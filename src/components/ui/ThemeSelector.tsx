/**
 * Theme Selector Component
 * Allows users to switch between different frame and button themes
 */

import React, { useState, useMemo } from 'react';
import { useThemeManager } from '../../hooks/useThemeManager';
import { useAssetManager } from '../../hooks/useAssetManager';
import { Frame } from './Frame';
import { Button } from './Button';
import styles from './ThemeSelector.module.css';

export interface ThemeSelectorProps {
  className?: string;
  showFrameThemes?: boolean;
  showButtonThemes?: boolean;
  showSearch?: boolean;
  showPreview?: boolean;
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  showFrameThemes = true,
  showButtonThemes = true,
  showSearch = true,
  showPreview = true,
  compact = false
}) => {
  const {
    state,
    setFrameTheme,
    setButtonTheme,
    getAvailableFrameThemes,
    getAvailableButtonThemes,
    getCurrentColors,
    searchThemes,
    getThemeMetadata
  } = useThemeManager();

  const { getFrameConfig, getButtonConfig } = useAssetManager();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'frame' | 'button'>('frame');

  const frameThemes = getAvailableFrameThemes();
  const buttonThemes = getAvailableButtonThemes();

  const filteredFrameThemes = useMemo(() => {
    if (!searchQuery) return frameThemes;
    return searchThemes(searchQuery).filter(theme => theme.category === 'frame');
  }, [frameThemes, searchQuery, searchThemes]);

  const filteredButtonThemes = useMemo(() => {
    if (!searchQuery) return buttonThemes;
    return searchThemes(searchQuery).filter(theme => theme.category === 'button');
  }, [buttonThemes, searchQuery, searchThemes]);

  const currentColors = getCurrentColors();

  const handleFrameThemeChange = (themeId: string) => {
    const success = setFrameTheme(themeId);
    if (!success) {
      console.warn(`Failed to set frame theme: ${themeId}`);
    }
  };

  const handleButtonThemeChange = (themeId: 'body' | 'mind' | 'soul') => {
    const success = setButtonTheme(themeId);
    if (!success) {
      console.warn(`Failed to set button theme: ${themeId}`);
    }
  };

  const renderThemeCard = (theme: any, type: 'frame' | 'button') => {
    const isSelected = type === 'frame' 
      ? state.currentFrameTheme === theme.id
      : state.currentButtonTheme === theme.buttonTheme;

    const metadata = getThemeMetadata(theme.id);
    const colors = theme.colors;

    return (
      <div
        key={theme.id}
        className={`${styles.themeCard} ${isSelected ? styles.selected : ''}`}
        onClick={() => type === 'frame' 
          ? handleFrameThemeChange(theme.id)
          : handleButtonThemeChange(theme.buttonTheme)
        }
        style={{
          borderColor: isSelected ? colors.accent : colors.border,
          backgroundColor: isSelected ? colors.background : 'transparent'
        }}
      >
        <div className={styles.themeHeader}>
          <h4 style={{ color: colors.text }}>{theme.name}</h4>
          {isSelected && <span className={styles.selectedBadge}>✓</span>}
        </div>
        
        <p className={styles.themeDescription} style={{ color: colors.text }}>
          {theme.description}
        </p>

        {showPreview && (
          <div className={styles.themePreview}>
            {type === 'frame' ? (
              <Frame
                frameId={theme.frameId || `frame-${theme.id}`}
                width={120}
                height={80}
                scale={0.5}
                className={styles.previewFrame}
              >
                <div className={styles.previewContent}>
                  <span style={{ color: colors.text, fontSize: '8px' }}>
                    Preview
                  </span>
                </div>
              </Frame>
            ) : (
              <div className={styles.buttonPreview}>
                <Button
                  buttonId={`button-${theme.buttonTheme}-small`}
                  size="small"
                  theme={theme.buttonTheme}
                  className={styles.previewButton}
                >
                  {theme.buttonTheme}
                </Button>
              </div>
            )}
          </div>
        )}

        {metadata?.tags && (
          <div className={styles.themeTags}>
            {metadata.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className={styles.tag}
                style={{
                  backgroundColor: colors.accent,
                  color: colors.text
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.colorPalette}>
          {Object.entries(colors).slice(0, 4).map(([key, color]) => (
            <div
              key={key}
              className={styles.colorSwatch}
              style={{ backgroundColor: color as string }}
              title={`${key}: ${color}`}
            />
          ))}
        </div>
      </div>
    );
  };

  if (state.loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading themes...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.error}>
          <p>Error loading themes: {state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''} ${className}`}>
      <div className={styles.header}>
        <h3>🎨 Theme Selector</h3>
        <div className={styles.currentThemes}>
          <span className={styles.currentTheme}>
            Frame: <strong>{state.currentFrameTheme}</strong>
          </span>
          <span className={styles.currentTheme}>
            Button: <strong>{state.currentButtonTheme}</strong>
          </span>
        </div>
      </div>

      {showSearch && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearSearch}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {showFrameThemes && showButtonThemes && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'frame' ? styles.active : ''}`}
            onClick={() => setActiveTab('frame')}
          >
            Frame Themes ({filteredFrameThemes.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'button' ? styles.active : ''}`}
            onClick={() => setActiveTab('button')}
          >
            Button Themes ({filteredButtonThemes.length})
          </button>
        </div>
      )}

      <div className={styles.content}>
        {activeTab === 'frame' && showFrameThemes && (
          <div className={styles.themeGrid}>
            {filteredFrameThemes.length > 0 ? (
              filteredFrameThemes.map(theme => renderThemeCard(theme, 'frame'))
            ) : (
              <div className={styles.noResults}>
                <p>No frame themes found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'button' && showButtonThemes && (
          <div className={styles.themeGrid}>
            {filteredButtonThemes.length > 0 ? (
              filteredButtonThemes.map(theme => renderThemeCard(theme, 'button'))
            ) : (
              <div className={styles.noResults}>
                <p>No button themes found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {!showFrameThemes && !showButtonThemes && (
        <div className={styles.noThemes}>
          <p>No theme types enabled</p>
        </div>
      )}
    </div>
  );
};
