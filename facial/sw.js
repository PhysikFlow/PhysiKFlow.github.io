const CACHE_NAME = 'flowface-v2';
const STATIC_ASSETS = [
  '/facial/',
  '/facial/index.html',
  '/facial/styles.css',
  '/facial/app.js',
  '/facial/manifest.json',
  '/facial/detector.worker.js',
  '/facial/db.js',
  '/facial/supabase.js',
  '/facial/icon.svg'
];

// ONNX models to cache for offline use
const MODEL_URLS = [
  // Modelos serão baixados dinamicamente
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Cache-first for static assets
  if (STATIC_ASSETS.some(a => url.pathname === a || url.pathname.endsWith(a.replace('/facial/', '')))) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Network-first for API calls
  if (url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-while-revalidate for other requests
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
      return cached || fetchPromise;
    })
  );
});

// Handle ONNX model caching
self.addEventListener('message', event => {
  if (event.data.type === 'CACHE_MODEL') {
    event.waitUntil(
      caches.open('flowface-models').then(cache =>
        cache.add(event.data.url)
      )
    );
  }
});
