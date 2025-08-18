/**
 * Atlas Mapping Test Component
 * Visualizes and verifies the atlas mapping data for Framesandbuttonsatlas.png
 */

import React, { useState } from 'react';
import { ATLAS_MAPPING, getSpriteById, getSpritesByCategory, getAvailableThemes } from '../../data/atlasMapping';
import styles from './AtlasMappingTest.module.css';

export interface AtlasMappingTestProps {
  className?: string;
}

export const AtlasMappingTest: React.FC<AtlasMappingTestProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'button' | 'frame'>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const availableThemes = getAvailableThemes();
  
  const filteredSprites = ATLAS_MAPPING.sprites.filter(sprite => {
    if (selectedCategory !== 'all' && sprite.category !== selectedCategory) return false;
    if (selectedTheme !== 'all' && sprite.theme !== selectedTheme) return false;
    if (searchQuery && !sprite.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !sprite.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const renderSpritePreview = (sprite: any) => {
    const atlasUrl = '/assets/Frames/Framesandbuttonsatlas.png';
    
    return (
      <div 
        className={styles.spritePreview}
        style={{
          backgroundImage: `url(${atlasUrl})`,
          backgroundPosition: `-${sprite.x}px -${sprite.y}px`,
          width: `${sprite.width}px`,
          height: `${sprite.height}px`,
          imageRendering: 'pixelated'
        }}
        title={`${sprite.name}\nPosition: (${sprite.x}, ${sprite.y})\nSize: ${sprite.width}x${sprite.height}`}
      />
    );
  };

  const renderSpriteCard = (sprite: any) => (
    <div key={sprite.id} className={styles.spriteCard}>
      <div className={styles.spriteHeader}>
        <h4 className={styles.spriteName}>{sprite.name}</h4>
        <span className={`${styles.spriteCategory} ${styles[sprite.category]}`}>
          {sprite.category}
        </span>
      </div>
      
      <div className={styles.spritePreviewContainer}>
        {renderSpritePreview(sprite)}
      </div>
      
      <div className={styles.spriteInfo}>
        <div className={styles.spriteId}>
          <strong>ID:</strong> {sprite.id}
        </div>
        <div className={styles.spritePosition}>
          <strong>Position:</strong> ({sprite.x}, {sprite.y})
        </div>
        <div className={styles.spriteSize}>
          <strong>Size:</strong> {sprite.width}×{sprite.height}
        </div>
        {sprite.theme && (
          <div className={styles.spriteTheme}>
            <strong>Theme:</strong> {sprite.theme}
          </div>
        )}
        {sprite.subcategory && (
          <div className={styles.spriteSubcategory}>
            <strong>Type:</strong> {sprite.subcategory}
          </div>
        )}
        {sprite.state && (
          <div className={styles.spriteState}>
            <strong>State:</strong> {sprite.state}
          </div>
        )}
        {showDetails && (
          <div className={styles.spriteDescription}>
            <strong>Description:</strong> {sprite.description}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h2>🎨 Atlas Mapping Test</h2>
        <div className={styles.stats}>
          <span>Total Sprites: {ATLAS_MAPPING.sprites.length}</span>
          <span>Buttons: {getSpritesByCategory('button').length}</span>
          <span>Frames: {getSpritesByCategory('frame').length}</span>
          <span>Themes: {availableThemes.length}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className={styles.select}
          >
            <option value="all">All Categories</option>
            <option value="button">Buttons</option>
            <option value="frame">Frames</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Theme:</label>
          <select 
            value={selectedTheme} 
            onChange={(e) => setSelectedTheme(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Themes</option>
            {availableThemes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search sprites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
            />
            Show Details
          </label>
        </div>
      </div>

      <div className={styles.atlasInfo}>
        <h3>Atlas Information</h3>
        <div className={styles.atlasStats}>
          <div><strong>Atlas Size:</strong> {ATLAS_MAPPING.metadata.atlasWidth}×{ATLAS_MAPPING.metadata.atlasHeight}px</div>
          <div><strong>Sprite Size:</strong> {ATLAS_MAPPING.metadata.spriteSize}px</div>
          <div><strong>Total Sprites:</strong> {ATLAS_MAPPING.metadata.totalSprites}</div>
        </div>
      </div>

      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <h3>Sprites ({filteredSprites.length})</h3>
          {filteredSprites.length === 0 && (
            <p className={styles.noResults}>No sprites found matching the current filters.</p>
          )}
        </div>

        <div className={styles.spriteGrid}>
          {filteredSprites.map(renderSpriteCard)}
        </div>
      </div>

      <div className={styles.themeBreakdown}>
        <h3>Theme Breakdown</h3>
        <div className={styles.themeGrid}>
          {availableThemes.map(theme => {
            const themeSprites = ATLAS_MAPPING.sprites.filter(s => s.theme === theme);
            const buttons = themeSprites.filter(s => s.category === 'button');
            const frames = themeSprites.filter(s => s.category === 'frame');
            
            return (
              <div key={theme} className={styles.themeCard}>
                <h4>{theme}</h4>
                <div className={styles.themeStats}>
                  <span>Buttons: {buttons.length}</span>
                  <span>Frames: {frames.length}</span>
                  <span>Total: {themeSprites.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
