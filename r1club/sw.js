const VERSION = "r1-club-v7";
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;
const MAX_RUNTIME_ENTRIES = 80;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./favicon.png",
  "./assets/icons/r1-logo.png",
  "./assets/login/login-bg-athlete.png",
  "./assets/icons/calendar.png",
  "./assets/icons/shield-check.png"
];

const isSameOrigin = (request) => {
  return new URL(request.url).origin === self.location.origin;
};

const trimRuntimeCache = async () => {
  const cache = await caches.open(RUNTIME);
  const keys = await cache.keys();

  if (keys.length <= MAX_RUNTIME_ENTRIES) {
    return;
  }

  await Promise.all(keys.slice(0, keys.length - MAX_RUNTIME_ENTRIES).map((key) => cache.delete(key)));
};

const cacheFirstWithRefresh = async (request) => {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);

  const refresh = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
        trimRuntimeCache();
      }

      return response;
    })
    .catch(() => undefined);

  if (cached) {
    return cached;
  }

  const response = await refresh;
  return response || caches.match("./index.html");
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => {
      return cache.addAll(CORE_ASSETS.map((asset) => new Request(asset, { cache: "reload" })));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => ![PRECACHE, RUNTIME].includes(key))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isSameOrigin(request)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(cacheFirstWithRefresh(request));
});
