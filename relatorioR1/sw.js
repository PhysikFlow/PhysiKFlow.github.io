const VERSION = "relatorio-r1-v17-physik-server-unit-id-2026-07-23";
const CACHE_PREFIXES_TO_DELETE = [
  "relatorio-r1-",
  "relatorio-r1-v",
  "relatorio-r1-beta-",
  "relatorio-r1-bank-"
];
const RUNTIME = `${VERSION}-runtime`;

const isSameOrigin = (request) => new URL(request.url).origin === self.location.origin;

async function clearOldCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key !== RUNTIME && CACHE_PREFIXES_TO_DELETE.some((prefix) => key.startsWith(prefix)))
      .map((key) => caches.delete(key))
  );
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);

  try {
    const response = await fetch(new Request(request, { cache: "reload" }));
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") return cache.match("./index.html");
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(clearOldCaches());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clearOldCaches().then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (type === "CLEAR_APP_CACHES") {
    event.waitUntil(clearOldCaches());
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isSameOrigin(request)) return;

  event.respondWith(networkFirst(request));
});
