const CACHE_NAME = 'iceland-map-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/data/iceland-places.csv',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Cache each URL individually and don't fail if some don't exist
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.log(`Failed to cache ${url}:`, err);
              return null; // Don't fail the entire installation
            })
          )
        );
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // For navigation requests, try network first, then fallback to cached index
        if (event.request.mode === 'navigate') {
          return fetch(event.request)
            .then((response) => {
              // Only cache successful responses
              if (response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            })
            .catch(() => {
              // Network failed, return cached index.html
              return caches.match('/');
            });
        }

        // For other requests, try network first then cache
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network failed, check cache
            return caches.match(event.request);
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim control of all clients
  return self.clients.claim();
});
