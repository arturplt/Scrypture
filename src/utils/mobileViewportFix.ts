// Mobile viewport height fix utility
// This addresses the issue where 100vh doesn't work correctly on mobile browsers
// due to dynamic toolbars and address bars

export const initializeMobileViewportFix = () => {
  // Only run on mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) return;

  const setViewportHeight = () => {
    // Get the actual viewport height
    const vh = window.innerHeight * 0.01;
    
    // Set CSS custom property for dynamic viewport height
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Also set a fallback for browsers that don't support CSS custom properties
    document.documentElement.style.setProperty('--mobile-vh', `${window.innerHeight}px`);
    
    console.log('Mobile viewport fix applied:', {
      innerHeight: window.innerHeight,
      vh: vh,
      cssVh: getComputedStyle(document.documentElement).getPropertyValue('--vh')
    });
  };

  // Set initial viewport height
  setViewportHeight();

  // Update on resize and orientation change
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    // Add a small delay for orientation change to complete
    setTimeout(setViewportHeight, 100);
  });

  // Also update when the virtual keyboard appears/disappears (iOS)
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // iOS Safari specific fixes
    let initialViewportHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      if (currentHeight !== initialViewportHeight) {
        // Virtual keyboard likely appeared/disappeared
        setTimeout(setViewportHeight, 100);
        initialViewportHeight = currentHeight;
      }
    });
  }

  return () => {
    // Cleanup function
    window.removeEventListener('resize', setViewportHeight);
    window.removeEventListener('orientationchange', setViewportHeight);
  };
};

// CSS helper function to get the correct viewport height
export const getMobileViewportHeight = (): number => {
  const vh = window.innerHeight;
  const cssVh = getComputedStyle(document.documentElement).getPropertyValue('--vh');
  
  if (cssVh) {
    return parseFloat(cssVh) * 100;
  }
  
  return vh;
};

// Check if we're on a mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if we're on iOS
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Check if we're on Android
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
}; 