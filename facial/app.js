/**
 * FlowFace PWA — Main Application Logic
 * Detector e reconhecimento facial com ONNX Runtime Web
 */

import db from './db.js';
import supabase from './supabase.js';

// ============================================
// Configuration
// ============================================

const CONFIG = {
  // Model URLs - downloaded models in /facial/models/
  DETECTOR_MODEL_URL: '/facial/models/scrfd_500m.onnx',
  RECOGNIZER_MODEL_URL: '/facial/models/arcface_mbf.onnx',
  
  // Detection settings
  DETECTION_INTERVAL: 100, // ms between detections
  CONFIDENCE_THRESHOLD: 0.5,
  RECOGNITION_THRESHOLD: 0.4,
  
  // Camera settings
  VIDEO_WIDTH: 1280,
  VIDEO_HEIGHT: 720,
  
  // Face quality
  MIN_FACE_SIZE: 50,
  MAX_FACE_SIZE: 400,
  CENTER_TOLERANCE: 0.3
};

// ============================================
// State
// ============================================

const state = {
  cameraActive: false,
  stream: null,
  worker: null,
  modelsLoaded: false,
  detectorLoaded: false,
  recognizerLoaded: false,
  detectionInterval: null,
  lastFrameTime: 0,
  fps: 0,
  frameCount: 0,
  knownEmbeddings: [],
  isRegistering: false,
  pendingEmbedding: null
};

// ============================================
// DOM Elements
// ============================================

const elements = {
  rest: document.getElementById('rest'),
  camera: document.getElementById('camera'),
  video: document.getElementById('video'),
  closeBtn: document.getElementById('close'),
  instruction: document.getElementById('instruction'),
  faceTarget: document.getElementById('faceTarget'),
  faceOverlay: document.getElementById('faceOverlay'),
  message: document.getElementById('message'),
  messageTitle: document.getElementById('messageTitle'),
  messageText: document.getElementById('messageText'),
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  stats: document.getElementById('stats'),
  statFps: document.getElementById('statFps'),
  statDetections: document.getElementById('statDetections'),
  statFace: document.getElementById('statFace'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingText: document.getElementById('loadingText'),
  loadingBar: document.getElementById('loadingBar'),
  registerForm: document.getElementById('registerForm'),
  registerName: document.getElementById('registerName'),
  registerId: document.getElementById('registerId'),
  registerCancel: document.getElementById('registerCancel'),
  registerSave: document.getElementById('registerSave'),
  captureCanvas: document.getElementById('captureCanvas')
};

// ============================================
// Service Worker Registration
// ============================================

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/facial/sw.js');
      console.log('Service Worker registered:', registration.scope);
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }
}

// ============================================
// Web Worker Initialization
// ============================================

async function initWorker() {
  return new Promise((resolve, reject) => {
    state.worker = new Worker('/facial/detector.worker.js');
    
    state.worker.onmessage = (event) => {
      const { type, data = {} } = event.data || {};
      
      switch (type) {
        case 'worker_ready':
          console.log('Worker ready');
          resolve();
          break;
          
        case 'initialized':
          console.log('ONNX initialized with providers:', data.providers);
          break;
          
        case 'detector_loaded':
          state.detectorLoaded = true;
          updateLoadingProgress(50, 'Detector facial carregado');
          checkModelsReady();
          break;
          
        case 'recognizer_loaded':
          state.recognizerLoaded = true;
          updateLoadingProgress(100, 'Modelos carregados');
          checkModelsReady();
          break;
          
        case 'detections':
          handleDetections(data.faces);
          break;
          
        case 'embedding':
          handleEmbedding(data.embedding);
          break;
          
        case 'match_result':
          handleMatchResult(data.match);
          break;
          
        case 'error':
          console.error('Worker error:', data.error);
          updateStatus('error', 'Erro na inferência');
          break;
      }
    };
    
    state.worker.onerror = (error) => {
      console.error('Worker error:', error);
      reject(error);
    };
    
    state.worker.postMessage({ type: 'init' });
  });
}

function updateLoadingProgress(percent, text) {
  elements.loadingBar.style.width = `${percent}%`;
  elements.loadingText.textContent = text;
}

function checkModelsReady() {
  if (state.detectorLoaded && state.recognizerLoaded) {
    state.modelsLoaded = true;
    elements.loadingOverlay.classList.remove('show');
    elements.instruction.textContent = 'Olhe para a câmera';
    updateStatus('ok', 'Pronto');
  }
}

// ============================================
// Model Loading
// ============================================

async function loadModels() {
  elements.loadingOverlay.classList.add('show');
  updateLoadingProgress(0, 'Inicializando ONNX Runtime...');
  
  try {
    // Load detector model
    updateLoadingProgress(10, 'Carregando detector facial...');
    state.worker.postMessage({
      type: 'load_detector',
      data: { modelUrl: CONFIG.DETECTOR_MODEL_URL }
    });
    
    // Load recognizer model
    updateLoadingProgress(30, 'Carregando reconhecimento facial...');
    state.worker.postMessage({
      type: 'load_recognizer',
      data: { modelUrl: CONFIG.RECOGNIZER_MODEL_URL }
    });
    
  } catch (error) {
    console.error('Failed to load models:', error);
    updateStatus('error', 'Erro ao carregar modelos');
    elements.loadingText.textContent = 'Erro ao carregar modelos';
  }
}

// ============================================
// Camera Control
// ============================================

async function startCamera() {
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'user' },
        width: { ideal: CONFIG.VIDEO_WIDTH },
        height: { ideal: CONFIG.VIDEO_HEIGHT }
      },
      audio: false
    });
    
    elements.video.srcObject = state.stream;
    state.cameraActive = true;
    
    // Wait for video to be ready
    await new Promise((resolve) => {
      elements.video.onloadedmetadata = resolve;
    });
    
    // Setup canvas
    elements.captureCanvas.width = elements.video.videoWidth;
    elements.captureCanvas.height = elements.video.videoHeight;
    
    // Start detection loop
    startDetectionLoop();
    
    return true;
  } catch (error) {
    console.error('Camera error:', error);
    updateStatus('error', 'Câmera indisponível');
    elements.instruction.textContent = 'Câmera indisponível';
    return false;
  }
}

function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach(track => track.stop());
    state.stream = null;
  }
  
  state.cameraActive = false;
  
  if (state.detectionInterval) {
    clearInterval(state.detectionInterval);
    state.detectionInterval = null;
  }
}

// ============================================
// Detection Loop
// ============================================

function startDetectionLoop() {
  state.detectionInterval = setInterval(() => {
    if (!state.cameraActive || !state.modelsLoaded) return;
    
    const now = performance.now();
    const delta = now - state.lastFrameTime;
    
    if (delta < CONFIG.DETECTION_INTERVAL) return;
    
    state.lastFrameTime = now;
    state.frameCount++;
    
    // Calculate FPS every second
    if (state.frameCount % 10 === 0) {
      state.fps = Math.round(1000 / delta);
      elements.statFps.textContent = state.fps;
    }
    
    // Capture frame
    const ctx = elements.captureCanvas.getContext('2d');
    ctx.drawImage(elements.video, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, elements.captureCanvas.width, elements.captureCanvas.height);
    
    // Send to worker for detection
    state.worker.postMessage({
      type: 'detect',
      data: {
        imageData: imageData.data.buffer,
        width: elements.captureCanvas.width,
        height: elements.captureCanvas.height
      }
    });
    
  }, CONFIG.DETECTION_INTERVAL);
}

// ============================================
// Detection Handling
// ============================================

function handleDetections(faces) {
  elements.statDetections.textContent = faces.length;
  
  // Clear previous overlays
  elements.faceOverlay.innerHTML = '';
  
  if (faces.length === 0) {
    elements.statFace.textContent = '--';
    elements.instruction.textContent = 'Olhe para a câmera';
    elements.instruction.className = 'instruction';
    return;
  }
  
  // Find best face (closest to center, largest)
  const bestFace = findBestFace(faces);
  
  if (!bestFace) {
    elements.statFace.textContent = 'Muito pequeno';
    elements.instruction.textContent = 'Aproxime-se';
    elements.instruction.className = 'instruction';
    return;
  }
  
  // Check if face is in good position
  const quality = checkFaceQuality(bestFace);
  
  if (!quality.ok) {
    elements.statFace.textContent = quality.reason;
    elements.instruction.textContent = quality.instruction;
    elements.instruction.className = 'instruction';
    return;
  }
  
  elements.statFace.textContent = '✓ Detectado';
  elements.instruction.textContent = 'Rosto detectado...';
  
  // Draw face box
  drawFaceBox(bestFace);
  
  // Request recognition
  recognizeFace(bestFace);
}

function findBestFace(faces) {
  // Sort by size and distance to center
  const centerX = elements.captureCanvas.width / 2;
  const centerY = elements.captureCanvas.height / 2;
  
  return faces
    .filter(face => {
      const size = Math.min(face.bbox.width, face.bbox.height);
      return size >= CONFIG.MIN_FACE_SIZE && size <= CONFIG.MAX_FACE_SIZE;
    })
    .sort((a, b) => {
      const aCenter = Math.abs((a.bbox.x + a.bbox.width / 2) - centerX);
      const bCenter = Math.abs((b.bbox.x + b.bbox.width / 2) - centerX);
      const aSize = Math.min(a.bbox.width, a.bbox.height);
      const bSize = Math.min(b.bbox.width, b.bbox.height);
      
      return (aCenter - bCenter) + (bSize - aSize);
    })[0];
}

function checkFaceQuality(face) {
  const centerX = elements.captureCanvas.width / 2;
  const centerY = elements.captureCanvas.height / 2;
  const faceCenterX = face.bbox.x + face.bbox.width / 2;
  const faceCenterY = face.bbox.y + face.bbox.height / 2;
  
  const distX = Math.abs(faceCenterX - centerX) / elements.captureCanvas.width;
  const distY = Math.abs(faceCenterY - centerY) / elements.captureCanvas.height;
  
  if (distX > CONFIG.CENTER_TOLERANCE || distY > CONFIG.CENTER_TOLERANCE) {
    return {
      ok: false,
      reason: 'Fora do centro',
      instruction: 'Olhe para a câmera'
    };
  }
  
  return { ok: true };
}

function drawFaceBox(face) {
  const box = document.createElement('div');
  box.className = 'face-box';
  
  // Mirror the x coordinate since video is mirrored
  const mirroredX = elements.captureCanvas.width - face.bbox.x - face.bbox.width;
  
  box.style.left = `${(mirroredX / elements.captureCanvas.width) * 100}%`;
  box.style.top = `${(face.bbox.y / elements.captureCanvas.height) * 100}%`;
  box.style.width = `${(face.bbox.width / elements.captureCanvas.width) * 100}%`;
  box.style.height = `${(face.bbox.height / elements.captureCanvas.height) * 100}%`;
  
  elements.faceOverlay.appendChild(box);
}

// ============================================
// Recognition
// ============================================

function recognizeFace(face) {
  // Extract face region from canvas
  const ctx = elements.captureCanvas.getContext('2d');
  const faceImageData = ctx.getImageData(
    face.bbox.x,
    face.bbox.y,
    face.bbox.width,
    face.bbox.height
  );
  
  // Send to worker for recognition
  state.worker.postMessage({
    type: 'recognize',
    data: {
      imageData: faceImageData.data.buffer,
      width: face.bbox.width,
      height: face.bbox.height
    }
  });
}

function handleEmbedding(embedding) {
  if (!embedding) {
    console.warn('No embedding generated');
    return;
  }
  
  state.pendingEmbedding = embedding;
  
  // Search for match in known embeddings
  state.worker.postMessage({
    type: 'find_match',
    data: {
      embedding,
      knownEmbeddings: state.knownEmbeddings,
      threshold: CONFIG.RECOGNITION_THRESHOLD
    }
  });
}

function handleMatchResult(match) {
  if (match) {
    // Face recognized
    showMessage('Acesso liberado', `Bem-vindo, ${match.name}!`, 'success');
    elements.instruction.textContent = 'Reconhecido!';
    elements.instruction.className = 'instruction success';
    
    // Log access
    logAccess(match, true);
    
    // Update status
    updateStatus('ok', match.name);
    
  } else {
    // Face not recognized
    if (state.isRegistering) {
      // Save new face
      saveNewFace();
    } else {
      showMessage('Acesso negado', 'Rosto não reconhecido', 'error');
      elements.instruction.textContent = 'Não reconhecido';
      elements.instruction.className = 'instruction error';
      
      // Log failed attempt
      logAccess(null, false);
    }
    
    updateStatus('warning', 'Não reconhecido');
  }
  
  // Reset after delay
  setTimeout(() => {
    elements.message.classList.remove('show');
    elements.instruction.textContent = 'Olhe para a câmera';
    elements.instruction.className = 'instruction';
  }, 2000);
}

// ============================================
// Face Registration
// ============================================

function startRegistration() {
  state.isRegistering = true;
  elements.registerForm.classList.add('show');
  elements.registerName.focus();
}

async function saveNewFace() {
  if (!state.pendingEmbedding) return;
  
  const name = elements.registerName.value.trim() || 'Desconhecido';
  const userId = elements.registerId.value.trim() || crypto.randomUUID();
  
  const embeddingData = {
    id: crypto.randomUUID(),
    userId,
    name,
    embedding: Array.from(state.pendingEmbedding),
    device_id: await db.getConfig('device_id', 'terminal-001'),
    synced: false
  };
  
  try {
    await db.addEmbedding(embeddingData);
    state.knownEmbeddings.push(embeddingData);
    
    showMessage('Cadastrado', `${name} foi cadastrado com sucesso!`, 'success');
    
    // Sync with Supabase if configured
    if (supabase.isConfigured()) {
      await supabase.syncEmbeddings();
    }
    
  } catch (error) {
    console.error('Failed to save embedding:', error);
    showMessage('Erro', 'Falha ao cadastrar', 'error');
  }
  
  // Reset form
  elements.registerForm.classList.remove('show');
  elements.registerName.value = '';
  elements.registerId.value = '';
  state.isRegistering = false;
  state.pendingEmbedding = null;
}

// ============================================
// Access Logging
// ============================================

async function logAccess(user, recognized) {
  const logEntry = {
    user_id: user ? user.userId : null,
    user_name: user ? user.name : null,
    recognized,
    device_id: await db.getConfig('device_id', 'terminal-001'),
    timestamp: new Date().toISOString(),
    synced: false
  };
  
  try {
    await db.logAccess(logEntry);
  } catch (error) {
    console.error('Failed to log access:', error);
  }
}

// ============================================
// UI Helpers
// ============================================

function showMessage(title, text, type = '') {
  elements.messageTitle.textContent = title;
  elements.messageText.textContent = text;
  elements.message.className = `message show ${type}`;
}

function updateStatus(status, text) {
  elements.statusDot.className = `status-dot ${status === 'error' ? 'error' : status === 'warning' ? 'warning' : ''}`;
  elements.statusText.textContent = text;
}

// ============================================
// Navigation
// ============================================

async function enterCamera() {
  elements.rest.classList.add('hidden');
  elements.camera.classList.add('active');
  
  if (!state.worker) {
    await initWorker();
    await loadModels();
  }
  
  const cameraStarted = await startCamera();
  if (!cameraStarted) {
    leaveCamera();
    return;
  }
  
  // Show face target
  setTimeout(() => elements.camera.classList.add('show-target'), 500);
  
  // Load known embeddings from DB
  await loadKnownEmbeddings();
}

function leaveCamera() {
  stopCamera();
  
  elements.camera.classList.remove('active', 'show-target');
  elements.message.classList.remove('show');
  elements.rest.classList.remove('hidden');
  elements.registerForm.classList.remove('show');
  
  updateStatus('ok', 'Pronto');
  elements.statFps.textContent = '0';
  elements.statDetections.textContent = '0';
  elements.statFace.textContent = '--';
}

async function loadKnownEmbeddings() {
  try {
    state.knownEmbeddings = await db.getAllEmbeddings();
    console.log(`Loaded ${state.knownEmbeddings.length} embeddings`);
  } catch (error) {
    console.error('Failed to load embeddings:', error);
  }
}

// ============================================
// Event Listeners
// ============================================

elements.rest.addEventListener('click', enterCamera);
elements.closeBtn.addEventListener('click', leaveCamera);

// Registration form
elements.registerCancel.addEventListener('click', () => {
  elements.registerForm.classList.remove('show');
  state.isRegistering = false;
});

elements.registerSave.addEventListener('click', saveNewFace);

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !elements.camera.classList.contains('active')) {
    enterCamera();
  }
  if (e.key === 'Escape' && elements.camera.classList.contains('active')) {
    leaveCamera();
  }
  // Double-tap to register (for kiosk mode)
  if (e.key === 'r' && e.ctrlKey && e.shiftKey) {
    startRegistration();
  }
});

// Handle video click for testing (remove in production)
elements.video.addEventListener('click', () => {
  if (!elements.camera.classList.contains('active')) return;
  
  // For testing: simulate recognition
  showMessage('Acesso liberado', 'Reconhecimento confirmado (teste)', 'success');
  elements.instruction.textContent = '';
  
  setTimeout(() => {
    elements.message.classList.remove('show');
    elements.instruction.textContent = 'Olhe para a câmera';
  }, 1800);
});

// ============================================
// Initialization
// ============================================

async function init() {
  console.log('FlowFace PWA initializing...');
  
  // Register service worker
  await registerServiceWorker();
  
  // Initialize database
  await db.init();
  
  // Generate device ID if not exists
  const deviceId = await db.getConfig('device_id');
  if (!deviceId) {
    await db.setConfig('device_id', `terminal-${crypto.randomUUID().slice(0, 8)}`);
  }
  
  // Initialize Supabase if configured
  const supabaseUrl = await db.getConfig('supabase_url');
  const supabaseKey = await db.getConfig('supabase_key');
  
  if (supabaseUrl && supabaseKey) {
    await supabase.init(supabaseUrl, supabaseKey);
  }
  
  console.log('FlowFace PWA ready');
}

// Start
init().catch(console.error);
