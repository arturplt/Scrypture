# Cache Management Technical Implementation

## Overview

This document provides technical details for the enhanced cache management system in Scrypture, including service worker configuration, cache clearing utilities, and integration patterns.

## Architecture

### Service Worker (`sw.js`)

The service worker implements a comprehensive caching strategy with automatic cache management:

```javascript
// Service Worker for Scrypture PWA
const CACHE_NAME = 'scrypture-v1.3.0';
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
```

### Cache Clearing Utilities (`src/utils/index.ts`)

Reusable cache management functions:

```typescript
/**
 * Clear all caches and service workers
 * @param {boolean} includeStorage - Whether to also clear localStorage and sessionStorage
 * @returns {Promise<boolean>} - Success status
 */
export async function clearAllCaches(includeStorage: boolean = false): Promise<boolean> {
  try {
    console.log('🧹 Starting cache clearing process...');
    
    // Step 1: Clear all caches
    console.log('📦 Step 1: Clearing caches...');
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`Found ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`);
      
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          console.log(`🗑️ Deleting cache: ${cacheName}`);
          const deleted = await caches.delete(cacheName);
          console.log(`✅ Cache ${cacheName}: ${deleted ? 'deleted' : 'not found'}`);
          return deleted;
        })
      );
    }
    
    // Step 2: Unregister service workers
    console.log('🔧 Step 2: Unregistering service workers...');
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`Found ${registrations.length} service worker(s)`);
      
      await Promise.all(
        registrations.map(async (registration) => {
          console.log(`🔧 Unregistering service worker: ${registration.scope}`);
          const unregistered = await registration.unregister();
          console.log(`✅ Service worker ${registration.scope}: ${unregistered ? 'unregistered' : 'failed'}`);
          return unregistered;
        })
      );
    }
    
    // Step 3: Clear storage if requested
    if (includeStorage) {
      console.log('💾 Step 3: Clearing storage...');
      try {
        localStorage.clear();
        console.log('✅ localStorage cleared');
      } catch (error) {
        console.warn('⚠️ Failed to clear localStorage:', error);
      }
      
      try {
        sessionStorage.clear();
        console.log('✅ sessionStorage cleared');
      } catch (error) {
        console.warn('⚠️ Failed to clear sessionStorage:', error);
      }
    }
    
    console.log('✅ Cache clearing completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    return false;
  }
}

/**
 * Check cache status without clearing
 */
export async function checkCacheStatus(): Promise<void> {
  console.log('🔍 Checking cache status...');
  
  // Check caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log(`📦 Caches (${cacheNames.length}): ${cacheNames.join(', ')}`);
  }
  
  // Check service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`🔧 Service Workers (${registrations.length}):`);
    registrations.forEach((reg, i) => {
      console.log(`  ${i + 1}. Scope: ${reg.scope}`);
      console.log(`     Active: ${!!reg.active}`);
      console.log(`     Waiting: ${!!reg.waiting}`);
      console.log(`     Installing: ${!!reg.installing}`);
    });
  }
  
  // Check storage
  console.log(`💾 localStorage items: ${Object.keys(localStorage).length}`);
  console.log(`💾 sessionStorage items: ${Object.keys(sessionStorage).length}`);
}
```

## Integration Patterns

### StorageService Integration

Enhanced `StorageService.clearAllData()` method:

```typescript
// Clear all data
async clearAllData(): Promise<boolean> {
  const keys = Object.values(STORAGE_KEYS);
  let success = true;

  // Clear localStorage items
  keys.forEach((key) => {
    if (!this.removeItem(key)) {
      success = false;
    }
  });

  // Also clear Start Here specific localStorage items
  const startHereKeys = [
    'startHereGivenTasks',
    'startHereGivenHabits'
  ];

  startHereKeys.forEach((key) => {
    if (!this.removeGenericItem(key)) {
      success = false;
    }
  });

  // Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
  } catch (error) {
    console.warn('⚠️ Failed to clear sessionStorage:', error);
    success = false;
  }

  // Clear service worker caches
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`🗑️ Clearing ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`);
      
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          const deleted = await caches.delete(cacheName);
          console.log(`✅ Cache ${cacheName}: ${deleted ? 'deleted' : 'not found'}`);
          return deleted;
        })
      );
    }
  } catch (error) {
    console.warn('⚠️ Failed to clear caches:', error);
    success = false;
  }

  // Unregister service workers
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`🔧 Unregistering ${registrations.length} service worker(s)`);
      
      await Promise.all(
        registrations.map(async (registration) => {
          const unregistered = await registration.unregister();
          console.log(`✅ Service worker ${registration.scope}: ${unregistered ? 'unregistered' : 'failed'}`);
          return unregistered;
        })
      );
    }
  } catch (error) {
    console.warn('⚠️ Failed to unregister service workers:', error);
    success = false;
  }

  // Dispatch custom event to notify components that data has been cleared
  if (success) {
    window.dispatchEvent(new CustomEvent('scrypture-data-cleared'));
    console.log('✅ All data cleared successfully');
  }

  return success;
}
```

### DataManager Component Integration

Enhanced data clearing with cache management:

```typescript
const handleConfirmClearData = async () => {
  setIsSaving(true);
  try {
    console.log('🧹 Starting complete data clear...');
    
    // Clear all data including caches
    const success = await userService.clearAllData();
    
    if (success) {
      // Reset tutorial state
      tutorialService.resetTutorial();
      
      showMessage('All data and cache cleared! Refreshing...', 'success');
      onDataChange?.();
      
      // Refresh the page after clearing data
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Give more time for cache clearing to complete
    } else {
      showMessage('Clear failed - some data may remain', 'error');
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    showMessage('Clear failed', 'error');
  } finally {
    setIsSaving(false);
    setShowClearConfirm(false);
  }
};
```

## Service Worker Registration

Enhanced service worker registration in `main.tsx`:

```typescript
// Register service worker for PWA functionality with better update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Check if we're in development mode - more reliable detection
    const isDevelopment = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '3003' ||
      window.location.port === '5173' ||
      window.location.port === '3000';
    
    console.log('🔧 Environment check:', {
      hostname: window.location.hostname,
      port: window.location.port,
      href: window.location.href,
      isDevelopment
    });
    
    if (isDevelopment) {
      console.log('🔧 Development mode detected - skipping service worker registration');
      
      // In development, unregister any existing service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          console.log('🔧 Unregistering service worker in dev mode:', registration.scope);
          registration.unregister();
        });
      });
      
      return;
    }
    
    console.log('🔧 Production mode detected - registering service worker');
    
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        registration = reg;
        console.log('SW registered: ', reg);
        
        // Check for updates every 30 seconds initially, then every 5 minutes
        let updateInterval = 30000; // Start with 30 seconds
        const checkForUpdates = () => {
          reg.update().then(() => {
            // After first check, increase interval to 5 minutes
            if (updateInterval === 30000) {
              updateInterval = 5 * 60 * 1000;
            }
            setTimeout(checkForUpdates, updateInterval);
          });
        };
        
        // Start checking for updates
        setTimeout(checkForUpdates, updateInterval);
        
        // Handle service worker updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('SW: New version available!');
                // Force the new service worker to take control
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'SW_UPDATED') {
            console.log('SW: Service worker updated, reloading page...');
            // Give a brief moment for any pending operations
            setTimeout(() => window.location.reload(), 100);
          }
        });
        
        // Handle controller change (when new SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW: Controller changed, reloading page...');
          window.location.reload();
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

## Debugging Utilities

### Console Functions

Global debugging functions available in browser console:

```javascript
// Clear all caches and data
window.clearScryptureCache = async () => {
  console.log('🧹 Clearing all caches...');
  
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`📋 Found ${registrations.length} service worker(s)`);
      
      for (const registration of registrations) {
        await registration.unregister();
        console.log(`🔧 Unregistered service worker: ${registration.scope}`);
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`📦 Found ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`);
      
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log(`🗑️ Deleted cache: ${cacheName}`);
      }
    }
    
    // Clear storage
    console.log('💾 Clearing localStorage...');
    localStorage.clear();
    console.log('💾 Clearing sessionStorage...');
    sessionStorage.clear();
    
    console.log('✅ All caches cleared successfully!');
    console.log('🔄 Reloading page in 2 seconds...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
};

// Force service worker update
window.forceUpdate = async () => {
  if (registration) {
    await registration.update();
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
};

// Check cache status
window.checkCacheStatus = async () => {
  console.log('🔍 Checking cache status...');
  
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`📋 Service Workers: ${registrations.length}`);
    registrations.forEach((reg, i) => {
      console.log(`  ${i + 1}. Scope: ${reg.scope}, Active: ${!!reg.active}, Waiting: ${!!reg.waiting}`);
    });
  }
  
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log(`📦 Caches: ${cacheNames.length}`);
    cacheNames.forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });
  }
  
  console.log(`💾 localStorage items: ${Object.keys(localStorage).length}`);
  console.log(`💾 sessionStorage items: ${Object.keys(sessionStorage).length}`);
};
```

## Best Practices

### Cache Versioning

Always update the cache name when deploying new versions:

```javascript
// Update this when deploying new versions
const CACHE_NAME = 'scrypture-v1.3.0';
```

### Error Handling

Comprehensive error handling for all cache operations:

```typescript
try {
  // Cache operation
  const result = await cacheOperation();
  console.log('✅ Operation successful:', result);
} catch (error) {
  console.error('❌ Operation failed:', error);
  // Graceful fallback
  return false;
}
```

### Logging

Detailed logging for debugging:

```typescript
console.log('🧹 Starting cache clearing process...');
console.log(`📦 Found ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`);
console.log(`✅ Cache ${cacheName}: ${deleted ? 'deleted' : 'not found'}`);
```

### User Feedback

Clear user feedback during operations:

```typescript
showMessage('All data and cache cleared! Refreshing...', 'success');
setTimeout(() => {
  window.location.reload();
}, 2000); // Give time for operations to complete
```

## Testing

### Manual Testing

Test cache clearing functionality:

1. **Open browser console**
2. **Run cache status check**:
   ```javascript
   await checkCacheStatus();
   ```
3. **Clear caches**:
   ```javascript
   await clearScryptureCache();
   ```
4. **Verify page refreshes** and shows fresh content

### Automated Testing

Add tests for cache clearing:

```typescript
describe('Cache Management', () => {
  it('should clear all caches successfully', async () => {
    // Mock caches and service workers
    const mockCaches = {
      keys: jest.fn().mockResolvedValue(['cache1', 'cache2']),
      delete: jest.fn().mockResolvedValue(true)
    };
    
    Object.defineProperty(window, 'caches', {
      value: mockCaches,
      writable: true
    });
    
    const result = await clearAllCaches();
    expect(result).toBe(true);
    expect(mockCaches.keys).toHaveBeenCalled();
    expect(mockCaches.delete).toHaveBeenCalledTimes(2);
  });
});
```

## Performance Considerations

### Cache Size Management

Monitor cache sizes and implement cleanup:

```typescript
// Check cache sizes
const cacheSizes = await Promise.all(
  cacheNames.map(async (cacheName) => {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    return { name: cacheName, size: keys.length };
  })
);

console.log('Cache sizes:', cacheSizes);
```

### Selective Clearing

Clear specific caches when needed:

```typescript
// Clear only specific cache
const specificCache = 'scrypture-assets';
await caches.delete(specificCache);
```

## Security Considerations

### Request Filtering

Only cache appropriate requests:

```javascript
// Skip non-GET requests
if (event.request.method !== 'GET') {
  return;
}

// Skip chrome-extension and other non-http requests
if (!event.request.url.startsWith('http')) {
  return;
}
```

### Response Validation

Only cache successful responses:

```javascript
// Don't cache non-successful responses
if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
  return networkResponse;
}
```

## Troubleshooting

### Common Issues

1. **Service worker not updating**:
   - Check cache name version
   - Force update with `window.forceUpdate()`
   - Clear caches manually

2. **Cache not clearing**:
   - Check browser console for errors
   - Verify service worker registration
   - Try manual cache clearing

3. **Page not refreshing**:
   - Increase timeout duration
   - Check for blocking operations
   - Force manual refresh

### Debug Commands

Use these commands in browser console:

```javascript
// Check current status
await checkCacheStatus();

// Clear everything
await clearScryptureCache();

// Force service worker update
await forceUpdate();

// Check service worker registration
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs));
```

## Future Enhancements

### Planned Improvements

1. **Selective Cache Clearing**: Clear specific cache types
2. **Automatic Cache Cleanup**: Periodic cache size management
3. **Cache Analytics**: Monitor cache usage and performance
4. **Offline Support**: Enhanced offline functionality
5. **Background Sync**: Background data synchronization

### Integration Opportunities

1. **Settings Integration**: Add cache management to app settings
2. **Performance Monitoring**: Track cache hit rates and performance
3. **User Preferences**: Allow users to configure cache behavior
4. **Automatic Updates**: Seamless app updates with cache management 