const CACHE_NAME = "vessel-v1";
const RUNTIME_CACHE = "vessel-runtime";
const API_CACHE = "vessel-api";

// Files to cache on install
const STATIC_ASSETS = ["/", "/offline.html", "/manifest.json"];

// Cache strategies
const CACHE_FIRST_URLS = ["/assets/", "/_next/static/"];
const NETWORK_FIRST_URLS = ["/api/", "/agents", "/marketplace", "/dashboard"];
const STALE_WHILE_REVALIDATE_URLS = ["/_next/image"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS).catch(() => {
        console.warn("Some static assets failed to cache");
      });
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name))
      );
      self.clients.claim();
    })()
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Cache first strategy for static assets
  if (CACHE_FIRST_URLS.some((pattern) => url.pathname.includes(pattern))) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
            return response;
          })
        );
      })
    );
    return;
  }

  // Network first strategy for API calls
  if (NETWORK_FIRST_URLS.some((pattern) => url.pathname.includes(pattern))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) throw new Error("Network response not ok");
          const cache = caches.open(API_CACHE);
          cache.then((c) => c.put(request, response.clone()));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return (
              cached || new Response("Offline - cached data unavailable", { status: 503 })
            );
          });
        })
    );
    return;
  }

  // Stale while revalidate for images
  if (STALE_WHILE_REVALIDATE_URLS.some((pattern) => url.pathname.includes(pattern))) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetched = fetch(request).then((response) => {
            cache.put(request, response.clone());
            return response;
          });
          return cached || fetched;
        });
      })
    );
    return;
  }

  // Default: network only
  event.respondWith(fetch(request));
});

// Message handler for cache updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
    );
  }
});
