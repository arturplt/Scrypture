import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import styles from './CombinationLockModal.module.css';

interface CombinationLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export const CombinationLockModal: React.FC<CombinationLockModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
}) => {
  const [combination, setCombination] = useState([2, 1, 3, 6]); // Default to 2136
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const correctCode = [2, 1, 3, 7]; // The correct combination is 2137

  useEffect(() => {
    if (isOpen) {
      setCombination([2, 1, 3, 6]); // Reset to default when opened
      setIsUnlocked(false);
      setAttempts(0);
    }
  }, [isOpen]);



  // Check combination whenever it changes
  useEffect(() => {
    if (isOpen && !isUnlocked) {
      const isCorrect = combination.every((digit, index) => digit === correctCode[index]);
      if (isCorrect) {
        setIsUnlocked(true);
        // Delay the unlock callback to allow animation to complete
        setTimeout(() => {
          onUnlock();
        }, 800); // Wait for animation to complete (0.6s) plus some buffer
      }
    }
  }, [combination, isOpen, isUnlocked]);

  const handleDigitChange = (index: number, direction: 'up' | 'down') => {
    if (isUnlocked) return;

    setCombination(prev => {
      const newCombination = [...prev];
      if (direction === 'up') {
        newCombination[index] = (newCombination[index] + 1) % 10;
      } else {
        newCombination[index] = (newCombination[index] - 1 + 10) % 10;
      }
      return newCombination;
    });
  };

  const checkCombination = () => {
    const isCorrect = combination.every((digit, index) => digit === correctCode[index]);
    
    if (isCorrect) {
      setIsUnlocked(true);
      // Delay the unlock callback to allow animation to complete
      setTimeout(() => {
        onUnlock();
      }, 800); // Wait for animation to complete (0.6s) plus some buffer
    } else {
      setShake(true);
      setAttempts(prev => prev + 1);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      checkCombination();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.lockBody}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          title="Close"
        >
          ×
        </button>
        
        <div className={styles.lockHandle}>
          <div className={`${styles.handle} ${isUnlocked ? styles.unlocked : ''}`}>
            <div className={styles.handleGrip}></div>
          </div>
        </div>
        
        <div className={`${styles.dials} ${shake ? styles.shake : ''}`}>
          {combination.map((digit, index) => (
            <div key={index} className={styles.dialContainer}>
              <div className={styles.dialControls}>
                <button
                  className={styles.dialButton}
                  onClick={() => handleDigitChange(index, 'up')}
                  disabled={isUnlocked}
                  title="Increase"
                >
                  ▲
                </button>
              </div>
              <div 
                className={styles.dialNumber}
                onClick={() => {
                  if (index === 3 && digit === 6) {
                    // Quick test: clicking the last digit when it's 6 will set it to 7
                    setCombination(prev => {
                      const newComb = [...prev];
                      newComb[3] = 7;
                      return newComb;
                    });
                  } else {
                    checkCombination();
                  }
                }}
                onKeyPress={handleKeyPress}
                tabIndex={0}
                role="button"
                title={index === 3 && digit === 6 ? "Click to set to 7" : "Click to unlock"}
              >
                {digit}
              </div>
              <div className={styles.dialControls}>
                <button
                  className={styles.dialButton}
                  onClick={() => handleDigitChange(index, 'down')}
                  disabled={isUnlocked}
                  title="Decrease"
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 