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

const appState = {
  paymentsWaitingProof: [
    {
      personName: 'Joao Manoel Matildes Silva',
      plan: 'Plano Mensal',
      paymentMethod: 'PIX',
      amount: 120,
      createdAt: Date.now() - 60000
    },
    {
      personName: 'Maria Oliveira',
      plan: 'Plano Trimestral',
      paymentMethod: 'Cartão',
      amount: 320,
      createdAt: Date.now() - 90000
    }
  ],
  receipts: []
};

function init() {
  renderWheel();
  initWheelSelector();
  centerSelectedWheelItem();
  initActions();
  startCameraPreview();
  registerServiceWorker();
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

  const receipt = {
    id: crypto.randomUUID(),
    personName,
    plan: planSelect.value,
    paymentMethod: paymentMethodSelect.value,
    amount: Number(amountInput.value),
    createdAt: Date.now(),
    photoBlob: currentCapture.photoBlob
  };

  appState.receipts.push(receipt);
  appState.paymentsWaitingProof = appState.paymentsWaitingProof.filter(
    (payment) => normalizePersonName(payment.personName) !== normalizePersonName(personName)
  );

  await downloadReceiptPhoto(receipt);
  renderWheel();
  centerSelectedWheelItem();
  closeConfirmPanel();
  showCaptureFeedback('Comprovante confirmado com sucesso!');
}

async function downloadReceiptPhoto(receipt) {
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
  input.multiple = true;
  input.addEventListener('change', (event) => {
    const files = event.target.files;
    if (!files || !files.length) return;
    showCaptureFeedback(`${files.length} imagem(ns) selecionada(s)`);
  });
  input.click();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}

window.addEventListener('beforeunload', () => {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }
});

window.addEventListener('DOMContentLoaded', init);
