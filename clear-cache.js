// Cache clearing utility for Scrypture PWA
// Run this in the browser console to clear all caches

/**
 * Clear all caches and service workers
 * @param {boolean} autoReload - Whether to automatically reload the page after clearing
 * @param {boolean} skipConfirmation - Whether to skip the confirmation dialog
 * @returns {Promise<boolean>} - Success status
 */
async function clearAllCaches(autoReload = true, skipConfirmation = false) {
  try {
    // Show confirmation unless skipped
    if (!skipConfirmation) {
      const confirmed = confirm(
        'This will clear all cached data and reload the page.\n\n' +
        'This is useful when you need fresh content after an update.\n\n' +
        'Continue?'
      );
      if (!confirmed) {
        console.log('❌ Cache clearing cancelled by user');
        return false;
      }
    }

    console.log('🧹 Starting cache clearing process...');
    
    // Step 1: Clear all caches
    console.log('📦 Step 1: Clearing caches...');
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
    } else {
      console.log('ℹ️ Service Worker API not available');
    }
    
    // Step 3: Clear storage (optional)
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
    
    console.log('✅ All caches cleared successfully!');
    
    if (autoReload) {
      console.log('🔄 Reloading page in 2 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.log('🔄 Please refresh the page to reload fresh content.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    return false;
  }
}

/**
 * Clear only service worker caches (preserves localStorage)
 * @param {boolean} autoReload - Whether to automatically reload the page after clearing
 * @returns {Promise<boolean>} - Success status
 */
async function clearServiceWorkerCaches(autoReload = true) {
  try {
    console.log('🧹 Clearing service worker caches only...');
    
    // Clear caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }
    
    console.log('✅ Service worker caches cleared!');
    
    if (autoReload) {
      console.log('🔄 Reloading page in 2 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing service worker caches:', error);
    return false;
  }
}

/**
 * Check cache status without clearing
 */
async function checkCacheStatus() {
  console.log('🔍 Checking cache status...');
  
  // Check caches
  const cacheNames = await caches.keys();
  console.log(`📦 Caches (${cacheNames.length}): ${cacheNames.join(', ')}`);
  
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

// Make functions globally available
if (typeof window !== 'undefined') {
  window.clearScryptureCache = clearAllCaches;
  window.clearServiceWorkerCaches = clearServiceWorkerCaches;
  window.checkCacheStatus = checkCacheStatus;
  
  console.log('🛠️ Cache clearing utilities loaded:');
  console.log('  - clearScryptureCache(autoReload, skipConfirmation) - Clear everything');
  console.log('  - clearServiceWorkerCaches(autoReload) - Clear only SW caches');
  console.log('  - checkCacheStatus() - Check current cache status');
}

// Auto-execute only if URL parameter is present
if (typeof window !== 'undefined' && window.location.search.includes('clearCache=true')) {
  console.log('🚀 Auto-clearing cache due to URL parameter...');
  clearAllCaches(true, true);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    clearAllCaches, 
    clearServiceWorkerCaches, 
    checkCacheStatus 
  };
} 