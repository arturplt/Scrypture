import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { initializeGlobalData, logGlobalDataState } from './utils/htmlDataBridge';
import { logger } from './utils/logger';

// Add build timestamp for cache busting
logger.info('🚀 Scrypture App Starting...');
logger.info('📅 Build timestamp:', new Date().toISOString());
logger.info('🔧 Environment:', import.meta.env?.MODE || 'unknown');

// Initialize global data from HTML
initializeGlobalData();

// Enhanced error boundary for React app with mobile-specific handling
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
    logger.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Log additional mobile-specific debugging info
    logger.info('Mobile Debug Info:', {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight
      },
      orientation: screen.orientation?.type || 'unknown',
      touchSupport: 'ontouchstart' in window,
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined'
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: 'calc(var(--vh, 1vh) * 100)',
          background: '#1a1a2e',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Courier New, monospace',
          padding: '2rem',
          textAlign: 'center',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          <h1>🚨 App Error</h1>
          <p>Something went wrong with the app.</p>
          <p style={{ fontSize: '0.9em', color: '#999', marginTop: '1rem' }}>
            Error: {this.state.error?.message}
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.8em', color: '#666' }}>
            <p>Device: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</p>
            <p>Viewport: {window.innerWidth} × {window.innerHeight}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
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
let reloadOnUpdate = false;

const promptForServiceWorkerUpdate = () => {
  if (reloadOnUpdate) return;

  const shouldReload = window.confirm(
    'A new version is available. Reload now to update?'
  );

  if (shouldReload) {
    reloadOnUpdate = true;
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
};

// Function to clear all caches
const clearAllCaches = async (): Promise<boolean> => {
  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      logger.info('🧹 All caches cleared');
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
    logger.error('❌ Failed to clear caches:', error);
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
  logger.info('🧹 Clearing all caches...');
  
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      logger.info(`📋 Found ${registrations.length} service worker(s)`);
      
      for (const registration of registrations) {
        await registration.unregister();
        logger.info(`🔧 Unregistered service worker: ${registration.scope}`);
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      logger.info(`📦 Found ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`);
      
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        logger.info(`🗑️ Deleted cache: ${cacheName}`);
      }
    }
    
    // Clear storage
    logger.info('💾 Clearing localStorage...');
    localStorage.clear();
    logger.info('💾 Clearing sessionStorage...');
    sessionStorage.clear();
    
    logger.info('✅ All caches cleared successfully!');
    logger.info('🔄 Reloading page in 2 seconds...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    logger.error('❌ Error clearing caches:', error);
  }
};

(window as any).forceUpdate = forceServiceWorkerUpdate;

// Add a simple cache status checker
(window as any).checkCacheStatus = async () => {
  logger.info('🔍 Checking cache status...');
  
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    logger.info(`📋 Service Workers: ${registrations.length}`);
    registrations.forEach((reg, i) => {
      logger.info(`  ${i + 1}. Scope: ${reg.scope}, Active: ${!!reg.active}, Waiting: ${!!reg.waiting}`);
    });
  }
  
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    logger.info(`📦 Caches: ${cacheNames.length}`);
    cacheNames.forEach((name, i) => {
      logger.info(`  ${i + 1}. ${name}`);
    });
  }
  
  logger.info(`💾 localStorage items: ${Object.keys(localStorage).length}`);
  logger.info(`💾 sessionStorage items: ${Object.keys(sessionStorage).length}`);
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
    
    logger.info('🔧 Environment check:', {
      hostname: window.location.hostname,
      port: window.location.port,
      href: window.location.href,
      isDevelopment
    });
    
    if (isDevelopment) {
      logger.info('🔧 Development mode detected - skipping service worker registration');
      
      // In development, unregister any existing service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          logger.info('🔧 Unregistering service worker in dev mode:', registration.scope);
          registration.unregister();
        });
      });
      
      return;
    }
    
    logger.info('🔧 Production mode detected - registering service worker');
    
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        registration = reg;
        logger.info('SW registered: ', reg);
        
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
                logger.info('SW: New version available!');
                promptForServiceWorkerUpdate();
              }
            });
          }
        });
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'SW_UPDATED') {
            logger.info('SW: Service worker updated');
            if (reloadOnUpdate) {
              logger.info('SW: Reloading page after update approval...');
              setTimeout(() => window.location.reload(), 100);
            }
          }
        });
        
        // Handle controller change (when new SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          logger.info('SW: Controller changed');
          if (reloadOnUpdate) {
            logger.info('SW: Reloading page after update approval...');
            window.location.reload();
          }
        });
      })
      .catch((registrationError) => {
        logger.error('SW registration failed: ', registrationError);
      });
  });
}

// Log global data state for debugging
logGlobalDataState();

// Initialize React app with error handling
try {
  // Check if root element exists
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  // Check for mobile-specific issues
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  logger.info('Mobile Debug - Initialization:', {
    isMobile,
    isIOS,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    screen: {
      width: screen.width,
      height: screen.height
    },
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent
  });

  // Mobile-specific viewport fixes
  if (isMobile) {
    // Fix for iOS Safari viewport issues
    if (isIOS) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
    }
    
    // Ensure proper viewport height on mobile
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
  }

  // Create React root with error boundary
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  logger.info('React app initialized successfully');
  
} catch (error) {
  logger.error('Failed to initialize React app:', error);
  
  // Show a more detailed error screen
  const rootElement = document.getElementById('root');
  if (rootElement) {
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
        padding: 2rem;
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
          max-width: 90vw;
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
          
          <div style="font-size: 6px; color: rgba(232, 229, 210, 0.5); margin-bottom: 12px;">
            <p>Device: ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</p>
            <p>Viewport: ${window.innerWidth} × ${window.innerHeight}</p>
            <p>Screen: ${screen.width} × ${screen.height}</p>
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
}

