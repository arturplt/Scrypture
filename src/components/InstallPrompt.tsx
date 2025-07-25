import React, { useState, useEffect } from 'react';
import styles from './InstallPrompt.module.css';

// Extend Navigator interface for standalone property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface InstallPromptProps {
  onClose: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onClose }) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    setIsStandalone(window.navigator.standalone || 
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches));
    
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
  }, []);

  // Don't show if already in standalone mode
  if (isStandalone) {
    return null;
  }

  const handleClose = () => {
    // Mark that install prompt has been shown
    localStorage.setItem('installPromptShown', 'true');
    onClose();
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        title: "Add to Home Screen",
        steps: [
          "Tap the Share button (📤) in Safari",
          "Scroll down and tap 'Add to Home Screen'",
          "Tap 'Add' to install"
        ]
      };
    } else if (isAndroid) {
      return {
        title: "Install App",
        steps: [
          "Tap the menu button (⋮) in Chrome",
          "Tap 'Add to Home screen'",
          "Tap 'Add' to install"
        ]
      };
    } else {
      return {
        title: "Install App",
        steps: [
          "Open this page in your mobile browser",
          "Use your browser's 'Add to Home Screen' option",
          "Launch from your home screen for full-screen experience"
        ]
      };
    }
  };

  const instructions = getInstallInstructions();

  return (
    <div className={styles.overlay}>
      <div className={styles.prompt}>
        <div className={styles.header}>
          <h3>📱 {instructions.title}</h3>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close install prompt"
          >
            ✕
          </button>
        </div>
        
        <div className={styles.content}>
          <p>For the best experience with no address bar:</p>
          <ol className={styles.steps}>
            {instructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          
          <div className={styles.benefits}>
            <h4>✨ Benefits:</h4>
            <ul>
              <li>Full-screen experience</li>
              <li>No address bar</li>
              <li>App-like feel</li>
              <li>Offline access</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={handleClose}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}; 