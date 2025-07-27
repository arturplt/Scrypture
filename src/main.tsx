import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { initializeGlobalData, logGlobalDataState } from './utils/htmlDataBridge';

// Initialize global data from HTML
initializeGlobalData();

// Error boundary for React app
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#1a1a2e',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Courier New, monospace',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1>🚨 App Error</h1>
          <p>Something went wrong with the app.</p>
          <p style={{ fontSize: '0.9em', color: '#999' }}>
            Error: {this.state.error?.message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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

(window as any).forceUpdate = forceServiceWorkerUpdate;

// Add a simple cache status checker
(window as any).checkCacheStatus = async () => {
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

// Log global data state for debugging
logGlobalDataState();

// Add loading state
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Show loading state
rootElement.innerHTML = `
  <div style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #23211a;
    color: #e8e5d2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Press Start 2P', monospace;
    text-align: center;
    font-size: 12px;
  ">
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #2d2b22;
      border: 4px solid #b6a432;
      border-radius: 0px;
      box-shadow: 0 0 20px rgba(182, 164, 50, 0.6);
      animation: fadeIn 0.5s ease-out;
    ">
      <div style="
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #b6a432;
        border: 2px solid #b6a432;
        border-radius: 0px;
        animation: beaverBounce 2s ease-in-out infinite;
      ">
        <img 
          src="/assets/Icons/beaver_32.png" 
          alt="Bóbr" 
          style="
            width: 32px;
            height: 32px;
            filter: brightness(0) saturate(100%) invert(1);
          "
        />
      </div>
      
      <div style="font-size: 12px; text-align: center; margin-bottom: 8px;">
        Loading Scrypture...
      </div>
      
      <div style="font-size: 8px; color: rgba(232, 229, 210, 0.8);">
        Initializing app...
      </div>
      
      <div style="
        width: 120px;
        height: 4px;
        background: #1a1812;
        border-radius: 0px;
        overflow: hidden;
        position: relative;
        margin-top: 8px;
      ">
        <div style="
          height: 100%;
          background: #b6a432;
          border-radius: 0px;
          animation: loadingProgress 2s ease-in-out infinite;
        "></div>
      </div>
    </div>
    
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes beaverBounce {
        0%, 100% {
          transform: scale(1) rotate(0deg);
          box-shadow: 0 0 8px rgba(182, 164, 50, 0.5);
        }
        25% {
          transform: scale(1.1) rotate(-5deg);
          box-shadow: 0 0 16px rgba(182, 164, 50, 0.8);
        }
        50% {
          transform: scale(1.15) rotate(0deg);
          box-shadow: 0 0 20px rgba(182, 164, 50, 1);
        }
        75% {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 16px rgba(182, 164, 50, 0.8);
        }
      }
      
      @keyframes loadingProgress {
        0% {
          width: 0%;
          opacity: 0.5;
        }
        50% {
          width: 70%;
          opacity: 1;
        }
        100% {
          width: 100%;
          opacity: 0.5;
        }
      }
    </style>
  </div>
`;

// Initialize React app with error handling
try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to initialize React app:', error);
  rootElement.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #23211a;
      color: #e8e5d2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Press Start 2P', monospace;
      text-align: center;
      font-size: 12px;
    ">
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #2d2b22;
        border: 4px solid #7b3b3b;
        border-radius: 0px;
        box-shadow: 0 0 20px rgba(123, 59, 59, 0.6);
        animation: fadeIn 0.5s ease-out;
      ">
        <div style="
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #7b3b3b;
          border: 2px solid #7b3b3b;
          border-radius: 0px;
          animation: errorPulse 2s ease-in-out infinite;
        ">
          <div style="font-size: 24px;">🚨</div>
        </div>
        
        <div style="font-size: 12px; text-align: center; margin-bottom: 8px;">
          Initialization Error
        </div>
        
        <div style="font-size: 8px; color: rgba(232, 229, 210, 0.8); margin-bottom: 12px;">
          Failed to load the app
        </div>
        
        <div style="font-size: 6px; color: rgba(232, 229, 210, 0.6); margin-bottom: 12px; max-width: 300px; word-wrap: break-word;">
          Error: ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
        
        <button 
          onclick="window.location.reload()"
          style="
            padding: 8px 16px;
            background: #b6a432;
            color: #23211a;
            border: none;
            border-radius: 0px;
            cursor: pointer;
            font-family: 'Press Start 2P', monospace;
            font-size: 8px;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'"
        >
          Reload App
        </button>
      </div>
      
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes errorPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 8px rgba(123, 59, 59, 0.5);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 16px rgba(123, 59, 59, 0.8);
          }
        }
      </style>
    </div>
  `;
}

