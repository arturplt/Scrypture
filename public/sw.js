// Service Worker for Scrypture PWA
const CACHE_NAME = 'scrypture-v7'; // Increment version to force cache update
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache resources and force activation
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker v4');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Opened cache v4');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        console.log('SW: Skipping waiting');
        return self.skipWaiting();
      })
  );
});

// Fetch event - completely bypass cache for HTML and always fetch fresh
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // For HTML files and the root path, ALWAYS fetch from network, never use cache
  if (event.request.headers.get('accept')?.includes('text/html') || 
      url.pathname === '/' || 
      url.pathname.endsWith('.html')) {
    
    console.log('SW: Fetching HTML from network only:', url.pathname);
    event.respondWith(
      fetch(event.request, { 
        cache: 'no-store', // Force bypass cache
        headers: {
          ...event.request.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      .then((response) => {
        console.log('SW: Network response for HTML:', url.pathname, response.status);
        // Don't cache HTML at all - always fetch fresh
        return response;
      })
      .catch((error) => {
        console.log('SW: Network failed for HTML:', url.pathname, error);
        // Return a basic offline page
        return new Response('App is offline. Please check your connection.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
  } 
  // For JS/CSS/assets, use network first but with cache fallback
  else {
    event.respondWith(
      fetch(event.request, { 
        cache: 'no-cache' // Use cache but revalidate
      })
      .then((response) => {
        // If network succeeds, update cache and return
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
    );
  }
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker v4');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Taking control of all clients');
      // Take control of all clients immediately
      return self.clients.claim();
    }).then(() => {
      // Notify all clients about the update
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            message: 'Service worker updated successfully'
          });
        });
      });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('SW: Received CLEAR_CACHE message');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('SW: Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
}); 