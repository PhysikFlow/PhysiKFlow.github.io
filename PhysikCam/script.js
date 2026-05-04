const wheelList = document.getElementById('wheel-list');
const cameraPreview = document.getElementById('camera-preview');
const cameraVideo = document.getElementById('camera-video');
const captureCanvas = document.getElementById('capture-canvas');
const galleryButton = document.getElementById('gallery-button');
const captureButton = document.getElementById('capture-button');
const confirmPanel = document.getElementById('confirm-panel');
const closeConfirmPanelBtn = document.getElementById('close-confirm-panel');
const receiptForm = document.getElementById('receipt-form');
const personNameInput = document.getElementById('person-name');
const planSelect = document.getElementById('plan-select');
const paymentMethodSelect = document.getElementById('payment-method-select');
const amountInput = document.getElementById('amount-input');
const capturedThumb = document.getElementById('captured-thumb');

const REGISTER_HERE = 'Registrar aqui';
let currentStream = null;
let wheelItems = [];
let currentCapture = null;

// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const appState = {
  paymentsWaitingProof: [], // Will be populated from Firebase
  receipts: []
};

function init() {
  startFirebaseListener();
  renderWheel();
  initWheelSelector();
  centerSelectedWheelItem();
  initActions();
  startCameraPreview();
  registerServiceWorker();
}

function startFirebaseListener() {
  const paymentsRef = database.ref('payments');
  
  paymentsRef.on('value', (snapshot) => {
    const paymentsData = snapshot.val() || {};
    appState.paymentsWaitingProof = Object.values(paymentsData)
      .filter(payment => payment.status === 'pending_proof')
      .map(payment => ({
        personName: payment.personName,
        plan: payment.plan,
        paymentMethod: payment.paymentMethod,
        amount: payment.amount,
        createdAt: payment.createdAt || Date.now(),
        id: snapshot.key
      }));
    
    renderWheel();
    centerSelectedWheelItem();
  }, (error) => {
    console.error('Firebase listener error:', error);
    showCaptureFeedback('Erro ao conectar com Firebase', true);
  });
}

function normalizePersonName(name) {
  return name.trim().toLowerCase();
}

function sortPeopleByRecentPending() {
  return [...appState.paymentsWaitingProof]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((item) => item.personName);
}

function renderWheel() {
  const names = [REGISTER_HERE, ...new Set(sortPeopleByRecentPending())];
  wheelList.innerHTML = '';

  wheelList.appendChild(createWheelSpacer());

  names.forEach((name, index) => {
    const option = document.createElement('div');
    option.className = 'wheel-item';
    option.textContent = name;
    option.setAttribute('role', 'option');
    option.setAttribute('tabindex', '-1');
    option.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    option.dataset.selected = index === 0 ? 'true' : 'false';
    wheelList.appendChild(option);
  });

  wheelList.appendChild(createWheelSpacer());
  wheelItems = Array.from(wheelList.querySelectorAll('.wheel-item:not(.wheel-spacer)'));
}

function createWheelSpacer() {
  const spacer = document.createElement('div');
  spacer.className = 'wheel-item wheel-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  return spacer;
}

function activateItem(item) {
  wheelItems.forEach((option) => {
    option.dataset.selected = 'false';
    option.setAttribute('aria-selected', 'false');
  });
  item.dataset.selected = 'true';
  item.setAttribute('aria-selected', 'true');
}

function getCenteredItem() {
  const listRect = wheelList.getBoundingClientRect();
  const centerY = listRect.top + listRect.height / 2;
  let closestItem = null;
  let closestDistance = Infinity;

  wheelItems.forEach((item) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenterY = itemRect.top + itemRect.height / 2;
    const distance = Math.abs(centerY - itemCenterY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  });
  return closestItem;
}

function updateSelectedBasedOnScroll() {
  const centeredItem = getCenteredItem();
  if (centeredItem && centeredItem.dataset.selected !== 'true') {
    activateItem(centeredItem);
  }
}

function getSelectedPersonName() {
  const selected = wheelItems.find((item) => item.dataset.selected === 'true');
  return selected ? selected.textContent.trim() : REGISTER_HERE;
}

function initWheelSelector() {
  wheelList.addEventListener('click', (event) => {
    const target = event.target.closest('.wheel-item:not(.wheel-spacer)');
    if (!target) return;
    activateItem(target);
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  let scrollTimeout;
  wheelList.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateSelectedBasedOnScroll, 40);
  });
}

function centerSelectedWheelItem() {
  setTimeout(() => {
    const selected = wheelItems.find((item) => item.dataset.selected === 'true');
    if (selected) selected.scrollIntoView({ block: 'center', behavior: 'auto' });
  }, 50);
}

function initActions() {
  if (galleryButton) {
    galleryButton.addEventListener('click', openNativeGallery);
  }
  if (captureButton) {
    captureButton.addEventListener('click', capturePhotoAndOpenFlow);
  }
  if (closeConfirmPanelBtn) {
    closeConfirmPanelBtn.addEventListener('click', closeConfirmPanel);
  }
  if (receiptForm) {
    receiptForm.addEventListener('submit', handleReceiptSubmit);
  }
}

function flashPreview() {
  cameraPreview.classList.add('flash');
  window.setTimeout(() => cameraPreview.classList.remove('flash'), 220);
}

async function capturePhotoAndOpenFlow() {
  const blob = await captureCurrentFrameAsBlob();
  if (!blob) return;

  flashPreview();
  const selectedPerson = getSelectedPersonName();
  openConfirmPanel(blob, selectedPerson);
}

async function captureCurrentFrameAsBlob() {
  if (!cameraVideo.srcObject) {
    showCaptureFeedback('Câmera não está ativa', true);
    return null;
  }

  const context = captureCanvas.getContext('2d');
  captureCanvas.width = cameraVideo.videoWidth;
  captureCanvas.height = cameraVideo.videoHeight;
  context.drawImage(cameraVideo, 0, 0, captureCanvas.width, captureCanvas.height);

  const blob = await new Promise((resolve) => {
    captureCanvas.toBlob(resolve, 'image/jpeg', 0.9);
  });
  if (!blob) {
    showCaptureFeedback('Falha ao gerar comprovante', true);
    return null;
  }
  return blob;
}

function openConfirmPanel(photoBlob, selectedPerson) {
  const selectedPending = appState.paymentsWaitingProof.find(
    (payment) => normalizePersonName(payment.personName) === normalizePersonName(selectedPerson)
  );

  const isRegisterMode = selectedPerson === REGISTER_HERE || !selectedPending;
  currentCapture = {
    photoBlob,
    selectedPerson,
    mode: isRegisterMode ? 'register' : 'pending'
  };

  const photoUrl = URL.createObjectURL(photoBlob);
  capturedThumb.src = photoUrl;
  capturedThumb.dataset.url = photoUrl;

  personNameInput.value = isRegisterMode ? '' : selectedPending.personName;
  planSelect.value = isRegisterMode ? '' : selectedPending.plan;
  paymentMethodSelect.value = isRegisterMode ? '' : selectedPending.paymentMethod;
  amountInput.value = isRegisterMode ? '' : String(selectedPending.amount);
  personNameInput.readOnly = !isRegisterMode;

  confirmPanel.classList.add('is-open');
  confirmPanel.setAttribute('aria-hidden', 'false');
}

function closeConfirmPanel() {
  if (capturedThumb.dataset.url) {
    URL.revokeObjectURL(capturedThumb.dataset.url);
  }
  capturedThumb.src = '';
  capturedThumb.dataset.url = '';
  confirmPanel.classList.remove('is-open');
  confirmPanel.setAttribute('aria-hidden', 'true');
  currentCapture = null;
}

async function handleReceiptSubmit(event) {
  event.preventDefault();
  if (!currentCapture) return;

  const personName = personNameInput.value.trim();
  if (!personName) {
    showCaptureFeedback('Informe o nome do aluno', true);
    return;
  }

  // Find the payment ID from Firebase data
  const payment = appState.paymentsWaitingProof.find(
    (p) => normalizePersonName(p.personName) === normalizePersonName(personName)
  );
  
  if (!payment && personName !== REGISTER_HERE) {
    showCaptureFeedback('Pagamento não encontrado para esta pessoa', true);
    return;
  }

  const receipt = {
    id: payment?.id || crypto.randomUUID(),
    personName,
    plan: planSelect.value,
    paymentMethod: paymentMethodSelect.value,
    amount: Number(amountInput.value),
    createdAt: Date.now(),
    photoBlob: currentCapture.photoBlob
  };

  try {
    // Upload image to PC (local or tunnel)
    await uploadImageToServer(receipt.photoBlob, receipt.id);
    
    // Update Firebase to mark payment as received
    if (payment) {
      await database.ref(`payments/${payment.id}`).update({
        status: 'proof_received',
        updatedAt: Date.now(),
        receivedAt: Date.now()
      });
    }
    
    appState.receipts.push(receipt);
    appState.paymentsWaitingProof = appState.paymentsWaitingProof.filter(
      (p) => normalizePersonName(p.personName) !== normalizePersonName(personName)
    );

    renderWheel();
    centerSelectedWheelItem();
    closeConfirmPanel();
    showCaptureFeedback('Comprovante enviado e confirmado com sucesso!');
    
  } catch (error) {
    console.error('Receipt submission error:', error);
    showCaptureFeedback('Erro ao processar comprovante', true);
  }
}

// Upload configuration
const UPLOAD_CONFIG = {
  // Local server (auto-detected or fallback)
  localUrl: null, // Will be auto-detected
  // Cloudflare tunnel (different networks)
  tunnelUrl: 'https://your-tunnel.cloudflare.com', // You'll need to configure this
  // Secret for token generation (not exposed to client)
  secretKey: 'physikcam_secret_2024',
  // Timeout for server check (increased for tunnel reliability)
  timeout: 7000,
  // Retry attempts
  maxRetries: 2
};

// Auto-detect local server URL
async function detectLocalServerUrl() {
  const possibleHosts = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.100:3000',
    'http://192.168.0.100:3000',
    'http://192.168.1.1:3000',
    'http://192.168.0.1:3000',
    'http://hostname.local:3000'
  ];
  
  for (const host of possibleHosts) {
    try {
      const response = await fetch(`${host}/health`, {
        method: 'GET',
        timeout: 2000
      });
      if (response.ok) {
        console.log(`Local server detected at: ${host}`);
        return host;
      }
    } catch (error) {
      // Continue trying next host
    }
  }
  
  console.log('No local server detected, will use tunnel');
  return null;
}

// Generate secure token based on payment ID and timestamp
function generateSecureToken(paymentId) {
  const timestamp = Math.floor(Date.now() / 30000); // Changes every 30 seconds
  const data = `${paymentId}_${timestamp}_${UPLOAD_CONFIG.secretKey}`;
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

// Check if local server is available
async function isLocalServerAvailable() {
  if (!UPLOAD_CONFIG.localUrl) {
    UPLOAD_CONFIG.localUrl = await detectLocalServerUrl();
  }
  
  if (!UPLOAD_CONFIG.localUrl) {
    return false;
  }
  
  try {
    const response = await fetch(`${UPLOAD_CONFIG.localUrl}/health`, {
      method: 'GET',
      timeout: UPLOAD_CONFIG.timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Compress image before upload
async function compressImage(imageBlob, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (max 1920x1080)
      let { width, height } = img;
      const maxWidth = 1920;
      const maxHeight = 1080;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(imageBlob);
  });
}

// Network change detection
let currentNetworkType = null;

function detectNetworkChange() {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      const newNetworkType = connection.effectiveType;
      if (currentNetworkType && currentNetworkType !== newNetworkType) {
        console.log(`Network changed: ${currentNetworkType} → ${newNetworkType}`);
        // Reset local server detection on network change
        UPLOAD_CONFIG.localUrl = null;
      }
      currentNetworkType = newNetworkType;
    }
  }
}

// Upload image to server with retry logic and network change detection
async function uploadImageToServer(imageBlob, paymentId, retryCount = 0) {
  // Detect network changes before upload
  detectNetworkChange();
  
  const isLocal = await isLocalServerAvailable();
  const uploadUrl = isLocal ? UPLOAD_CONFIG.localUrl : UPLOAD_CONFIG.tunnelUrl;
  const secureToken = generateSecureToken(paymentId);
  
  try {
    // Compress image first
    const compressedBlob = await compressImage(imageBlob);
    console.log(`Image compressed: ${imageBlob.size} → ${compressedBlob.size} bytes`);
    
    const formData = new FormData();
    formData.append('image', compressedBlob, `payment_${paymentId}.jpg`);
    
    // Add abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_CONFIG.timeout);
    
    try {
      const response = await fetch(`${uploadUrl}/upload/${paymentId}?token=${secureToken}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      showCaptureFeedback(isLocal ? 'Imagem enviada para PC local' : 'Imagem enviada via túnel');
      return result;
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
    
  } catch (error) {
    console.error(`Upload error (attempt ${retryCount + 1}):`, error);
    
    // Check if it's a network change error
    if (error.name === 'AbortError') {
      console.log('Upload timeout, possibly due to network change');
      // Reset and retry with fresh network detection
      UPLOAD_CONFIG.localUrl = null;
    }
    
    // Retry logic
    if (retryCount < UPLOAD_CONFIG.maxRetries) {
      showCaptureFeedback(`Tentando novamente... (${retryCount + 1}/${UPLOAD_CONFIG.maxRetries})`, true);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return uploadImageToServer(imageBlob, paymentId, retryCount + 1);
    }
    
    showCaptureFeedback('Erro ao enviar imagem', true);
    throw error;
  }
}

async function downloadReceiptPhoto(receipt) {
  // This function is now replaced by uploadImageToServer
  // Keeping for reference but not used in new workflow
  const timestamp = new Date(receipt.createdAt).toISOString().replace(/[:.]/g, '-');
  const safeName = receipt.personName.replace(/\s+/g, '_');
  const filename = `PhysikCam_${safeName}_${timestamp}.jpg`;
  const url = URL.createObjectURL(receipt.photoBlob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function showCaptureFeedback(message, isError = false) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isError ? 'rgba(220, 38, 38, 0.94)' : 'rgba(16, 157, 88, 0.94)'};
    color: white;
    padding: 10px 14px;
    border-radius: 10px;
    z-index: 2000;
    font-weight: 600;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 1800);
}

function startCameraPreview() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraError();
    return;
  }

  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  })
    .then((stream) => {
      currentStream = stream;
      cameraVideo.srcObject = stream;
      cameraVideo.play().catch(() => {});
      cameraVideo.addEventListener('loadedmetadata', () => {
        const overlay = document.querySelector('.preview-overlay p');
        if (overlay) overlay.style.display = 'none';
      });
    })
    .catch(showCameraError);
}

function showCameraError() {
  const fallbackText = document.createElement('p');
  fallbackText.textContent = 'Câmera indisponível';
  fallbackText.style.position = 'relative';
  fallbackText.style.zIndex = '4';
  fallbackText.style.color = 'var(--text)';
  cameraPreview.appendChild(fallbackText);
}

async function openNativeGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', async (event) => {
    const files = event.target.files;
    if (!files || !files.length) return;
    
    // Process the first selected image like a camera capture
    const file = files[0];
    console.log('File selected:', file.name, file.type, file.size);
    
    // Convert File to Blob properly
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    console.log('Blob created:', blob.size, blob.type);
    
    flashPreview();
    const selectedPerson = getSelectedPersonName();
    console.log('Selected person:', selectedPerson);
    
    openConfirmPanel(blob, selectedPerson);
    
    if (files.length > 1) {
      showCaptureFeedback(`${files.length} imagem(ns) selecionada(s). Processando a primeira.`);
    } else {
      showCaptureFeedback('Imagem selecionada com sucesso!');
    }
  });
  input.click();
}

function registerServiceWorker() {
  // Temporarily disabled to fix gallery functionality
  // if ('serviceWorker' in navigator) {
  //   window.addEventListener('load', () => {
  //     navigator.serviceWorker.register('sw.js').catch(() => {});
  //   });
  // }
}

window.addEventListener('beforeunload', () => {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }
});

window.addEventListener('DOMContentLoaded', init);
