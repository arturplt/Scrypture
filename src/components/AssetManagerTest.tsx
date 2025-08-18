/**
 * Test component for Asset Management System
 * Used to verify asset loading, button states, and frame rendering
 */

import React, { useState } from 'react';
import { useAssetManager } from '../hooks/useAssetManager';

interface AssetManagerTestProps {
  className?: string;
}

export const AssetManagerTest: React.FC<AssetManagerTestProps> = ({ className }) => {
  const {
    state,
    getButtonConfig,
    getButtonsBySize,
    getFrameConfig,
    getFramesByTheme,
    getAvailableThemes,
    getButtonBackground,
    getFrameBorderImage,
    isAssetLoaded,
    getLoadingProgress
  } = useAssetManager();

  const [selectedTheme, setSelectedTheme] = useState<string>('wood');
  const [buttonState, setButtonState] = useState<'normal' | 'hover' | 'pressed'>('normal');

  const themes = getAvailableThemes();
  const smallButtons = getButtonsBySize('small');
  const wideButtons = getButtonsBySize('wide');
  const themedButtons = getButtonsBySize('themed');
  const frames = getFramesByTheme(selectedTheme);

  if (state.loading) {
    return (
      <div className={className} style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Loading Assets...</h3>
        <div>Progress: {getLoadingProgress().toFixed(1)}%</div>
        {state.error && <div style={{ color: 'red' }}>Error: {state.error}</div>}
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={className} style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h3>Asset Loading Failed</h3>
        <div>{state.error}</div>
      </div>
    );
  }

  return (
    <div className={className} style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Asset Manager Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Status</h3>
        <div>Loaded: {state.loaded ? 'Yes' : 'No'}</div>
        <div>Loading: {state.loading ? 'Yes' : 'No'}</div>
        <div>Cached Assets: {Object.keys(state.cache).length}</div>
        <div>Progress: {getLoadingProgress().toFixed(1)}%</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Theme Selection</h3>
        <select 
          value={selectedTheme} 
          onChange={(e) => setSelectedTheme(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          {themes.map(theme => (
            <option key={theme} value={theme}>{theme}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Button State</h3>
        <div>
          {(['normal', 'hover', 'pressed'] as const).map(state => (
            <button
              key={state}
              onClick={() => setButtonState(state)}
              style={{
                marginRight: '10px',
                padding: '5px 10px',
                backgroundColor: buttonState === state ? '#4CAF50' : '#ddd',
                color: buttonState === state ? 'white' : 'black',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Small Buttons (16x16)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {smallButtons.map(button => (
            <div key={button.id} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: button.width * 2,
                  height: button.height * 2,
                  backgroundImage: getButtonBackground(button.id, buttonState),
                  backgroundSize: 'auto',
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'pixelated',
                  border: '1px solid #ccc',
                  marginBottom: '5px'
                }}
              />
              <div style={{ fontSize: '10px' }}>{button.id}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Wide Buttons (16x32)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {wideButtons.map(button => (
            <div key={button.id} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: button.width * 2,
                  height: button.height * 2,
                  backgroundImage: getButtonBackground(button.id, buttonState),
                  backgroundSize: 'auto',
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'pixelated',
                  border: '1px solid #ccc',
                  marginBottom: '5px'
                }}
              />
              <div style={{ fontSize: '10px' }}>{button.id}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Themed Buttons (Body, Mind, Soul)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {themedButtons.map(button => (
            <div key={button.id} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: button.width * 2,
                  height: button.height * 2,
                  backgroundImage: getButtonBackground(button.id, buttonState),
                  backgroundSize: 'auto',
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'pixelated',
                  border: '1px solid #ccc',
                  marginBottom: '5px'
                }}
              />
              <div style={{ fontSize: '10px' }}>{button.theme}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Frames ({selectedTheme} theme)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {frames.map(frame => (
            <div key={frame.id} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: frame.width * 2,
                  height: frame.height * 2,
                  borderImage: getFrameBorderImage(frame.id),
                  borderStyle: 'solid',
                  borderWidth: '16px',
                  imageRendering: 'pixelated',
                  marginBottom: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }}
              >
                <span style={{ fontSize: '8px', color: '#666' }}>Frame</span>
              </div>
              <div style={{ fontSize: '10px' }}>{frame.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Asset Cache</h3>
        <div style={{ fontSize: '12px' }}>
          {Object.keys(state.cache).map(assetId => (
            <div key={assetId}>
              ✓ {assetId} ({state.cache[assetId].width}x{state.cache[assetId].height})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
