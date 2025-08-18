/**
 * Theme Test Component - Demonstrates theme system functionality
 * Shows theme switching, color previews, and integration with frames and buttons
 */

import React, { useState } from 'react';
import { useThemeManager } from '../../hooks/useThemeManager';
import { useAssetManager } from '../../hooks/useAssetManager';
import { ThemeSelector } from './ThemeSelector';
import { Frame } from './Frame';
import { Button, SmallButton, WideButton, ThemedButton } from './Button';
import styles from './ThemeTest.module.css';

export interface ThemeTestProps {
  className?: string;
}

export const ThemeTest: React.FC<ThemeTestProps> = ({ className }) => {
  const {
    state,
    getCurrentColors,
    getFrameThemeConfig,
    getButtonThemeConfig,
    getAvailableFrameThemes,
    getAvailableButtonThemes
  } = useThemeManager();

  const { state: assetState } = useAssetManager();

  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [demoContent, setDemoContent] = useState('This is a demo frame with themed content. The colors and styling adapt to the selected theme.');

  const currentColors = getCurrentColors();
  const frameThemes = getAvailableFrameThemes();
  const buttonThemes = getAvailableButtonThemes();

  if (assetState.loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading assets...</p>
        </div>
      </div>
    );
  }

  if (assetState.error) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.error}>
          <p>Error loading assets: {assetState.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h2>🎨 Theme System Test</h2>
        <div className={styles.stats}>
          <span>Frame Themes: {frameThemes.length}</span>
          <span>Button Themes: {buttonThemes.length}</span>
          <span>Assets Loaded: {assetState.loadedAssets.length}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <Button
          buttonId="button-small-default"
          onClick={() => setShowThemeSelector(!showThemeSelector)}
          className={styles.controlButton}
        >
          {showThemeSelector ? 'Hide' : 'Show'} Theme Selector
        </Button>
        
        <input
          type="text"
          value={demoContent}
          onChange={(e) => setDemoContent(e.target.value)}
          placeholder="Edit demo content..."
          className={styles.contentInput}
        />
      </div>

      {showThemeSelector && (
        <div className={styles.themeSelectorSection}>
          <ThemeSelector />
        </div>
      )}

      <div className={styles.demoSection}>
        <div className={styles.currentThemeInfo}>
          <h3>Current Theme</h3>
          <div className={styles.themeInfo}>
            <div className={styles.themeItem}>
              <strong>Frame:</strong> {state.currentFrameTheme}
            </div>
            <div className={styles.themeItem}>
              <strong>Button:</strong> {state.currentButtonTheme}
            </div>
          </div>
        </div>

        <div className={styles.colorPreview}>
          <h3>Color Palette</h3>
          <div className={styles.colorGrid}>
            <div className={styles.colorSection}>
              <h4>Frame Colors</h4>
              <div className={styles.colorSwatches}>
                {Object.entries(currentColors.frame).map(([key, color]) => (
                  <div key={key} className={styles.colorSwatch}>
                    <div
                      className={styles.swatch}
                      style={{ backgroundColor: color }}
                    />
                    <span className={styles.colorName}>{key}</span>
                    <span className={styles.colorValue}>{color}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.colorSection}>
              <h4>Button Colors</h4>
              <div className={styles.colorSwatches}>
                {Object.entries(currentColors.button).map(([key, color]) => (
                  <div key={key} className={styles.colorSwatch}>
                    <div
                      className={styles.swatch}
                      style={{ backgroundColor: color }}
                    />
                    <span className={styles.colorName}>{key}</span>
                    <span className={styles.colorValue}>{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.frameDemo}>
          <h3>Frame Demo</h3>
          <div className={styles.frameGrid}>
            <Frame
              frameId={`frame-${state.currentFrameTheme}`}
              width={300}
              height={200}
              className={styles.demoFrame}
            >
              <div className={styles.frameContent}>
                <h4 style={{ color: currentColors.frame.text }}>
                  Themed Frame Demo
                </h4>
                <p style={{ color: currentColors.frame.text }}>
                  {demoContent}
                </p>
                <div className={styles.frameButtons}>
                  <SmallButton>Small</SmallButton>
                  <WideButton>Wide Button</WideButton>
                  <ThemedButton theme={state.currentButtonTheme}>
                    Themed
                  </ThemedButton>
                </div>
              </div>
            </Frame>

            <Frame
              frameId={`frame-${state.currentFrameTheme}`}
              width={200}
              height={150}
              scale={0.8}
              className={styles.demoFrame}
            >
              <div className={styles.frameContent}>
                <h5 style={{ color: currentColors.frame.text }}>
                  Smaller Frame
                </h5>
                <p style={{ color: currentColors.frame.text, fontSize: '10px' }}>
                  This frame is scaled down to 0.8x
                </p>
              </div>
            </Frame>
          </div>
        </div>

        <div className={styles.buttonDemo}>
          <h3>Button Demo</h3>
          <div className={styles.buttonGrid}>
            <div className={styles.buttonSection}>
              <h4>Small Buttons</h4>
              <div className={styles.buttonRow}>
                <SmallButton>OK</SmallButton>
                <SmallButton disabled>Disabled</SmallButton>
                <SmallButton loading>Loading</SmallButton>
              </div>
            </div>

            <div className={styles.buttonSection}>
              <h4>Wide Buttons</h4>
              <div className={styles.buttonRow}>
                <WideButton>Save</WideButton>
                <WideButton disabled>Cancel</WideButton>
                <WideButton loading>Processing</WideButton>
              </div>
            </div>

            <div className={styles.buttonSection}>
              <h4>Themed Buttons</h4>
              <div className={styles.buttonRow}>
                <ThemedButton theme="body">Body</ThemedButton>
                <ThemedButton theme="mind">Mind</ThemedButton>
                <ThemedButton theme="soul">Soul</ThemedButton>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.integrationDemo}>
          <h3>Integration Demo</h3>
          <div className={styles.integrationGrid}>
            <Frame
              frameId={`frame-${state.currentFrameTheme}`}
              width={400}
              height={250}
              className={styles.integrationFrame}
            >
              <div className={styles.integrationContent}>
                <h4 style={{ color: currentColors.frame.text }}>
                  Complete UI Integration
                </h4>
                <p style={{ color: currentColors.frame.text }}>
                  This demonstrates how frames and buttons work together with the theme system.
                  All colors and styling automatically adapt to the selected theme.
                </p>
                
                <div className={styles.integrationControls}>
                  <div className={styles.controlGroup}>
                    <label style={{ color: currentColors.frame.text }}>Action:</label>
                    <div className={styles.buttonGroup}>
                      <SmallButton>Add</SmallButton>
                      <SmallButton>Edit</SmallButton>
                      <SmallButton>Delete</SmallButton>
                    </div>
                  </div>
                  
                  <div className={styles.controlGroup}>
                    <label style={{ color: currentColors.frame.text }}>Category:</label>
                    <div className={styles.buttonGroup}>
                      <ThemedButton theme="body">Physical</ThemedButton>
                      <ThemedButton theme="mind">Mental</ThemedButton>
                      <ThemedButton theme="soul">Spiritual</ThemedButton>
                    </div>
                  </div>
                  
                  <div className={styles.controlGroup}>
                    <label style={{ color: currentColors.frame.text }}>Confirm:</label>
                    <WideButton>Save Changes</WideButton>
                  </div>
                </div>
              </div>
            </Frame>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <h3>Features</h3>
        <ul>
          <li>🎨 <strong>Theme Switching:</strong> Switch between 8 frame themes and 3 button themes</li>
          <li>💾 <strong>Persistent Storage:</strong> Theme preferences are saved to localStorage</li>
          <li>🎯 <strong>Color Coordination:</strong> All UI elements adapt to the selected theme</li>
          <li>🔍 <strong>Search & Filter:</strong> Find themes by name, description, or tags</li>
          <li>📱 <strong>Responsive Design:</strong> Works on desktop and mobile devices</li>
          <li>♿ <strong>Accessibility:</strong> WCAG 2.1 AA compliant with keyboard navigation</li>
          <li>⚡ <strong>Performance:</strong> Efficient asset loading and caching system</li>
          <li>🎭 <strong>Preview System:</strong> See theme changes in real-time</li>
        </ul>
      </div>
    </div>
  );
};
