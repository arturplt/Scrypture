import React, { useEffect, useState } from 'react';
import styles from './Sanctuary.module.css';
import { ISOMETRIC_TILES, TILE_SHEET_CONFIG, IsometricTileData } from '../data/isometric-tiles';
import AtlasEditor from './AtlasEditor';
import { useSanctuary } from './Sanctuary/hooks';

// ============================================================================
// REFACTORED SANCTUARY COMPONENT USING CUSTOM HOOKS
// ============================================================================

interface SanctuaryProps {
  className?: string;
  onExit?: () => void;
}

// Tile Preview Component
interface TilePreviewProps {
  tile: IsometricTileData;
  size?: number;
  className?: string;
}

const TilePreview: React.FC<TilePreviewProps> = ({ tile, size = 32, className }) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url('${TILE_SHEET_CONFIG.imagePath}')`,
        backgroundPosition: `-${tile.sourceX}px -${tile.sourceY}px`,
        backgroundSize: `${TILE_SHEET_CONFIG.sheetWidth}px ${TILE_SHEET_CONFIG.sheetHeight}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        display: 'inline-block'
      }}
    />
  );
};

const Sanctuary: React.FC<SanctuaryProps> = React.memo(({ className, onExit }) => {
  // Use our main Sanctuary hook
  const [state, actions] = useSanctuary();
  
  const {
    sanctuary,
    canvas,
    input,
    performance,
    levelManagement
  } = state;

  // Unified button style
  const unifiedButtonStyle = {
    background: 'var(--color-accent-beaver)',
    color: 'white',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    transition: 'background-color 0.2s'
  };

  // Block categories for the UI
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

  // Load tile sheet on mount
  useEffect(() => {
    const loadTileSheet = () => {
      const img = new Image();
      img.onload = () => {
        actions.canvas.setTileSheet(img);
        actions.canvas.setTileSheetLoaded(true);
        actions.canvas.setCanvasLoaded(true);
      };
      img.onerror = () => {
        console.error('Failed to load tile sheet');
        actions.canvas.setCanvasLoaded(true); // Still mark as loaded for fallback
      };
      img.src = TILE_SHEET_CONFIG.imagePath;
    };

    loadTileSheet();
  }, []); // Remove actions.canvas dependency to prevent re-renders

  // Canvas size state
  const [canvasSize, setCanvasSize] = useState<'512' | '1024'>('512');

  // Initial canvas setup with fixed sizes
  useEffect(() => {
    const canvasElement = canvas.canvasRef.current;
    if (canvasElement) {
      const size = parseInt(canvasSize);
      const dpr = window.devicePixelRatio || 1;
      
      console.log('Canvas setup - Fixed size:', {
        size,
        dpr,
        actualWidth: size * dpr,
        actualHeight: size * dpr
      });
      
      // Set canvas size to fixed dimensions with device pixel ratio
      canvasElement.width = size * dpr;
      canvasElement.height = size * dpr;
      
      // Set CSS size to maintain visual size
      canvasElement.style.width = `${size}px`;
      canvasElement.style.height = `${size}px`;
      
      // Scale the context to account for device pixel ratio
      const ctx = canvasElement.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      // Position camera at center of canvas
      const centerX = size / 2;
      const centerY = size / 2;
      
      // Update camera position to center of canvas
      actions.sanctuary.setCamera({
        position: { x: centerX, y: centerY, z: 0 },
        zoom: 1,
        rotation: 0
      });
      
      console.log('Canvas setup - Camera positioned at:', {
        centerX,
        centerY,
        canvasSize: size
      });
      
      console.log('Canvas setup - Canvas dimensions:', {
        width: canvasElement.width,
        height: canvasElement.height,
        styleWidth: canvasElement.style.width,
        styleHeight: canvasElement.style.height
      });
    }
  }, [canvasSize]); // Only re-run when canvas size changes

  // Handle canvas resize with fixed sizes
  useEffect(() => {
    const { setCamera } = actions.sanctuary;
    
    const handleResize = () => {
      const canvasElement = canvas.canvasRef.current;
      if (canvasElement) {
        const size = parseInt(canvasSize);
        const dpr = window.devicePixelRatio || 1;
        
        console.log('Canvas resize - Fixed size:', {
          size,
          dpr,
          actualWidth: size * dpr,
          actualHeight: size * dpr
        });
        
        // Set canvas size to fixed dimensions with device pixel ratio
        canvasElement.width = size * dpr;
        canvasElement.height = size * dpr;
        
        // Set CSS size to maintain visual size
        canvasElement.style.width = `${size}px`;
        canvasElement.style.height = `${size}px`;
        
        // Scale the context to account for device pixel ratio
        const ctx = canvasElement.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
        
        // Reposition camera to center of new canvas size
        const centerX = size / 2;
        const centerY = size / 2;
        
        // Only update if center actually changed to avoid redundant renders
        if (
          sanctuary.camera.position.x !== centerX ||
          sanctuary.camera.position.y !== centerY
        ) {
          setCamera({
            position: { x: centerX, y: centerY, z: 0 },
            zoom: sanctuary.camera.zoom, // Keep current zoom level
            rotation: sanctuary.camera.rotation
          });
        }
        
        console.log('Canvas resize - Camera repositioned to:', {
          centerX,
          centerY,
          canvasSize: size
        });
        
        console.log('Canvas resize - Canvas dimensions:', {
          width: canvasElement.width,
          height: canvasElement.height,
          styleWidth: canvasElement.style.width,
          styleHeight: canvasElement.style.height
        });
      }
    };

    // Initial setup
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Add orientation change listener for mobile devices
    const orientationHandler = () => {
      // Small delay to ensure orientation change is complete
      setTimeout(handleResize, 100);
    };
    window.addEventListener('orientationchange', orientationHandler);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', orientationHandler);
    };
  }, [canvasSize, sanctuary.camera.zoom, sanctuary.camera.rotation, actions.sanctuary.setCamera]); // Re-run when canvas size or camera zoom/rotation changes

  // Zoom handlers
  const handleZoomClick = (zoom: number) => {
    actions.sanctuary.updateCamera({ zoom });
  };

  const resetCamera = () => {
    const size = parseInt(canvasSize);
    const centerX = size / 2;
    const centerY = size / 2;
    
    actions.sanctuary.setCamera({
      position: { x: centerX, y: centerY, z: 0 },
      zoom: 1,
      rotation: 0
    });
    
    console.log('Camera reset to:', { centerX, centerY, canvasSize: size });
  };

  // Level management handlers
  const createNewLevel = async () => {
    await actions.levelManagement.createNewLevel();
  };

  const saveLevelDirectly = async () => {
    await actions.levelManagement.saveLevel();
  };

  const loadLevel = async (level: any) => {
    await actions.levelManagement.loadLevel(level.id);
  };

  const renameLevel = async (newName: string) => {
    if (levelManagement.currentLevelId) {
      await actions.levelManagement.renameLevel(levelManagement.currentLevelId, newName);
    }
    actions.sanctuary.setLevelNameInput('');
    actions.sanctuary.setShowRenameDialog(false);
  };

  const openRenameDialog = () => {
    actions.sanctuary.setLevelNameInput(sanctuary.currentLevel.name);
    actions.sanctuary.setShowRenameDialog(true);
  };

  // Reset terrain handlers
  const resetTerrain = () => {
    actions.sanctuary.setShowResetConfirmation(true);
  };

  const confirmResetTerrain = () => {
    actions.resetSanctuary();
    actions.sanctuary.setShowResetConfirmation(false);
  };

  // Fill and generate handlers
  const fillVisibleArea = () => {
    if (!sanctuary.selectedTile) return;
    
    // Get visible area bounds and fill with selected tile
    const bounds = state.cullingSystem.getVisibleAreaBounds(
      sanctuary.camera,
      canvas.canvasRef.current?.width || 800,
      canvas.canvasRef.current?.height || 600
    );
    
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      for (let y = bounds.minY; y <= bounds.maxY; y++) {
        const newBlock = {
          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: sanctuary.selectedTile.type,
          position: { x, y, z: sanctuary.currentZLevel },
          sprite: {
            sourceX: sanctuary.selectedTile.sourceX,
            sourceY: sanctuary.selectedTile.sourceY,
            width: sanctuary.selectedTile.width,
            height: sanctuary.selectedTile.height,
            sheetPath: TILE_SHEET_CONFIG.imagePath
          },
          rotation: 0 as 0,
          palette: sanctuary.selectedTile.palette || 'green',
          properties: {
            walkable: true,
            climbable: false,
            interactable: false,
            destructible: true
          }
        };
        actions.sanctuary.addBlock(newBlock);
      }
    }
  };

  const generateWithAllBlocks = () => {
    // Generate a map with all available blocks
    const bounds = state.cullingSystem.getVisibleAreaBounds(
      sanctuary.camera,
      canvas.canvasRef.current?.width || 800,
      canvas.canvasRef.current?.height || 600
    );
    
    let blockIndex = 0;
    const allTiles = ISOMETRIC_TILES;
    
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      for (let y = bounds.minY; y <= bounds.maxY; y++) {
        const tile = allTiles[blockIndex % allTiles.length];
        const newBlock = {
          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: tile.type,
          position: { x, y, z: sanctuary.currentZLevel },
          sprite: {
            sourceX: tile.sourceX,
            sourceY: tile.sourceY,
            width: tile.width,
            height: tile.height,
            sheetPath: TILE_SHEET_CONFIG.imagePath
          },
          rotation: 0 as 0,
          palette: tile.palette || 'green',
          properties: {
            walkable: true,
            climbable: false,
            interactable: false,
            destructible: true
          }
        };
        actions.sanctuary.addBlock(newBlock);
        blockIndex++;
      }
    }
  };

  // Z-level handlers
  const switchToZLevel = (level: number) => {
    actions.sanctuary.setCurrentZLevel(level);
  };

  // Multi-Z presets helpers
  const availableZLevels = React.useMemo(() => {
    const set = new Set<number>();
    sanctuary.blocks.forEach(b => set.add(b.position.z));
    // Always include 0,1,2 as common defaults even if no blocks yet
    [0, 1, 2].forEach(z => set.add(z));
    return Array.from(set).sort((a, b) => a - b);
  }, [sanctuary.blocks]);

  const applyZFilter = (levels: number[] | 'all') => {
    if (levels === 'all' || levels.length === 0) {
      actions.sanctuary.setZLevelFilter([]); // empty means show all
      return;
    }
    const uniqueSorted = Array.from(new Set(levels)).sort((a, b) => a - b);
    actions.sanctuary.setZLevelFilter(uniqueSorted);
  };

  const applyCurrPlusMinusOne = () => {
    const cz = sanctuary.currentZLevel;
    const target = [cz - 1, cz, cz + 1].filter(z => availableZLevels.includes(z));
    applyZFilter(target);
  };

  const applyToCurrent = () => {
    const cz = sanctuary.currentZLevel;
    const target = availableZLevels.filter(z => z <= cz);
    applyZFilter(target);
  };

  const addZLevel = (level: number, name: string) => {
    // This would integrate with the ZLevelManager system
    console.log(`Adding Z-level ${level}: ${name}`);
  };

  const removeZLevel = (level: number) => {
    // This would integrate with the ZLevelManager system
    console.log(`Removing Z-level ${level}`);
  };

  const toggleZLevelVisibility = (level: number) => {
    // This would integrate with the ZLevelManager system
    console.log(`Toggling visibility for Z-level ${level}`);
  };

  const toggleZLevelLock = (level: number) => {
    // This would integrate with the ZLevelManager system
    console.log(`Toggling lock for Z-level ${level}`);
  };

  const updateZLevelBlockCounts = () => {
    // This would update block counts for all Z-levels
    console.log('Updating Z-level block counts');
  };

  // Height map handlers
  const generateProceduralMap = (size: 'small' | 'medium' | 'large') => {
    // Basic preset configs
    const presets = {
      small: { width: 32, height: 32, octaves: 4, frequency: 0.08, amplitude: 1.0, persistence: 0.5, lacunarity: 2.0, minHeight: 0, maxHeight: 100, smoothing: 1.0 },
      medium: { width: 64, height: 64, octaves: 5, frequency: 0.06, amplitude: 1.0, persistence: 0.5, lacunarity: 2.0, minHeight: 0, maxHeight: 100, smoothing: 1.5 },
      large: { width: 128, height: 128, octaves: 6, frequency: 0.045, amplitude: 1.0, persistence: 0.5, lacunarity: 2.1, minHeight: 0, maxHeight: 100, smoothing: 2.0 }
    } as const;

    const cfg = presets[size];
    actions.sanctuary.setHeightMapConfig(cfg as any);

    // Generate with in-app system if available via MapGenerator (fallback: simple client-side generator)
    try {
      // Lazy import to avoid bundling issues if types move
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { HeightMapGenerator } = require('./Sanctuary/systems/HeightMapSystem');
      const gen = new HeightMapGenerator();
      const map = gen.generateHeightMap(cfg as any);
      actions.sanctuary.setCurrentHeightMap(map);
      if (!sanctuary.showHeightMap) actions.sanctuary.setHeightMapVisible(true);
    } catch (e) {
      console.warn('HeightMapSystem dynamic import failed, using fallback', e);
      // Minimal fallback height map (flat)
      const data: number[][] = Array.from({ length: (cfg as any).height }, () => Array((cfg as any).width).fill(0));
      actions.sanctuary.setCurrentHeightMap({
        width: (cfg as any).width,
        height: (cfg as any).height,
        data,
        minHeight: (cfg as any).minHeight,
        maxHeight: (cfg as any).maxHeight,
        seed: Math.floor(Math.random() * 1e6)
      });
      if (!sanctuary.showHeightMap) actions.sanctuary.setHeightMapVisible(true);
    }
  };

  const exportHeightMap = () => {
    const hm = sanctuary.currentHeightMap;
    if (!hm) return;
    const blob = new Blob([JSON.stringify(hm, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanctuary.currentLevel.name.replace(/\s+/g, '_')}_heightmap.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Test coordinate conversion
  const testCoordinateConversion = () => {
    const canvasElement = canvas.canvasRef.current;
    if (!canvasElement) return;
    
    const rect = canvasElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    console.log('Testing coordinate conversion at canvas center:', {
      screenX: centerX,
      screenY: centerY,
      canvasRect: rect,
      canvasSize: canvasSize
    });
    
    // Test the coordinate conversion
    const gridPos = actions.canvas.screenToGrid(centerX, centerY);
    console.log('Grid position at center:', gridPos);
    
    // Test converting back to screen
    const screenPos = actions.canvas.gridToScreen(gridPos.x, gridPos.y, gridPos.z);
    console.log('Back to screen position:', screenPos);
    
    // Calculate the difference
    const diffX = Math.abs(centerX - screenPos.x);
    const diffY = Math.abs(centerY - screenPos.y);
    console.log('Coordinate conversion accuracy:', { diffX, diffY, isAccurate: diffX < 1 && diffY < 1 });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`${styles.sanctuary} ${className}`}>
      {/* Header */}
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
          <h3 className={styles.sanctuaryTitle}>{sanctuary.currentLevel.name}</h3>
          <span className={styles.canvasSizeIndicator}>{canvasSize}x{canvasSize}</span>
          
          {/* Selected Tile Indicator */}
          {sanctuary.selectedTile && (
            <div className={styles.selectedTileIndicator}>
              <span>Selected: {sanctuary.selectedTile.name}</span>
              <TilePreview tile={sanctuary.selectedTile} size={24} />
            </div>
          )}
        </div>

        {/* Bottom Row - Action Buttons */}
        <div className={styles.headerBottomRow}>
          {/* Camera Options Group */}
          <div className={styles.buttonGroup}>
            <div 
              className={`${styles.buttonGroupHeader} ${sanctuary.collapsedGroups.camera ? styles.collapsed : ''}`}
              onClick={() => actions.sanctuary.toggleGroupCollapse('camera')}
            >
              <span className={styles.buttonGroupLabel}>Camera</span>
              <span className={styles.collapseIcon}>
                {sanctuary.collapsedGroups.camera ? '▶' : '▼'}
              </span>
            </div>
            {!sanctuary.collapsedGroups.camera && (
              <div className={styles.buttonGroupContent}>
                <div className={styles.zoomControls}>
                  <button 
                    className={`${styles.zoomButton} ${sanctuary.camera.zoom === 1 ? styles.zoomButtonActive : ''}`}
                    onClick={() => handleZoomClick(1)}
                    title="1x Zoom"
                  >
                    [1x]
                  </button>
                  <button 
                    className={`${styles.zoomButton} ${sanctuary.camera.zoom === 2 ? styles.zoomButtonActive : ''}`}
                    onClick={() => handleZoomClick(2)}
                    title="2x Zoom"
                  >
                    [2x]
                  </button>
                  <button 
                    className={`${styles.zoomButton} ${sanctuary.camera.zoom === 4 ? styles.zoomButtonActive : ''}`}
                    onClick={() => handleZoomClick(4)}
                    title="4x Zoom"
                  >
                    [4x]
                  </button>
                </div>
                <button 
                  style={unifiedButtonStyle}
                  onClick={resetCamera}
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
              className={`${styles.buttonGroupHeader} ${sanctuary.collapsedGroups.levels ? styles.collapsed : ''}`}
              onClick={() => actions.sanctuary.toggleGroupCollapse('levels')}
            >
              <span className={styles.buttonGroupLabel}>Levels</span>
              <span className={styles.collapseIcon}>
                {sanctuary.collapsedGroups.levels ? '▶' : '▼'}
              </span>
            </div>
            {!sanctuary.collapsedGroups.levels && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => actions.sanctuary.toggleLevelMenu()}
                  title="Level Management"
                >
                  LEVELS
                </button>
                <button 
                  style={unifiedButtonStyle}
                  onClick={resetTerrain}
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
              className={`${styles.buttonGroupHeader} ${sanctuary.collapsedGroups.building ? styles.collapsed : ''}`}
              onClick={() => actions.sanctuary.toggleGroupCollapse('building')}
            >
              <span className={styles.buttonGroupLabel}>Building</span>
              <span className={styles.collapseIcon}>
                {sanctuary.collapsedGroups.building ? '▶' : '▼'}
              </span>
            </div>
            {!sanctuary.collapsedGroups.building && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => actions.sanctuary.toggleBlockMenu()}
                  title="Block Selector"
                >
                  {sanctuary.isBlockMenuOpen ? 'CLOSE' : 'BLOCKS'}
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: 'var(--color-accent-beaver)'
                  }}
                  onClick={fillVisibleArea}
                  title="Fill visible area with selected block"
                >
                  FILL
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: 'var(--color-accent-gold)'
                  }}
                  onClick={generateWithAllBlocks}
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
              className={`${styles.buttonGroupHeader} ${sanctuary.collapsedGroups.tools ? styles.collapsed : ''}`}
              onClick={() => actions.sanctuary.toggleGroupCollapse('tools')}
            >
              <span className={styles.buttonGroupLabel}>Tools</span>
              <span className={styles.collapseIcon}>
                {sanctuary.collapsedGroups.tools ? '▶' : '▼'}
              </span>
            </div>
            {!sanctuary.collapsedGroups.tools && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => actions.sanctuary.toggleInstructions()}
                  title="Show/Hide Instructions"
                >
                  HELP
                </button>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => actions.sanctuary.toggleGrid()}
                  title="Show/Hide Grid"
                >
                  GRID
                </button>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => actions.sanctuary.togglePerformance()}
                  title="Performance Monitor"
                >
                  STATS
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: 'var(--color-accent-gold)',
                    fontSize: '10px',
                    padding: '2px 4px'
                  }}
                  onClick={testCoordinateConversion}
                  title="Test Coordinate Conversion"
                >
                  TEST
                </button>
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  <button 
                    style={{
                      ...unifiedButtonStyle,
                      background: canvasSize === '512' ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)',
                      fontSize: '10px',
                      padding: '2px 4px'
                    }}
                    onClick={() => setCanvasSize('512')}
                    title="512x512 Canvas"
                  >
                    512
                  </button>
                  <button 
                    style={{
                      ...unifiedButtonStyle,
                      background: canvasSize === '1024' ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)',
                      fontSize: '10px',
                      padding: '2px 4px'
                    }}
                    onClick={() => setCanvasSize('1024')}
                    title="1024x1024 Canvas"
                  >
                    1024
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Height Map Group */}
          <div className={styles.buttonGroup}>
            <div 
              className={`${styles.buttonGroupHeader} ${sanctuary.collapsedGroups.heightmap ? styles.collapsed : ''}`}
              onClick={() => actions.sanctuary.toggleGroupCollapse('heightmap')}
            >
              <span className={styles.buttonGroupLabel}>Height Map</span>
              <span className={styles.collapseIcon}>
                {sanctuary.collapsedGroups.heightmap ? '▶' : '▼'}
              </span>
            </div>
            {!sanctuary.collapsedGroups.heightmap && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => generateProceduralMap('small')}
                  title="Generate Island"
                >
                  GENERATE
                </button>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => actions.sanctuary.toggleHeightMap()}
                  title="Show/Hide Height Map"
                >
                  {sanctuary.showHeightMap ? 'HIDE' : 'SHOW'}
                </button>
                <button 
                  style={unifiedButtonStyle}
                  onClick={exportHeightMap}
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
              className={`${styles.buttonGroupHeader} ${sanctuary.collapsedGroups.zlevels ? styles.collapsed : ''}`}
              onClick={() => actions.sanctuary.toggleGroupCollapse('zlevels')}
            >
              <span className={styles.buttonGroupLabel}>Z-Levels</span>
              <span className={styles.collapseIcon}>
                {sanctuary.collapsedGroups.zlevels ? '▶' : '▼'}
              </span>
            </div>
            {!sanctuary.collapsedGroups.zlevels && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => actions.sanctuary.toggleZLevelManager()}
                  title="Z-Level Manager"
                >
                  MANAGER
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: sanctuary.currentZLevel === 0 ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                  }}
                  onClick={() => switchToZLevel(0)}
                  title="Switch to Ground Level (Z=0)"
                >
                  Z0
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: sanctuary.currentZLevel === 1 ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                  }}
                  onClick={() => switchToZLevel(1)}
                  title="Switch to Level 1 (Z=1)"
                >
                  Z1
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: sanctuary.currentZLevel === 2 ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                  }}
                  onClick={() => switchToZLevel(2)}
                  title="Switch to Level 2 (Z=2)"
                >
                  Z2
                </button>

                {/* Z Filter Presets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>Filter:</span>
                    {sanctuary.zLevelFilter.length === 0 ? (
                      <span style={{ fontSize: 12 }}>All</span>
                    ) : (
                      sanctuary.zLevelFilter.map((z) => (
                        <span key={z} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'var(--color-accent-beaver)',
                          color: '#fff',
                          borderRadius: 12,
                          padding: '2px 6px',
                          fontSize: 11
                        }}>
                          Z{z}
                          <button
                            onClick={() => actions.sanctuary.removeZLevelFilter(z)}
                            style={{
                              background: 'transparent',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 12,
                              lineHeight: 1
                            }}
                            title={`Remove Z${z} from filter`}
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button
                      style={{ ...unifiedButtonStyle, fontSize: 10, padding: '2px 6px' }}
                      onClick={() => applyZFilter('all')}
                      title="Show all Z levels"
                    >ALL</button>
                    <button
                      style={{ ...unifiedButtonStyle, fontSize: 10, padding: '2px 6px' }}
                      onClick={() => applyZFilter([0, 1])}
                      title="Show Z0 and Z1"
                    >0+1</button>
                    <button
                      style={{ ...unifiedButtonStyle, fontSize: 10, padding: '2px 6px' }}
                      onClick={() => applyZFilter([1, 2])}
                      title="Show Z1 and Z2"
                    >1+2</button>
                    <button
                      style={{ ...unifiedButtonStyle, fontSize: 10, padding: '2px 6px' }}
                      onClick={applyCurrPlusMinusOne}
                      title="Show current Z and its neighbors"
                    >CURR±1</button>
                    <button
                      style={{ ...unifiedButtonStyle, fontSize: 10, padding: '2px 6px' }}
                      onClick={applyToCurrent}
                      title="Show all Z levels up to current"
                    >TO CURR</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Display */}
      {sanctuary.showPerformance && (
        <div className={styles.performanceDisplay}>
          <div>FPS: {performance.fps.toFixed(1)}</div>
          <div>Render: {performance.renderTime.toFixed(1)}ms</div>
          <div>Blocks: {performance.blockCount}</div>
          <div>Visible: {performance.visibleBlocks}</div>
          <div>Draw Calls: {performance.drawCalls}</div>
          <div>Grade: {performance.isOptimized ? 'Optimized' : 'Standard'}</div>
        </div>
      )}

      {/* Debug Coordinate Display */}
      {sanctuary.showPerformance && (
        <div className={styles.debugDisplay}>
          <div>Mouse: {input.lastMousePosition ? `${input.lastMousePosition.x.toFixed(1)}, ${input.lastMousePosition.y.toFixed(1)}` : 'N/A'}</div>
          <div>Grid: {sanctuary.hoverCell ? `${sanctuary.hoverCell.x}, ${sanctuary.hoverCell.y}, ${sanctuary.hoverCell.z}` : 'N/A'}</div>
          <div>Camera: {`${sanctuary.camera.position.x.toFixed(1)}, ${sanctuary.camera.position.y.toFixed(1)}, ${sanctuary.camera.position.z.toFixed(1)}`}</div>
          <div>Zoom: {sanctuary.camera.zoom.toFixed(2)}x</div>
          <div>Z-Level: {sanctuary.currentZLevel}</div>
        </div>
      )}

      {/* Level Management Menu */}
      {sanctuary.showLevelMenu && (
        <div className={styles.levelMenu}>
          <div className={styles.levelMenuHeader}>
            <h4>Level Management</h4>
            <button onClick={() => actions.sanctuary.toggleLevelMenu()}>✕</button>
          </div>
          
          <div className={styles.levelActions}>
            <button onClick={createNewLevel}>New Level</button>
            <button onClick={saveLevelDirectly}>Save Level</button>
            <button onClick={openRenameDialog}>Rename Level</button>
            <button onClick={() => actions.sanctuary.toggleAtlasEditor()}>Atlas Editor</button>
          </div>
          
          <div className={styles.levelList}>
            <h5>Saved Levels</h5>
            {levelManagement.savedLevels.map(level => (
              <div key={level.id} className={styles.levelItem}>
                <span>{level.name}</span>
                <div className={styles.levelItemActions}>
                  <button onClick={() => loadLevel(level)}>Load</button>
                  <button onClick={() => actions.levelManagement.deleteLevel(level.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Terrain Confirmation Dialog */}
      {sanctuary.showResetConfirmation && (
        <div className={styles.confirmationDialog}>
          <div className={styles.confirmationDialogContent}>
            <h4>Reset Terrain</h4>
            <p>Are you sure you want to reset the terrain? This will remove all blocks and cannot be undone.</p>
            <div className={styles.confirmationDialogActions}>
              <button 
                onClick={confirmResetTerrain}
                style={{
                  ...unifiedButtonStyle,
                  background: 'var(--color-error)',
                  color: 'white'
                }}
              >
                Reset Terrain
              </button>
              <button 
                onClick={() => actions.sanctuary.setShowResetConfirmation(false)}
                style={unifiedButtonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Selector */}
      {sanctuary.isBlockMenuOpen && (
        <div className={styles.blockSelector}>
          <div className={styles.blockSelectorHeader}>
            <button 
              className={styles.closeButton}
              onClick={() => actions.sanctuary.toggleBlockMenu()}
              title="Close Block Selector"
            >
              ✕
            </button>
          </div>
          
          <div className={styles.blockCategories}>
            {blockCategories.map(category => {
              const isExpanded = sanctuary.expandedCategory === category.type;
              
              return (
                <div key={category.type} className={styles.blockCategory}>
                  <div 
                    className={styles.categoryHeader}
                    onClick={() => actions.sanctuary.setExpandedCategory(isExpanded ? null : category.type)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h4>{category.name}</h4>
                    <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                  </div>
                  
                  {isExpanded && (
                    <div className={styles.expandedContent}>
                      {category.type === 'water' ? (
                        // Special rendering for water category
                        <div className={styles.tileGrid}>
                          {ISOMETRIC_TILES.filter(tile => tile.type === 'water').map(tile => (
                            <button
                              key={tile.id}
                              className={`${styles.tileButton} ${sanctuary.selectedTile?.id === tile.id ? styles.active : ''}`}
                              onClick={() => actions.sanctuary.setSelectedTile(tile)}
                              title={`${tile.name} (water) - ${tile.sourceX},${tile.sourceY}`}
                            >
                              <TilePreview tile={tile} size={32} />
                            </button>
                          ))}
                        </div>
                      ) : (
                        // Regular rendering for other categories
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
                                      className={`${styles.tileButton} ${sanctuary.selectedTile?.id === tile.id ? styles.active : ''}`}
                                      onClick={() => actions.sanctuary.setSelectedTile(tile)}
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
      )}

      {/* Rename Dialog */}
      {sanctuary.showRenameDialog && (
        <div className={styles.renameDialog}>
          <div className={styles.renameDialogContent}>
            <h4>Rename Level</h4>
            <input
              type="text"
              value={sanctuary.levelNameInput}
              onChange={(e) => actions.sanctuary.setLevelNameInput(e.target.value)}
              placeholder="Enter level name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renameLevel(sanctuary.levelNameInput);
                } else if (e.key === 'Escape') {
                  actions.sanctuary.setShowRenameDialog(false);
                  actions.sanctuary.setLevelNameInput('');
                }
              }}
              autoFocus
            />
            <div className={styles.renameDialogActions}>
              <button onClick={() => renameLevel(sanctuary.levelNameInput)}>Rename</button>
              <button onClick={() => {
                actions.sanctuary.setShowRenameDialog(false);
                actions.sanctuary.setLevelNameInput('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvas.canvasRef}
          className={styles.isometricCanvas}
          onMouseDown={actions.input.handleMouseDown}
          onMouseMove={actions.input.handleMouseMove}
          onMouseUp={actions.input.handleMouseUp}
          onMouseLeave={actions.input.handleMouseLeave}
          onClick={actions.input.handleMouseClick}
          onWheel={actions.input.handleWheel}
          onTouchStart={actions.input.handleTouchStart}
          onTouchMove={actions.input.handleTouchMove}
          onTouchEnd={actions.input.handleTouchEnd}
          onContextMenu={actions.input.handleContextMenu}
          tabIndex={0}
          style={{
            cursor: sanctuary.selectedTile ? 'crosshair' : 'default',
            width: `${canvasSize}px`,
            height: `${canvasSize}px`
          }}
        />
      </div>

      {/* Instructions */}
      {sanctuary.showInstructions && (
        <div className={styles.instructions}>
          <h4>Instructions</h4>
          <div className={styles.instructionItem}>
            <strong>Left Click:</strong> {sanctuary.selectedTile ? 'Place Block' : 'Select Block'}
          </div>
          <div className={styles.instructionItem}>
            <strong>Right Click:</strong> Remove Block
          </div>
          <div className={styles.instructionItem}>
            <strong>Middle Drag:</strong> Pan Camera
          </div>
          <div className={styles.instructionItem}>
            <strong>Zoom Buttons:</strong> [1x] [2x] [4x]
          </div>
          <div className={styles.instructionItem}>
            <strong>R Key:</strong> Rotate Selected Block
          </div>
          <div className={styles.instructionItem}>
            <strong>Delete:</strong> Remove Selected Block
          </div>
          <div className={styles.instructionItem}>
            <strong>Ctrl+C:</strong> Toggle All Button Groups
          </div>
          <div className={styles.instructionItem}>
            <strong>Ctrl+D:</strong> Toggle Debug Info (Coordinates)
          </div>
          <div className={styles.instructionItem}>
            <strong>Canvas Size:</strong> Use 512/1024 buttons in Tools to switch between fixed canvas sizes
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(!canvas.isLoaded || !canvas.tileSheetLoaded) && (
        <div className={styles.loadingOverlay}>
          {!canvas.isLoaded ? 'Loading Optimized Sanctuary...' : 'Loading Tile Sheet...'}
        </div>
      )}

      {/* Atlas Editor */}
      <AtlasEditor 
        isOpen={sanctuary.showAtlasEditor}
        onClose={() => actions.sanctuary.toggleAtlasEditor()}
      />
    </div>
  );
});

Sanctuary.displayName = 'Sanctuary';

export default Sanctuary; 