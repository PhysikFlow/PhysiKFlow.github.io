/**
 * FlowFace PWA — Face Detection & Recognition Web Worker
 * Roda inferência facial fora da thread principal usando ONNX Runtime Web
 */

let ort = null;
let detectorSession = null;
let recognizerSession = null;
let isInitialized = false;
const DETECTOR_SIZE = 640;
const SCRFD_STRIDES = [8, 16, 32];

// ============================================
// ONNX Runtime Setup
// ============================================

async function initONNX() {
  try {
    // Dynamically import ONNX Runtime
    const ORT_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist';
    const script = await import(`${ORT_CDN}/esm/ort.min.js`);
    ort = script.default || window.ort;

    // Point WASM binaries to CDN (otherwise the browser tries the page origin → 404)
    ort.env.wasm.wasmPaths = ORT_CDN + '/';

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

    // multi-threading requires crossOriginIsolated headers; fall back to 1 thread otherwise
    ort.env.wasm.numThreads = self.crossOriginIsolated
      ? (navigator.hardwareConcurrency || 4)
      : 1;

    return providers;
  } catch (error) {
    console.error('Failed to load ONNX Runtime:', error);
    throw error;
  }
}

async function loadModel(modelUrl, modelName) {
  try {
    const response = await fetch(modelUrl);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength < 1024) {
      throw new Error('o arquivo do modelo é inválido ou está incompleto');
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 1024) {
      throw new Error('o arquivo do modelo é inválido ou está incompleto');
    }
    
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
    const { tensor: inputTensor, transform } = preprocessImage(
      imageData, width, height, DETECTOR_SIZE, DETECTOR_SIZE
    );
    
    // Run inference
    const inputName = detectorSession.inputNames[0];
    const results = await detectorSession.run({ [inputName]: inputTensor });

    // Log output shapes once for debugging
    if (!detectFaces._logged) {
      detectFaces._logged = true;
      const shapes = Object.entries(results).map(([name, t]) => `${name}: [${t.dims}] len=${t.data.length}`);
      console.log('[SCRFD] output shapes:', shapes.join(' | '));
    }
    
    return postprocessDetections(results, transform);
  } catch (error) {
    console.error('Detection error:', error);
    return [];
  }
}

function preprocessImage(imageData, srcWidth, srcHeight, targetWidth, targetHeight) {
  // SCRFD expects a square, letterboxed BGR image normalized to [-1, 1].
  // Preserving aspect ratio is essential: stretching shifts its decoded boxes.
  const source = new OffscreenCanvas(srcWidth, srcHeight);
  source.getContext('2d').putImageData(
    new ImageData(new Uint8ClampedArray(imageData), srcWidth, srcHeight), 0, 0
  );
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);
  const resizedWidth = Math.round(srcWidth * scale);
  const resizedHeight = Math.round(srcHeight * scale);
  const padX = Math.floor((targetWidth - resizedWidth) / 2);
  const padY = Math.floor((targetHeight - resizedHeight) / 2);
  ctx.drawImage(source, 0, 0, srcWidth, srcHeight, padX, padY, resizedWidth, resizedHeight);
  const resizedData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
  
  // Convert to float32 tensor [1, 3, H, W]
  const float32Data = new Float32Array(3 * targetWidth * targetHeight);
  
  for (let i = 0; i < targetWidth * targetHeight; i++) {
    const srcIdx = i * 4;
    // BGR, mean=127.5 and std=128 are the SCRFD training convention.
    float32Data[i] = (resizedData[srcIdx + 2] - 127.5) / 128.0;
    float32Data[targetWidth * targetHeight + i] = (resizedData[srcIdx + 1] - 127.5) / 128.0;
    float32Data[2 * targetWidth * targetHeight + i] = (resizedData[srcIdx] - 127.5) / 128.0;
  }
  
  return {
    tensor: new ort.Tensor('float32', float32Data, [1, 3, targetHeight, targetWidth]),
    transform: { scale, padX, padY, srcWidth, srcHeight }
  };
}

function postprocessDetections(results, transform) {
  const detections = [];
  const confThreshold = 0.5;
  const outputs = Object.values(results);

  for (const stride of SCRFD_STRIDES) {
    const gridSize = DETECTOR_SIZE / stride;
    const locations = gridSize * gridSize;

    // Match tensors by NCHW shape — avoids data-length collisions across strides
    const scoreTensor = outputs.find(o =>
      o.dims && o.dims.length === 4 && o.dims[1] === 1 &&
      o.dims[2] === gridSize && o.dims[3] === gridSize
    );
    const boxTensor = outputs.find(o =>
      o.dims && o.dims.length === 4 && o.dims[1] === 4 &&
      o.dims[2] === gridSize && o.dims[3] === gridSize
    );
    const landmarkTensor = outputs.find(o =>
      o.dims && o.dims.length === 4 && o.dims[1] === 10 &&
      o.dims[2] === gridSize && o.dims[3] === gridSize
    );
    if (!scoreTensor || !boxTensor || !landmarkTensor) {
      if (!postprocessDetections._skipLogged) {
        postprocessDetections._skipLog = postprocessDetections._skipLog || [];
        postprocessDetections._skipLog.push(`stride=${stride} gridSize=${gridSize} score=${!!scoreTensor} box=${!!boxTensor} kps=${!!landmarkTensor}`);
      }
      continue;
    }

    for (let i = 0; i < locations; i++) {
      const h = Math.floor(i / gridSize);
      const w = i % gridSize;

      const rawScore = scoreTensor.data[i];
      const score = rawScore >= 0 && rawScore <= 1
        ? rawScore
        : 1 / (1 + Math.exp(-rawScore));
      if (score < confThreshold) continue;

      const centerX = w * stride;
      const centerY = h * stride;

      // NCHW layout: flat index for channel c at position (h,w) = c * H * W + h * W + w
      const left   = boxTensor.data[0 * locations + i] * stride;
      const top    = boxTensor.data[1 * locations + i] * stride;
      const right  = boxTensor.data[2 * locations + i] * stride;
      const bottom = boxTensor.data[3 * locations + i] * stride;

      const x1 = (centerX - left   - transform.padX) / transform.scale;
      const y1 = (centerY - top    - transform.padY) / transform.scale;
      const x2 = (centerX + right  - transform.padX) / transform.scale;
      const y2 = (centerY + bottom - transform.padY) / transform.scale;

      const bbox = clampBox(x1, y1, x2, y2, transform.srcWidth, transform.srcHeight);
      if (bbox.width <= 1 || bbox.height <= 1) continue;

      // NCHW landmarks [1,10,H,W]: channel 2p = point p x, channel 2p+1 = point p y
      const landmarks = Array.from({ length: 5 }, (_, point) => ({
        x: clamp((centerX + landmarkTensor.data[point * 2 * locations + i] * stride - transform.padX) / transform.scale, 0, transform.srcWidth),
        y: clamp((centerY + landmarkTensor.data[(point * 2 + 1) * locations + i] * stride - transform.padY) / transform.scale, 0, transform.srcHeight)
      }));

      detections.push({ bbox, score, landmarks });
    }
  }

  // Log debug info once
  if (!postprocessDetections._reported) {
    postprocessDetections._reported = true;
    if (postprocessDetections._skipLog && postprocessDetections._skipLog.length > 0) {
      console.log('[SCRFD] skipped strides:', postprocessDetections._skipLog.join(' | '));
    }
    console.log('[SCRFD] pre-nms detections:', detections.length);
  }

  // Apply NMS
  return nms(detections, 0.4);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function clampBox(x1, y1, x2, y2, width, height) {
  const left = clamp(x1, 0, width);
  const top = clamp(y1, 0, height);
  const right = clamp(x2, 0, width);
  const bottom = clamp(y2, 0, height);
  return { x: left, y: top, width: right - left, height: bottom - top };
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
      case 'init': {
        const providers = await initONNX();
        isInitialized = true;
        self.postMessage({ type: 'initialized', providers });
        break;
      }

      case 'load_detector': {
        detectorSession = await loadModel(data.modelUrl, 'detector');
        self.postMessage({ type: 'detector_loaded' });
        break;
      }

      case 'load_recognizer': {
        recognizerSession = await loadModel(data.modelUrl, 'recognizer');
        self.postMessage({ type: 'recognizer_loaded' });
        break;
      }

      case 'detect': {
        const faces = await detectFaces(data.imageData, data.width, data.height);
        self.postMessage({ type: 'detections', faces });
        break;
      }

      case 'recognize': {
        const embedding = await getFaceEmbedding(data.imageData, data.width, data.height);
        self.postMessage({ type: 'embedding', embedding });
        break;
      }

      case 'compare': {
        const comparison = compareEmbeddings(data.embedding1, data.embedding2, data.threshold);
        self.postMessage({ type: 'comparison', result: comparison });
        break;
      }

      case 'find_match': {
        const match = findBestMatch(data.embedding, data.knownEmbeddings, data.threshold);
        self.postMessage({ type: 'match_result', match });
        break;
      }

      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};

// Signal that worker is ready
self.postMessage({ type: 'worker_ready' });
