const CACHE_NAME = "vessel-v1";
const RUNTIME_CACHE = "vessel-runtime";
const API_CACHE = "vessel-api";

// Cache strategies
const CACHE_FIRST_URLS = ["/assets/", "/_next/static/", "/_next/image"];
const NETWORK_FIRST_URLS = ["/api/"];
const STALE_WHILE_REVALIDATE_URLS = ["/_next/"];

// Network timeout (5 seconds)
const NETWORK_TIMEOUT = 5000;

/**
 * Helper: Fetch with timeout
 */
function fetchWithTimeout(request, timeout = NETWORK_TIMEOUT) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Network timeout")), timeout)
    ),
  ]);
}

/**
 * Helper: Cache response safely (clone before any consumption)
 */
async function cacheResponse(cacheName, request, response) {
  try {
    // Only cache successful responses
    if (!response || response.status < 200 || response.status >= 300) {
      return;
    }

    // Clone BEFORE doing anything else with response
    const responseToCache = response.clone();
    const cache = await caches.open(cacheName);
    await cache.put(request, responseToCache);
  } catch (error) {
    console.warn("[SW] Cache error:", error.message);
    // Fail silently - caching is not critical
  }
}

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        // Only cache critical assets that actually exist
        const assets = ["/manifest.json"];
        await cache.addAll(assets).catch(() => {
          console.warn("[SW] Some assets failed to cache (OK)");
        });
      } catch (error) {
        console.warn("[SW] Install error:", error.message);
      }
      self.skipWaiting();
    })()
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== CACHE_NAME &&
                name !== RUNTIME_CACHE &&
                name !== API_CACHE
            )
            .map((name) => caches.delete(name))
        );
      } catch (error) {
        console.warn("[SW] Activate error:", error.message);
      }
      self.clients.claim();
    })()
  );
});

// Fetch event with proper Response handling
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip non-http(s) schemes (chrome-extension, data, etc)
  if (!url.protocol.startsWith("http")) {
    return; // Let browser handle it
  }

  // Cache-first strategy for static assets
  if (CACHE_FIRST_URLS.some((pattern) => url.pathname.includes(pattern))) {
    event.respondWith(
      (async () => {
        try {
          // Check cache first
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }

          // Network fallback
          const response = await fetchWithTimeout(request);

          // Cache the response (safely cloned inside function)
          await cacheResponse(CACHE_NAME, request, response);

          return response.clone(); // Return a clone for safety
        } catch (error) {
          console.warn("[SW] Cache-first error:", error.message);
          // Return offline page or empty response
          return new Response("Offline - page not available", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })()
    );
    return;
  }

  // Network-first strategy for API calls
  if (NETWORK_FIRST_URLS.some((pattern) => url.pathname.includes(pattern))) {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const response = await fetchWithTimeout(request);

          // Clone for caching BEFORE returning
          await cacheResponse(API_CACHE, request, response);

          return response.clone(); // Return a fresh clone
        } catch (error) {
          console.warn("[SW] Network-first error:", error.message);

          // Fall back to cache on network failure
          try {
            const cached = await caches.match(request);
            if (cached) {
              return cached;
            }
          } catch (cacheError) {
            console.warn("[SW] Cache fallback error:", cacheError.message);
          }

          // Return offline response
          return new Response(
            JSON.stringify({
              error: "Offline - no cached data available",
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      })()
    );
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);

        // Start background fetch
        const networkPromise = fetchWithTimeout(request)
          .then(async (response) => {
            await cacheResponse(RUNTIME_CACHE, request, response);
            return response.clone();
          })
          .catch((error) => {
            console.warn("[SW] Background fetch error:", error.message);
            return null;
          });

        // Return cached immediately if available, otherwise wait for network
        return cached || (await networkPromise) || new Response(null, { status: 503 });
      } catch (error) {
        console.warn("[SW] Stale-while-revalidate error:", error.message);
        return new Response(null, { status: 503 });
      }
    })()
  );
});

// Message handler for cache control
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      (async () => {
        try {
          const names = await caches.keys();
          await Promise.all(names.map((name) => caches.delete(name)));
          console.log("[SW] All caches cleared");
        } catch (error) {
          console.warn("[SW] Clear cache error:", error.message);
        }
      })()
    );
  }
});

console.log("[SW] ✓ Service Worker v1 loaded");
