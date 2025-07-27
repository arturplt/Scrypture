// Cache clearing utility for Scrypture
// Run this in browser console to clear all caches and force a fresh reload

async function clearAllCaches() {
  console.log('🧹 Starting cache clearing process...');
  
  try {
    // 1. Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('📦 Found caches:', cacheNames);
      
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log('🗑️ Deleted cache:', cacheName);
      }
    }
    
    // 2. Unregister Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('🔧 Unregistered service worker:', registration.scope);
      }
    }
    
    // 3. Clear localStorage
    localStorage.clear();
    console.log('💾 Cleared localStorage');
    
    // 4. Clear sessionStorage
    sessionStorage.clear();
    console.log('💾 Cleared sessionStorage');
    
    // 5. Clear IndexedDB (if any)
    if ('indexedDB' in window) {
      // This is a simplified approach - in practice you'd need to know the DB names
      console.log('🗄️ IndexedDB clearing skipped (manual clear recommended)');
    }
    
    console.log('✅ Cache clearing complete!');
    console.log('🔄 Reloading page in 2 seconds...');
    
    // Force reload after clearing
    setTimeout(() => {
      window.location.reload(true);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
}

// Also provide individual clearing functions
window.clearScryptureCache = clearAllCaches;

window.clearServiceWorkerOnly = async function() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log('🗑️ Deleted cache:', cacheName);
    }
  }
  console.log('✅ Service Worker caches cleared');
};

window.clearStorageOnly = function() {
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Storage cleared');
};

console.log('🛠️ Cache clearing utilities loaded:');
console.log('  - clearScryptureCache() - Clear everything and reload');
console.log('  - clearServiceWorkerOnly() - Clear only SW caches');
console.log('  - clearStorageOnly() - Clear only localStorage/sessionStorage');

// Auto-run if requested
if (window.location.search.includes('clearCache=true')) {
  console.log('🚀 Auto-clearing cache due to URL parameter...');
  clearAllCaches();
} 