import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { initializeGlobalData, logGlobalDataState } from './utils/htmlDataBridge';

// Initialize global data from HTML
initializeGlobalData();

// Service worker management functions
let registration: ServiceWorkerRegistration | null = null;

// Function to clear all caches
const clearAllCaches = async (): Promise<boolean> => {
  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🧹 All caches cleared');
    }
    
    // Send message to service worker to clear its caches too
    if (registration && registration.active) {
      const messageChannel = new MessageChannel();
      registration.active.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2]);
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
        };
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
    return false;
  }
};

// Function to force service worker update
const forceServiceWorkerUpdate = async (): Promise<void> => {
  if (registration) {
    await registration.update();
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
};

// Make functions globally available for debugging
(window as any).clearScryptureCache = async () => {
  console.log('🧹 Clearing all caches...');
  const success = await clearAllCaches();
  if (success) {
    console.log('✅ Caches cleared, reloading...');
    setTimeout(() => window.location.reload(), 1000);
  }
};

(window as any).forceUpdate = forceServiceWorkerUpdate;

// Register service worker for PWA functionality with better update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
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

// Log global data state for debugging
logGlobalDataState();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

