import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styles from './Sanctuary.module.css';
import { ISOMETRIC_TILES, TILE_SHEET_CONFIG, IsometricTileData } from '../data/isometric-tiles';

// ============================================================================
// PERFORMANCE-FIRST ARCHITECTURE
// ============================================================================

interface SanctuaryProps {
  className?: string;
}

// Core data structures optimized for performance
interface Block {
  id: string;
  type: IsometricTileData['type'];
  palette: IsometricTileData['palette'];
  position: { x: number; y: number; z: number };
  rotation: 0 | 90 | 180 | 270;
  properties: {
    walkable: boolean;
    climbable: boolean;
    interactable: boolean;
    destructible: boolean;
  };
  sprite: {
    sourceX: number;
    sourceY: number;
    width: number;
    height: number;
    sheetPath: string;
  };
}

interface Camera {
  position: { x: number; y: number; z: number };
  zoom: number;
  rotation: number;
}

interface ViewFrustum {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
}

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  blockCount: number;
  visibleBlocks: number;
  memoryUsage: number;
  drawCalls: number;
  timestamp: number;
}

interface Level {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: Date;
  modifiedAt: Date;
  blocks: Block[];
  camera: Camera;
  settings: {
    gravity: boolean;
    timeLimit?: number;
  };
}

// ============================================================================
// PERFORMANCE MONITORING SYSTEM
// ============================================================================

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxSamples = 60; // 1 second at 60fps
  private lastFrameTime = 0;

  collectMetrics(): PerformanceMetrics {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    const fps = deltaTime > 0 ? 1000 / deltaTime : 60;
    this.lastFrameTime = now;

    const metrics: PerformanceMetrics = {
      fps: Math.min(fps, 60),
      renderTime: deltaTime,
      blockCount: 0, // Will be set by renderer
      visibleBlocks: 0, // Will be set by culling system
      memoryUsage: this.getMemoryUsage(),
      drawCalls: 0, // Will be set by renderer
      timestamp: now
    };

    this.metrics.push(metrics);
    if (this.metrics.length > this.maxSamples) {
      this.metrics.shift();
    }

    return metrics;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  getAverageFPS(): number {
    if (this.metrics.length === 0) return 60;
    return this.metrics.reduce((sum, m) => sum + m.fps, 0) / this.metrics.length;
  }

  getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const avgFPS = this.getAverageFPS();
    if (avgFPS >= 58) return 'A';
    if (avgFPS >= 50) return 'B';
    if (avgFPS >= 40) return 'C';
    if (avgFPS >= 30) return 'D';
    return 'F';
  }

  getRecentMetrics(): PerformanceMetrics[] {
    return this.metrics.slice(-10);
  }
}

// ============================================================================
// SPATIAL INDEXING SYSTEM
// ============================================================================

class SpatialIndex {
  private grid = new Map<string, Block[]>();
  private cellSize = 32;

  private getCellKey(x: number, y: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellY},${cellZ}`;
  }

  addBlock(block: Block): void {
    const key = this.getCellKey(block.position.x, block.position.y, block.position.z);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(block);
  }

  removeBlock(block: Block): void {
    const key = this.getCellKey(block.position.x, block.position.y, block.position.z);
    const cell = this.grid.get(key);
    if (cell) {
      const index = cell.findIndex(b => b.id === block.id);
      if (index !== -1) {
        cell.splice(index, 1);
        if (cell.length === 0) {
          this.grid.delete(key);
        }
      }
    }
  }

  getBlocksInArea(x: number, y: number, z: number, radius: number): Block[] {
    const blocks: Block[] = [];
    const centerCell = this.getCellKey(x, y, z);
    const [centerX, centerY, centerZ] = centerCell.split(',').map(Number);
    
    // Check surrounding cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cellKey = `${centerX + dx},${centerY + dy},${centerZ + dz}`;
          const cellBlocks = this.grid.get(cellKey) || [];
          blocks.push(...cellBlocks);
        }
      }
    }
    
    return blocks;
  }

  getBlockAt(x: number, y: number, z: number): Block | null {
    const key = this.getCellKey(x, y, z);
    const cell = this.grid.get(key);
    if (cell && cell.length > 0) {
      return cell.find(block => 
        block.position.x === x && 
        block.position.y === y && 
        block.position.z === z
      ) || null;
    }
    return null;
  }

  clear(): void {
    this.grid.clear();
  }
  
  getAllBlocks(): Block[] {
    const allBlocks: Block[] = [];
    this.grid.forEach(cellBlocks => {
      allBlocks.push(...cellBlocks);
    });
    return allBlocks;
  }
}

// ============================================================================
// CULLING SYSTEM
// ============================================================================

class CullingSystem {
  private spatialIndex: SpatialIndex;
  private frustum: ViewFrustum;

  constructor(spatialIndex: SpatialIndex) {
    this.spatialIndex = spatialIndex;
    this.frustum = {
      left: -1000,
      right: 1000,
      top: -1000,
      bottom: 1000,
      near: 0,
      far: 1000
    };
  }

  updateFrustum(camera: Camera, canvasWidth: number, canvasHeight: number): void {
    const halfWidth = canvasWidth / (2 * camera.zoom);
    const halfHeight = canvasHeight / (2 * camera.zoom);
    
    this.frustum = {
      left: camera.position.x - halfWidth,
      right: camera.position.x + halfWidth,
      top: camera.position.y - halfHeight,
      bottom: camera.position.y + halfHeight,
      near: 0,
      far: 1000
    };
  }

  getVisibleBlocks(camera: Camera, maxDistance: number = 200): Block[] {
    // Temporarily bypass spatial index and return all blocks for debugging
    const allBlocks = this.spatialIndex.getAllBlocks();
    
    // Temporarily disable culling to see all blocks
    const filteredBlocks = allBlocks; // .filter(block => {
    //   // Frustum culling
    //   if (!this.isInFrustum(block)) return false;
    //   
    //   // Distance culling
    //   const distance = this.getDistance(block, camera);
    //   if (distance > maxDistance) return false;
    //   
    //   return true;
    // });
    
    // Debug info removed for clean output
    
    return filteredBlocks;
  }

  private isInFrustum(block: Block): boolean {
    const { x, y, z } = block.position;
    
    // Convert grid coordinates to world coordinates (before camera transform)
    const tileWidth = 32;
    const tileHeight = 16;
    
    // Isometric projection to world coordinates
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * tileHeight;
    
    // Check if the block's world position is within the frustum
    // The frustum is already in world coordinates (accounting for camera)
    return isoX >= this.frustum.left && isoX <= this.frustum.right &&
           isoY >= this.frustum.bottom && isoY <= this.frustum.top &&
           z >= this.frustum.near && z <= this.frustum.far;
  }

  private getDistance(block: Block, camera: Camera): number {
    const { x, y, z } = block.position;
    
    // Convert grid coordinates to world coordinates for distance calculation
    const tileWidth = 32;
    const tileHeight = 16;
    
    // Isometric projection to world coordinates
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * tileHeight;
    
    // Calculate distance in world space
    const dx = isoX - camera.position.x;
    const dy = isoY - camera.position.y;
    const dz = z - camera.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

// ============================================================================
// BATCH RENDERING SYSTEM
// ============================================================================

interface RenderBatch {
  texture: string;
  blocks: Block[];
  vertices: number[];
  indices: number[];
  count: number;
}

class BatchRenderer {
  private batches = new Map<string, RenderBatch>();

  addToBatch(block: Block): void {
    const textureKey = block.sprite.sheetPath;
    
    if (!this.batches.has(textureKey)) {
      this.batches.set(textureKey, {
        texture: textureKey,
        blocks: [],
        vertices: [],
        indices: [],
        count: 0
      });
    }
    
    const batch = this.batches.get(textureKey)!;
    batch.blocks.push(block);
    batch.count++;
  }

  getBatches(): RenderBatch[] {
    return Array.from(this.batches.values());
  }

  clear(): void {
    this.batches.clear();
  }

  getDrawCallCount(): number {
    return this.batches.size;
  }
}

// ============================================================================
// MEMORY POOL SYSTEM
// ============================================================================

class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void) {
    this.factory = factory;
    this.reset = reset;
  }

  get(): T {
    return this.pool.pop() || this.factory();
  }

  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// ============================================================================
// LEVEL MANAGEMENT SYSTEM
// ============================================================================

class LevelManager {
  private static STORAGE_KEY = 'sanctuary_levels';

  static saveLevel(level: Level): void {
    try {
      const levels = this.getAllLevels();
      const existingIndex = levels.findIndex(l => l.id === level.id);
      
      if (existingIndex >= 0) {
        levels[existingIndex] = { ...level, modifiedAt: new Date() };
      } else {
        levels.push({ ...level, createdAt: new Date(), modifiedAt: new Date() });
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(levels));
    } catch (error) {
      console.error('Failed to save level:', error);
    }
  }

  static loadLevel(levelId: string): Level | null {
    try {
      const levels = this.getAllLevels();
      return levels.find(l => l.id === levelId) || null;
    } catch (error) {
      console.error('Failed to load level:', error);
      return null;
    }
  }

  static getAllLevels(): Level[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get levels:', error);
      return [];
    }
  }

  static deleteLevel(levelId: string): boolean {
    try {
      const levels = this.getAllLevels();
      const filtered = levels.filter(l => l.id !== levelId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete level:', error);
      return false;
    }
  }

  static createNewLevel(name: string = 'New Level'): Level {
    return {
      id: `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: 'A new sanctuary level',
      author: 'Player',
      createdAt: new Date(),
      modifiedAt: new Date(),
      blocks: [],
      camera: { position: { x: 400, y: 300, z: 0 }, zoom: 1.5, rotation: 0 },
      settings: { gravity: true }
    };
  }
}

// ============================================================================
// TILE PREVIEW COMPONENT (OPTIMIZED)
// ============================================================================

interface TilePreviewProps {
  tile: IsometricTileData;
  size?: number;
  className?: string;
}

const TilePreview: React.FC<TilePreviewProps> = React.memo(({ tile, size = 32, className = '' }) => {
  const spriteStyle = useMemo(() => ({
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url('${TILE_SHEET_CONFIG.imagePath}')`,
    backgroundPosition: `-${tile.sourceX}px -${tile.sourceY}px`,
    backgroundSize: `${TILE_SHEET_CONFIG.sheetWidth}px ${TILE_SHEET_CONFIG.sheetHeight}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as const,
    display: 'block',
    flexShrink: 0,
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) translateZ(0)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '2px'
  }), [tile.sourceX, tile.sourceY, size]);

  return (
    <div 
      className={`${styles.tilePreviewSprite} ${className}`}
      style={spriteStyle}
      title={`${tile.name} (${tile.palette}) - ${tile.sourceX},${tile.sourceY}`}
    />
  );
});

TilePreview.displayName = 'TilePreview';

// ============================================================================
// PROCEDURAL MAP GENERATION SYSTEM
// ============================================================================

interface MapGeneratorConfig {
  width: number;
  height: number;
  seed?: number;
  terrainTypes: {
    grass: number;
    stone: number;
    water: number;
    sand: number;
  };
  features: {
    structures: boolean;
    trees: boolean;
    waterBodies: boolean;
    elevation: boolean;
  };
}

class ProceduralMapGenerator {
  private seed: number;
  private noise: (x: number, y: number) => number;

  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
    this.noise = this.createNoiseFunction();
  }

  private createNoiseFunction(): (x: number, y: number) => number {
    // Simple hash-based noise function
    const hash = (x: number, y: number): number => {
      const n = x + y * 57 + this.seed;
      return Math.sin(n) * 43758.5453 - Math.floor(Math.sin(n) * 43758.5453);
    };

    return (x: number, y: number): number => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;

      const h00 = hash(xi, yi);
      const h10 = hash(xi + 1, yi);
      const h01 = hash(xi, yi + 1);
      const h11 = hash(xi + 1, yi + 1);

      // Bilinear interpolation
      const top = h00 + (h10 - h00) * xf;
      const bottom = h01 + (h11 - h01) * xf;
      return top + (bottom - top) * yf;
    };
  }

  private getTerrainType(x: number, y: number): { type: string; palette: string; elevation: number } {
    const noise1 = this.noise(x * 0.1, y * 0.1);
    const noise2 = this.noise(x * 0.05, y * 0.05);
    const combinedNoise = (noise1 + noise2) / 2;

    // Elevation based on noise
    const elevation = Math.floor(combinedNoise * 3);

    // Terrain type based on noise and elevation
    if (combinedNoise < 0.2) {
      return { type: 'water', palette: 'blue', elevation };
    } else if (combinedNoise < 0.4) {
      return { type: 'flat', palette: 'green', elevation };
    } else if (combinedNoise < 0.7) {
      return { type: 'flat', palette: 'gray', elevation };
    } else {
      return { type: 'cube', palette: 'orange', elevation };
    }
  }

  private shouldPlaceStructure(x: number, y: number): boolean {
    const structureNoise = this.noise(x * 0.3, y * 0.3);
    return structureNoise > 0.8 && Math.abs(x) > 3 && Math.abs(y) > 3; // Avoid center
  }

  private shouldPlaceTree(x: number, y: number): boolean {
    const treeNoise = this.noise(x * 0.4, y * 0.4);
    return treeNoise > 0.85 && Math.abs(x) > 2 && Math.abs(y) > 2;
  }

  generateMap(config: MapGeneratorConfig): Block[] {
    const blocks: Block[] = [];
    const centerX = 0;
    const centerY = 0;

    // Generate base terrain
    for (let x = -config.width / 2; x < config.width / 2; x++) {
      for (let y = -config.height / 2; y < config.height / 2; y++) {
        const terrain = this.getTerrainType(x, y);
        
        // Skip water tiles for now (we'll add them separately)
        if (terrain.type === 'water') continue;

        // Find appropriate tile for this terrain type and palette
        const availableTiles = ISOMETRIC_TILES.filter(tile => 
          tile.type === terrain.type && tile.palette === terrain.palette
        );

        if (availableTiles.length > 0) {
          const selectedTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
          
          const block: Block = {
            id: `terrain_${x}_${y}_${terrain.elevation}`,
            type: terrain.type as IsometricTileData['type'],
            palette: terrain.palette as IsometricTileData['palette'],
            position: { x, y, z: terrain.elevation },
            rotation: 0,
            properties: {
              walkable: terrain.type === 'flat',
              climbable: terrain.type === 'ramp' || terrain.type === 'staircase',
              interactable: false,
              destructible: true,
            },
            sprite: {
              sourceX: selectedTile.sourceX,
              sourceY: selectedTile.sourceY,
              width: selectedTile.width,
              height: selectedTile.height,
              sheetPath: TILE_SHEET_CONFIG.imagePath,
            },
          };
          
          blocks.push(block);
        }
      }
    }

    // Add water bodies
    if (config.features.waterBodies) {
      for (let x = -config.width / 2; x < config.width / 2; x++) {
        for (let y = -config.height / 2; y < config.height / 2; y++) {
          const terrain = this.getTerrainType(x, y);
          
          if (terrain.type === 'water') {
            const waterTiles = ISOMETRIC_TILES.filter(tile => tile.type === 'water');
            if (waterTiles.length > 0) {
              const selectedTile = waterTiles[Math.floor(Math.random() * waterTiles.length)];
              
              const block: Block = {
                id: `water_${x}_${y}_0`,
                type: 'water',
                palette: 'blue',
                position: { x, y, z: 0 },
                rotation: 0,
                properties: {
                  walkable: false,
                  climbable: false,
                  interactable: false,
                  destructible: false,
                },
                sprite: {
                  sourceX: selectedTile.sourceX,
                  sourceY: selectedTile.sourceY,
                  width: selectedTile.width,
                  height: selectedTile.height,
                  sheetPath: TILE_SHEET_CONFIG.imagePath,
                },
              };
              
              blocks.push(block);
            }
          }
        }
      }
    }

    // Add structures
    if (config.features.structures) {
      for (let x = -config.width / 2; x < config.width / 2; x++) {
        for (let y = -config.height / 2; y < config.height / 2; y++) {
          if (this.shouldPlaceStructure(x, y)) {
            const structureTiles = ISOMETRIC_TILES.filter(tile => 
              tile.type === 'cube' && tile.palette === 'gray'
            );
            
            if (structureTiles.length > 0) {
              const selectedTile = structureTiles[Math.floor(Math.random() * structureTiles.length)];
              
              const block: Block = {
                id: `structure_${x}_${y}_1`,
                type: 'cube',
                palette: 'gray',
                position: { x, y, z: 1 },
                rotation: 0,
                properties: {
                  walkable: false,
                  climbable: false,
                  interactable: true,
                  destructible: true,
                },
                sprite: {
                  sourceX: selectedTile.sourceX,
                  sourceY: selectedTile.sourceY,
                  width: selectedTile.width,
                  height: selectedTile.height,
                  sheetPath: TILE_SHEET_CONFIG.imagePath,
                },
              };
              
              blocks.push(block);
            }
          }
        }
      }
    }

    // Add trees
    if (config.features.trees) {
      for (let x = -config.width / 2; x < config.width / 2; x++) {
        for (let y = -config.height / 2; y < config.height / 2; y++) {
          if (this.shouldPlaceTree(x, y)) {
            const treeTiles = ISOMETRIC_TILES.filter(tile => 
              tile.type === 'pillar' && tile.palette === 'green'
            );
            
            if (treeTiles.length > 0) {
              const selectedTile = treeTiles[Math.floor(Math.random() * treeTiles.length)];
              
              const block: Block = {
                id: `tree_${x}_${y}_1`,
                type: 'pillar',
                palette: 'green',
                position: { x, y, z: 1 },
                rotation: 0,
                properties: {
                  walkable: false,
                  climbable: false,
                  interactable: false,
                  destructible: true,
                },
                sprite: {
                  sourceX: selectedTile.sourceX,
                  sourceY: selectedTile.sourceY,
                  width: selectedTile.width,
                  height: selectedTile.height,
                  sheetPath: TILE_SHEET_CONFIG.imagePath,
                },
              };
              
              blocks.push(block);
            }
          }
        }
      }
    }

    return blocks;
  }
}

// ============================================================================
// MAIN SANCTUARY COMPONENT
// ============================================================================

const Sanctuary: React.FC<SanctuaryProps> = React.memo(({ className = '' }) => {
  // Debug logging removed for performance

  // ============================================================================
  // PERFORMANCE SYSTEMS
  // ============================================================================
  
  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);
  const spatialIndex = useMemo(() => new SpatialIndex(), []);
  const cullingSystem = useMemo(() => new CullingSystem(spatialIndex), [spatialIndex]);
  const batchRenderer = useMemo(() => new BatchRenderer(), []);
  
  // Memory pools for frequently created objects
  const blockPool = useMemo(() => new ObjectPool<Block>(
    () => ({
      id: '',
      type: 'cube',
      palette: 'green',
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      properties: { walkable: true, climbable: false, interactable: false, destructible: false },
      sprite: { sourceX: 0, sourceY: 0, width: 32, height: 32, sheetPath: '' }
    }),
    (block) => {
      block.id = '';
      block.position = { x: 0, y: 0, z: 0 };
      block.rotation = 0;
    }
  ), []);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  
  // Camera drag state
  const isDraggingRef = useRef(false);
  const isPaintingRef = useRef(false);
  const isErasingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [camera, setCamera] = useState<Camera>({
    position: { x: 400, y: 300, z: 0 }, // Center the camera on the canvas
    zoom: 1.5, // Slightly zoomed out to see more of the larger map
    rotation: 0
  });
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number; z: number } | null>(null);
  const [selectedTile, setSelectedTile] = useState<IsometricTileData | null>(ISOMETRIC_TILES[0]); // Default to first tile
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isBlockMenuOpen, setIsBlockMenuOpen] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  // Click indicator removed
  // Debug grid position removed
  const [showInstructions, setShowInstructions] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  
  // Tile sheet loading state
  const [tileSheet, setTileSheet] = useState<HTMLImageElement | null>(null);
  const [tileSheetLoaded, setTileSheetLoaded] = useState(false);
  
  // Level management state
  const [currentLevel, setCurrentLevel] = useState<Level>(LevelManager.createNewLevel());
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [levelName, setLevelName] = useState('New Level');
  
  // Fill mode state
  const [fillMode, setFillMode] = useState(false);

  // ============================================================================
  // PROCEDURAL MAP GENERATION
  // ============================================================================

  const generateProceduralMap = useCallback((size: 'small' | 'medium' | 'large' = 'medium') => {
    console.log(`🏗️ Generating ${size} procedural map...`);
    
    const mapGenerator = new ProceduralMapGenerator();
    
    // Map size configurations
    const sizeConfigs = {
      small: { width: 16, height: 16, zoom: 2 },
      medium: { width: 32, height: 32, zoom: 1.5 },
      large: { width: 48, height: 48, zoom: 1 }
    };
    
    const config: MapGeneratorConfig = {
      width: sizeConfigs[size].width,
      height: sizeConfigs[size].height,
      seed: Math.floor(Math.random() * 1000000),
      terrainTypes: {
        grass: 0.4,
        stone: 0.3,
        water: 0.2,
        sand: 0.1
      },
      features: {
        structures: true,
        trees: true,
        waterBodies: true,
        elevation: true
      }
    };
    
    const generatedBlocks = mapGenerator.generateMap(config);
    console.log(`🏗️ Generated ${generatedBlocks.length} blocks for ${size} procedural map`);
    
    // Clear existing blocks and spatial index
    setBlocks([]);
    spatialIndex.clear();
    
    // Add generated blocks
    setBlocks(generatedBlocks);
    generatedBlocks.forEach(block => {
      spatialIndex.addBlock(block);
    });
    
    // Update camera zoom for the new map size
    setCamera(prev => ({
      ...prev,
      zoom: sizeConfigs[size].zoom
    }));
    
    // Update level
    setCurrentLevel(prevLevel => ({
      ...prevLevel,
      blocks: generatedBlocks,
      modifiedAt: new Date()
    }));
    
    console.log(`✅ ${size} procedural map generation complete!`);
  }, [spatialIndex]);

  const fillWithFlatBlocks = useCallback(() => {
    console.log('🏗️ Filling grid with flat blocks...');
    
    const newBlocks: Block[] = [];
    const gridSize = 8; // 8x8 grid
    
    // Find flat tiles from different palettes
    const flatTiles = ISOMETRIC_TILES.filter(tile => tile.type === 'flat');
    if (flatTiles.length === 0) {
      console.error('❌ No flat tiles found in ISOMETRIC_TILES');
      return;
    }
    
    // Create a grid pattern with alternating palettes
    for (let x = -gridSize/2; x < gridSize/2; x++) {
      for (let y = -gridSize/2; y < gridSize/2; y++) {
        // Alternate between different flat tile palettes
        const tileIndex = (Math.abs(x) + Math.abs(y)) % flatTiles.length;
        const selectedTile = flatTiles[tileIndex];
        
        const block: Block = {
          id: `fill_${x}_${y}_0`,
          type: 'flat',
          palette: selectedTile.palette,
          position: { x, y, z: 0 },
          rotation: 0,
          properties: {
            walkable: true,
            climbable: false,
            interactable: false,
            destructible: false
          },
          sprite: {
            sourceX: selectedTile.sourceX,
            sourceY: selectedTile.sourceY,
            width: selectedTile.width,
            height: selectedTile.height,
            sheetPath: TILE_SHEET_CONFIG.imagePath
          }
        };
        
        newBlocks.push(block);
      }
    }
    
    console.log(`🏗️ Created ${newBlocks.length} flat blocks`);
    console.log('🏗️ Sample block:', newBlocks[0]);
    
    // Add new blocks to state and spatial index
    setBlocks(prevBlocks => {
      const updatedBlocks = [...prevBlocks, ...newBlocks];
      console.log('🏗️ Total blocks after fill:', updatedBlocks.length);
      
      // Update spatial index
      newBlocks.forEach(block => {
        spatialIndex.addBlock(block);
      });
      
      return updatedBlocks;
    });
    
    // Update level
    setCurrentLevel(prevLevel => ({
      ...prevLevel,
      blocks: [...prevLevel.blocks, ...newBlocks],
      modifiedAt: new Date()
    }));
    
    console.log('✅ Fill complete!');
  }, [spatialIndex]);

  // ============================================================================
  // BLOCK MANAGEMENT
  // ============================================================================
  
  const createBlock = useCallback((tile: IsometricTileData, position: { x: number; y: number; z: number }): Block => {
    
    const block: Block = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: tile.type,
      palette: tile.palette,
      position,
      rotation: 0,
      properties: {
        walkable: tile.type === 'flat' || tile.type === 'cube',
        climbable: tile.type === 'ramp' || tile.type === 'staircase',
        interactable: false,
        destructible: true,
      },
      sprite: {
        sourceX: tile.sourceX,
        sourceY: tile.sourceY,
        width: tile.width,
        height: tile.height,
        sheetPath: TILE_SHEET_CONFIG.imagePath,
      },
    };
    
    console.log('🏛️ Block created:', block);
    return block;
  }, []);

  const addBlock = useCallback((block: Block) => {
    setBlocks(prev => {
      const newBlocks = [...prev, block];
      return newBlocks;
    });
    spatialIndex.addBlock(block);
  }, [spatialIndex]);

  const removeBlock = useCallback((blockId: string) => {
    setBlocks(prev => {
      const block = prev.find(b => b.id === blockId);
      if (block) {
        spatialIndex.removeBlock(block);
        blockPool.release(block);
      }
      return prev.filter(b => b.id !== blockId);
    });
  }, [spatialIndex, blockPool]);

  const rotateBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return { ...block, rotation: ((block.rotation + 90) % 360) as 0 | 90 | 180 | 270 };
      }
      return block;
    }));
  }, []);

  // ============================================================================
  // COORDINATE CONVERSION UTILITIES
  // ============================================================================

  const screenToGrid = useCallback((screenX: number, screenY: number): { x: number; y: number; z: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, z: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    // Convert to world coordinates (accounting for camera)
    const worldX = (canvasX - camera.position.x) / camera.zoom;
    const worldY = (canvasY - camera.position.y) / camera.zoom;
    
    // Convert to isometric grid coordinates
    const tileWidth = 32;
    const tileHeight = 16;
    
    // Isometric to grid conversion (corrected for half-height grid)
    // For 2:1 isometric projection, we need to account for the projection ratio
    const isoX = worldX / (tileWidth / 2);
    const isoY = worldY / (tileHeight / 2);
    
    const gridX = Math.round((isoX + isoY) / 2);
    const gridY = Math.round((isoY - isoX) / 2);
    const gridZ = 0;
    
    // Debug logging removed for performance
    
    return { x: gridX, y: gridY, z: gridZ };
  }, [camera]);

  const gridToScreen = useCallback((gridX: number, gridY: number, gridZ: number): { x: number; y: number } => {
    const tileWidth = 32;
    const tileHeight = 16;
    
    // Isometric projection (corrected to match screenToGrid and half-height grid)
    const isoX = (gridX - gridY) * (tileWidth / 2);
    const isoY = (gridX + gridY) * (tileHeight / 2) - gridZ * tileHeight;
    
    // Convert to screen coordinates (accounting for camera)
    const screenX = isoX * camera.zoom + camera.position.x;
    const screenY = isoY * camera.zoom + camera.position.y;
    
    return { x: screenX, y: screenY };
  }, [camera]);

  // ============================================================================
  // UNIFIED BUTTON STYLES
  // ============================================================================
  
  const unifiedButtonStyle = {
    background: 'var(--color-accent-gold)',
    border: '1px solid var(--color-border-primary)',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    color: 'var(--color-text-primary)',
    pointerEvents: 'auto' as const,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    minWidth: '40px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // ============================================================================
  // RENDERING SYSTEM
  // ============================================================================

  const renderBlock = useCallback((ctx: CanvasRenderingContext2D, block: Block, tileSheet: HTMLImageElement) => {
    const { x, y, z } = block.position;
    const tileWidth = 32;
    const tileHeight = 16;
    
    // Isometric projection (corrected to match grid coordinate system)
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * tileHeight;
    
    // Debug logging removed for performance
    
    ctx.save();
    ctx.translate(isoX, isoY);
    ctx.rotate((block.rotation * Math.PI) / 180);
    
    // Pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    
    ctx.drawImage(
      tileSheet,
      block.sprite.sourceX, block.sprite.sourceY,
      block.sprite.width, block.sprite.height,
      -block.sprite.width / 2, -block.sprite.height + tileHeight/2,
      block.sprite.width, block.sprite.height
    );
    
    ctx.restore();
  }, []);

  const renderHoverPreview = useCallback((ctx: CanvasRenderingContext2D, tileSheet: HTMLImageElement) => {
    if (!hoverCell || !selectedTile) return;
    
    const { x, y, z } = hoverCell;
    const tileWidth = 32;
    const tileHeight = 16;
    
    // Isometric projection (corrected to match grid coordinate system)
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * tileHeight;
    
    ctx.save();
    ctx.translate(isoX, isoY);
    
    // Semi-transparent preview
    ctx.globalAlpha = 0.6;
    
    // Draw tile preview (aligned to grid base)
    ctx.drawImage(
      tileSheet,
      selectedTile.sourceX, selectedTile.sourceY,
      selectedTile.width, selectedTile.height,
      -selectedTile.width / 2, -selectedTile.height + tileHeight/2,
      selectedTile.width, selectedTile.height
    );
    
    ctx.restore();
  }, [hoverCell, selectedTile, spatialIndex]);

  const renderSelectionHighlight = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!selectedBlock) return;
    
    const { x, y, z } = selectedBlock.position;
    const tileWidth = 32;
    const tileHeight = 16;
    
    // Calculate isometric position (matching the grid coordinate system)
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * tileHeight;
    
    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(isoX - tileWidth/2, isoY - tileHeight + tileHeight/2, tileWidth, tileHeight);
    ctx.restore();
  }, [selectedBlock]);

  const renderGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    const tileWidth = 32;
    const tileHeight = 16;
    const gridSize = 20; // Number of grid cells to render
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw highlighted cell if hovering
    if (hoverCell) {
      const { x, y } = hoverCell;
      const isoX = (x - y) * (tileWidth / 2);
      const isoY = (x + y) * (tileHeight / 2);
      
      const centerX = isoX;
      const centerY = isoY;
      
      // Highlight diamond
      const top = { x: centerX, y: centerY - tileHeight/2 };
      const right = { x: centerX + tileWidth/2, y: centerY };
      const bottom = { x: centerX, y: centerY + tileHeight/2 };
      const left = { x: centerX - tileWidth/2, y: centerY };
      
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(right.x, right.y);
      ctx.lineTo(bottom.x, bottom.y);
      ctx.lineTo(left.x, left.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw diamond-shaped grid cells for isometric projection
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let y = -gridSize; y <= gridSize; y++) {
        // Calculate isometric position (adjusted for seamless tiling)
        const isoX = (x - y) * (tileWidth / 2);
        const isoY = (x + y) * (tileHeight / 2);
        
        // Draw diamond shape for each grid cell
        const centerX = isoX;
        const centerY = isoY;
        
        // Isometric diamond grid cells (half height for traditional isometric pixel art)
        // Each diamond represents one grid cell in isometric space
        const top = { x: centerX, y: centerY - tileHeight/2 };
        const right = { x: centerX + tileWidth/2, y: centerY };
        const bottom = { x: centerX, y: centerY + tileHeight/2 };
        const left = { x: centerX - tileWidth/2, y: centerY };
        
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(right.x, right.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.lineTo(left.x, left.y);
        ctx.closePath();
        ctx.stroke();
        
        // Add a subtle center point for each diamond
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }, [showGrid, hoverCell]);

  const renderScene = useCallback((ctx: CanvasRenderingContext2D, tileSheet: HTMLImageElement) => {
    const startTime = performance.now();
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Apply camera transform
    ctx.save();
    ctx.translate(camera.position.x, camera.position.y);
    ctx.scale(camera.zoom, camera.zoom);
    
    // Get visible blocks using culling system
    const visibleBlocks = cullingSystem.getVisibleBlocks(camera);
    
    // Sort blocks by depth (z DESC, then y ASC, then x ASC)
    const sortedBlocks = visibleBlocks.sort((a, b) => {
      if (a.position.z !== b.position.z) return b.position.z - a.position.z;
      if (a.position.y !== b.position.y) return a.position.y - b.position.y;
      return a.position.x - b.position.x;
    });
    
    // Render blocks
    let drawCalls = 0;
    sortedBlocks.forEach(block => {
      renderBlock(ctx, block, tileSheet);
      drawCalls++;
    });
    
    // Render hover preview
    renderHoverPreview(ctx, tileSheet);
    
    // Render selection highlight
    renderSelectionHighlight(ctx);

    // Render grid
    renderGrid(ctx);
    
    // Click indicator removed
    
    // Debug grid position indicator removed
    
    ctx.restore();
    
    // Update performance metrics
    const renderTime = performance.now() - startTime;
    const metrics = performanceMonitor.collectMetrics();
    metrics.renderTime = renderTime;
    metrics.blockCount = blocks.length;
    metrics.visibleBlocks = visibleBlocks.length;
    metrics.drawCalls = drawCalls;
    
    // Debug culling info
    if (blocks.length > 0 && visibleBlocks.length === 0) {
      console.log('🏛️ Culling Debug: All blocks are being culled!');
      console.log('🏛️ Total blocks:', blocks.length);
      console.log('🏛️ Camera position:', camera.position);
      console.log('🏛️ Camera zoom:', camera.zoom);
    }
    
    setPerformanceMetrics(metrics);
  }, [camera, blocks, cullingSystem, renderBlock, renderHoverPreview, renderSelectionHighlight, performanceMonitor, renderGrid, showGrid]);

  const renderFallbackScene = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Apply camera transform
    ctx.save();
    ctx.translate(camera.position.x, camera.position.y);
    ctx.scale(camera.zoom, camera.zoom);
    
    // Render grid first (so blocks appear on top)
    if (showGrid) {
      const tileWidth = 32;
      const tileHeight = 16;
      const gridSize = 20; // Number of grid cells to render
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      
      // Draw diamond-shaped grid cells for isometric projection
      for (let x = -gridSize; x <= gridSize; x++) {
        for (let y = -gridSize; y <= gridSize; y++) {
          // Calculate isometric position (adjusted for seamless tiling)
          const isoX = (x - y) * (tileWidth / 2);
          const isoY = (x + y) * (tileHeight / 2);
          
          // Isometric diamond grid cells
          const centerX = isoX;
          const centerY = isoY;
          
          // Isometric diamond grid cells (half height)
          // Each diamond represents one grid cell in isometric space
          const top = { x: centerX, y: centerY - tileHeight/2 };
          const right = { x: centerX + tileWidth/2, y: centerY };
          const bottom = { x: centerX, y: centerY + tileHeight/2 };
          const left = { x: centerX - tileWidth/2, y: centerY };
          
          ctx.beginPath();
          ctx.moveTo(top.x, top.y);
          ctx.lineTo(right.x, right.y);
          ctx.lineTo(bottom.x, bottom.y);
          ctx.lineTo(left.x, left.y);
          ctx.closePath();
          ctx.stroke();
          
          // Add a subtle center point for each diamond
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.arc(centerX, centerY, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // Render blocks as colored rectangles using corrected coordinate system
    blocks.forEach((block, index) => {
      console.log('🏛️ Rendering fallback block:', block.id, 'at position:', block.position);
      
      const { x, y, z } = block.position;
      const tileWidth = 32;
      const tileHeight = 16;
      
      // Calculate isometric position (matching the coordinate system)
      const isoX = (x - y) * (tileWidth / 2);
      const isoY = (x + y) * tileHeight - z * tileHeight;
      
      // Color based on palette
      const colors = {
        green: '#00FF00',
        blue: '#0080FF',
        gray: '#808080',
        orange: '#FF8000'
      };
      
      ctx.fillStyle = colors[block.palette] || '#FF0000';
      ctx.fillRect(isoX - tileWidth/2, isoY - tileHeight, tileWidth, tileHeight);
      
      // Draw border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(isoX - tileWidth/2, isoY - tileHeight, tileWidth, tileHeight);
    });
    
    // Click indicator removed
    
    // Debug grid position indicator removed
    
    ctx.restore();
  }, [blocks, camera, showGrid]);

  // ============================================================================
  // GAME LOOP
  // ============================================================================

  const gameLoop = useCallback((currentTime: number) => {
    if (currentTime - lastRenderTimeRef.current >= 16.67) { // ~60fps
      const canvas = canvasRef.current;
      if (canvas && isLoaded) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Update culling system frustum
          cullingSystem.updateFrustum(camera, canvas.width, canvas.height);
          
          // Use proper tile sheet rendering if loaded, otherwise fallback
          if (tileSheetLoaded && tileSheet) {
            renderScene(ctx, tileSheet);
          } else {
            renderFallbackScene(ctx);
          }
        }
      }
      lastRenderTimeRef.current = currentTime;
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isLoaded, camera, cullingSystem, renderScene, renderFallbackScene, tileSheetLoaded, tileSheet]);

  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // ============================================================================
  // INPUT HANDLING
  // ============================================================================

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const gridPos = screenToGrid(event.clientX, event.clientY);
    
    if (event.button === 0) { // Left click
      if (selectedTile) {
        // Place block
        const existingBlock = spatialIndex.getBlockAt(gridPos.x, gridPos.y, gridPos.z);
        if (!existingBlock) {
          const newBlock = createBlock(selectedTile, gridPos);
          addBlock(newBlock);
        }
      } else {
        // Select block
        const block = spatialIndex.getBlockAt(gridPos.x, gridPos.y, gridPos.z);
        setSelectedBlock(block);
      }
    } else if (event.button === 2) { // Right click
      // Remove block
      const block = spatialIndex.getBlockAt(gridPos.x, gridPos.y, gridPos.z);
      if (block) {
        removeBlock(block.id);
        if (selectedBlock?.id === block.id) {
          setSelectedBlock(null);
        }
      }
    }
  }, [selectedTile, spatialIndex, createBlock, addBlock, removeBlock, selectedBlock, screenToGrid]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const gridPos = screenToGrid(event.clientX, event.clientY);
    setHoverCell(gridPos);
    
    // Handle continuous painting
    if (isPaintingRef.current && selectedTile) {
      const existingBlock = spatialIndex.getBlockAt(gridPos.x, gridPos.y, gridPos.z);
      if (!existingBlock) {
        const newBlock = createBlock(selectedTile, gridPos);
        addBlock(newBlock);
      }
    }
    
    // Handle continuous erasing
    if (isErasingRef.current) {
      const block = spatialIndex.getBlockAt(gridPos.x, gridPos.y, gridPos.z);
      if (block) {
        removeBlock(block.id);
        if (selectedBlock?.id === block.id) {
          setSelectedBlock(null);
        }
      }
    }
  }, [screenToGrid, selectedTile, spatialIndex, createBlock, addBlock, removeBlock, selectedBlock]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 0) { // Left mouse button - start painting
      isPaintingRef.current = true;
      const gridPos = screenToGrid(event.clientX, event.clientY);
      if (selectedTile) {
        const existingBlock = spatialIndex.getBlockAt(gridPos.x, gridPos.y, gridPos.z);
        if (!existingBlock) {
          const newBlock = createBlock(selectedTile, gridPos);
          addBlock(newBlock);
        }
      }
    } else if (event.button === 1) { // Middle mouse button - camera pan
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    } else if (event.button === 2) { // Right mouse button - start erasing
      isErasingRef.current = true;
      const gridPos = screenToGrid(event.clientX, event.clientY);
      const block = spatialIndex.getBlockAt(gridPos.x, gridPos.y, gridPos.z);
      if (block) {
        removeBlock(block.id);
        if (selectedBlock?.id === block.id) {
          setSelectedBlock(null);
        }
      }
    }
  }, [selectedTile, spatialIndex, createBlock, addBlock, removeBlock, selectedBlock, screenToGrid]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 0) { // Left mouse button - stop painting
      isPaintingRef.current = false;
    } else if (event.button === 1) { // Middle mouse button - stop camera pan
      isDraggingRef.current = false;
    } else if (event.button === 2) { // Right mouse button - stop erasing
      isErasingRef.current = false;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    setHoverCell(null);
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    const currentZoom = camera.zoom;
    const zoomLevels = [1, 2, 4]; // Only allow 1x, 2x, 4x zoom levels
    
    // Determine zoom direction
    const zoomIn = event.deltaY < 0;
    
    // Find current zoom level index
    const currentIndex = zoomLevels.indexOf(currentZoom);
    
    // Calculate new zoom level
    let newZoom: number;
    if (zoomIn) {
      // Zoom in - go to next higher level
      newZoom = zoomLevels[Math.min(currentIndex + 1, zoomLevels.length - 1)];
    } else {
      // Zoom out - go to next lower level
      newZoom = zoomLevels[Math.max(currentIndex - 1, 0)];
    }
    
    // Only update if zoom level actually changed
    if (newZoom !== currentZoom) {
      setCamera(prev => ({
        ...prev,
        zoom: newZoom
      }));
    }
  }, [camera.zoom]);

  // Handle camera dragging
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = event.clientX - lastMousePosRef.current.x;
        const deltaY = event.clientY - lastMousePosRef.current.y;
        
        setCamera(prev => ({
          ...prev,
          position: {
            ...prev.position,
            x: prev.position.x + deltaX,
            y: prev.position.y + deltaY
          }
        }));
        
        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedBlock) {
            removeBlock(selectedBlock.id);
            setSelectedBlock(null);
          }
          break;
        case 'r':
        case 'R':
          if (selectedBlock) {
            rotateBlock(selectedBlock.id);
          }
          break;
        case 'Escape':
          setSelectedTile(null);
          setSelectedBlock(null);
          break;
        case 's':
        case 'S':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setShowSaveDialog(true);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlock, removeBlock, rotateBlock]);

  // ============================================================================
  // LEVEL MANAGEMENT
  // ============================================================================

  const saveLevel = useCallback(() => {
    const levelToSave: Level = {
      ...currentLevel,
      blocks: [...blocks],
      camera: { ...camera },
      modifiedAt: new Date()
    };
    
    LevelManager.saveLevel(levelToSave);
    setCurrentLevel(levelToSave);
    setShowSaveDialog(false);
  }, [currentLevel, blocks, camera]);

  const loadLevel = useCallback((level: Level) => {
    setBlocks([...level.blocks]);
    setCamera({ ...level.camera });
    setCurrentLevel(level);
    setSelectedBlock(null);
    setSelectedTile(null);
    
    // Clear spatial index and rebuild
    spatialIndex.clear();
    level.blocks.forEach(block => spatialIndex.addBlock(block));
  }, [spatialIndex]);

  const createNewLevel = useCallback(() => {
    const newLevel = LevelManager.createNewLevel();
    setBlocks([]);
    setCamera({ position: { x: 400, y: 300, z: 0 }, zoom: 1.5, rotation: 0 });
    setCurrentLevel(newLevel);
    setSelectedBlock(null);
    setSelectedTile(null);
    spatialIndex.clear();
  }, [spatialIndex]);

  const resetCamera = useCallback(() => {
    setCamera({ position: { x: 400, y: 300, z: 0 }, zoom: 1.5, rotation: 0 });
  }, []);

  const resetTerrain = useCallback(() => {
    console.log('🏛️ Resetting terrain...');
    setBlocks([]);
    setSelectedBlock(null);
    spatialIndex.clear();
    // The terrain generation useEffect will trigger automatically
  }, [spatialIndex]);

  // ============================================================================
  // DEBUG TESTING
  // ============================================================================
  
  // Expose debug functions to window for testing
  useEffect(() => {
    (window as any).testSanctuary = {
      screenToGrid: (x: number, y: number) => screenToGrid(x, y),
      gridToScreen: (x: number, y: number, z: number) => gridToScreen(x, y, z),
      addTestBlock: () => {
        const testBlock = createBlock(ISOMETRIC_TILES[0], { x: 0, y: 0, z: 0 });
        addBlock(testBlock);
        console.log('🏛️ Test block added:', testBlock);
      },
      getCamera: () => camera,
      getBlocks: () => blocks,
      setCamera: (pos: { x: number; y: number; z: number }) => setCamera(prev => ({ ...prev, position: pos })),
      getTileSheetStatus: () => ({ loaded: tileSheetLoaded, image: tileSheet }),
      forceFallback: () => {
        console.log('🏛️ Forcing fallback rendering');
        setTileSheetLoaded(false);
      },
      forceTileSheet: () => {
        console.log('🏛️ Forcing tile sheet rendering');
        setTileSheetLoaded(true);
      },
      generateProceduralMap: (size: 'small' | 'medium' | 'large' = 'medium') => {
        console.log('🏛️ Generating procedural map via debug function');
        generateProceduralMap(size);
      }
    };
    console.log('🏛️ Debug functions available on window.testSanctuary');
  }, [screenToGrid, gridToScreen, createBlock, addBlock, camera, blocks, tileSheetLoaded, tileSheet, generateProceduralMap]);

  // ============================================================================
  // TILE SHEET LOADING
  // ============================================================================

  useEffect(() => {
    console.log('🏛️ Loading tile sheet from:', TILE_SHEET_CONFIG.imagePath);
    const img = new Image();
    img.onload = () => {
      console.log('🏛️ Tile sheet loaded successfully:', img.width, 'x', img.height);
      setTileSheet(img);
      setTileSheetLoaded(true);
    };
    img.onerror = (error) => {
      console.error('🏛️ Failed to load tile sheet:', error);
      setTileSheetLoaded(false);
    };
    img.src = TILE_SHEET_CONFIG.imagePath;
  }, []);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Initialize canvas dimensions
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Test render to verify canvas is working
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(100, 100, 100, 100);
      }
    }

    // Initialize canvas and systems (test blocks removed - procedural map will be generated instead)
    console.log('🏛️ Canvas initialized, ready for procedural map generation');
    
    setIsLoaded(true);
  }, [createBlock, addBlock]);

  // Initialize with procedural map
  useEffect(() => {
    if (blocks.length === 0 && isLoaded) {
      console.log('🏛️ Generating initial procedural map...');
      generateProceduralMap('medium');
    }
  }, [blocks.length, isLoaded, generateProceduralMap]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click indicator effect removed

  // Debug grid position effect removed

  // Debug instructions state
  useEffect(() => {
    console.log('🏛️ Instructions panel should show:', showInstructions);
  }, [showInstructions]);

  // ============================================================================
  // BLOCK SELECTOR UI
  // ============================================================================

  const blockCategories = useMemo(() => [
    { type: 'cube', name: 'Cubes' },
    { type: 'flat', name: 'Flats' },
    { type: 'ramp', name: 'Ramps' },
    { type: 'corner', name: 'Corners' },
    { type: 'staircase', name: 'Stairs' },
    { type: 'pillar', name: 'Pillars' },
    { type: 'water', name: 'Water' },
  ], []);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const palettes = useMemo(() => [
    { name: 'green', color: '#4CAF50' },
    { name: 'gray', color: '#9E9E9E' },
    { name: 'orange', color: '#FF9800' },
  ], []);

  const getTilesByTypeAndPalette = useCallback((type: string, palette: string) => {
    return ISOMETRIC_TILES.filter(tile => tile.type === type && tile.palette === palette);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`${styles.sanctuary} ${className}`}>
      {/* Debug indicator */}
      {/* Tile Sheet Loading Indicator - Hidden */}

      {/* Header */}
      <div className={styles.sanctuaryHeader}>
        <span className={styles.sanctuaryIcon}>🏛️</span>
        <h3 className={styles.sanctuaryTitle}>Sanctuary - {currentLevel.name}</h3>
        
        {/* Selected Tile Indicator */}
        {selectedTile && (
          <div className={styles.selectedTileIndicator}>
            <span>Selected: {selectedTile.name}</span>
            <div 
              className={styles.selectedTilePreview}
              style={{
                backgroundImage: `url('${TILE_SHEET_CONFIG.imagePath}')`,
                backgroundPosition: `-${selectedTile.sourceX}px -${selectedTile.sourceY}px`,
                backgroundSize: `${TILE_SHEET_CONFIG.sheetWidth}px ${TILE_SHEET_CONFIG.sheetHeight}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                width: '24px',
                height: '24px',
                display: 'inline-block',
                marginLeft: '8px'
              }}
            />
          </div>
        )}
        
        {/* Zoom Level Indicator */}
        <div className={styles.zoomIndicator}>
          <span>{camera.zoom}x</span>
        </div>
        
        {/* Level Management */}
        <button 
          style={unifiedButtonStyle}
          onClick={() => setShowLevelMenu(!showLevelMenu)}
          title="Level Management"
        >
          SAVE
        </button>
        
        {/* Camera Reset */}
        <button 
          style={unifiedButtonStyle}
          onClick={resetCamera}
          title="Reset Camera"
        >
          🎯
        </button>
        
        {/* Reset Terrain */}
        <button 
          style={unifiedButtonStyle}
          onClick={resetTerrain}
          title="Reset Terrain"
        >
          🌱
        </button>
        
        {/* Instructions Toggle */}
        <button 
          style={unifiedButtonStyle}
          onClick={() => {
            console.log('🏛️ Instructions toggle clicked, current state:', showInstructions);
            setShowInstructions(!showInstructions);
            console.log('🏛️ Instructions state will be:', !showInstructions);
          }}
          title="Show/Hide Instructions"
        >
          [?]
        </button>
        
        {/* Grid Toggle */}
        <button 
          style={unifiedButtonStyle}
          onClick={() => setShowGrid(!showGrid)}
          title="Show/Hide Grid"
        >
          {showGrid ? 'GRID ON' : 'GRID OFF'}
        </button>
        
        <button 
          style={unifiedButtonStyle}
          onClick={() => setIsBlockMenuOpen(!isBlockMenuOpen)}
          title="Block Selector"
        >
          {isBlockMenuOpen ? '✕' : '🧱'}
        </button>
        
        <button 
          style={unifiedButtonStyle}
          onClick={() => setShowPerformance(!showPerformance)}
          title="Performance Monitor"
        >
          📊
        </button>
        
        <button 
          style={{
            ...unifiedButtonStyle,
            background: 'var(--color-accent-beaver)'
          }}
          onClick={fillWithFlatBlocks}
          title="Fill Grid with Flat Blocks"
        >
          🏗️ FILL
        </button>
        
        <button 
          style={{
            ...unifiedButtonStyle,
            background: 'var(--color-accent-gold)'
          }}
          onClick={() => generateProceduralMap('medium')}
          title="Generate Medium Procedural Map (32x32)"
        >
          🌍 MEDIUM
        </button>
        
        <button 
          style={{
            ...unifiedButtonStyle,
            background: 'var(--color-accent-beaver)'
          }}
          onClick={() => generateProceduralMap('large')}
          title="Generate Large Procedural Map (48x48)"
        >
          🌍 LARGE
        </button>
      </div>

      {/* Performance Display */}
      {showPerformance && performanceMetrics && (
        <div className={styles.performanceDisplay}>
          <div>FPS: {performanceMetrics.fps.toFixed(1)}</div>
          <div>Render: {performanceMetrics.renderTime.toFixed(1)}ms</div>
          <div>Blocks: {performanceMetrics.blockCount}</div>
          <div>Visible: {performanceMetrics.visibleBlocks}</div>
          <div>Draw Calls: {performanceMetrics.drawCalls}</div>
          <div>Grade: {performanceMonitor.getPerformanceGrade()}</div>
        </div>
      )}

      {/* Level Management Menu */}
      {showLevelMenu && (
        <div className={styles.levelMenu}>
          <div className={styles.levelMenuHeader}>
            <h4>Level Management</h4>
            <button onClick={() => setShowLevelMenu(false)}>✕</button>
          </div>
          
          <div className={styles.levelActions}>
            <button onClick={createNewLevel}>New Level</button>
            <button onClick={() => setShowSaveDialog(true)}>Save Level</button>
          </div>
          
          <div className={styles.levelList}>
            <h5>Saved Levels</h5>
            {LevelManager.getAllLevels().map(level => (
              <div key={level.id} className={styles.levelItem}>
                <span>{level.name}</span>
                <div className={styles.levelItemActions}>
                  <button onClick={() => loadLevel(level)}>Load</button>
                  <button onClick={() => LevelManager.deleteLevel(level.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className={styles.saveDialog}>
          <div className={styles.saveDialogContent}>
            <h4>Save Level</h4>
            <input
              type="text"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              placeholder="Level name"
            />
            <div className={styles.saveDialogActions}>
              <button onClick={saveLevel}>Save</button>
              <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

            {/* Block Selector */}
      {isBlockMenuOpen && (
        <div className={styles.blockSelector}>
          <div className={styles.blockSelectorHeader}>
            <button 
              className={styles.closeButton}
              onClick={() => setIsBlockMenuOpen(false)}
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
                    onClick={() => setExpandedCategory(isExpanded ? null : category.type)}
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
                              onClick={() => setSelectedTile(tile)}
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
                                    onClick={() => setSelectedTile(tile)}
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

      {/* Canvas Container */}
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.isometricCanvas}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            cursor: selectedTile ? 'crosshair' : 'default',
            touchAction: 'none'
          }}
        />
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className={styles.instructions}>
          <h4>Instructions</h4>
          <div className={styles.instructionItem}>
            <strong>Left Click:</strong> {selectedTile ? 'Place Block' : 'Select Block'}
          </div>
          <div className={styles.instructionItem}>
            <strong>Right Click:</strong> Remove Block
          </div>
          <div className={styles.instructionItem}>
            <strong>Middle Drag:</strong> Pan Camera
          </div>
          <div className={styles.instructionItem}>
            <strong>Mouse Wheel:</strong> Zoom
          </div>
          <div className={styles.instructionItem}>
            <strong>R Key:</strong> Rotate Selected Block
          </div>
          <div className={styles.instructionItem}>
            <strong>Delete:</strong> Remove Selected Block
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(!isLoaded || !tileSheetLoaded) && (
        <div className={styles.loadingOverlay}>
          {!isLoaded ? 'Loading Optimized Sanctuary...' : 'Loading Tile Sheet...'}
        </div>
      )}
    </div>
  );
});

Sanctuary.displayName = 'Sanctuary';

export default Sanctuary; 