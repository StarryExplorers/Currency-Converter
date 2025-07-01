const CACHE_NAME = "ultra-currency-cache-v1";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
];

// Install event: cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch event: serve from cache or fetch from network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Serve from cache, or fetch from network
      return (
        response ||
        fetch(event.request).catch(() =>
          // Fallback for failed requests (like offline API fetches)
          new Response("You are offline.", {
            status: 503,
            statusText: "Offline",
            headers: { "Content-Type": "text/plain" },
          })
        )
      );
    })
  );
});
