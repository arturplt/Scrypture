import React, { useMemo, useState } from 'react';
import styles from '../Sanctuary.module.css';
import { ISOMETRIC_TILES, IsometricTileData } from '../../../data/isometric-tiles';
import { TilePreview } from './TilePreview';

interface BlockSelectorProps {
  isOpen: boolean;
  selectedTile: IsometricTileData | null;
  expandedCategory: string | null;
  onClose: () => void;
  onSelectTile: (tile: IsometricTileData) => void;
  onToggleCategory: (category: string | null) => void;
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

  // Minimalistic inventory-style UI: simple chips + flat grid
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'green' | 'gray' | 'orange'>('all');
  const activeCategory = expandedCategory ?? 'all';

  const visibleTiles = useMemo(() => {
    return ISOMETRIC_TILES.filter((tile) => {
      const categoryOk = activeCategory === 'all' ? true : tile.type === activeCategory;
      const paletteOk = paletteFilter === 'all' ? true : tile.palette === paletteFilter;
      return categoryOk && paletteOk;
    });
  }, [activeCategory, paletteFilter]);

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

      {/* Filters bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 8px 8px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Category:</span>
          <button
            onClick={() => onToggleCategory(null)}
            style={{
              padding: '4px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeCategory === 'all' ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)',
              color: '#fff', fontSize: 12
            }}
          >All</button>
          {blockCategories.map((c) => (
            <button
              key={c.type}
              onClick={() => onToggleCategory(c.type)}
              style={{
                padding: '4px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: activeCategory === c.type ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)',
                color: '#fff', fontSize: 12
              }}
            >{c.name}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Palette:</span>
          {[{ name: 'all', color: '#666' }, ...palettes].map((p) => (
            <button
              key={p.name}
              onClick={() => setPaletteFilter(p.name as any)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: paletteFilter === p.name ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)',
                color: '#fff', fontSize: 12
              }}
              title={p.name === 'all' ? 'All palettes' : p.name}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
              {p.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Flat grid */}
      <div className={styles.tileGrid}>
        {visibleTiles.map((tile) => (
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
};

export default BlockSelector; 