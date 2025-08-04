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

interface BlockGroup {
  type: IsometricTileData['type'];
  name: string;
  icon: string;
  colors: {
    palette: IsometricTileData['palette'];
    tiles: IsometricTileData[];
  }[];
}

// Tile Preview Component
interface TilePreviewProps {
  tile: IsometricTileData;
  size?: number;
  className?: string;
}



const TilePreview: React.FC<TilePreviewProps> = ({ tile, size = 32, className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const spriteStyle = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url(${TILE_SHEET_CONFIG.imagePath})`,
    backgroundPosition: `-${tile.sourceX}px -${tile.sourceY}px`,
    backgroundSize: `${TILE_SHEET_CONFIG.sheetWidth}px ${TILE_SHEET_CONFIG.sheetHeight}px`,
    imageRendering: 'pixelated' as const,
    display: 'inline-block',
    border: '1px solid var(--color-border-primary)',
    backgroundColor: 'transparent'
  };

  // Debug logging
  useEffect(() => {
    console.log('TilePreview:', {
      tileId: tile.id,
      tileName: tile.name,
      imagePath: TILE_SHEET_CONFIG.imagePath,
      sourceX: tile.sourceX,
      sourceY: tile.sourceY,
      spriteStyle
    });
  }, [tile]);

  if (imageError) {
    return (
      <div 
        className={`${styles.tilePreviewSprite} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: 'var(--color-text-secondary)'
        }}
        title={`${tile.name} (Image failed to load)`}
      >
        {tile.id}
      </div>
    );
  }

  return (
    <div 
      className={`${styles.tilePreviewSprite} ${className}`}
      style={spriteStyle}
      title={tile.name}
      onError={() => setImageError(true)}
    />
  );
};

const Sanctuary: React.FC<SanctuaryProps> = ({
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tiles, setTiles] = useState<IsometricTile[]>([]);
  const [hoverCell, setHoverCell] = useState<HoverCell | null>(null);
  const [nextTileId, setNextTileId] = useState(53);
  const [camera, setCamera] = useState<CameraPosition>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startCameraX: 0,
    startCameraY: 0
  });
  
  // Block selector state
  const [isBlockMenuOpen, setIsBlockMenuOpen] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState<IsometricTileData['type'] | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<IsometricTileData['palette'] | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  
  // Throttle hover updates to reduce redraws
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Group tiles by type and color
  const blockGroups: BlockGroup[] = [
    {
      type: 'cube',
      name: 'Cubes',
      icon: '⬜',
      colors: [
        {
          palette: 'green',
          tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'cube' && tile.palette === 'green')
        },
        {
          palette: 'blue',
          tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'cube' && tile.palette === 'blue')
        },
        {
          palette: 'gray',
          tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'cube' && tile.palette === 'gray')
        },
        {
          palette: 'orange',
          tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'cube' && tile.palette === 'orange')
        }
      ]
    },
         {
       type: 'flat',
       name: 'Flats',
       icon: '⬜',
       colors: [
         {
           palette: 'green',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'flat' && tile.palette === 'green')
         },
         {
           palette: 'blue',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'flat' && tile.palette === 'blue')
         },
         {
           palette: 'gray',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'flat' && tile.palette === 'gray')
         },
         {
           palette: 'orange',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'flat' && tile.palette === 'orange')
         }
       ]
     },
     {
       type: 'ramp',
       name: 'Ramps',
       icon: '⬜',
       colors: [
         {
           palette: 'green',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'ramp' && tile.palette === 'green')
         },
         {
           palette: 'blue',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'ramp' && tile.palette === 'blue')
         },
         {
           palette: 'gray',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'ramp' && tile.palette === 'gray')
         },
         {
           palette: 'orange',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'ramp' && tile.palette === 'orange')
         }
       ]
     },
     {
       type: 'corner',
       name: 'Corners',
       icon: '⬜',
       colors: [
         {
           palette: 'green',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'corner' && tile.palette === 'green')
         },
         {
           palette: 'blue',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'corner' && tile.palette === 'blue')
         },
         {
           palette: 'gray',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'corner' && tile.palette === 'gray')
         },
         {
           palette: 'orange',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'corner' && tile.palette === 'orange')
         }
       ]
     },
     {
       type: 'staircase',
       name: 'Stairs',
       icon: '⬜',
       colors: [
         {
           palette: 'green',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'staircase' && tile.palette === 'green')
         },
         {
           palette: 'blue',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'staircase' && tile.palette === 'blue')
         },
         {
           palette: 'gray',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'staircase' && tile.palette === 'gray')
         },
         {
           palette: 'orange',
           tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'staircase' && tile.palette === 'orange')
         }
       ]
     },
    {
      type: 'pillar',
      name: 'Pillars',
      icon: '⬜',
      colors: [
        {
          palette: 'orange',
          tiles: ISOMETRIC_TILES.filter(tile => tile.type === 'pillar' && tile.palette === 'orange')
        }
      ]
    }
  ];

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
      { id: 19, x: 0, y: 3, tileId: 20, rotation: 0 }, // Blue Flat 1
      { id: 20, x: 1, y: 3, tileId: 21, rotation: 0 }, // Blue Flat 2
      { id: 21, x: 2, y: 3, tileId: 22, rotation: 0 }, // Blue Flat 3
      { id: 22, x: 3, y: 3, tileId: 23, rotation: 0 }, // Blue Corner Left
      { id: 23, x: 4, y: 3, tileId: 24, rotation: 0 }, // Blue Corner Right
      { id: 24, x: 5, y: 3, tileId: 25, rotation: 0 }, // Blue Cube 4
      
      // Row 5 - Gray tiles
      { id: 25, x: 0, y: 4, tileId: 27, rotation: 0 }, // Gray Cube 1
      { id: 26, x: 1, y: 4, tileId: 28, rotation: 0 }, // Gray Cube 2
      { id: 27, x: 2, y: 4, tileId: 29, rotation: 0 }, // Gray Cube 3
      { id: 28, x: 3, y: 4, tileId: 30, rotation: 0 }, // Gray Ramp Left
      { id: 29, x: 4, y: 4, tileId: 31, rotation: 0 }, // Gray Ramp Right
      { id: 30, x: 5, y: 4, tileId: 32, rotation: 0 }, // Gray Staircase
      
      // Row 6 - Gray tiles
      { id: 31, x: 0, y: 5, tileId: 33, rotation: 0 }, // Gray Flat 1
      { id: 32, x: 1, y: 5, tileId: 34, rotation: 0 }, // Gray Flat 2
      { id: 33, x: 2, y: 5, tileId: 35, rotation: 0 }, // Gray Flat 3
      { id: 34, x: 3, y: 5, tileId: 36, rotation: 0 }, // Gray Corner Left
      { id: 35, x: 4, y: 5, tileId: 37, rotation: 0 }, // Gray Corner Right
      { id: 36, x: 5, y: 5, tileId: 38, rotation: 0 }, // Gray Cube 4
    ];
    
    setTiles(initialTiles);
  }, []);

  // Draw isometric grid and tiles (static content)
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
      
      // Render static content (grid and tiles)
      const render = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        
        // Apply camera transform
        ctx.save();
        ctx.translate(camera.x, camera.y);
        ctx.scale(zoom, zoom);
        
        // Draw isometric grid
        drawIsometricGrid();
        
        // Draw tiles
        tiles.forEach(tile => {
          drawTile(ctx, tileSheet, tile, rect.width);
        });
        
        // Draw hover highlight on main canvas for now
        if (hoverCell) {
          drawHoverHighlight(ctx, hoverCell, rect.width);
        }
        
        ctx.restore();
      };
      
      render();
    };
    
    tileSheet.src = TILE_SHEET_CONFIG.imagePath;
  }, [tiles, hoverCell, isLoaded, camera, zoom]); // Added hoverCell back temporarily

  // Draw hover highlight on separate canvas layer (temporarily disabled)
  // useEffect(() => {
  //   const hoverCanvas = hoverCanvasRef.current;
  //   const mainCanvas = canvasRef.current;
  //   if (!hoverCanvas || !mainCanvas || !isLoaded) return;

  //   const ctx = hoverCanvas.getContext('2d');
  //   if (!ctx) return;

  //   // Get device pixel ratio for crisp rendering
  //   const dpr = window.devicePixelRatio || 1;
  //   const mainRect = mainCanvas.getBoundingClientRect();
    
  //   // Set canvas size accounting for device pixel ratio - use main canvas dimensions
  //   hoverCanvas.width = mainRect.width * dpr;
  //   hoverCanvas.height = 300 * dpr;
    
  //   // Scale context to account for device pixel ratio
  //   ctx.scale(dpr, dpr);
    
  //   // Set canvas CSS size - match main canvas exactly
  //   hoverCanvas.style.width = mainRect.width + 'px';
  //   hoverCanvas.style.height = 300 + 'px';

  //   // Clear hover canvas
  //   ctx.clearRect(0, 0, hoverCanvas.width / dpr, hoverCanvas.height / dpr);
    
  //   // Draw hover highlight if exists
  //   if (hoverCell) {
  //     // Apply camera transform - same as main canvas
  //     ctx.save();
  //     ctx.translate(camera.x, camera.y);
  //     ctx.scale(zoom, zoom);
      
  //     drawHoverHighlight(ctx, hoverCell, mainRect.width);
      
  //     ctx.restore();
  //   }
  // }, [hoverCell, isLoaded, camera, zoom]);

  const drawIsometricGrid = () => {
    // Grid drawing is currently disabled for cleaner visual appearance
    // This function is kept for future grid visualization features
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
    
    // Draw simple cell border highlight
    ctx.save();
    
    // Simple border styling
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // White border
    ctx.lineWidth = 2; // Simple line width
    
    // Draw isometric diamond shape for hover cell
    // This should match the grid cell shape exactly
    ctx.beginPath();
    ctx.moveTo(isoX, isoY - tileHeight / 2); // top
    ctx.lineTo(isoX + tileWidth / 2, isoY); // right
    ctx.lineTo(isoX, isoY + tileHeight / 2); // bottom
    ctx.lineTo(isoX - tileWidth / 2, isoY); // left
    ctx.closePath();
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

  // Block selection handlers
  const handleBlockTypeSelect = (type: IsometricTileData['type']) => {
    setSelectedBlockType(type);
    setSelectedPalette(null);
    setSelectedTileId(null);
  };

  const handlePaletteSelect = (palette: IsometricTileData['palette']) => {
    setSelectedPalette(palette);
    // Auto-select first tile of this palette and type
    const group = blockGroups.find(g => g.type === selectedBlockType);
    if (group) {
      const colorGroup = group.colors.find(c => c.palette === palette);
      if (colorGroup && colorGroup.tiles.length > 0) {
        setSelectedTileId(colorGroup.tiles[0].id);
      }
    }
  };

  const handleTileSelect = (tileId: number) => {
    setSelectedTileId(tileId);
  };

  const getSelectedTileId = (): number => {
    if (selectedTileId) return selectedTileId;
    
    // Fallback to random tile if nothing selected
    return getRandomTileId();
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
    
    // Throttle hover updates to reduce redraws
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
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
      
      // Debug: log coordinates to see what's happening
      console.log('Mouse coords:', { x: event.clientX, y: event.clientY });
      console.log('Canvas rect:', { left: rect.left, top: rect.top, width: rect.width });
      console.log('Calculated grid:', { gridX, gridY });
      
      const existingTile = tiles.find(tile => tile.x === gridX && tile.y === gridY);
      if (existingTile) {
        setHoverCell(null);
        return;
      }
      
      setHoverCell({ x: gridX, y: gridY });
    }, 16); // ~60fps throttling
  };

  const handleMouseUp = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  const handleMouseLeave = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
    setHoverCell(null);
    // Clear any pending hover updates
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
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
    
    // Place selected tile or random tile if none selected
    const newTile: IsometricTile = {
      id: nextTileId,
      x: gridX,
      y: gridY,
      tileId: getSelectedTileId(),
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
        <button 
          className={styles.blockMenuToggle}
          onClick={() => setIsBlockMenuOpen(!isBlockMenuOpen)}
        >
          {isBlockMenuOpen ? '✕' : '🧱'}
        </button>
      </div>
      
      {/* Block Selector Menu */}
      {isBlockMenuOpen && (
        <div className={styles.blockSelector}>
          <div className={styles.blockGroups}>
            {blockGroups.map((group) => (
              <div key={group.type} className={styles.blockGroup}>
                <button
                  className={`${styles.blockTypeButton} ${selectedBlockType === group.type ? styles.active : ''}`}
                  onClick={() => handleBlockTypeSelect(group.type)}
                >
                  <span className={styles.blockIcon}>{group.icon}</span>
                  <span className={styles.blockName}>{group.name}</span>
                </button>
                
                {selectedBlockType === group.type && (
                  <div className={styles.colorPalettes}>
                    {group.colors.map((colorGroup) => (
                      <div key={colorGroup.palette} className={styles.colorPalette}>
                        <button
                          className={`${styles.paletteButton} ${selectedPalette === colorGroup.palette ? styles.active : ''}`}
                          onClick={() => handlePaletteSelect(colorGroup.palette)}
                          style={{
                            backgroundColor: colorGroup.palette === 'green' ? '#4CAF50' :
                                           colorGroup.palette === 'blue' ? '#2196F3' :
                                           colorGroup.palette === 'gray' ? '#9E9E9E' :
                                           colorGroup.palette === 'orange' ? '#FF9800' : '#ccc'
                          }}
                        >
                          {colorGroup.palette}
                        </button>
                        
                        {selectedPalette === colorGroup.palette && (
                          <div className={styles.tileGrid}>
                            {colorGroup.tiles.map((tile) => (
                              <button
                                key={tile.id}
                                className={`${styles.tileButton} ${selectedTileId === tile.id ? styles.active : ''}`}
                                onClick={() => handleTileSelect(tile.id)}
                                title={tile.name}
                              >
                                <TilePreview tile={tile} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Selected tile info */}
          {selectedTileId && (
            <div className={styles.selectedTileInfo}>
              <div className={styles.selectedTilePreview}>
                <TilePreview 
                  tile={ISOMETRIC_TILES.find(t => t.id === selectedTileId)!} 
                  size={24}
                />
                <span>{ISOMETRIC_TILES.find(t => t.id === selectedTileId)?.name}</span>
              </div>
            </div>
          )}
        </div>
      )}
      
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
      
      <div className={styles.canvasContainer}>
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
        {/* Temporarily disabled hover canvas for debugging
        <canvas
          ref={hoverCanvasRef}
          className={styles.hoverCanvas}
          style={{ 
            pointerEvents: 'none',
            touchAction: 'none',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
        */}
      </div>
      {!isLoaded && (
        <div className={styles.loadingOverlay}>
          Loading Sanctuary...
        </div>
      )}
    </div>
  );
};

export default Sanctuary; 