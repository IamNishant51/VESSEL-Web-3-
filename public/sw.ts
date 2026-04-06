/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "vessel-v1";
const RUNTIME_CACHE = "vessel-runtime";
const API_CACHE = "vessel-api";

// Files to cache on install
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
];

// Cache strategies
const CACHE_FIRST_URLS = ["/assets/", "/_next/static/"];
const NETWORK_FIRST_URLS = ["/api/", "/agents", "/marketplace", "/dashboard"];
const STALE_WHILE_REVALIDATE_URLS = ["/_next/image"];

// Install event - cache static assets
self.addEventListener("install", (event: ExtendableEvent) => {
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
self.addEventListener("activate", (event: ExtendableEvent) => {
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
self.addEventListener("fetch", (event: FetchEvent) => {
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
            return cached || new Response("Offline - cached data unavailable", { status: 503 });
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

// Background sync for queued actions
self.addEventListener("sync", (event: any) => {
  if (event.tag === "sync-conversations") {
    event.waitUntil(syncConversations());
  }
  if (event.tag === "sync-preferences") {
    event.waitUntil(syncPreferences());
  }
});

async function syncConversations() {
  try {
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();
    const conversationRequests = requests.filter((req) =>
      req.url.includes("/api/db") && req.url.includes("conversation")
    );

    for (const request of conversationRequests) {
      try {
        await fetch(request.clone());
      } catch (error) {
        console.warn("Failed to sync conversation:", error);
      }
    }
  } catch (error) {
    console.warn("Sync conversations failed:", error);
  }
}

async function syncPreferences() {
  try {
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();
    const prefRequests = requests.filter((req) => req.url.includes("/api/auth/user"));

    for (const request of prefRequests) {
      try {
        await fetch(request.clone());
      } catch (error) {
        console.warn("Failed to sync preferences:", error);
      }
    }
  } catch (error) {
    console.warn("Sync preferences failed:", error);
  }
}

// Message handler for cache updates
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
    );
  }
});

export {};
