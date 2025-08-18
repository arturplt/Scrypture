/**
 * UI Element Mapping Test Component
 * Visualizes and verifies the UI element mapping data for Framesandbuttonsatlas.png
 */

import React, { useState } from 'react';
import { 
  UI_ELEMENT_MAPPING, 
  getUIElementById, 
  getUIElementsByCategory, 
  getUIElementsByTheme,
  getUIElementsByUsage,
  getAvailableThemes 
} from '../../data/uiElementMapping';
import styles from './UIElementMappingTest.module.css';

export interface UIElementMappingTestProps {
  className?: string;
}

export const UIElementMappingTest: React.FC<UIElementMappingTestProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'button' | 'frame'>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedUsage, setSelectedUsage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(true);

  const availableThemes = getAvailableThemes();
  const availableUsages = ['SmallButton', 'WideButton', 'BodyButton', 'MindButton', 'SoulButton', 'IconButton', 'TextButton', 'Frame', 'Modal', 'Panel', 'Card'];

  // Filter elements based on current selections
  const filteredElements = UI_ELEMENT_MAPPING.elements.filter(element => {
    if (selectedCategory !== 'all' && element.category !== selectedCategory) return false;
    if (selectedTheme !== 'all' && element.theme !== selectedTheme) return false;
    if (selectedUsage !== 'all' && !element.usage.includes(selectedUsage)) return false;
    if (searchQuery && !element.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !element.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const renderElementCard = (element: any) => (
    <div key={element.id} className={styles.elementCard}>
      <div className={styles.elementHeader}>
        <h4 className={styles.elementName}>{element.name}</h4>
        <div className={styles.elementMeta}>
          <span className={styles.elementId}>{element.id}</span>
          <span className={styles.elementCategory}>{element.category}</span>
        </div>
      </div>
      
      {showCoordinates && (
        <div className={styles.coordinates}>
          <div className={styles.coordItem}>
            <span className={styles.coordLabel}>Position:</span>
            <span className={styles.coordValue}>({element.x}, {element.y})</span>
          </div>
          <div className={styles.coordItem}>
            <span className={styles.coordLabel}>Size:</span>
            <span className={styles.coordValue}>{element.width}×{element.height}</span>
          </div>
        </div>
      )}

      <div className={styles.elementInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Theme:</span>
          <span className={styles.infoValue}>{element.theme}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Subcategory:</span>
          <span className={styles.infoValue}>{element.subcategory}</span>
        </div>
        {element.state && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>State:</span>
            <span className={styles.infoValue}>{element.state}</span>
          </div>
        )}
        {element.variant && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Variant:</span>
            <span className={styles.infoValue}>{element.variant}</span>
          </div>
        )}
        {element.cssClass && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>CSS Class:</span>
            <span className={styles.infoValue}>{element.cssClass}</span>
          </div>
        )}
      </div>

      <div className={styles.elementDescription}>
        <p>{element.description}</p>
      </div>

      <div className={styles.elementUsage}>
        <span className={styles.usageLabel}>Usage:</span>
        <div className={styles.usageTags}>
          {element.usage.map((usage: string) => (
            <span key={usage} className={styles.usageTag}>{usage}</span>
          ))}
        </div>
      </div>

      {showDetails && element.borderSlice && (
        <div className={styles.borderSlice}>
          <span className={styles.borderLabel}>Border Slice:</span>
          <span className={styles.borderValue}>
            {element.borderSlice.top}px {element.borderSlice.right}px {element.borderSlice.bottom}px {element.borderSlice.left}px
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h2>🎨 UI Element Mapping</h2>
        <div className={styles.stats}>
          <span>Total: {UI_ELEMENT_MAPPING.metadata.totalElements}</span>
          <span>Buttons: {UI_ELEMENT_MAPPING.metadata.buttonCount}</span>
          <span>Frames: {UI_ELEMENT_MAPPING.metadata.frameCount}</span>
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
          <label>Usage:</label>
          <select 
            value={selectedUsage} 
            onChange={(e) => setSelectedUsage(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Usages</option>
            {availableUsages.map(usage => (
              <option key={usage} value={usage}>{usage}</option>
            ))}
          </select>
        </div>

        <div className={styles.searchGroup}>
          <label>Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or description..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.toggleGroup}>
          <label>
            <input
              type="checkbox"
              checked={showCoordinates}
              onChange={(e) => setShowCoordinates(e.target.checked)}
            />
            Show Coordinates
          </label>
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

      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <h3>Elements ({filteredElements.length})</h3>
          {filteredElements.length === 0 && (
            <p className={styles.noResults}>No elements match the current filters.</p>
          )}
        </div>

        <div className={styles.elementGrid}>
          {filteredElements.map(renderElementCard)}
        </div>
      </div>

      <div className={styles.atlasInfo}>
        <h3>Atlas Information</h3>
        <div className={styles.atlasDetails}>
          <div className={styles.atlasDetail}>
            <span className={styles.detailLabel}>Atlas Size:</span>
            <span className={styles.detailValue}>
              {UI_ELEMENT_MAPPING.metadata.atlasWidth}×{UI_ELEMENT_MAPPING.metadata.atlasHeight} pixels
            </span>
          </div>
          <div className={styles.atlasDetail}>
            <span className={styles.detailLabel}>Total Elements:</span>
            <span className={styles.detailValue}>{UI_ELEMENT_MAPPING.metadata.totalElements}</span>
          </div>
          <div className={styles.atlasDetail}>
            <span className={styles.detailLabel}>Available Themes:</span>
            <span className={styles.detailValue}>{availableThemes.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
