import React from 'react';
import styles from '../Sanctuary.module.css';
import { IsometricTileData } from '../../../data/isometric-tiles';
import { TilePreview } from './TilePreview';

interface SanctuaryHeaderProps {
  // Core state
  currentLevelName: string;
  selectedTile: IsometricTileData | null;
  camera: { zoom: number };
  currentZLevel: number;
  
  // UI state
  collapsedGroups: {
    camera: boolean;
    levels: boolean;
    building: boolean;
    tools: boolean;
    heightmap: boolean;
    zlevels: boolean;
  };
  
  // Actions
  onExit?: () => void;
  onToggleGroupCollapse: (group: string) => void;
  onZoomClick: (zoom: number) => void;
  onResetCamera: () => void;
  onToggleLevelMenu: () => void;
  onResetTerrain: () => void;
  onToggleBlockMenu: () => void;
  onFillVisibleArea: () => void;
  onGenerateWithAllBlocks: () => void;
  onToggleInstructions: () => void;
  onToggleGrid: () => void;
  onTogglePerformance: () => void;
  onGenerateProceduralMap: (size: string) => void;
  onToggleHeightMap: () => void;
  onExportHeightMap: () => void;
  onToggleZLevelManager: () => void;
  onSwitchToZLevel: (level: number) => void;
  onToggleAtlasEditor: () => void;
  
  // Block menu state
  isBlockMenuOpen: boolean;
  showHeightMap: boolean;
}

const SanctuaryHeader: React.FC<SanctuaryHeaderProps> = ({
  currentLevelName,
  selectedTile,
  camera,
  currentZLevel,
  collapsedGroups,
  onExit,
  onToggleGroupCollapse,
  onZoomClick,
  onResetCamera,
  onToggleLevelMenu,
  onResetTerrain,
  onToggleBlockMenu,
  onFillVisibleArea,
  onGenerateWithAllBlocks,
  onToggleInstructions,
  onToggleGrid,
  onTogglePerformance,
  onGenerateProceduralMap,
  onToggleHeightMap,
  onExportHeightMap,
  onToggleZLevelManager,
  onSwitchToZLevel,
  onToggleAtlasEditor,
  isBlockMenuOpen,
  showHeightMap
}) => {
  // Unified button style
  const unifiedButtonStyle = {
    background: 'var(--color-accent-beaver)',
    color: 'white',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    transition: 'background-color 0.2s'
  };

  return (
    <div className={styles.sanctuaryHeader}>
      {/* Top Row - Essential Controls */}
      <div className={styles.headerTopRow}>
        {onExit && (
          <button 
            className={styles.homeButton}
            onClick={onExit}
            title="Exit to Home"
          >
            [HOME]
          </button>
        )}
        <span className={styles.sanctuaryIcon}>🏛️</span>
        <h3 className={styles.sanctuaryTitle}>{currentLevelName}</h3>
        
        {/* Selected Tile Indicator */}
        {selectedTile && (
          <div className={styles.selectedTileIndicator}>
            <span>Selected: {selectedTile.name}</span>
            <TilePreview tile={selectedTile} size={24} />
          </div>
        )}
      </div>

      {/* Bottom Row - Action Buttons */}
      <div className={styles.headerBottomRow}>
        {/* Camera Options Group */}
        <div className={styles.buttonGroup}>
          <div 
            className={`${styles.buttonGroupHeader} ${collapsedGroups.camera ? styles.collapsed : ''}`}
            onClick={() => onToggleGroupCollapse('camera')}
          >
            <span className={styles.buttonGroupLabel}>Camera</span>
            <span className={styles.collapseIcon}>
              {collapsedGroups.camera ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedGroups.camera && (
            <div className={styles.buttonGroupContent}>
              <div className={styles.zoomControls}>
                <button 
                  className={`${styles.zoomButton} ${camera.zoom === 1 ? styles.zoomButtonActive : ''}`}
                  onClick={() => onZoomClick(1)}
                  title="1x Zoom"
                >
                  [1x]
                </button>
                <button 
                  className={`${styles.zoomButton} ${camera.zoom === 2 ? styles.zoomButtonActive : ''}`}
                  onClick={() => onZoomClick(2)}
                  title="2x Zoom"
                >
                  [2x]
                </button>
                <button 
                  className={`${styles.zoomButton} ${camera.zoom === 4 ? styles.zoomButtonActive : ''}`}
                  onClick={() => onZoomClick(4)}
                  title="4x Zoom"
                >
                  [4x]
                </button>
              </div>
              <button 
                style={unifiedButtonStyle}
                onClick={onResetCamera}
                title="Reset Camera"
              >
                RESET
              </button>
            </div>
          )}
        </div>

        {/* Level Management Group */}
        <div className={styles.buttonGroup}>
          <div 
            className={`${styles.buttonGroupHeader} ${collapsedGroups.levels ? styles.collapsed : ''}`}
            onClick={() => onToggleGroupCollapse('levels')}
          >
            <span className={styles.buttonGroupLabel}>Levels</span>
            <span className={styles.collapseIcon}>
              {collapsedGroups.levels ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedGroups.levels && (
            <div className={styles.buttonGroupContent}>
              <button 
                style={unifiedButtonStyle}
                onClick={onToggleLevelMenu}
                title="Level Management"
              >
                LEVELS
              </button>
              <button 
                style={unifiedButtonStyle}
                onClick={onResetTerrain}
                title="Reset Terrain"
              >
                RESET
              </button>
            </div>
          )}
        </div>

        {/* Building Tools Group */}
        <div className={styles.buttonGroup}>
          <div 
            className={`${styles.buttonGroupHeader} ${collapsedGroups.building ? styles.collapsed : ''}`}
            onClick={() => onToggleGroupCollapse('building')}
          >
            <span className={styles.buttonGroupLabel}>Building</span>
            <span className={styles.collapseIcon}>
              {collapsedGroups.building ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedGroups.building && (
            <div className={styles.buttonGroupContent}>
              <button 
                style={unifiedButtonStyle}
                onClick={onToggleBlockMenu}
                title="Block Selector"
              >
                {isBlockMenuOpen ? 'CLOSE' : 'BLOCKS'}
              </button>
              <button 
                style={{
                  ...unifiedButtonStyle,
                  background: 'var(--color-accent-beaver)'
                }}
                onClick={onFillVisibleArea}
                title="Fill visible area with selected block"
              >
                FILL
              </button>
              <button 
                style={{
                  ...unifiedButtonStyle,
                  background: 'var(--color-accent-gold)'
                }}
                onClick={onGenerateWithAllBlocks}
                title="Generate map with all available blocks"
              >
                GENERATE
              </button>
            </div>
          )}
        </div>

        {/* Utility Tools Group */}
        <div className={styles.buttonGroup}>
          <div 
            className={`${styles.buttonGroupHeader} ${collapsedGroups.tools ? styles.collapsed : ''}`}
            onClick={() => onToggleGroupCollapse('tools')}
          >
            <span className={styles.buttonGroupLabel}>Tools</span>
            <span className={styles.collapseIcon}>
              {collapsedGroups.tools ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedGroups.tools && (
            <div className={styles.buttonGroupContent}>
              <button 
                style={unifiedButtonStyle}
                onClick={onToggleInstructions}
                title="Show/Hide Instructions"
              >
                HELP
              </button>
              <button 
                style={unifiedButtonStyle}
                onClick={onToggleGrid}
                title="Show/Hide Grid"
              >
                GRID
              </button>
              <button 
                style={unifiedButtonStyle}
                onClick={onTogglePerformance}
                title="Performance Monitor"
              >
                STATS
              </button>
            </div>
          )}
        </div>

        {/* Height Map Group */}
        <div className={styles.buttonGroup}>
          <div 
            className={`${styles.buttonGroupHeader} ${collapsedGroups.heightmap ? styles.collapsed : ''}`}
            onClick={() => onToggleGroupCollapse('heightmap')}
          >
            <span className={styles.buttonGroupLabel}>Height Map</span>
            <span className={styles.collapseIcon}>
              {collapsedGroups.heightmap ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedGroups.heightmap && (
            <div className={styles.buttonGroupContent}>
              <button 
                style={unifiedButtonStyle}
                onClick={() => onGenerateProceduralMap('small')}
                title="Generate Island"
              >
                GENERATE
              </button>
              <button 
                style={unifiedButtonStyle}
                onClick={onToggleHeightMap}
                title="Show/Hide Height Map"
              >
                {showHeightMap ? 'HIDE' : 'SHOW'}
              </button>
              <button 
                style={unifiedButtonStyle}
                onClick={onExportHeightMap}
                title="Export Height Map"
              >
                EXPORT
              </button>
            </div>
          )}
        </div>

        {/* Z-Level Management Group */}
        <div className={styles.buttonGroup}>
          <div 
            className={`${styles.buttonGroupHeader} ${collapsedGroups.zlevels ? styles.collapsed : ''}`}
            onClick={() => onToggleGroupCollapse('zlevels')}
          >
            <span className={styles.buttonGroupLabel}>Z-Levels</span>
            <span className={styles.collapseIcon}>
              {collapsedGroups.zlevels ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedGroups.zlevels && (
            <div className={styles.buttonGroupContent}>
              <button 
                style={unifiedButtonStyle}
                onClick={onToggleZLevelManager}
                title="Z-Level Manager"
              >
                MANAGER
              </button>
              <button 
                style={{
                  ...unifiedButtonStyle,
                  background: currentZLevel === 0 ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                }}
                onClick={() => onSwitchToZLevel(0)}
                title="Switch to Ground Level (Z=0)"
              >
                Z0
              </button>
              <button 
                style={{
                  ...unifiedButtonStyle,
                  background: currentZLevel === 1 ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                }}
                onClick={() => onSwitchToZLevel(1)}
                title="Switch to Level 1 (Z=1)"
              >
                Z1
              </button>
              <button 
                style={{
                  ...unifiedButtonStyle,
                  background: currentZLevel === 2 ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                }}
                onClick={() => onSwitchToZLevel(2)}
                title="Switch to Level 2 (Z=2)"
              >
                Z2
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SanctuaryHeader; 