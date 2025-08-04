// Service Worker for Scrypture PWA
const CACHE_NAME = 'scrypture-v1.4.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache resources:', error);
        throw error;
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve from cache if available
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
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Fetch from network if not in cache
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('Service Worker: Cached new resource:', event.request.url);
              })
              .catch((error) => {
                console.error('Service Worker: Failed to cache resource:', error);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error);
            // Return a fallback response for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            throw error;
          });
      })
      .catch((error) => {
        console.error('Service Worker: Cache match failed:', error);
        throw error;
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      console.log('Service Worker: Taking control of all clients');
      return self.clients.claim();
    }).catch((error) => {
      console.error('Service Worker: Activation failed:', error);
      throw error;
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Received clear cache message');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: All caches cleared');
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      console.error('Service Worker: Failed to clear caches:', error);
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skipping waiting');
    self.skipWaiting();
  }
}); 