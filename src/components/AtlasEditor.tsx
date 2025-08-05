import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ISOMETRIC_TILES, TILE_SHEET_CONFIG, IsometricTileData } from '../data/isometric-tiles';
import styles from './AtlasEditor.module.css';

interface AtlasEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TilePosition {
  id: number;
  name: string;
  sourceX: number;
  sourceY: number;
  width: number;
  height: number;
  palette: string;
  type: string;
}

const AtlasEditor: React.FC<AtlasEditorProps> = ({ isOpen, onClose }) => {
  const [selectedTile, setSelectedTile] = useState<TilePosition | null>(null);
  const [tileSheet, setTileSheet] = useState<HTMLImageElement | null>(null);
  const [tileSheetLoaded, setTileSheetLoaded] = useState(false);
  const [zoom] = useState(2); // Fixed zoom level
  const [showGrid, setShowGrid] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [filterPalette, setFilterPalette] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load tile sheet image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setTileSheet(img);
      setTileSheetLoaded(true);
    };
    img.src = TILE_SHEET_CONFIG.imagePath;
  }, []);

  // Filter tiles based on search and filters
  const filteredTiles = ISOMETRIC_TILES.filter(tile => {
    const matchesPalette = filterPalette === 'all' || tile.palette === filterPalette;
    const matchesType = filterType === 'all' || tile.type === filterType;
    const matchesSearch = searchTerm === '' || 
      tile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tile.id.toString().includes(searchTerm);
    
    return matchesPalette && matchesType && matchesSearch;
  });

  // Render the atlas editor
  const renderAtlas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !tileSheet || !tileSheetLoaded || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get container dimensions
    const containerRect = container.getBoundingClientRect();
    const maxWidth = containerRect.width - 16; // Account for padding
    const maxHeight = containerRect.height - 16;

         // Calculate scale to fit the entire atlas
     const scaleX = maxWidth / TILE_SHEET_CONFIG.sheetWidth;
     const scaleY = maxHeight / TILE_SHEET_CONFIG.sheetHeight;
     const scale = Math.min(scaleX, scaleY, 2); // Fixed 2x zoom

    const canvasWidth = TILE_SHEET_CONFIG.sheetWidth * scale;
    const canvasHeight = TILE_SHEET_CONFIG.sheetHeight * scale;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw tile sheet with pixel art filtering
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tileSheet, 0, 0, canvasWidth, canvasHeight);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= TILE_SHEET_CONFIG.sheetWidth; x += TILE_SHEET_CONFIG.tileWidth) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, canvasHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y <= TILE_SHEET_CONFIG.sheetHeight; y += TILE_SHEET_CONFIG.tileHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(canvasWidth, y * scale);
        ctx.stroke();
      }
    }

    // Draw tile highlights and coordinates
    filteredTiles.forEach(tile => {
      const x = tile.sourceX * scale;
      const y = tile.sourceY * scale;
      const width = tile.width * scale;
      const height = tile.height * scale;

      // Highlight selected tile
      if (selectedTile && selectedTile.id === tile.id) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
      }

      // Draw tile border
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);

      // Draw floating tile info
      if (showCoordinates && scale >= 1.5) {
        const coordText = `${tile.sourceX},${tile.sourceY}`;
        const nameText = tile.name;
        
        // Calculate text dimensions
        ctx.font = '10px monospace';
        const coordWidth = ctx.measureText(coordText).width;
        const nameWidth = ctx.measureText(nameText).width;
        const maxWidth = Math.max(coordWidth, nameWidth);
        const textHeight = 24; // Space for two lines
        
        // Background for text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, maxWidth + 8, textHeight);
        
        // Draw coordinates
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(coordText, x + 4, y + 10);
        
        // Draw tile name
        ctx.fillStyle = '#ffff00';
        ctx.font = '9px monospace';
        ctx.fillText(nameText, x + 4, y + 20);
      }
    });
     }, [tileSheet, tileSheetLoaded, showGrid, showCoordinates, selectedTile, filteredTiles]);

    // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
          // Calculate the actual scale being used
      const maxWidth = containerRect.width - 16;
      const maxHeight = containerRect.height - 16;
      const scaleX = maxWidth / TILE_SHEET_CONFIG.sheetWidth;
      const scaleY = maxHeight / TILE_SHEET_CONFIG.sheetHeight;
      const scale = Math.min(scaleX, scaleY, 2);
      
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    // Find clicked tile
    const clickedTile = filteredTiles.find(tile => 
      x >= tile.sourceX && x < tile.sourceX + tile.width &&
      y >= tile.sourceY && y < tile.sourceY + tile.height
    );

    setSelectedTile(clickedTile || null);

    // Copy coordinates to clipboard if tile is found
    if (clickedTile) {
      const coords = `${clickedTile.sourceX},${clickedTile.sourceY}`;
      navigator.clipboard.writeText(coords).then(() => {
        // Optional: Show a brief visual feedback
        console.log(`Copied coordinates: ${coords}`);
      }).catch(err => {
        console.error('Failed to copy coordinates:', err);
      });
    }
  }, [filteredTiles]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'g':
          setShowGrid(!showGrid);
          break;
        case 'c':
          setShowCoordinates(!showCoordinates);
          break;
        case '+':
        case '=':
        case '-':
        case '0':
          // Zoom functionality removed - keeping only 2x
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showGrid, showCoordinates, onClose]);

  // Render when dependencies change
  useEffect(() => {
    renderAtlas();
  }, [renderAtlas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      renderAtlas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderAtlas]);

  if (!isOpen) return null;

  return (
    <div className={styles.atlasEditorOverlay}>
      <div className={styles.atlasEditor}>
        <div className={styles.atlasEditorHeader}>
          <h2>Atlas Editor</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.atlasEditorContent}>
          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <label>Palette:</label>
              <select 
                value={filterPalette} 
                onChange={(e) => setFilterPalette(e.target.value)}
              >
                <option value="all">All</option>
                <option value="green">Green</option>
                <option value="gray">Gray</option>
                <option value="orange">Orange</option>
                <option value="blue">Blue</option>
              </select>
            </div>

            <div className={styles.controlGroup}>
              <label>Type:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="cube">Cube</option>
                <option value="flat">Flat</option>
                <option value="ramp">Ramp</option>
                <option value="corner">Corner</option>
                <option value="staircase">Staircase</option>
                <option value="pillar">Pillar</option>
                <option value="water">Water</option>
              </select>
            </div>

            <div className={styles.controlGroup}>
              <label>Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tiles..."
              />
            </div>



            <div className={styles.controlGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                Grid (G)
              </label>
            </div>

                         <div className={styles.controlGroup}>
               <label>
                 <input
                   type="checkbox"
                   checked={showCoordinates}
                   onChange={(e) => setShowCoordinates(e.target.checked)}
                 />
                 Tile Info (C)
               </label>
             </div>
          </div>

          <div className={styles.atlasContainer} ref={containerRef}>
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={styles.atlasCanvas}
              style={{ cursor: 'crosshair' }}
            />
          </div>
        </div>

        <div className={styles.atlasEditorFooter}>
                     <div className={styles.shortcuts}>
             <strong>Shortcuts:</strong>
             <span>G - Toggle Grid</span>
             <span>C - Toggle Tile Info</span>
             <span>Click - Copy Coords</span>
             <span>ESC - Close</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AtlasEditor; 