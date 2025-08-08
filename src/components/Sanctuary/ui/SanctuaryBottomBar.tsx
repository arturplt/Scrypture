import React from 'react';
import styles from '../Sanctuary.module.css';

interface SanctuaryBottomBarProps {
  // Actions
  onToggleLevelMenu: () => void;
  onResetTerrain: () => void;
  onFillVisibleArea: () => void;
  onGenerateWithAllBlocks: () => void;
  onGenerateProceduralMap: (size: string) => void;
  onToggleHeightMap: () => void;
  onExportHeightMap: () => void;
  onToggleZLevelManager: () => void;
  onToggleAtlasEditor: () => void;
  
  // State
  showHeightMap: boolean;
}

const SanctuaryBottomBar: React.FC<SanctuaryBottomBarProps> = ({
  onToggleLevelMenu,
  onResetTerrain,
  onFillVisibleArea,
  onGenerateWithAllBlocks,
  onGenerateProceduralMap,
  onToggleHeightMap,
  onExportHeightMap,
  onToggleZLevelManager,
  onToggleAtlasEditor,
  showHeightMap
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
    <div className={styles.sanctuaryBottomBar}>
      {/* Left Section - Level Management */}
      <div className={styles.bottomBarLeft}>
        <div className={styles.buttonGroup}>
          <span className={styles.controlLabel}>LEVELS</span>
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
        </div>
      </div>

      {/* Center Section - Building Tools */}
      <div className={styles.bottomBarCenter}>
        <div className={styles.buttonGroup}>
          <span className={styles.controlLabel}>BUILDING</span>
          <div className={styles.buttonGroupContent}>
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
        </div>
      </div>

      {/* Right Section - Advanced Tools */}
      <div className={styles.bottomBarRight}>
        {/* Height Map Tools */}
        <div className={styles.buttonGroup}>
          <span className={styles.controlLabel}>HEIGHT MAP</span>
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
        </div>

        {/* Z-Level Management */}
        <div className={styles.buttonGroup}>
          <span className={styles.controlLabel}>Z-LEVELS</span>
          <div className={styles.buttonGroupContent}>
            <button 
              style={unifiedButtonStyle}
              onClick={onToggleZLevelManager}
              title="Z-Level Manager"
            >
              MANAGER
            </button>
          </div>
        </div>

        {/* Atlas Editor */}
        <div className={styles.buttonGroup}>
          <span className={styles.controlLabel}>TOOLS</span>
          <div className={styles.buttonGroupContent}>
            <button 
              style={unifiedButtonStyle}
              onClick={onToggleAtlasEditor}
              title="Atlas Editor"
            >
              ATLAS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SanctuaryBottomBar; 