/**
 * Button Test Component - Demonstrates button system functionality
 * Shows all button types, states, and interactions
 */

import React, { useState } from 'react';
import { 
  Button, 
  SmallButton, 
  WideButton, 
  ThemedButton,
  BodyButton,
  MindButton,
  SoulButton,
  ButtonSize,
  ButtonTheme
} from './Button';
import { useAssetManager } from '../../hooks/useAssetManager';
import styles from './ButtonTest.module.css';

interface ButtonTestProps {
  className?: string;
}

export const ButtonTest: React.FC<ButtonTestProps> = ({ className }) => {
  const { state, getButtonsBySize } = useAssetManager();
  const [clickCount, setClickCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ButtonSize>('small');
  const [selectedTheme, setSelectedTheme] = useState<ButtonTheme>('body');
  const [loadingState, setLoadingState] = useState(false);

  const smallButtons = getButtonsBySize('small');
  const wideButtons = getButtonsBySize('wide');
  const themedButtons = getButtonsBySize('themed');

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  const handleLoadingClick = () => {
    setLoadingState(true);
    setTimeout(() => setLoadingState(false), 2000);
  };

  if (state.loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <h2>Loading Button Assets...</h2>
        <div>Progress: {state.loaded ? '100%' : 'Loading...'}</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`${styles.container} ${className}`}>
        <h2>Button Loading Error</h2>
        <div className={styles.error}>{state.error}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <h2>🎮 Button System Test</h2>
      
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span>Click Count:</span>
          <span className={styles.value}>{clickCount}</span>
        </div>
        <div className={styles.stat}>
          <span>Loaded Assets:</span>
          <span className={styles.value}>{Object.keys(state.cache).length}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Button Size Controls</h3>
        <div className={styles.controls}>
          {(['small', 'wide', 'themed'] as ButtonSize[]).map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`${styles.controlButton} ${selectedSize === size ? styles.active : ''}`}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Theme Controls</h3>
        <div className={styles.controls}>
          {(['body', 'mind', 'soul'] as ButtonTheme[]).map(theme => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`${styles.controlButton} ${selectedTheme === theme ? styles.active : ''}`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Basic Button Examples</h3>
        <div className={styles.buttonGrid}>
          <div className={styles.buttonExample}>
            <h4>Small Button</h4>
            <SmallButton onClick={handleClick}>OK</SmallButton>
          </div>
          
          <div className={styles.buttonExample}>
            <h4>Wide Button</h4>
            <WideButton onClick={handleClick}>Submit</WideButton>
          </div>
          
          <div className={styles.buttonExample}>
            <h4>Themed Button</h4>
            <ThemedButton theme={selectedTheme} onClick={handleClick}>
              {selectedTheme}
            </ThemedButton>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Specific Themed Buttons</h3>
        <div className={styles.buttonGrid}>
          <div className={styles.buttonExample}>
            <h4>Body Button</h4>
            <BodyButton onClick={handleClick}>Body</BodyButton>
          </div>
          
          <div className={styles.buttonExample}>
            <h4>Mind Button</h4>
            <MindButton onClick={handleClick}>Mind</MindButton>
          </div>
          
          <div className={styles.buttonExample}>
            <h4>Soul Button</h4>
            <SoulButton onClick={handleClick}>Soul</SoulButton>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Button States</h3>
        <div className={styles.buttonGrid}>
          <div className={styles.buttonExample}>
            <h4>Normal</h4>
            <Button size={selectedSize} theme={selectedSize === 'themed' ? selectedTheme : undefined} onClick={handleClick}>
              Normal
            </Button>
          </div>
          
          <div className={styles.buttonExample}>
            <h4>Disabled</h4>
            <Button size={selectedSize} theme={selectedSize === 'themed' ? selectedTheme : undefined} disabled>
              Disabled
            </Button>
          </div>
          
          <div className={styles.buttonExample}>
            <h4>Loading</h4>
            <Button size={selectedSize} theme={selectedSize === 'themed' ? selectedTheme : undefined} loading={loadingState} onClick={handleLoadingClick}>
              {loadingState ? 'Loading...' : 'Click to Load'}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>All Available Buttons</h3>
        <div className={styles.allButtons}>
          <div className={styles.buttonCategory}>
            <h4>Small Buttons ({smallButtons.length})</h4>
            <div className={styles.buttonRow}>
              {smallButtons.map(button => (
                <Button key={button.id} buttonId={button.id} onClick={handleClick}>
                  {button.id.replace('button-small-', '')}
                </Button>
              ))}
            </div>
          </div>
          
          <div className={styles.buttonCategory}>
            <h4>Wide Buttons ({wideButtons.length})</h4>
            <div className={styles.buttonRow}>
              {wideButtons.map(button => (
                <Button key={button.id} buttonId={button.id} onClick={handleClick}>
                  {button.id.replace('button-wide-', '')}
                </Button>
              ))}
            </div>
          </div>
          
          <div className={styles.buttonCategory}>
            <h4>Themed Buttons ({themedButtons.length})</h4>
            <div className={styles.buttonRow}>
              {themedButtons.map(button => (
                <Button key={button.id} buttonId={button.id} onClick={handleClick}>
                  {button.theme}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Button with Icons</h3>
        <div className={styles.buttonGrid}>
          <div className={styles.buttonExample}>
            <h4>With Icon</h4>
            <Button size={selectedSize} theme={selectedSize === 'themed' ? selectedTheme : undefined} onClick={handleClick} icon="🎮">
              Play
            </Button>
          </div>
          
          <div className={styles.buttonExample}>
            <h4>Icon Only</h4>
            <Button size={selectedSize} theme={selectedSize === 'themed' ? selectedTheme : undefined} onClick={handleClick} icon="⚙️" aria-label="Settings" />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Button Groups</h3>
        <div className={styles.buttonGrid}>
          <div className={styles.buttonExample}>
            <h4>Size Group</h4>
            <div className={styles.buttonGroup}>
              <SmallButton onClick={handleClick}>S</SmallButton>
              <WideButton onClick={handleClick}>M</WideButton>
              <ThemedButton theme="body" onClick={handleClick}>L</ThemedButton>
            </div>
          </div>
          
          <div className={styles.buttonExample}>
            <h4>Theme Group</h4>
            <div className={styles.buttonGroup}>
              <BodyButton onClick={handleClick}>Body</BodyButton>
              <MindButton onClick={handleClick}>Mind</MindButton>
              <SoulButton onClick={handleClick}>Soul</SoulButton>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <h3>Button System Features</h3>
        <ul>
          <li>✅ Sprite-based button rendering with state transitions</li>
          <li>✅ Multiple button sizes (small, wide, themed)</li>
          <li>✅ Three themed button categories (Body, Mind, Soul)</li>
          <li>✅ Hover, pressed, and disabled states</li>
          <li>✅ Loading states with spinners</li>
          <li>✅ Icon support and accessibility features</li>
          <li>✅ Touch-friendly mobile interactions</li>
          <li>✅ High DPI display support</li>
        </ul>
      </div>
    </div>
  );
};
