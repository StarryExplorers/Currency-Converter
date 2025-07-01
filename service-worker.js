const CACHE_NAME = "ultra-currency-cache-v2";
const OFFLINE_URL = "index.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        "manifest.json",
        "icon-192.png",
        "icon-512.png",
      ]);
    })
  );
  self.skipWaiting(); // Force install
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim(); // Take control immediately
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache the response
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(() => {
        // If failed, try from cache
        return caches.match(event.request).then((cached) => {
          return (
            cached ||
            (event.request.mode === "navigate"
              ? caches.match(OFFLINE_URL)
              : null)
          );
        });
      })
  );
});
