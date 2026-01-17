import { Dispatch, SetStateAction } from 'react';
import { CombinationLockModal } from '../CombinationLockModal';
import Pixelite from '../Pixelite';
import { Synthesizer } from '../Synthesizer';
import { UIBuilder } from '../UIBuilder';
import { CardDemo } from '../CardDemo';
import SanctuaryModalDemo from '../SanctuaryModalDemo';
import styles from '../../App.module.css';

type SecretToolsProps = {
  isSecretMenuUnlocked: boolean;
  setIsSecretMenuUnlocked: Dispatch<SetStateAction<boolean>>;
  showCombinationLock: boolean;
  setShowCombinationLock: Dispatch<SetStateAction<boolean>>;
  isClosingLock: boolean;
  setIsClosingLock: Dispatch<SetStateAction<boolean>>;
  showPixelite: boolean;
  setShowPixelite: Dispatch<SetStateAction<boolean>>;
  showSynthesizer: boolean;
  setShowSynthesizer: Dispatch<SetStateAction<boolean>>;
  showUIBuilder: boolean;
  setShowUIBuilder: Dispatch<SetStateAction<boolean>>;
  showCardDemo: boolean;
  setShowCardDemo: Dispatch<SetStateAction<boolean>>;
  showSanctuaryDemo: boolean;
  setShowSanctuaryDemo: Dispatch<SetStateAction<boolean>>;
};

export function SecretTools({
  isSecretMenuUnlocked,
  setIsSecretMenuUnlocked,
  showCombinationLock,
  setShowCombinationLock,
  isClosingLock,
  setIsClosingLock,
  showPixelite,
  setShowPixelite,
  showSynthesizer,
  setShowSynthesizer,
  showUIBuilder,
  setShowUIBuilder,
  showCardDemo,
  setShowCardDemo,
  showSanctuaryDemo,
  setShowSanctuaryDemo,
}: SecretToolsProps) {
  return (
    <>
      {/* Secret Menu Section */}
      <div className={styles.secretMenuSection}>
        <h3 className={styles.secretMenuTitle}>🔐 Secret Menu</h3>
        <div className={styles.secretMenuButtons}>
          {!isSecretMenuUnlocked ? (
            <button 
              className={styles.secretMenuButton}
              onClick={() => setShowCombinationLock(true)}
              title="Enter combination to unlock"
            >
              🔒 LOCKED
            </button>
          ) : (
            <>
              <button 
                className={styles.secretMenuButton}
                onClick={() => setShowPixelite(true)}
                title="Advanced Pixel Grid Converter"
              >
                🎨 Pixelite
              </button>
              <button 
                className={styles.secretMenuButton}
                onClick={() => setShowSynthesizer(true)}
                title="8-Bit Synthesizer"
              >
                🎵 Synthesizer
              </button>
              <button 
                className={styles.secretMenuButton}
                onClick={() => setShowUIBuilder(true)}
                title="Interactive UI Frame Builder"
              >
                🎛️ UI Builder
              </button>
              <button 
                className={styles.secretMenuButton}
                onClick={() => setShowCardDemo(true)}
                title="Modern Card Components Demo"
              >
                🎮 Card Demo
              </button>
              <button 
                className={styles.secretMenuButton}
                onClick={() => setShowSanctuaryDemo(true)}
                title="Isometric Sanctuary Builder"
              >
                🏛️ Sanctuary
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pixelite Modal */}
      <Pixelite
        isOpen={showPixelite}
        onClose={() => setShowPixelite(false)}
      />

      {/* Synthesizer Modal (lazy mount to defer initialization) */}
      {showSynthesizer && (
        <Synthesizer
          isOpen={showSynthesizer}
          onClose={() => setShowSynthesizer(false)}
        />
      )}

      {/* UI Builder Modal */}
      <UIBuilder
        isOpen={showUIBuilder}
        onClose={() => setShowUIBuilder(false)}
      />

      {/* Card Demo Modal */}
      {showCardDemo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCardDemo(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'var(--color-danger)',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                zIndex: 2001
              }}
            >
              ✕
            </button>
            <CardDemo />
          </div>
        </div>
      )}

      {/* Sanctuary Demo Modal */}
      <SanctuaryModalDemo 
        isOpen={showSanctuaryDemo}
        onClose={() => setShowSanctuaryDemo(false)}
      />

      {/* Combination Lock - Expanding from Secret Menu */}
      {showCombinationLock && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: isClosingLock ? 'fadeOut 0.3s ease-in' : 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            animation: isClosingLock ? 'shrinkToCenter 0.3s ease-in' : 'expandFromCenter 0.4s ease-out',
            transformOrigin: 'center'
          }}>
            <CombinationLockModal
              isOpen={showCombinationLock}
              onClose={() => {
                setIsClosingLock(true);
                setTimeout(() => {
                  setShowCombinationLock(false);
                  setIsClosingLock(false);
                }, 300);
              }}
              onUnlock={() => {
                setIsSecretMenuUnlocked(true);
                setIsClosingLock(true);
                setTimeout(() => {
                  setShowCombinationLock(false);
                  setIsClosingLock(false);
                }, 300);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
