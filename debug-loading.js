// Debug script for loading screen testing
// Run this in browser console

console.log('🔧 Loading Screen Debug Tools');

// Function to trigger loading screen
window.debugLoading = function(duration = 3000) {
  console.log(`Triggering loading screen for ${duration}ms`);
  
  // Find the debug loading state setter
  const appElement = document.querySelector('[data-testid="app"]') || document.querySelector('.app');
  if (appElement && appElement._reactInternalFiber) {
    // Try to access React state
    console.log('App element found, attempting to trigger loading...');
  }
  
  // Alternative: Create a temporary loading overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--color-bg-primary);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Press Start 2P', monospace;
    color: var(--color-text-primary);
  `;
  
  overlay.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background: var(--color-bg-secondary);
      border: 4px solid var(--color-accent-gold);
      border-radius: 0px;
      box-shadow: 0 0 20px rgba(182, 164, 50, 0.6);
    ">
      <div style="
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-accent-gold);
        border: 2px solid var(--color-accent-gold);
        border-radius: 0px;
        animation: beaverBounce 2s ease-in-out infinite;
      ">
        <img src="/assets/Icons/beaver_32.png" alt="Bóbr" style="
          width: 32px;
          height: 32px;
          filter: brightness(0) saturate(100%) invert(1);
        ">
      </div>
      <div style="font-size: var(--font-size-md); text-align: center;">
        Debug Loading...
      </div>
      <div style="
        width: 120px;
        height: 4px;
        background: var(--color-bg-tertiary);
        border-radius: 0px;
        overflow: hidden;
        position: relative;
      ">
        <div style="
          height: 100%;
          background: var(--color-accent-gold);
          border-radius: 0px;
          animation: loadingProgress 2s ease-in-out infinite;
        "></div>
      </div>
    </div>
    <style>
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
  `;
  
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    document.body.removeChild(overlay);
    console.log('Loading screen removed');
  }, duration);
};

// Function to check current loading states
window.checkLoadingStates = function() {
  console.log('🔍 Checking loading states...');
  
  // Look for loading indicators
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="overlay"]');
  console.log('Found loading elements:', loadingElements.length);
  
  // Check for React state indicators
  const appElement = document.querySelector('.app');
  if (appElement) {
    console.log('App element found:', appElement);
  }
  
  // Check for any visible overlays
  const overlays = document.querySelectorAll('[style*="position: fixed"][style*="z-index"]');
  console.log('Fixed overlays found:', overlays.length);
  
  return {
    loadingElements: loadingElements.length,
    overlays: overlays.length,
    appElement: !!appElement
  };
};

// Function to simulate saving states
window.simulateSaving = function() {
  console.log('💾 Simulating saving states...');
  
  // This would need to be integrated with your React state
  // For now, just trigger the debug loading
  window.debugLoading(2000);
};

console.log('Available commands:');
console.log('- debugLoading(duration) - Trigger loading screen');
console.log('- checkLoadingStates() - Check current loading states');
console.log('- simulateSaving() - Simulate saving states'); 