import React, { useEffect, useRef, useState } from 'react';
import styles from './Sanctuary.module.css';
import { ISOMETRIC_TILES, TILE_SHEET_CONFIG, IsometricTileData } from '../data/isometric-tiles';
import AtlasEditor from './AtlasEditor';
import { HeightMapGenerator } from './Sanctuary/systems/HeightMapSystem';
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

  // Minimalistic block selector uses fixed sections without additional categories/palettes constants

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

  // Add a new Z level by adding a persistent button and switching to it
  const addNewZLevel = () => {
    const maxZ = availableZLevels.length ? availableZLevels[availableZLevels.length - 1] : 0;
    const nextZ = Math.max(sanctuary.currentZLevel, maxZ) + 1;
    if (actions.sanctuary.addDefinedZLevel) {
      actions.sanctuary.addDefinedZLevel(nextZ);
    }
    actions.sanctuary.setCurrentZLevel(nextZ);
    console.log(`Added Z-level ${nextZ}`);
  };

  // Multi-Z presets helpers
  const availableZLevels = React.useMemo(() => {
    const set = new Set<number>(sanctuary.definedZLevels || []);
    set.add(sanctuary.currentZLevel);
    return Array.from(set).sort((a, b) => a - b);
  }, [sanctuary.definedZLevels, sanctuary.currentZLevel]);

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
      small: { width: 64, height: 64, octaves: 5, frequency: 0.03, amplitude: 1.0, persistence: 0.5, lacunarity: 2.0, minHeight: 0, maxHeight: 255, smoothing: 1.2 },
      medium: { width: 96, height: 96, octaves: 6, frequency: 0.025, amplitude: 1.0, persistence: 0.5, lacunarity: 2.0, minHeight: 0, maxHeight: 255, smoothing: 1.5 },
      large: { width: 128, height: 128, octaves: 7, frequency: 0.02, amplitude: 1.0, persistence: 0.5, lacunarity: 2.1, minHeight: 0, maxHeight: 255, smoothing: 1.8 }
    } as const;

    const cfg = presets[size];
    actions.sanctuary.setHeightMapConfig(cfg as any);

    try {
      const gen = new HeightMapGenerator();
      const map = gen.generateHeightMap(cfg as any);
      actions.sanctuary.setCurrentHeightMap(map);
      // Do not auto-show overlay
    } catch (e) {
      console.warn('HeightMap generation failed, using fallback', e);
      const data: number[][] = Array.from({ length: (cfg as any).height }, () => Array((cfg as any).width).fill(0));
      actions.sanctuary.setCurrentHeightMap({
        width: (cfg as any).width,
        height: (cfg as any).height,
        data,
        minHeight: (cfg as any).minHeight,
        maxHeight: (cfg as any).maxHeight,
        seed: Math.floor(Math.random() * 1e6)
      });
      // Do not auto-show overlay
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

  // Regenerate height map from current config
  const regenerateHeightMapFromConfig = () => {
    const cfg = sanctuary.heightMapConfig as any;
    try {
      const gen = new HeightMapGenerator();
      const map = gen.generateHeightMap(cfg);
      actions.sanctuary.setCurrentHeightMap(map);
      // Do not auto-show overlay
    } catch (e) {
      console.warn('HeightMap regeneration failed', e);
    }
  };

  // Generate terrain blocks from current height map with Z and palette rules
  const generateTerrainFromHeightMap = async (size: number, name: string) => {

    // Ensure height map matches requested size
    if ((sanctuary.heightMapConfig as any).width !== size || (sanctuary.heightMapConfig as any).height !== size) {
      actions.sanctuary.setHeightMapConfig({ ...sanctuary.heightMapConfig, width: size, height: size } as any);
      try {
        const gen = new HeightMapGenerator();
        const newMap = gen.generateHeightMap({ ...(sanctuary.heightMapConfig as any), width: size, height: size } as any);
        actions.sanctuary.setCurrentHeightMap(newMap);
      } catch {}
    }

    const hm = sanctuary.currentHeightMap;
    if (!hm) return;

    // Helper: pick a representative tile by palette or water type
    const pickWater = () => ISOMETRIC_TILES.find(t => t.type === 'water') || ISOMETRIC_TILES[0];
    const pickByPalette = (palette: 'orange' | 'green' | 'gray') =>
      ISOMETRIC_TILES.find(t => t.palette === palette && t.type !== 'water') || ISOMETRIC_TILES.find(t => t.palette === palette) || ISOMETRIC_TILES[0];

    const waterTile = pickWater();
    const orangeTile = pickByPalette('orange');
    const greenTile = pickByPalette('green');
    const grayTile = pickByPalette('gray');

    const minH: number = hm.minHeight ?? 0;
    const maxH: number = hm.maxHeight ?? 255;
    const range = Math.max(1, maxH - minH);

    const blocks: any[] = [];
    for (let y = 0; y < hm.height; y++) {
      for (let x = 0; x < hm.width; x++) {
        const h = hm.data[y][x] as number;
        const t = Math.max(0, Math.min(1, (h - minH) / range));
        const zLevel = Math.max(0, Math.min(10, Math.round(t * 10)));

        // Choose tile per spec
        let tile: IsometricTileData;
        if (zLevel === 0) {
          tile = waterTile;
        } else if (zLevel >= 1 && zLevel <= 3) {
          tile = orangeTile;
        } else if (zLevel >= 4 && zLevel <= 7) {
          tile = greenTile;
        } else {
          tile = grayTile;
        }

        const newBlock = {
          id: `block_${x}_${y}_${zLevel}_${Math.random().toString(36).slice(2, 8)}`,
          type: tile.type,
          position: { x, y, z: zLevel },
          sprite: {
            sourceX: tile.sourceX,
            sourceY: tile.sourceY,
            width: tile.width,
            height: tile.height,
            sheetPath: TILE_SHEET_CONFIG.imagePath
          },
          rotation: 0 as 0,
          palette: (tile as any).palette || 'green',
          properties: {
            walkable: true,
            climbable: false,
            interactable: false,
            destructible: true
          }
        };
        blocks.push(newBlock);
      }
    }

    // Set blocks first, then create the level snapshot so it captures the terrain
    actions.sanctuary.setBlocks(blocks);
    await actions.levelManagement.createNewLevel(name, `Generated ${size}x${size} terrain from height map`);
    // Immediately save with current blocks
    await actions.levelManagement.saveLevel({
      ...sanctuary.currentLevel,
      name,
      blocks,
      camera: sanctuary.camera,
      modifiedAt: new Date()
    } as any);
    // Ensure Z buttons cover 0..10
    if ((actions.sanctuary as any).setDefinedZLevels) {
      (actions.sanctuary as any).setDefinedZLevels(Array.from({ length: 11 }, (_, i) => i));
    }
    actions.sanctuary.setCurrentZLevel(5);
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

  // Height map preview canvas ref
  const heightMapPreviewRef = useRef<HTMLCanvasElement>(null);
  // Terrain generation modal state
  const [showTerrainModal, setShowTerrainModal] = useState(false);
  const [terrainSize, setTerrainSize] = useState<number>(128);
  const [terrainName, setTerrainName] = useState<string>('Generated Terrain');

  const openTerrainModal = () => {
    setTerrainSize(((sanctuary.heightMapConfig as any)?.width as number) || 128);
    setTerrainName(sanctuary.currentLevel.name || 'Generated Terrain');
    setShowTerrainModal(true);
  };

  // Draw height map preview in manager modal
  useEffect(() => {
    if (!sanctuary.showHeightMapManager) return;
    const hm = sanctuary.currentHeightMap;
    const canvas = heightMapPreviewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!hm) return;

    const width: number = hm.width;
    const height: number = hm.height;
    // Fit into 256x256 while preserving aspect
    const maxSize = 256;
    const scale = Math.max(1, Math.floor(Math.min(maxSize / width, maxSize / height)));
    const drawWidth = width * scale;
    const drawHeight = height * scale;
    canvas.width = drawWidth;
    canvas.height = drawHeight;

    const minH: number = hm.minHeight ?? 0;
    const maxH: number = hm.maxHeight ?? 100;
    const getColorForHeight = (h: number): string => {
      const t = Math.max(0, Math.min(1, (h - minH) / Math.max(maxH - minH, 1)));
      const v = Math.round(t * 255);
      return `rgb(${v},${v},${v})`;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const h = hm.data[y][x] as number;
        ctx.fillStyle = getColorForHeight(h);
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }, [sanctuary.showHeightMapManager, sanctuary.currentHeightMap]);

  // Live-regenerate height map when sliders change (debounced)
  useEffect(() => {
    if (!sanctuary.showHeightMapManager) return;
    const handle = setTimeout(() => {
      regenerateHeightMapFromConfig();
    }, 200);
    return () => clearTimeout(handle);
  }, [sanctuary.showHeightMapManager, sanctuary.heightMapConfig]);

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
                    background: sanctuary.eraseMode ? 'var(--color-error)' : 'var(--color-accent-beaver)'
                  }}
                  onClick={() => actions.sanctuary.setEraseMode(!sanctuary.eraseMode)}
                  title="Erase mode: click to remove blocks"
                >
                  {sanctuary.eraseMode ? 'ERASE: ON' : 'ERASE'}
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: sanctuary.zBuildMode ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                  }}
                  onClick={() => actions.sanctuary.setZBuildMode(!sanctuary.zBuildMode)}
                  title="Z-Build mode: after each placement, active Z goes up by 1"
                >
                  {sanctuary.zBuildMode ? 'Z BUILD: ON' : 'Z BUILD'}
                </button>
                {/* Brush sizes */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,3,5,7].map(size => (
                    <button
                      key={size}
                      style={{
                        ...unifiedButtonStyle,
                        background: sanctuary.brushSize === size ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)',
                        fontSize: 10,
                        padding: '2px 6px'
                      }}
                      onClick={() => actions.sanctuary.setBrushSize(size)}
                      title={`Circle brush size ${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
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
                  onClick={() => actions.sanctuary.undo()}
                  title="Undo (Ctrl+Z)"
                >
                  UNDO
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
                  onClick={() => actions.sanctuary.toggleHeightMapManager()}
                  title="Height Map Manager"
                >
                  MANAGER
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
                  onClick={addNewZLevel}
                  title="Add new Z level"
                >
                  ADD
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: sanctuary.shadeInactive ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                  }}
                  onClick={() => actions.sanctuary.setShadeInactive(!sanctuary.shadeInactive)}
                  title="Shade inactive Z levels"
                >
                  SHADE
                </button>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {availableZLevels.map((z) => (
                    <button
                      key={z}
                      style={{
                        ...unifiedButtonStyle,
                        background: sanctuary.currentZLevel === z ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                      }}
                      onClick={() => switchToZLevel(z)}
                      title={`Switch to Z=${z}`}
                    >
                      {`Z${z}`}
                    </button>
                  ))}
                </div>

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
          <div>
            <div>FPS: {performance.fps.toFixed(1)}</div>
            <div>Render: {performance.renderTime.toFixed(1)}</div>
            <div>Blocks: {performance.blockCount}</div>
            <div>Visible: {performance.visibleBlocks}</div>
            <div>Draw Calls: {performance.drawCalls}</div>
            <div>Grade: {performance.isOptimized ? 'Optimized' : 'Standard'}</div>
          </div>
          <div>
            <div>Mouse: {input.lastMousePosition ? `${input.lastMousePosition.x.toFixed(1)}, ${input.lastMousePosition.y.toFixed(1)}` : 'N/A'}</div>
            <div>Grid: {sanctuary.hoverCell ? `${sanctuary.hoverCell.x}, ${sanctuary.hoverCell.y}, ${sanctuary.hoverCell.z}` : 'N/A'}</div>
            <div>Camera: {`${sanctuary.camera.position.x.toFixed(1)}, ${sanctuary.camera.position.y.toFixed(1)}, ${sanctuary.camera.position.z.toFixed(1)}`}</div>
            <div>Zoom: {sanctuary.camera.zoom.toFixed(2)}x</div>
            <div>Z-Level: {sanctuary.currentZLevel}</div>
          </div>
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

      {/* Block Selector (Minimalistic: right-center, no bg, collapsible sections) */}
      {sanctuary.isBlockMenuOpen && (
        <div
          style={{
            position: 'fixed',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'transparent',
            padding: 0,
            zIndex: 1000,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => actions.sanctuary.toggleBlockMenu()}
              title="Close Block Selector"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>

          {(() => {
            const sections = [
              { id: 'water', title: 'Water', tiles: ISOMETRIC_TILES.filter(t => t.type === 'water') },
              { id: 'gray', title: 'Grey', tiles: ISOMETRIC_TILES.filter(t => t.palette === 'gray') },
              { id: 'green', title: 'Green', tiles: ISOMETRIC_TILES.filter(t => t.palette === 'green') },
              { id: 'orange', title: 'Orange', tiles: ISOMETRIC_TILES.filter(t => t.palette === 'orange') },
            ];

            return sections.map(section => {
              const isExpanded = sanctuary.expandedCategory === section.id;
              const columns = Math.ceil(section.tiles.length / 2) || 1;
              return (
                <div key={section.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    onClick={() => actions.sanctuary.setExpandedCategory(isExpanded ? null : section.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    title={section.title}
                  >
                    <span>{isExpanded ? '▼' : '▶'}</span>
                    <span>{section.title}</span>
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        display: 'grid',
                        gridAutoFlow: 'column',
                        gridTemplateRows: 'repeat(2, auto)',
                        gridTemplateColumns: `repeat(${columns}, auto)`,
                        gap: 4,
                      }}
                    >
                      {section.tiles.map(tile => (
                        <button
                          key={tile.id}
                          onClick={() => actions.sanctuary.setSelectedTile(tile)}
                          title={tile.name}
                          style={{
                            background: 'transparent',
                            border: sanctuary.selectedTile?.id === tile.id ? '2px solid var(--color-accent-gold)' : '1px solid transparent',
                            padding: 0,
                            margin: 0,
                            width: 34,
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <TilePreview tile={tile} size={30} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()}
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

      {/* Height Map Manager Modal */}
      {sanctuary.showHeightMapManager && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.2)',
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: 'var(--color-surface, #1e1e1e)',
              color: 'var(--color-text, #fff)',
              borderRadius: 8,
              padding: 12,
              minWidth: 280,
              maxWidth: 360,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: 14 }}>Height Map Manager</h4>
              <button onClick={() => actions.sanctuary.toggleHeightMapManager()} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <canvas
                ref={heightMapPreviewRef}
                style={{
                  width: 256,
                  height: 256,
                  imageRendering: 'pixelated' as const,
                  borderRadius: 4,
                  background: '#000'
                }}
              />
              {/* Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 6, width: '100%' }}>
                <label style={{ fontSize: 11, opacity: 0.9 }}>Octaves</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={sanctuary.heightMapConfig.octaves}
                  onChange={(e) => actions.sanctuary.setHeightMapConfig({ ...sanctuary.heightMapConfig, octaves: parseInt(e.target.value, 10) })}
                  className={styles.uiSlider}
                />
                <span style={{ fontSize: 11 }}>{sanctuary.heightMapConfig.octaves}</span>

                <label style={{ fontSize: 11, opacity: 0.9 }}>Frequency</label>
                <input
                  type="range"
                  min={0.005}
                  max={0.08}
                  step={0.001}
                  value={sanctuary.heightMapConfig.frequency}
                  onChange={(e) => actions.sanctuary.setHeightMapConfig({ ...sanctuary.heightMapConfig, frequency: parseFloat(e.target.value) })}
                  className={styles.uiSlider}
                />
                <span style={{ fontSize: 11 }}>{sanctuary.heightMapConfig.frequency.toFixed(3)}</span>

                <label style={{ fontSize: 11, opacity: 0.9 }}>Persistence</label>
                <input
                  type="range"
                  min={0.3}
                  max={0.9}
                  step={0.05}
                  value={sanctuary.heightMapConfig.persistence}
                  onChange={(e) => actions.sanctuary.setHeightMapConfig({ ...sanctuary.heightMapConfig, persistence: parseFloat(e.target.value) })}
                  className={styles.uiSlider}
                />
                <span style={{ fontSize: 11 }}>{sanctuary.heightMapConfig.persistence.toFixed(2)}</span>

                <label style={{ fontSize: 11, opacity: 0.9 }}>Lacunarity</label>
                <input
                  type="range"
                  min={1.5}
                  max={3}
                  step={0.1}
                  value={sanctuary.heightMapConfig.lacunarity}
                  onChange={(e) => actions.sanctuary.setHeightMapConfig({ ...sanctuary.heightMapConfig, lacunarity: parseFloat(e.target.value) })}
                  className={styles.uiSlider}
                />
                <span style={{ fontSize: 11 }}>{sanctuary.heightMapConfig.lacunarity.toFixed(1)}</span>

                <label style={{ fontSize: 11, opacity: 0.9 }}>Smoothing</label>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={sanctuary.heightMapConfig.smoothing}
                  onChange={(e) => actions.sanctuary.setHeightMapConfig({ ...sanctuary.heightMapConfig, smoothing: parseFloat(e.target.value) })}
                  className={styles.uiSlider}
                />
                <span style={{ fontSize: 11 }}>{sanctuary.heightMapConfig.smoothing.toFixed(1)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  style={unifiedButtonStyle}
                  onClick={() => {
                    const sz = (sanctuary.heightMapConfig as any)?.width || 128;
                    const nm = sanctuary.currentLevel.name || 'Generated Terrain';
                    generateTerrainFromHeightMap(sz, nm);
                  }}
                >
                  Generate Terrain
                </button>
                <button style={unifiedButtonStyle} onClick={openTerrainModal}>
                  Regen
                </button>
                <button style={unifiedButtonStyle} onClick={exportHeightMap}>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Terrain Modal */}
      {sanctuary.showHeightMapManager && showTerrainModal && (
        <div
          style={{
            position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)', zIndex: 1300
          }}
        >
          <div
            style={{
              background: 'var(--color-surface, #1e1e1e)', color: 'var(--color-text, #fff)',
              borderRadius: 8, padding: 12, width: 300, boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: 14 }}>Generate Terrain</h4>
              <button onClick={() => setShowTerrainModal(false)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, marginTop: 8 }}>
              <label style={{ fontSize: 11 }}>Size</label>
              <input
                type="range" min={32} max={256} step={32}
                value={terrainSize}
                onChange={(e) => setTerrainSize(Math.max(32, Math.min(256, parseInt(e.target.value, 10) || 128)))}
                className={styles.uiSlider}
              />
              <span style={{ fontSize: 11 }}>{terrainSize}x{terrainSize}</span>

              <label style={{ fontSize: 11 }}>Name</label>
              <input
                type="text"
                value={terrainName}
                onChange={(e) => setTerrainName(e.target.value.slice(0, 40))}
                style={{ gridColumn: 'span 2', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: 4, padding: '4px 6px' }}
                maxLength={40}
                placeholder="Level name"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
              <button style={unifiedButtonStyle} onClick={() => setShowTerrainModal(false)}>Cancel</button>
              <button
                style={{ ...unifiedButtonStyle, background: 'var(--color-accent-gold)' }}
                onClick={async () => { await generateTerrainFromHeightMap(terrainSize, terrainName || 'Generated Terrain'); setShowTerrainModal(false); }}
              >
                Generate
              </button>
            </div>
          </div>
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