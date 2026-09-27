/**
 * FlowFace — service worker.
 *
 * Arquivos do site: rede primeiro, cache se estiver sem internet. Assim uma
 * versão nova chega no próximo carregamento, sem "?v=" nem cache preso.
 * Runtime do ONNX (jsDelivr, com versão fixa na URL) e o modelo: cache
 * primeiro, porque nunca mudam.
 */

const CACHE = 'flowface-v7';
const BASE = new URL('./', self.location).pathname;

const APP = [
  '',
  'index.html',
  'styles.css',
  'app.js',
  'detector.worker.js',
  'manifest.json',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  'models/yunet-2023mar-dinamico.onnx'
].map((arquivo) => BASE + arquivo);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  const imutavel = url.hostname === 'cdn.jsdelivr.net' || url.pathname.endsWith('.onnx');
  if (imutavel) {
    event.respondWith(cachePrimeiro(req));
    return;
  }
  if (url.origin === self.location.origin && url.pathname.startsWith(BASE)) {
    event.respondWith(redePrimeiro(req));
  }
});

async function cachePrimeiro(req) {
  const guardado = await caches.match(req);
  if (guardado) return guardado;
  const resposta = await fetch(req);
  if (resposta.ok) {
    const copia = resposta.clone();
    caches.open(CACHE).then((cache) => cache.put(req, copia));
  }
  return resposta;
}

async function redePrimeiro(req) {
  try {
    const resposta = await fetch(req);
    if (resposta.ok) {
      const copia = resposta.clone();
      caches.open(CACHE).then((cache) => cache.put(req, copia));
    }
    return resposta;
  } catch (erro) {
    const guardado = await caches.match(req, { ignoreSearch: true });
    if (guardado) return guardado;
    throw erro;
  }
}
