/**
 * FlowFace PWA — Face Detection & Recognition Web Worker
 * Roda inferência facial fora da thread principal usando ONNX Runtime Web
 */

let ort = null;
let detectorSession = null;
let recognizerSession = null;
let isInitialized = false;

// ============================================
// ONNX Runtime Setup
// ============================================

async function initONNX() {
  try {
    // Dynamically import ONNX Runtime
    const script = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/esm/ort.min.js');
    ort = script.default || window.ort;

    // Configure execution providers
    const providers = [];
    
    if (typeof WebGPU !== 'undefined') {
      try {
        const adapter = await navigator.gpu?.requestAdapter();
        if (adapter) {
          providers.push('webgpu');
        }
      } catch (e) {
        console.warn('WebGPU not available, using WASM');
      }
    }
    
    providers.push('wasm');

    ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;

    return providers;
  } catch (error) {
    console.error('Failed to load ONNX Runtime:', error);
    throw error;
  }
}

async function loadModel(modelUrl, modelName) {
  try {
    const response = await fetch(modelUrl);
    const buffer = await response.arrayBuffer();
    
    const providers = await initONNX();
    
    const session = await ort.InferenceSession.create(buffer, {
      executionProviders: providers
    });

    return session;
  } catch (error) {
    console.error(`Failed to load model ${modelName}:`, error);
    throw error;
  }
}

// ============================================
// Face Detection (SCRFD/BlazeFace)
// ============================================

async function detectFaces(imageData, width, height) {
  if (!detectorSession) {
    return [];
  }

  try {
    // Preprocess image for detector
    const inputTensor = preprocessImage(imageData, width, height, 640, 640);
    
    // Run inference
    const inputName = detectorSession.inputNames[0];
    const results = await detectorSession.run({ [inputName]: inputTensor });
    
    // Post-process results
    const outputName = detectorSession.outputNames[0];
    const output = results[outputName].data;
    
    return postprocessDetections(output, width, height);
  } catch (error) {
    console.error('Detection error:', error);
    return [];
  }
}

function preprocessImage(imageData, srcWidth, srcHeight, targetWidth, targetHeight) {
  // Create canvas for resizing
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  
  // Draw and resize
  const imageDataObj = new ImageData(new Uint8ClampedArray(imageData), srcWidth, srcHeight);
  ctx.putImageData(imageDataObj, 0, 0);
  
  // Get pixel data
  const resizedData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
  
  // Convert to float32 tensor [1, 3, H, W]
  const float32Data = new Float32Array(3 * targetWidth * targetHeight);
  
  for (let i = 0; i < targetWidth * targetHeight; i++) {
    const srcIdx = i * 4;
    // Normalize to [0, 1] and convert RGB to BGR if needed
    float32Data[i] = resizedData[srcIdx] / 255.0;                    // R
    float32Data[targetWidth * targetHeight + i] = resizedData[srcIdx + 1] / 255.0;  // G
    float32Data[2 * targetWidth * targetHeight + i] = resizedData[srcIdx + 2] / 255.0; // B
  }
  
  return new ort.Tensor('float32', float32Data, [1, 3, targetHeight, targetWidth]);
}

function postprocessDetections(output, origWidth, origHeight) {
  const detections = [];
  const confThreshold = 0.5;
  const scaleX = origWidth / 640;
  const scaleY = origHeight / 640;
  
  // Simple post-processing - adjust based on your model's output format
  // This is a placeholder that needs to be adapted to the specific model
  for (let i = 0; i < output.length; i += 15) {
    const score = output[i + 4];
    if (score > confThreshold) {
      const x = output[i] * scaleX;
      const y = output[i + 1] * scaleY;
      const w = output[i + 2] * scaleX;
      const h = output[i + 3] * scaleY;
      
      detections.push({
        bbox: { x, y, width: w, height: h },
        score,
        landmarks: [
          { x: output[i + 5] * scaleX, y: output[i + 6] * scaleY },
          { x: output[i + 7] * scaleX, y: output[i + 8] * scaleY },
          { x: output[i + 9] * scaleX, y: output[i + 10] * scaleY },
          { x: output[i + 11] * scaleX, y: output[i + 12] * scaleY },
          { x: output[i + 13] * scaleX, y: output[i + 14] * scaleY }
        ]
      });
    }
  }
  
  // Apply NMS
  return nms(detections, 0.4);
}

function nms(detections, threshold) {
  // Sort by score
  detections.sort((a, b) => b.score - a.score);
  
  const keep = [];
  const suppressed = new Set();
  
  for (let i = 0; i < detections.length; i++) {
    if (suppressed.has(i)) continue;
    
    keep.push(detections[i]);
    
    for (let j = i + 1; j < detections.length; j++) {
      if (suppressed.has(j)) continue;
      
      const iou = calculateIoU(detections[i].bbox, detections[j].bbox);
      if (iou > threshold) {
        suppressed.add(j);
      }
    }
  }
  
  return keep;
}

function calculateIoU(box1, box2) {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
  
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const union = area1 + area2 - intersection;
  
  return union > 0 ? intersection / union : 0;
}

// ============================================
// Face Recognition (ArcFace)
// ============================================

async function getFaceEmbedding(faceImageData, width, height) {
  if (!recognizerSession) {
    return null;
  }

  try {
    // Preprocess face for recognizer
    const inputTensor = preprocessFace(faceImageData, width, height, 112, 112);
    
    // Run inference
    const inputName = recognizerSession.inputNames[0];
    const results = await recognizerSession.run({ [inputName]: inputTensor });
    
    // Get embedding
    const outputName = recognizerSession.outputNames[0];
    const embedding = results[outputName].data;
    
    // L2 normalize
    const norm = Math.sqrt(Array.from(embedding).reduce((sum, val) => sum + val * val, 0));
    const normalized = Array.from(embedding).map(val => val / norm);
    
    return normalized;
  } catch (error) {
    console.error('Recognition error:', error);
    return null;
  }
}

function preprocessFace(imageData, srcWidth, srcHeight, targetWidth, targetHeight) {
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  
  const imageDataObj = new ImageData(new Uint8ClampedArray(imageData), srcWidth, srcHeight);
  
  // Draw face region
  ctx.putImageData(imageDataObj, 0, 0);
  
  const resizedData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
  
  // Convert to float32 tensor [1, 3, 112, 112]
  const float32Data = new Float32Array(3 * targetWidth * targetHeight);
  
  for (let i = 0; i < targetWidth * targetHeight; i++) {
    const srcIdx = i * 4;
    // Normalize with mean subtraction (ImageNet stats)
    float32Data[i] = (resizedData[srcIdx] - 127.5) / 128.0;                    // R
    float32Data[targetWidth * targetHeight + i] = (resizedData[srcIdx + 1] - 127.5) / 128.0;  // G
    float32Data[2 * targetWidth * targetHeight + i] = (resizedData[srcIdx + 2] - 127.5) / 128.0; // B
  }
  
  return new ort.Tensor('float32', float32Data, [1, 3, targetHeight, targetWidth]);
}

// ============================================
// Embedding Comparison
// ============================================

function compareEmbeddings(embedding1, embedding2, threshold = 0.4) {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
    return { distance: 1, match: false };
  }

  // Cosine similarity
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  const distance = 1 - similarity;

  return {
    distance,
    similarity,
    match: similarity > (1 - threshold)
  };
}

function findBestMatch(embedding, knownEmbeddings, threshold = 0.4) {
  let bestMatch = null;
  let bestSimilarity = -1;

  for (const known of knownEmbeddings) {
    const result = compareEmbeddings(embedding, known.embedding, threshold);
    if (result.match && result.similarity > bestSimilarity) {
      bestSimilarity = result.similarity;
      bestMatch = {
        ...known,
        similarity: result.similarity,
        distance: result.distance
      };
    }
  }

  return bestMatch;
}

// ============================================
// Message Handler
// ============================================

self.onmessage = async function(event) {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'init':
        const providers = await initONNX();
        isInitialized = true;
        self.postMessage({ type: 'initialized', providers });
        break;

      case 'load_detector':
        detectorSession = await loadModel(data.modelUrl, 'detector');
        self.postMessage({ type: 'detector_loaded' });
        break;

      case 'load_recognizer':
        recognizerSession = await loadModel(data.modelUrl, 'recognizer');
        self.postMessage({ type: 'recognizer_loaded' });
        break;

      case 'detect':
        const faces = await detectFaces(data.imageData, data.width, data.height);
        self.postMessage({ type: 'detections', faces });
        break;

      case 'recognize':
        const embedding = await getFaceEmbedding(data.imageData, data.width, data.height);
        self.postMessage({ type: 'embedding', embedding });
        break;

      case 'compare':
        const comparison = compareEmbeddings(data.embedding1, data.embedding2, data.threshold);
        self.postMessage({ type: 'comparison', result: comparison });
        break;

      case 'find_match':
        const match = findBestMatch(data.embedding, data.knownEmbeddings, data.threshold);
        self.postMessage({ type: 'match_result', match });
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};

// Signal that worker is ready
self.postMessage({ type: 'worker_ready' });
