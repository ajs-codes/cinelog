const CACHE_NAME = "cinelog-v4";

const PRECACHE_ASSETS = [
  "/manifest.webmanifest",
  "/icon.svg",
  "/logo_dark.svg",
  "/logo_light.svg",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/icon-maskable-192x192.png",
  "/icon-maskable-512x512.png",
  "/apple-touch-icon.png",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/file.svg",
  "/tmdb_logo.svg",
  "/imdb_logo.svg",
];

function isStaticAssetPath(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css")
  );
}

function shouldClearNavigationEntry(url) {
  if (url.pathname.startsWith("/api/")) {
    return true;
  }

  if (isStaticAssetPath(url.pathname)) {
    return false;
  }

  return true;
}

async function precacheAssets(cache) {
  await Promise.allSettled(PRECACHE_ASSETS.map((asset) => cache.add(asset)));
}

async function clearNavigationCache() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();

  await Promise.all(
    keys.map(async (request) => {
      const url = new URL(request.url);
      if (shouldClearNavigationEntry(url)) {
        await cache.delete(request);
      }
    }),
  );
}

// Install event: pre-cache critical shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => precacheAssets(cache))
      .then(() => self.skipWaiting()),
  );
});

// Activate event: clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch event: handle offline and caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Don't intercept API requests
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Navigation requests: always fetch from network so dynamic auth/dashboard state is never stale
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Offline - CineLog</title><style>body{background:#121314;color:#f8f9fc;font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;padding:24px;text-align:center;}h1{font-size:1.5rem;margin-bottom:8px;}p{color:#9ca3af;font-size:0.95rem;margin-top:0;}</style></head><body><h1>You're Offline</h1><p>Please check your internet connection to continue using CineLog.</p></body></html>",
          {
            headers: { "Content-Type": "text/html; charset=utf-8" },
            status: 503,
            statusText: "Service Unavailable",
          },
        );
      }),
    );
    return;
  }

  // Static assets (images, png, svg, fonts, css, js): Stale-While-Revalidate / Cache-first
  if (url.origin === self.location.origin && isStaticAssetPath(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      }),
    );
    return;
  }

  // Default: Network only (no cache fallback for dynamic RSC payloads)
  event.respondWith(fetch(request));
});

// Message event: skip waiting and clear auth-gated navigation cache on logout
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data.type === "CLEAR_NAV_CACHE") {
    event.waitUntil(clearNavigationCache());
  }
});
