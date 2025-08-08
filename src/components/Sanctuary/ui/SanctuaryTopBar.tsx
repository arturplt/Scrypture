import React from 'react';
import styles from '../Sanctuary.module.css';
import { IsometricTileData } from '../../../data/isometric-tiles';
import { TilePreview } from './TilePreview';

interface SanctuaryTopBarProps {
  // Core state
  currentLevelName: string;
  selectedTile: IsometricTileData | null;
  camera: { zoom: number };
  currentZLevel: number;
  
  // Actions
  onExit?: () => void;
  onZoomClick: (zoom: number) => void;
  onResetCamera: () => void;
  onToggleBlockMenu: () => void;
  onToggleInstructions: () => void;
  onToggleGrid: () => void;
  onTogglePerformance: () => void;
  onSwitchToZLevel: (level: number) => void;
  
  // Block menu state
  isBlockMenuOpen: boolean;
}

const SanctuaryTopBar: React.FC<SanctuaryTopBarProps> = ({
  currentLevelName,
  selectedTile,
  camera,
  currentZLevel,
  onExit,
  onZoomClick,
  onResetCamera,
  onToggleBlockMenu,
  onToggleInstructions,
  onToggleGrid,
  onTogglePerformance,
  onSwitchToZLevel,
  isBlockMenuOpen
}) => {
  // Unified button style
  const unifiedButtonStyle = {
    background: 'var(--color-accent-beaver)',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    transition: 'background-color 0.2s'
  };

  return (
    <div className={styles.sanctuaryTopBar}>
      {/* Left Section - Level Info and Navigation */}
      <div className={styles.topBarLeft}>
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

      {/* Center Section - Camera Controls */}
      <div className={styles.topBarCenter}>
        <div className={styles.cameraControls}>
          <span className={styles.controlLabel}>CAMERA</span>
          <div className={styles.zoomControls}>
            <button 
              className={`${styles.zoomButton} ${camera.zoom === 1 ? styles.zoomButtonActive : ''}`}
              onClick={() => onZoomClick(1)}
              title="1x Zoom"
            >
              [1X]
            </button>
            <button 
              className={`${styles.zoomButton} ${camera.zoom === 2 ? styles.zoomButtonActive : ''}`}
              onClick={() => onZoomClick(2)}
              title="2x Zoom"
            >
              [2X]
            </button>
            <button 
              className={`${styles.zoomButton} ${camera.zoom === 4 ? styles.zoomButtonActive : ''}`}
              onClick={() => onZoomClick(4)}
              title="4x Zoom"
            >
              [4X]
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
      </div>

      {/* Right Section - Quick Actions */}
      <div className={styles.topBarRight}>
        <div className={styles.quickActions}>
          <button 
            style={unifiedButtonStyle}
            onClick={onToggleBlockMenu}
            title="Block Selector"
          >
            {isBlockMenuOpen ? 'CLOSE' : 'BLOCKS'}
          </button>
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
        
        {/* Z-Level Quick Access */}
        <div className={styles.zLevelQuickAccess}>
          <span className={styles.controlLabel}>Z-LEVELS</span>
          <div className={styles.zLevelButtons}>
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
        </div>
      </div>
    </div>
  );
};

export default SanctuaryTopBar; 