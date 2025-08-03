import React, { useState, useRef, useEffect } from 'react';
import styles from './Sanctuary.module.css';
import { ISOMETRIC_TILES, TILE_SHEET_CONFIG, IsometricTileData } from '../../Reference/isometric-sandbox-sheet';

interface SanctuaryProps {
  className?: string;
}

interface IsometricTile {
  id: number;
  x: number;
  y: number;
  tileId: number; // References the tile data from the sheet
  rotation: 0 | 90 | 180 | 270;
}

interface HoverCell {
  x: number;
  y: number;
}

interface CameraPosition {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  startCameraX: number;
  startCameraY: number;
}

const Sanctuary: React.FC<SanctuaryProps> = ({
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tiles, setTiles] = useState<IsometricTile[]>([]);
  const [hoverCell, setHoverCell] = useState<HoverCell | null>(null);
  const [nextTileId, setNextTileId] = useState(37);
  const [camera, setCamera] = useState<CameraPosition>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startCameraX: 0,
    startCameraY: 0
  });

  // Initialize isometric tiles based on the sandbox sheet
  useEffect(() => {
    const initialTiles: IsometricTile[] = [
      // Fill the area with tiles to check alignment
      // Row 1 - Green tiles
      { id: 1, x: 0, y: 0, tileId: 1, rotation: 0 }, // Green Cube 1
      { id: 2, x: 1, y: 0, tileId: 2, rotation: 0 }, // Green Cube 2
      { id: 3, x: 2, y: 0, tileId: 3, rotation: 0 }, // Green Cube 3
      { id: 4, x: 3, y: 0, tileId: 4, rotation: 0 }, // Green Ramp Left
      { id: 5, x: 4, y: 0, tileId: 5, rotation: 0 }, // Green Ramp Right
      { id: 6, x: 5, y: 0, tileId: 6, rotation: 0 }, // Green Staircase
      
      // Row 2 - Green tiles
      { id: 7, x: 0, y: 1, tileId: 1, rotation: 0 },
      { id: 8, x: 1, y: 1, tileId: 2, rotation: 0 },
      { id: 9, x: 2, y: 1, tileId: 3, rotation: 0 },
      { id: 10, x: 3, y: 1, tileId: 4, rotation: 0 },
      { id: 11, x: 4, y: 1, tileId: 5, rotation: 0 },
      { id: 12, x: 5, y: 1, tileId: 6, rotation: 0 },
      
      // Row 3 - Blue tiles
      { id: 13, x: 0, y: 2, tileId: 14, rotation: 0 }, // Blue Cube 1
      { id: 14, x: 1, y: 2, tileId: 15, rotation: 0 }, // Blue Cube 2
      { id: 15, x: 2, y: 2, tileId: 16, rotation: 0 }, // Blue Cube 3
      { id: 16, x: 3, y: 2, tileId: 17, rotation: 0 }, // Blue Ramp Left
      { id: 17, x: 4, y: 2, tileId: 18, rotation: 0 }, // Blue Ramp Right
      { id: 18, x: 5, y: 2, tileId: 19, rotation: 0 }, // Blue Staircase
      
      // Row 4 - Blue tiles
      { id: 19, x: 0, y: 3, tileId: 14, rotation: 0 },
      { id: 20, x: 1, y: 3, tileId: 15, rotation: 0 },
      { id: 21, x: 2, y: 3, tileId: 16, rotation: 0 },
      { id: 22, x: 3, y: 3, tileId: 17, rotation: 0 },
      { id: 23, x: 4, y: 3, tileId: 18, rotation: 0 },
      { id: 24, x: 5, y: 3, tileId: 19, rotation: 0 },
      
      // Row 5 - Gray tiles
      { id: 25, x: 0, y: 4, tileId: 20, rotation: 0 }, // Gray Cube 1
      { id: 26, x: 1, y: 4, tileId: 21, rotation: 0 }, // Gray Cube 2
      { id: 27, x: 2, y: 4, tileId: 22, rotation: 0 }, // Gray Cube 3
      { id: 28, x: 3, y: 4, tileId: 23, rotation: 0 }, // Gray Ramp Left
      { id: 29, x: 4, y: 4, tileId: 24, rotation: 0 }, // Gray Ramp Right
      { id: 30, x: 5, y: 4, tileId: 25, rotation: 0 }, // Gray Staircase
      
      // Row 6 - Gray tiles
      { id: 31, x: 0, y: 5, tileId: 20, rotation: 0 },
      { id: 32, x: 1, y: 5, tileId: 21, rotation: 0 },
      { id: 33, x: 2, y: 5, tileId: 22, rotation: 0 },
      { id: 34, x: 3, y: 5, tileId: 23, rotation: 0 },
      { id: 35, x: 4, y: 5, tileId: 24, rotation: 0 },
      { id: 36, x: 5, y: 5, tileId: 25, rotation: 0 },
    ];
    
    setTiles(initialTiles);
  }, []);

  // Draw isometric grid and tiles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size accounting for device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = 300 * dpr;
    
    // Scale context to account for device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Set canvas CSS size
    canvas.style.width = rect.width + 'px';
    canvas.style.height = 300 + 'px';

    // Load tile sheet
    const tileSheet = new Image();
    tileSheet.onload = () => {
      setIsLoaded(true);
      
      // Use requestAnimationFrame for smooth rendering
      const render = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        
        // Apply camera transform
        ctx.save();
        ctx.translate(camera.x, camera.y);
        ctx.scale(zoom, zoom);
        
        // Draw isometric grid
        drawIsometricGrid(ctx, rect.width);
        
        // Draw tiles
        tiles.forEach(tile => {
          drawTile(ctx, tileSheet, tile, rect.width);
        });
        
        // Draw hover highlight
        if (hoverCell) {
          drawHoverHighlight(ctx, hoverCell, rect.width);
        }
        
        ctx.restore();
      };
      
      render();
    };
    
    tileSheet.src = TILE_SHEET_CONFIG.imagePath;
  }, [tiles, hoverCell, isLoaded, camera, zoom]);

  const drawIsometricGrid = (ctx: CanvasRenderingContext2D, width: number) => {
    // Proper isometric tilemap grid system
    // Each tile is 32x32 pixels, but in isometric projection:
    // - The tile's base footprint is 32 pixels wide
    // - The tile's base footprint is 16 pixels tall (32/2 for isometric)
    // - Grid cells should match the tile's base footprint exactly
    const tileWidth = 32;
    const tileHeight = 16; // Half the tile width for isometric projection
    
    // Grid cell dimensions - make diamonds larger to fill gaps
    // For edge-to-edge diamonds, use the full tile width/height for diamond points
    const cellWidth = tileWidth; // Full width for diamond points
    const cellHeight = tileHeight; // Full height for diamond points
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Center point - match tile positioning
    const centerX = width / 2;
    const centerY = 56; // Offset down to align with tile bases
    
    // Draw grid cells that match tile base footprints
    // Each cell is a diamond shape that represents where a tile's base would be
    // Use smaller range to reduce flickering and bring cells closer together
    for (let x = -4; x <= 4; x++) {
      for (let y = -4; y <= 4; y++) {
        // Use half the tile width for spacing to match tile positioning
        const isoX = (x - y) * (tileWidth / 2) + centerX;
        const isoY = (x + y) * (tileHeight / 2) + centerY;
        
        // Draw diamond shape for this grid cell
        // The diamond represents the tile's base footprint
        // Use full diamond size to eliminate gaps between cells
        ctx.beginPath();
        ctx.moveTo(isoX, isoY - cellHeight / 2); // top
        ctx.lineTo(isoX + cellWidth / 2, isoY); // right
        ctx.lineTo(isoX, isoY + cellHeight / 2); // bottom
        ctx.lineTo(isoX - cellWidth / 2, isoY); // left
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  const drawTile = (ctx: CanvasRenderingContext2D, tileSheet: HTMLImageElement, tile: IsometricTile, canvasWidth: number) => {
    // Get tile data from the sheet
    const tileData = ISOMETRIC_TILES.find((t: IsometricTileData) => t.id === tile.tileId);
    if (!tileData) return;
    
    // Proper isometric tile positioning
    // Each tile is 32x32 pixels, but in isometric projection:
    // - The tile's base footprint is 32 pixels wide
    // - The tile's base footprint is 16 pixels tall (32/2 for isometric)
    // - For edge-to-edge placement, use half the tile width for spacing
    const tileWidth = 32;
    const tileHeight = 16; // Half the tile width for isometric projection
    
    // Calculate isometric position - this is the center of the tile's base
    // Use half the tile width for spacing to make tiles touch edge-to-edge
    const isoX = (tile.x - tile.y) * (tileWidth / 2) + canvasWidth / 2;
    const isoY = (tile.x + tile.y) * (tileHeight / 2) + 64; // Grid base position
    
    // Draw tile with pixel-perfect positioning
    ctx.save();
    ctx.translate(Math.round(isoX), Math.round(isoY));
    ctx.rotate((tile.rotation * Math.PI) / 180);
    
    // Ensure pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    
    // Draw the tile at its original size from the tile sheet
    // Position the tile so its base aligns with the grid
    // The tile's base should be at the center point, so offset by half the tile height
    ctx.drawImage(
      tileSheet,
      tileData.sourceX, tileData.sourceY, tileData.width, tileData.height,
      -tileData.width / 2, -tileData.height, tileData.width, tileData.height
    );
    
    ctx.restore();
  };

  const drawHoverHighlight = (ctx: CanvasRenderingContext2D, cell: HoverCell, canvasWidth: number) => {
    // Use consistent tile dimensions for hover highlight
    const tileWidth = 32;
    const tileHeight = 16; // Half the tile width for isometric projection
    
    // Use half the tile width for spacing to match tile positioning
    const isoX = (cell.x - cell.y) * (tileWidth / 2) + canvasWidth / 2;
    const isoY = (cell.x + cell.y) * (tileHeight / 2) + 56; // Updated to match grid position
    
    // Draw hover highlight with much better visibility
    ctx.save();
    
    // Draw filled background for better visibility
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Bright green with transparency
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.9)'; // Bright green border
    ctx.lineWidth = 3; // Thicker line for better visibility
    
    // Draw isometric diamond shape for hover cell
    // This should match the grid cell shape exactly
    const points = [
      { x: isoX, y: isoY - tileHeight / 2 }, // top
      { x: isoX + tileWidth / 2, y: isoY }, // right
      { x: isoX, y: isoY + tileHeight / 2 }, // bottom
      { x: isoX - tileWidth / 2, y: isoY }, // left
    ];
    
    // Fill the diamond
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fill();
    
    // Stroke the border
    ctx.stroke();
    
    // Add a pulsing effect with dashed line overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    
    ctx.restore();
  };

  const getRandomTileId = (): number => {
    const availableTiles = ISOMETRIC_TILES.filter(tile => 
      tile.type === 'cube' || tile.type === 'flat'
    );
    const randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
    return randomTile.id;
  };

  // Zoom handlers
  const handleZoomIn = (zoomLevel: number) => {
    setZoom(zoomLevel);
  };

  const handleResetView = () => {
    setCamera({ x: 0, y: 0 });
    setZoom(1);
  };

  // Mouse and touch event handlers
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragState({
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      startCameraX: camera.x,
      startCameraY: camera.y
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    if (dragState.isDragging) {
      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;
      
      setCamera({
        x: dragState.startCameraX + deltaX,
        y: dragState.startCameraY + deltaY
      });
      return; // Don't update hover when dragging
    }
    
    // Update hover cell for tile placement
    const x = (event.clientX - rect.left - camera.x) / zoom;
    const y = (event.clientY - rect.top - camera.y) / zoom;
    
    // Convert screen coordinates to isometric grid coordinates
    const tileWidth = 32;
    const tileHeight = 16;
    
    const centerX = rect.width / 2;
    const centerY = 56; // Updated to match grid position
    
    const isoX = (x - centerX) / (tileWidth / 2);
    const isoY = (y - centerY) / (tileHeight / 2);
    
    const gridX = Math.round((isoX + isoY) / 2);
    const gridY = Math.round((isoY - isoX) / 2);
    
    const existingTile = tiles.find(tile => tile.x === gridX && tile.y === gridY);
    if (existingTile) {
      setHoverCell(null);
      return;
    }
    
    setHoverCell({ x: gridX, y: gridY });
  };

  const handleMouseUp = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  const handleMouseLeave = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
    setHoverCell(null);
  };

  // Touch event handlers
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragState({
      isDragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      startCameraX: camera.x,
      startCameraY: camera.y
    });
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !dragState.isDragging) return;
    
    const deltaX = touch.clientX - dragState.startX;
    const deltaY = touch.clientY - dragState.startY;
    
    setCamera({
      x: dragState.startCameraX + deltaX,
      y: dragState.startCameraY + deltaY
    });
  };

  const handleTouchEnd = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // Only place tiles if not dragging
    if (dragState.isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - camera.x) / zoom;
    const y = (event.clientY - rect.top - camera.y) / zoom;
    
    // Convert screen coordinates to isometric grid coordinates
    const tileWidth = 32;
    const tileHeight = 16;
    
    const centerX = rect.width / 2;
    const centerY = 56; // Updated to match grid position
    
    const isoX = (x - centerX) / (tileWidth / 2);
    const isoY = (y - centerY) / (tileHeight / 2);
    
    const gridX = Math.round((isoX + isoY) / 2);
    const gridY = Math.round((isoY - isoX) / 2);
    
    // Check if cell is empty
    const existingTile = tiles.find(tile => tile.x === gridX && tile.y === gridY);
    if (existingTile) return; // Don't place on existing tile
    
    // Place random tile
    const newTile: IsometricTile = {
      id: nextTileId,
      x: gridX,
      y: gridY,
      tileId: getRandomTileId(),
      rotation: 0
    };
    
    setTiles(prev => [...prev, newTile]);
    setNextTileId(prev => prev + 1);
  };

  return (
    <div className={`${styles.sanctuary} ${className}`}>
      <div className={styles.sanctuaryHeader}>
        <span className={styles.sanctuaryIcon}>🏛️</span>
        <h3 className={styles.sanctuaryTitle}>Sanctuary</h3>
      </div>
      
      <div className={styles.zoomControls}>
        <button 
          className={`${styles.zoomButton} ${zoom === 1 ? styles.active : ''}`}
          onClick={() => handleZoomIn(1)}
        >
          1x
        </button>
        <button 
          className={`${styles.zoomButton} ${zoom === 2 ? styles.active : ''}`}
          onClick={() => handleZoomIn(2)}
        >
          2x
        </button>
        <button 
          className={`${styles.zoomButton} ${zoom === 4 ? styles.active : ''}`}
          onClick={() => handleZoomIn(4)}
        >
          4x
        </button>
        <button 
          className={styles.resetButton}
          onClick={handleResetView}
        >
          Reset
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        className={styles.isometricCanvas}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          cursor: dragState.isDragging 
            ? 'grabbing' 
            : hoverCell 
              ? 'pointer' 
              : 'grab',
          touchAction: 'none' // Prevent default touch behaviors
        }}
      />
      {!isLoaded && (
        <div className={styles.loadingOverlay}>
          Loading Sanctuary...
        </div>
      )}
    </div>
  );
};

export default Sanctuary; 