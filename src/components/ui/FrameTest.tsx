/**
 * Frame Test Component - Demonstrates 9-slice frame rendering
 * Shows frames at different sizes, scales, and themes
 */

import React, { useState } from 'react';
import { Frame, FRAME_THEMES } from './Frame';
import { useAssetManager } from '../../hooks/useAssetManager';
import styles from './FrameTest.module.css';

interface FrameTestProps {
  className?: string;
}

export const FrameTest: React.FC<FrameTestProps> = ({ className }) => {
  const { getAvailableThemes, state } = useAssetManager();
  const [selectedTheme, setSelectedTheme] = useState<string>('wood');
  const [selectedScale, setSelectedScale] = useState<1 | 2 | 4>(1);
  const [frameSize, setFrameSize] = useState<number>(200);

  const themes = getAvailableThemes();
  const frameIds = Object.values(FRAME_THEMES);

  if (state.loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <h2>Loading Frame Assets...</h2>
        <div>Progress: {state.loaded ? '100%' : 'Loading...'}</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`${styles.container} ${className}`}>
        <h2>Frame Loading Error</h2>
        <div className={styles.error}>{state.error}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <h2>🎨 9-Slice Frame Rendering Test</h2>
      
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Theme:</label>
          <select 
            value={selectedTheme} 
            onChange={(e) => setSelectedTheme(e.target.value)}
            className={styles.select}
          >
            {themes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>Scale:</label>
          <div className={styles.scaleButtons}>
            {([1, 2, 4] as const).map(scale => (
              <button
                key={scale}
                onClick={() => setSelectedScale(scale)}
                className={`${styles.scaleButton} ${selectedScale === scale ? styles.active : ''}`}
              >
                {scale}x
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label>Size:</label>
          <input
            type="range"
            min="100"
            max="400"
            step="25"
            value={frameSize}
            onChange={(e) => setFrameSize(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.sizeLabel}>{frameSize}px</span>
        </div>
      </div>

      <div className={styles.frameGrid}>
        <div className={styles.frameSection}>
          <h3>Single Frame Test</h3>
          <Frame
            frameId={`frame-${selectedTheme}`}
            width={frameSize}
            height={frameSize}
            scale={selectedScale}
            className={styles.testFrame}
          >
            <div className={styles.frameContent}>
              <h4>Frame Content</h4>
              <p>Theme: {selectedTheme}</p>
              <p>Scale: {selectedScale}x</p>
              <p>Size: {frameSize}px</p>
            </div>
          </Frame>
        </div>

        <div className={styles.frameSection}>
          <h3>All Themes</h3>
          <div className={styles.themeGrid}>
            {frameIds.map(frameId => {
              const theme = frameId.replace('frame-', '');
              return (
                <div key={frameId} className={styles.themeFrame}>
                  <Frame
                    frameId={frameId}
                    width={120}
                    height={120}
                    scale={1}
                    className={styles.smallFrame}
                  >
                    <div className={styles.themeLabel}>{theme}</div>
                  </Frame>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.frameSection}>
          <h3>Scale Comparison</h3>
          <div className={styles.scaleGrid}>
            {([1, 2, 4] as const).map(scale => (
              <div key={scale} className={styles.scaleFrame}>
                <Frame
                  frameId={`frame-${selectedTheme}`}
                  width={100}
                  height={100}
                  scale={scale}
                  className={styles.scaleTestFrame}
                >
                  <div className={styles.scaleLabel}>{scale}x</div>
                </Frame>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.frameSection}>
          <h3>Responsive Test</h3>
          <div className={styles.responsiveContainer}>
            <Frame
              frameId={`frame-${selectedTheme}`}
              width="100%"
              height={150}
              scale={selectedScale}
              className={styles.responsiveFrame}
            >
              <div className={styles.responsiveContent}>
                <h4>Responsive Frame</h4>
                <p>This frame adapts to container width</p>
                <p>Current width: {typeof window !== 'undefined' ? window.innerWidth : 'Unknown'}px</p>
              </div>
            </Frame>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <h3>9-Slice Frame Rendering Features</h3>
        <ul>
          <li>✅ Pixel-perfect scaling with CSS border-image</li>
          <li>✅ Multiple scale factors (1x, 2x, 4x)</li>
          <li>✅ 8 different frame themes</li>
          <li>✅ Responsive design support</li>
          <li>✅ Loading and error states</li>
          <li>✅ High DPI display support</li>
          <li>✅ Accessibility features</li>
        </ul>
      </div>
    </div>
  );
};
