const app = document.getElementById('app');
const wheelList = document.querySelector('.wheel-list');
const items = Array.from(document.querySelectorAll('.wheel-item:not(.wheel-spacer)'));
const cameraPreview = document.getElementById('camera-preview');
const cameraVideo = document.getElementById('camera-video');
const galleryButton = document.getElementById('gallery-button');
const captureButton = document.getElementById('capture-button');

function activateItem(item) {
  items.forEach((option) => {
    option.dataset.selected = 'false';
    option.setAttribute('aria-selected', 'false');
  });

  item.dataset.selected = 'true';
  item.setAttribute('aria-selected', 'true');
  item.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function initWheelSelector() {
  const selected = document.querySelector('.wheel-item[data-selected="true"]');
  if (selected) {
    setTimeout(() => {
      selected.scrollIntoView({ block: 'center', behavior: 'auto' });
    }, 50);
  }

  items.forEach((item) => {
    item.addEventListener('click', () => {
      activateItem(item);
    });
  });
}

function flashPreview() {
  cameraPreview.classList.add('flash');
  window.setTimeout(() => cameraPreview.classList.remove('flash'), 260);
}

function initActions() {
  if (galleryButton) {
    galleryButton.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: 'PhysikCam', text: 'Abrir galeria.' }).catch(() => {});
      } else {
        console.log('Abrir galeria - ação do botão');
      }
    });
  }

  if (captureButton) {
    captureButton.addEventListener('click', () => {
      flashPreview();
      console.log('Capturar foto - ação do botão');
    });
  }
}

function startCameraPreview() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('Navegador não suporta câmera');
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then((stream) => {
      cameraVideo.srcObject = stream;
      cameraVideo.play().catch(() => {});
    })
    .catch((error) => {
      console.error('Erro ao iniciar câmera:', error);
      const fallbackText = document.createElement('p');
      fallbackText.textContent = 'Câmera indisponível';
      fallbackText.style.position = 'relative';
      fallbackText.style.zIndex = '4';
      fallbackText.style.color = 'var(--text)';
      cameraPreview.appendChild(fallbackText);
    });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((error) => {
        console.error('SW registration failed:', error);
      });
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initWheelSelector();
  initActions();
  startCameraPreview();
  registerServiceWorker();
});
