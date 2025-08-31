// Development service worker - does nothing
// This prevents any caching in development mode

console.log('Development service worker loaded - no caching enabled');

// Just pass through all requests without caching
self.addEventListener('fetch', (event) => {
  // Do nothing - let all requests go through normally
  return;
});

self.addEventListener('install', (event) => {
  console.log('Dev SW installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Dev SW activated');
  // Clear all caches in development
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  return self.clients.claim();
});
