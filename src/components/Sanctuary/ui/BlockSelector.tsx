import React from 'react';
import styles from '../Sanctuary.module.css';
import { ISOMETRIC_TILES, IsometricTileData } from '../../../data/isometric-tiles';
import { TilePreview } from './TilePreview';

interface BlockSelectorProps {
  isOpen: boolean;
  selectedTile: IsometricTileData | null;
  expandedCategory: string | null;
  onClose: () => void;
  onSelectTile: (tile: IsometricTileData) => void;
  onToggleCategory: (category: string) => void;
}

const BlockSelector: React.FC<BlockSelectorProps> = ({
  isOpen,
  selectedTile,
  expandedCategory,
  onClose,
  onSelectTile,
  onToggleCategory
}) => {
  if (!isOpen) return null;

  const blockCategories = [
    { type: 'cube', name: 'Cubes' },
    { type: 'flat', name: 'Flats' },
    { type: 'ramp', name: 'Ramps' },
    { type: 'corner', name: 'Corners' },
    { type: 'staircase', name: 'Stairs' },
    { type: 'pillar', name: 'Pillars' },
    { type: 'water', name: 'Water' },
  ];

  const palettes = [
    { name: 'green', color: '#4CAF50' },
    { name: 'gray', color: '#9E9E9E' },
    { name: 'orange', color: '#FF9800' },
  ];

  return (
    <div className={styles.blockSelector}>
      <div className={styles.blockSelectorHeader}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          title="Close Block Selector"
        >
          ✕
        </button>
      </div>
      
      <div className={styles.blockCategories}>
        {blockCategories.map(category => {
          const isExpanded = expandedCategory === category.type;
          
          return (
            <div key={category.type} className={styles.blockCategory}>
              <div 
                className={styles.categoryHeader}
                onClick={() => onToggleCategory(isExpanded ? null : category.type)}
                style={{ cursor: 'pointer' }}
              >
                <h4>{category.name}</h4>
                <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
              </div>
              
              {isExpanded && (
                <div className={styles.expandedContent}>
                  {category.type === 'water' ? (
                    // Special rendering for water category - show all water tiles directly
                    <div className={styles.tileGrid}>
                      {ISOMETRIC_TILES.filter(tile => tile.type === 'water').map(tile => (
                        <button
                          key={tile.id}
                          className={`${styles.tileButton} ${selectedTile?.id === tile.id ? styles.active : ''}`}
                          onClick={() => onSelectTile(tile)}
                          title={`${tile.name} (water) - ${tile.sourceX},${tile.sourceY}`}
                        >
                          <TilePreview tile={tile} size={32} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Regular rendering for other categories - show palettes
                    <div className={styles.paletteGrid}>
                      {palettes.map(palette => {
                        const tiles = ISOMETRIC_TILES.filter(tile => 
                          tile.type === category.type && tile.palette === palette.name
                        );
                        
                        if (tiles.length === 0) return null;
                        
                        return (
                          <div key={palette.name} className={styles.paletteSection}>
                            <div className={styles.paletteHeader}>
                              <div 
                                className={styles.paletteButton}
                                style={{ backgroundColor: palette.color }}
                              />
                            </div>
                            
                            <div className={styles.tileGrid}>
                              {tiles.map(tile => (
                                <button
                                  key={tile.id}
                                  className={`${styles.tileButton} ${selectedTile?.id === tile.id ? styles.active : ''}`}
                                  onClick={() => onSelectTile(tile)}
                                  title={`${tile.name} (${tile.palette}) - ${tile.sourceX},${tile.sourceY}`}
                                >
                                  <TilePreview tile={tile} size={32} />
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockSelector; 