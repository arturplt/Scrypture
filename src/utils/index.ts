/**
 * Generate a UUID with fallback for browsers that don't support crypto.randomUUID()
 */
export function generateUUID(): string {
  // Try to use crypto.randomUUID() if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
