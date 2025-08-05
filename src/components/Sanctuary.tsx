import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styles from './Sanctuary.module.css';
import { ISOMETRIC_TILES, TILE_SHEET_CONFIG, IsometricTileData } from '../data/isometric-tiles';
import AtlasEditor from './AtlasEditor';

// ============================================================================
// PERFORMANCE-FIRST ARCHITECTURE
// ============================================================================

interface SanctuaryProps {
  className?: string;
  onExit?: () => void;
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

// ============================================================================
// HEIGHT MAP SYSTEM
// ============================================================================

interface HeightMap {
  width: number;
  height: number;
  data: number[][]; // 2D array of height values (0-255)
  minHeight: number;
  maxHeight: number;
  seed: number;
}

interface HeightMapConfig {
  width: number;
  height: number;
  seed?: number;
  octaves: number; // Number of noise layers
  frequency: number; // Base frequency for noise
  amplitude: number; // Base amplitude for noise
  persistence: number; // How much each octave contributes
  lacunarity: number; // How frequency changes per octave
  minHeight: number;
  maxHeight: number;
  smoothing: number; // Gaussian blur strength
}

class HeightMapGenerator {
  private seed: number;
  private noise: (x: number, y: number) => number;

  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
    this.noise = this.createNoiseFunction();
  }

  private createNoiseFunction(): (x: number, y: number) => number {
    // Improved Perlin-like noise function
    const hash = (x: number, y: number): number => {
      const n = x + y * 57 + this.seed;
      const hash1 = Math.sin(n) * 43758.5453;
      const hash2 = Math.sin(n * 1.5) * 23456.789;
      const hash3 = Math.sin(n * 0.7) * 34567.123;
      return (hash1 + hash2 + hash3) / 3 - Math.floor((hash1 + hash2 + hash3) / 3);
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

      const smoothstep = (t: number) => t * t * (3 - 2 * t);
      const sx = smoothstep(xf);
      const sy = smoothstep(yf);

      const top = h00 + (h10 - h00) * sx;
      const bottom = h01 + (h11 - h01) * sx;
      return top + (bottom - top) * sy;
    };
  }

  generateHeightMap(config: HeightMapConfig): HeightMap {
    console.log(`🗺️ Generating height map: ${config.width}x${config.height}, seed: ${this.seed}`);
    
    const heightMap: HeightMap = {
      width: config.width,
      height: config.height,
      data: [],
      minHeight: config.minHeight,
      maxHeight: config.maxHeight,
      seed: this.seed
    };

    // Initialize height map data
    for (let y = 0; y < config.height; y++) {
      heightMap.data[y] = [];
      for (let x = 0; x < config.width; x++) {
        heightMap.data[y][x] = 0;
      }
    }

    // Generate fractal noise
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        let amplitude = config.amplitude;
        let frequency = config.frequency;
        let noiseValue = 0;
        let maxValue = 0;

        // Multiple octaves for fractal noise
        for (let octave = 0; octave < config.octaves; octave++) {
          const nx = x * frequency;
          const ny = y * frequency;
          noiseValue += this.noise(nx, ny) * amplitude;
          maxValue += amplitude;
          amplitude *= config.persistence;
          frequency *= config.lacunarity;
        }

        // Normalize to 0-1 range
        noiseValue = noiseValue / maxValue;
        
        // Apply height range
        const height = config.minHeight + (noiseValue * (config.maxHeight - config.minHeight));
        heightMap.data[y][x] = Math.round(height);
      }
    }

    // Apply smoothing if requested
    if (config.smoothing > 0) {
      heightMap.data = this.applyGaussianBlur(heightMap.data, config.smoothing);
    }

    // Update min/max values
    let min = Infinity;
    let max = -Infinity;
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        min = Math.min(min, heightMap.data[y][x]);
        max = Math.max(max, heightMap.data[y][x]);
      }
    }
    heightMap.minHeight = min;
    heightMap.maxHeight = max;

    console.log(`🗺️ Height map generated: min=${min}, max=${max}`);
    
    // Debug: Show some sample height values
    console.log(`🗺️ Sample heights: [0,0]=${heightMap.data[0][0]}, [5,5]=${heightMap.data[5]?.[5] || 'N/A'}, [10,10]=${heightMap.data[10]?.[10] || 'N/A'}`);
    
    return heightMap;
  }

  private applyGaussianBlur(data: number[][], strength: number): number[][] {
    const kernel = this.createGaussianKernel(strength);
    const result: number[][] = [];
    
    for (let y = 0; y < data.length; y++) {
      result[y] = [];
      for (let x = 0; x < data[y].length; x++) {
        let sum = 0;
        let weightSum = 0;
        
        for (let ky = 0; ky < kernel.length; ky++) {
          for (let kx = 0; kx < kernel[ky].length; kx++) {
            const sampleY = y + ky - Math.floor(kernel.length / 2);
            const sampleX = x + kx - Math.floor(kernel[ky].length / 2);
            
            if (sampleY >= 0 && sampleY < data.length && 
                sampleX >= 0 && sampleX < data[sampleY].length) {
              sum += data[sampleY][sampleX] * kernel[ky][kx];
              weightSum += kernel[ky][kx];
            }
          }
        }
        
        result[y][x] = Math.round(sum / weightSum);
      }
    }
    
    return result;
  }

  private createGaussianKernel(strength: number): number[][] {
    const size = Math.max(3, Math.floor(strength * 2) + 1);
    const kernel: number[][] = [];
    const sigma = strength;
    
    for (let y = 0; y < size; y++) {
      kernel[y] = [];
      for (let x = 0; x < size; x++) {
        const center = Math.floor(size / 2);
        const dx = x - center;
        const dy = y - center;
        const distance = Math.sqrt(dx * dx + dy * dy);
        kernel[y][x] = Math.exp(-(distance * distance) / (2 * sigma * sigma));
      }
    }
    
    return kernel;
  }

  // Get height at specific coordinates (with bounds checking)
  getHeightAt(heightMap: HeightMap, x: number, y: number): number {
    if (x < 0 || x >= heightMap.width || y < 0 || y >= heightMap.height) {
      return 0; // Return ground level for out-of-bounds
    }
    return heightMap.data[y][x];
  }

  // Get interpolated height for sub-grid positions
  getInterpolatedHeight(heightMap: HeightMap, x: number, y: number): number {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.min(x1 + 1, heightMap.width - 1);
    const y2 = Math.min(y1 + 1, heightMap.height - 1);
    
    const fx = x - x1;
    const fy = y - y1;
    
    const h11 = this.getHeightAt(heightMap, x1, y1);
    const h12 = this.getHeightAt(heightMap, x1, y2);
    const h21 = this.getHeightAt(heightMap, x2, y1);
    const h22 = this.getHeightAt(heightMap, x2, y2);
    
    // Bilinear interpolation
    const h1 = h11 * (1 - fx) + h21 * fx;
    const h2 = h12 * (1 - fx) + h22 * fx;
    return h1 * (1 - fy) + h2 * fy;
  }
}

// ============================================================================
// Z-LEVEL MANAGEMENT SYSTEM
// ============================================================================

interface ZLevelInfo {
  level: number;
  name: string;
  description: string;
  blockCount: number;
  isVisible: boolean;
  isLocked: boolean;
}

class ZLevelManager {
  private levels: Map<number, ZLevelInfo> = new Map();
  private currentLevel: number = 0;
  private maxLevel: number = 0;

  constructor() {
    // Initialize ground level
    this.addLevel(0, "Ground", "Base terrain level");
  }

  addLevel(z: number, name: string, description: string = ""): void {
    this.levels.set(z, {
      level: z,
      name,
      description,
      blockCount: 0,
      isVisible: true,
      isLocked: false
    });
    
    this.maxLevel = Math.max(this.maxLevel, z);
    console.log(`🏗️ Added Z-level ${z}: ${name}`);
  }

  removeLevel(z: number): boolean {
    if (z === 0) {
      console.warn("Cannot remove ground level (Z=0)");
      return false;
    }
    
    const removed = this.levels.delete(z);
    if (removed) {
      this.updateMaxLevel();
      console.log(`🏗️ Removed Z-level ${z}`);
    }
    return removed;
  }

  getLevel(z: number): ZLevelInfo | undefined {
    return this.levels.get(z);
  }

  getAllLevels(): ZLevelInfo[] {
    return Array.from(this.levels.values()).sort((a, b) => a.level - b.level);
  }

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  setCurrentLevel(z: number): void {
    if (this.levels.has(z)) {
      this.currentLevel = z;
      console.log(`🏗️ Switched to Z-level ${z}`);
    }
  }

  getMaxLevel(): number {
    return this.maxLevel;
  }

  private updateMaxLevel(): void {
    this.maxLevel = Math.max(...Array.from(this.levels.keys()));
  }

  updateBlockCount(z: number, count: number): void {
    const level = this.levels.get(z);
    if (level) {
      level.blockCount = count;
    }
  }

  toggleLevelVisibility(z: number): void {
    const level = this.levels.get(z);
    if (level) {
      level.isVisible = !level.isVisible;
      console.log(`🏗️ Z-level ${z} visibility: ${level.isVisible}`);
    }
  }

  toggleLevelLock(z: number): void {
    const level = this.levels.get(z);
    if (level) {
      level.isLocked = !level.isLocked;
      console.log(`🏗️ Z-level ${z} lock: ${level.isLocked}`);
    }
  }

  // Get all visible levels
  getVisibleLevels(): number[] {
    return Array.from(this.levels.values())
      .filter(level => level.isVisible)
      .map(level => level.level);
  }

  // Get all unlocked levels
  getUnlockedLevels(): number[] {
    return Array.from(this.levels.values())
      .filter(level => !level.isLocked)
      .map(level => level.level);
  }
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

  getBlocksInArea(x: number, y: number, z: number, _radius: number): Block[] {
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
    const allBlocks = this.spatialIndex.getAllBlocks();
    
    // Temporarily disable culling to fix rendering
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

  // Get the visible area bounds in grid coordinates
  // Convert camera position to grid coordinates
  private cameraToGrid(camera: Camera): { x: number; y: number; z: number } {
    // The camera position represents where grid (0,0,0) would be rendered on screen
    // We need to find which grid position is currently at the center of the screen
    
    // Since the camera position is in screen coordinates, and we want to know
    // which grid position is at the center of the screen, we can use the fact that
    // the camera position represents where grid (0,0,0) would be rendered
    
    // For now, let's use a simple approach: assume the camera is looking at grid (0,0,0)
    // This works because the camera starts at (400, 300) which is likely the center of the canvas
    return { x: 0, y: 0, z: 0 };
  }

  getVisibleAreaBounds(camera: Camera, canvasWidth: number, canvasHeight: number): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  } {
    const tileWidth = 32;
    const tileHeight = 16;
    const zoom = camera.zoom;
    
    // Get the grid position that the camera is centered on
    const centerGrid = this.cameraToGrid(camera);
    
    // Calculate how many tiles we need to fill the screen
    const tilesPerScreenX = Math.ceil(canvasWidth / (tileWidth * zoom)) + 40; // Add extra tiles
    const tilesPerScreenY = Math.ceil(canvasHeight / (tileHeight * zoom)) + 40; // Add extra tiles
    
    return {
      minX: centerGrid.x - Math.floor(tilesPerScreenX/2),
      maxX: centerGrid.x + Math.floor(tilesPerScreenX/2),
      minY: centerGrid.y - Math.floor(tilesPerScreenY/2),
      maxY: centerGrid.y + Math.floor(tilesPerScreenY/2),
      minZ: 0,
      maxZ: 10
    };
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
      camera: { position: { x: 0, y: 0, z: 0 }, zoom: 1, rotation: 0 }, // Will be set to canvas center when loaded
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
// ENHANCED PROCEDURAL MAP GENERATION SYSTEM
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
  heightMap?: HeightMapConfig; // New: Height map configuration
  zLevels?: {
    enabled: boolean;
    maxLevels: number;
    structureHeight: number;
  };
}

class EnhancedProceduralMapGenerator {
  private seed: number;
  private heightMapGenerator: HeightMapGenerator;
  private heightMap: HeightMap | null = null;

  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
    this.heightMapGenerator = new HeightMapGenerator(this.seed);
  }

  private generateHeightMap(config: HeightMapConfig): HeightMap {
    console.log(`🗺️ Generating height map for terrain...`);
    return this.heightMapGenerator.generateHeightMap(config);
  }

  private getTerrainTypeFromHeightMap(x: number, y: number, heightMap: HeightMap): { 
    type: string; 
    palette: string; 
    elevation: number;
    slope: number;
  } {
    // Convert world coordinates to height map coordinates (fix negative coordinate handling)
    const mapX = ((x + heightMap.width / 2) % heightMap.width + heightMap.width) % heightMap.width;
    const mapY = ((y + heightMap.height / 2) % heightMap.height + heightMap.height) % heightMap.height;
    
    // Ensure coordinates are within bounds
    const clampedX = Math.max(0, Math.min(mapX, heightMap.width - 1));
    const clampedY = Math.max(0, Math.min(mapY, heightMap.height - 1));
    
    // Get height at this position
    const height = this.heightMapGenerator.getHeightAt(heightMap, clampedX, clampedY);
    
    // Calculate slope by checking neighboring heights
    const neighbors = [
      this.heightMapGenerator.getHeightAt(heightMap, Math.min(clampedX + 1, heightMap.width - 1), clampedY),
      this.heightMapGenerator.getHeightAt(heightMap, Math.max(clampedX - 1, 0), clampedY),
      this.heightMapGenerator.getHeightAt(heightMap, clampedX, Math.min(clampedY + 1, heightMap.height - 1)),
      this.heightMapGenerator.getHeightAt(heightMap, clampedX, Math.max(clampedY - 1, 0))
    ];
    
    const maxSlope = Math.max(...neighbors.map(h => Math.abs(h - height)));
    const slope = maxSlope / Math.max(heightMap.maxHeight, 1); // Avoid division by zero
    
    // Determine terrain type based on height and slope
    const heightRatio = height / Math.max(heightMap.maxHeight, 1); // Avoid division by zero
    
    let type: string;
    let palette: string;
    
    if (heightRatio < 0.2) {
      // Low areas - water or sand
      type = slope > 0.1 ? 'flat' : 'water';
      palette = type === 'water' ? 'blue' : 'orange';
    } else if (heightRatio < 0.4) {
      // Low-mid areas - grass
      type = slope > 0.15 ? 'ramp' : 'flat';
      palette = 'green';
    } else if (heightRatio < 0.7) {
      // Mid areas - stone
      type = slope > 0.2 ? 'ramp' : 'flat';
      palette = 'gray';
    } else {
      // High areas - mountains
      type = slope > 0.25 ? 'cube' : 'flat';
      palette = 'gray';
    }
    
    return {
      type,
      palette,
      elevation: Math.floor(height / 5), // Scale height to create more dramatic elevation differences
      slope
    };
  }

  private shouldPlaceStructure(x: number, y: number, heightMap: HeightMap): boolean {
    const mapX = ((x + heightMap.width / 2) % heightMap.width + heightMap.width) % heightMap.width;
    const mapY = ((y + heightMap.height / 2) % heightMap.height + heightMap.height) % heightMap.height;
    const clampedX = Math.max(0, Math.min(mapX, heightMap.width - 1));
    const clampedY = Math.max(0, Math.min(mapY, heightMap.height - 1));
    const height = this.heightMapGenerator.getHeightAt(heightMap, clampedX, clampedY);
    
    // Place structures on moderate heights, not too high or too low
    const heightRatio = height / Math.max(heightMap.maxHeight, 1);
    return heightRatio > 0.3 && heightRatio < 0.7 && Math.abs(x) > 3 && Math.abs(y) > 3;
  }

  private shouldPlaceTree(x: number, y: number, heightMap: HeightMap): boolean {
    const mapX = ((x + heightMap.width / 2) % heightMap.width + heightMap.width) % heightMap.width;
    const mapY = ((y + heightMap.height / 2) % heightMap.height + heightMap.height) % heightMap.height;
    const clampedX = Math.max(0, Math.min(mapX, heightMap.width - 1));
    const clampedY = Math.max(0, Math.min(mapY, heightMap.height - 1));
    const height = this.heightMapGenerator.getHeightAt(heightMap, clampedX, clampedY);
    
    // Place trees on moderate heights with some randomness
    const heightRatio = height / Math.max(heightMap.maxHeight, 1);
    const treeNoise = Math.sin(x * 0.4 + y * 0.3 + this.seed) * 0.5 + 0.5;
    return heightRatio > 0.2 && heightRatio < 0.8 && treeNoise > 0.7;
  }

  generateMap(config: MapGeneratorConfig): Block[] {
    const blocks: Block[] = [];
    
    console.log(`🏗️ Starting enhanced terrain generation for ${config.width}x${config.height} map`);
    console.log(`🏗️ Seed: ${this.seed}`);

    // Temporarily disable height map for island generation
    // if (config.heightMap) {
    //   this.heightMap = this.generateHeightMap(config.heightMap);
    //   console.log(`🗺️ Height map generated: ${this.heightMap.width}x${this.heightMap.height}`);
    // }

    // Generate island with specific Z-level pattern
    for (let x = -config.width / 2; x < config.width / 2; x++) {
      for (let y = -config.height / 2; y < config.height / 2; y++) {
        const centerX = 0;
        const centerY = 0;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = 8; // Island radius
        
        // Z=0: Water around edges, grey blocks in center
        if (distance > maxDistance) {
          // Outside island - water
          const waterTiles = ISOMETRIC_TILES.filter(tile => tile.type === 'water');
          if (waterTiles.length > 0) {
            const selectedTile = waterTiles[Math.floor(Math.random() * waterTiles.length)];
            const block: Block = {
              id: `water_${x}_${y}_0`,
              type: 'water',
              palette: 'blue',
              position: { x, y, z: 0 },
              rotation: 0,
              properties: { walkable: false, climbable: false, interactable: false, destructible: false },
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
        } else if (distance > maxDistance - 2) {
          // Near edge - random water or grey
          const waterChance = Math.sin(x * 0.5 + y * 0.3 + this.seed) * 0.5 + 0.5;
          if (waterChance > 0.7) {
            // Random water block
            const waterTiles = ISOMETRIC_TILES.filter(tile => tile.type === 'water');
            if (waterTiles.length > 0) {
              const selectedTile = waterTiles[Math.floor(Math.random() * waterTiles.length)];
              const block: Block = {
                id: `water_${x}_${y}_0`,
                type: 'water',
                palette: 'blue',
                position: { x, y, z: 0 },
                rotation: 0,
                properties: { walkable: false, climbable: false, interactable: false, destructible: false },
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
          } else {
            // Grey block at Z=0
            const greyTiles = ISOMETRIC_TILES.filter(tile => tile.type === 'flat' && tile.palette === 'gray');
            if (greyTiles.length > 0) {
              const selectedTile = greyTiles[Math.floor(Math.random() * greyTiles.length)];
              const block: Block = {
                id: `grey_${x}_${y}_0`,
                type: 'flat',
                palette: 'gray',
                position: { x, y, z: 0 },
                rotation: 0,
                properties: { walkable: true, climbable: false, interactable: false, destructible: true },
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
        } else {
          // Center area - grey blocks at Z=0
          const greyTiles = ISOMETRIC_TILES.filter(tile => tile.type === 'flat' && tile.palette === 'gray');
          if (greyTiles.length > 0) {
            const selectedTile = greyTiles[Math.floor(Math.random() * greyTiles.length)];
            const block: Block = {
              id: `grey_${x}_${y}_0`,
              type: 'flat',
              palette: 'gray',
              position: { x, y, z: 0 },
              rotation: 0,
              properties: { walkable: true, climbable: false, interactable: false, destructible: true },
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
        
        // Z=1: Grass blocks on top of grey blocks (but not on water)
        if (distance <= maxDistance && distance > maxDistance - 2) {
          const waterChance = Math.sin(x * 0.5 + y * 0.3 + this.seed) * 0.5 + 0.5;
          if (waterChance <= 0.7) {
            // Add grass at Z=1 on grey blocks
            const grassTiles = ISOMETRIC_TILES.filter(tile => tile.type === 'flat' && tile.palette === 'green');
            if (grassTiles.length > 0) {
              const selectedTile = grassTiles[Math.floor(Math.random() * grassTiles.length)];
              const block: Block = {
                id: `grass_${x}_${y}_1`,
                type: 'flat',
                palette: 'green',
                position: { x, y, z: 1 },
                rotation: 0,
                properties: { walkable: true, climbable: false, interactable: false, destructible: true },
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
        } else if (distance <= maxDistance - 2) {
          // Add grass at Z=1 on center grey blocks
          const grassTiles = ISOMETRIC_TILES.filter(tile => tile.type === 'flat' && tile.palette === 'green');
          if (grassTiles.length > 0) {
            const selectedTile = grassTiles[Math.floor(Math.random() * grassTiles.length)];
            const block: Block = {
              id: `grass_${x}_${y}_1`,
              type: 'flat',
              palette: 'green',
              position: { x, y, z: 1 },
              rotation: 0,
              properties: { walkable: true, climbable: false, interactable: false, destructible: true },
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
        
        // Z=2: Orange blocks on top of grass (but not on water)
        if (distance <= maxDistance - 2) {
          // Add orange blocks at Z=2 on center grass blocks
          const orangeTiles = ISOMETRIC_TILES.filter(tile => tile.type === 'flat' && tile.palette === 'orange');
          if (orangeTiles.length > 0) {
            const selectedTile = orangeTiles[Math.floor(Math.random() * orangeTiles.length)];
            const block: Block = {
              id: `orange_${x}_${y}_2`,
              type: 'flat',
              palette: 'orange',
              position: { x, y, z: 2 },
              rotation: 0,
              properties: { walkable: true, climbable: false, interactable: false, destructible: true },
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

    console.log(`🏗️ Island generation complete: ${blocks.length} blocks`);
    
    // Debug: Show elevation distribution
    if (blocks.length > 0) {
      const elevations = blocks.map(b => b.position.z);
      const minZ = Math.min(...elevations);
      const maxZ = Math.max(...elevations);
      const avgZ = elevations.reduce((a, b) => a + b, 0) / elevations.length;
      console.log(`🗺️ Island elevation stats: min=${minZ}, max=${maxZ}, avg=${avgZ.toFixed(1)}`);
      
      // Count blocks by Z-level
      const zLevelCounts = blocks.reduce((acc, block) => {
        acc[block.position.z] = (acc[block.position.z] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      console.log(`🗺️ Island Z-level distribution:`, zLevelCounts);
      
      // Note: Z-levels will be added to the manager when blocks are set in the component
    }

    // Disabled structure and tree generation for clean island pattern
    /*
    // Second pass: Add structures at multiple z-levels if enabled
    if (config.features.structures && config.zLevels?.enabled) {
      const maxLevels = config.zLevels.maxLevels;
      const structureHeight = config.zLevels.structureHeight;
      
      for (let x = -config.width / 2; x < config.width / 2; x++) {
        for (let y = -config.height / 2; y < config.height / 2; y++) {
          if (this.heightMap && this.shouldPlaceStructure(x, y, this.heightMap)) {
            // Get base elevation from height map
            const mapX = ((x + this.heightMap.width / 2) % this.heightMap.width + this.heightMap.width) % this.heightMap.width;
            const mapY = ((y + this.heightMap.height / 2) % this.heightMap.height + this.heightMap.height) % this.heightMap.height;
            const clampedX = Math.max(0, Math.min(mapX, this.heightMap.width - 1));
            const clampedY = Math.max(0, Math.min(mapY, this.heightMap.height - 1));
            const baseHeight = this.heightMapGenerator.getHeightAt(this.heightMap, clampedX, clampedY);
            const baseZ = Math.floor(baseHeight / 5);
            
            // Create multi-level structure
            for (let level = 1; level <= Math.min(maxLevels, 3); level++) {
              const structureTiles = ISOMETRIC_TILES.filter(tile => 
                tile.type === 'cube' && tile.palette === 'gray'
              );
              
              if (structureTiles.length > 0) {
                const selectedTile = structureTiles[Math.floor(Math.random() * structureTiles.length)];
                
                const block: Block = {
                  id: `structure_${x}_${y}_${baseZ + level}`,
                  type: 'cube',
                  palette: 'gray',
                  position: { x, y, z: baseZ + level },
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
    } else if (config.features.structures) {
      // Original single-level structure placement
      for (let x = -config.width / 2; x < config.width / 2; x++) {
        for (let y = -config.height / 2; y < config.height / 2; y++) {
          if (this.heightMap && this.shouldPlaceStructure(x, y, this.heightMap)) {
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

    // Third pass: Add trees
    if (config.features.trees) {
      for (let x = -config.width / 2; x < config.width / 2; x++) {
        for (let y = -config.height / 2; y < config.height / 2; y++) {
          if (this.heightMap && this.shouldPlaceTree(x, y, this.heightMap)) {
            const treeTiles = ISOMETRIC_TILES.filter(tile => 
              tile.type === 'pillar' && tile.palette === 'green'
            );
            
            if (treeTiles.length > 0) {
              const selectedTile = treeTiles[Math.floor(Math.random() * treeTiles.length)];
              
              // Get base elevation for tree placement
              const mapX = ((x + this.heightMap.width / 2) % this.heightMap.width + this.heightMap.width) % this.heightMap.width;
              const mapY = ((y + this.heightMap.height / 2) % this.heightMap.height + this.heightMap.height) % this.heightMap.height;
              const clampedX = Math.max(0, Math.min(mapX, this.heightMap.width - 1));
              const clampedY = Math.max(0, Math.min(mapY, this.heightMap.height - 1));
              const baseHeight = this.heightMapGenerator.getHeightAt(this.heightMap, clampedX, clampedY);
              const baseZ = Math.floor(baseHeight / 10);
              
              const block: Block = {
                id: `tree_${x}_${y}_${baseZ + 1}`,
                type: 'pillar',
                palette: 'green',
                position: { x, y, z: baseZ + 1 },
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
         */

    console.log(`🏗️ Enhanced map generation complete: ${blocks.length} total blocks`);
    return blocks;
  }

  // Island terrain generation with specific Z-level pattern
  private getTerrainTypeFallback(x: number, y: number): { type: string; palette: string; elevation: number } {
    // Create a simple island pattern
    const centerX = 0;
    const centerY = 0;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const maxDistance = 8; // Island radius
    
    // Z=0: Water around edges, grey blocks in center
    if (distance > maxDistance) {
      // Outside island - water
      return { type: 'water', palette: 'blue', elevation: 0 };
    } else if (distance > maxDistance - 2) {
      // Near edge - random water or grey
      const waterChance = Math.sin(x * 0.5 + y * 0.3 + this.seed) * 0.5 + 0.5;
      if (waterChance > 0.7) {
        return { type: 'water', palette: 'blue', elevation: 0 };
      } else {
        return { type: 'flat', palette: 'gray', elevation: 0 };
      }
    } else {
      // Center area - grey blocks
      return { type: 'flat', palette: 'gray', elevation: 0 };
    }
  }

  // Get height map for external use
  getHeightMap(): HeightMap | null {
    return this.heightMap;
  }
}

// ============================================================================
// MAIN SANCTUARY COMPONENT
// ============================================================================

const Sanctuary: React.FC<SanctuaryProps> = React.memo(({ className = '', onExit }) => {
  // Debug logging removed for performance

  // ============================================================================
  // PERFORMANCE SYSTEMS
  // ============================================================================
  
  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);
  const spatialIndex = useMemo(() => new SpatialIndex(), []);
  const cullingSystem = useMemo(() => new CullingSystem(spatialIndex), [spatialIndex]);
  const batchRenderer = useMemo(() => new BatchRenderer(), []);
  
  // ============================================================================
  // HEIGHT MAP & Z-LEVEL SYSTEMS
  // ============================================================================
  
  const heightMapGenerator = useMemo(() => new HeightMapGenerator(), []);
  const zLevelManager = useMemo(() => new ZLevelManager(), []);
  
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
    position: { x: 0, y: 0, z: 0 }, // Will be set to canvas center with offset after canvas loads
    zoom: 1, // Default to 1x zoom
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
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [levelNameInput, setLevelNameInput] = useState('');
  
  // Height map state
  const [currentHeightMap, setCurrentHeightMap] = useState<HeightMap | null>(null);
  const [showHeightMap, setShowHeightMap] = useState(false);
  const [heightMapConfig, setHeightMapConfig] = useState<HeightMapConfig>({
    width: 32,
    height: 32,
    octaves: 4,
    frequency: 0.1,
    amplitude: 1.0,
    persistence: 0.5,
    lacunarity: 2.0,
    minHeight: 0,
    maxHeight: 100,
    smoothing: 1.0
  });
  
  // Z-level state
  const [currentZLevel, setCurrentZLevel] = useState(0);
  const [showZLevelManager, setShowZLevelManager] = useState(false);
  const [zLevelFilter, setZLevelFilter] = useState<number[]>([]); // Empty array = show all levels
  
  // Fill mode state
  const [fillMode, setFillMode] = useState(false);

  // Confirmation dialog state
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Collapsible button groups state
  const [collapsedGroups, setCollapsedGroups] = useState<{
    camera: boolean;
    levels: boolean;
    building: boolean;
    tools: boolean;
    heightmap: boolean;
    zlevels: boolean;
  }>({
    camera: false,
    levels: false,
    building: false,
    tools: false,
    heightmap: false,
    zlevels: false
  });

  // Atlas Editor state
  const [showAtlasEditor, setShowAtlasEditor] = useState(false);

  // ============================================================================
  // PROCEDURAL MAP GENERATION
  // ============================================================================

  const generateProceduralMap = useCallback((size: 'small' | 'medium' | 'large' = 'medium') => {
    console.log(`🏗️ Generating ${size} procedural map...`);
    
    const mapGenerator = new EnhancedProceduralMapGenerator();
    
    // Map size configurations
    const sizeConfigs = {
      small: { width: 16, height: 16, zoom: 2 },
      medium: { width: 32, height: 32, zoom: 1 },
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
      },
      // Add height map configuration for enhanced terrain
      heightMap: {
        width: sizeConfigs[size].width,
        height: sizeConfigs[size].height,
        octaves: 4,
        frequency: 0.1,
        amplitude: 1.0,
        persistence: 0.5,
        lacunarity: 2.0,
        minHeight: 0,
        maxHeight: 200, // Increased for more dramatic elevation
        smoothing: 1.0
      },
      // Add z-level configuration
      zLevels: {
        enabled: true,
        maxLevels: 3,
        structureHeight: 1
      }
    };
    
    const generatedBlocks = mapGenerator.generateMap(config);
    console.log(`🏗️ Generated ${generatedBlocks.length} blocks for ${size} procedural map`);
    
    if (generatedBlocks.length === 0) {
      console.error('❌ No blocks generated!');
      return;
    }
    
    // Clear existing blocks and spatial index
    setBlocks([]);
    spatialIndex.clear();
    
    // Add generated blocks
    setBlocks(generatedBlocks);
    generatedBlocks.forEach((block: Block) => {
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
    
    // Calculate the center of generated blocks and center camera
    if (generatedBlocks.length > 0) {
      const minX = Math.min(...generatedBlocks.map((b: Block) => b.position.x));
      const maxX = Math.max(...generatedBlocks.map((b: Block) => b.position.x));
      const minY = Math.min(...generatedBlocks.map((b: Block) => b.position.y));
      const maxY = Math.max(...generatedBlocks.map((b: Block) => b.position.y));
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      // Convert grid center to screen coordinates
      const tileWidth = 32;
      const tileHeight = 16;
      const screenCenterX = (centerX - centerY) * (tileWidth / 2);
      const screenCenterY = (centerX + centerY) * (tileHeight / 2);
      
      console.log(`🎯 Grid center: (${centerX}, ${centerY}) -> Screen center: (${screenCenterX}, ${screenCenterY})`);
      
      // Center camera on the generated blocks
      setCamera(prev => ({
        ...prev,
        position: { x: screenCenterX, y: screenCenterY, z: 0 }
      }));
    }
    
    console.log(`✅ ${size} procedural map generation complete!`);
    console.log(`🎯 Blocks in state after generation:`, generatedBlocks.length);
    console.log(`🎯 Blocks in spatial index:`, spatialIndex.getAllBlocks().length);
  }, [spatialIndex]);

  const fillVisibleArea = useCallback(() => {
    if (!selectedTile) {
      console.log('❌ No tile selected for filling');
      return;
    }
    
    console.log('🏗️ Filling visible area with selected block:', selectedTile.name);
    
    const newBlocks: Block[] = [];
    
    // Get canvas dimensions for proper frustum calculation
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ Canvas not available for frustum calculation');
      return;
    }
    
    // Get visible area bounds using culling system
    const visibleBounds = cullingSystem.getVisibleAreaBounds(camera, canvas.width, canvas.height);
    
    console.log(`🏗️ Visible area bounds:`, visibleBounds);
    console.log(`🏗️ Using selected tile: ${selectedTile.name} (${selectedTile.type}, ${selectedTile.palette})`);
    
    // Fill a larger area around the center to ensure we cover the visible area
    const fillRadius = 20; // Fill a 40x40 area around center
    
    for (let x = -fillRadius; x <= fillRadius; x++) {
      for (let y = -fillRadius; y <= fillRadius; y++) {
        // Check if there's already a block at this position
        const existingBlock = spatialIndex.getBlockAt(x, y, 0);
        if (existingBlock) {
          continue; // Skip if block already exists
        }
        
        const block: Block = {
          id: `fill_${x}_${y}_0_${Date.now()}`,
          type: selectedTile.type,
          palette: selectedTile.palette,
          position: { x, y, z: 0 },
          rotation: 0,
          properties: {
            walkable: selectedTile.type === 'flat' || selectedTile.type === 'cube',
            climbable: selectedTile.type === 'ramp' || selectedTile.type === 'staircase',
            interactable: selectedTile.type === 'pillar',
            destructible: true
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
    
    console.log(`🏗️ Created ${newBlocks.length} blocks using selected tile`);
    
    if (newBlocks.length === 0) {
      console.log('❌ No blocks created - this might indicate an issue with the bounds calculation');
      return;
    }
    
    // Add new blocks to state and spatial index
    setBlocks(prevBlocks => {
      const updatedBlocks = [...prevBlocks, ...newBlocks];
      console.log('🏗️ Total blocks after fill:', updatedBlocks.length);
      console.log('🏗️ First few new blocks:', newBlocks.slice(0, 3));
      
      // Update spatial index
      newBlocks.forEach(block => {
        spatialIndex.addBlock(block);
      });
      
      console.log('🏗️ Blocks in spatial index after fill:', spatialIndex.getAllBlocks().length);
      
      return updatedBlocks;
    });
    
    // Update level
    setCurrentLevel(prevLevel => ({
      ...prevLevel,
      blocks: [...prevLevel.blocks, ...newBlocks],
      modifiedAt: new Date()
    }));
    
    console.log('✅ Fill complete!');
  }, [spatialIndex, selectedTile, camera, cullingSystem]);

  const generateWithAllBlocks = useCallback(() => {
    console.log('🏗️ Generating map with all available blocks...');
    
    const newBlocks: Block[] = [];
    
    // Get all available tiles
    const allTiles = ISOMETRIC_TILES;
    if (allTiles.length === 0) {
      console.error('❌ No tiles found in ISOMETRIC_TILES');
      return;
    }
    
    // Log tile type distribution for debugging
    const tileTypeCounts = allTiles.reduce((acc, tile) => {
      acc[tile.type] = (acc[tile.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('🏗️ Available tile types:', tileTypeCounts);
    
    // Log palette distribution for debugging
    const paletteCounts = allTiles.reduce((acc, tile) => {
      acc[tile.palette] = (acc[tile.palette] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('🏗️ Available palettes:', paletteCounts);
    
    // Get canvas dimensions for proper frustum calculation
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ Canvas not available for frustum calculation');
      return;
    }
    
    // Get visible area bounds using culling system
    const visibleBounds = cullingSystem.getVisibleAreaBounds(camera, canvas.width, canvas.height);
    
    console.log(`🏗️ Visible area bounds:`, visibleBounds);
    console.log(`🏗️ Using ${allTiles.length} different tile types`);
    
    // Create a diverse pattern using all available blocks in a large area around center
    const generateRadius = 25; // Generate a 50x50 area around center
    
    for (let x = -generateRadius; x <= generateRadius; x++) {
      for (let y = -generateRadius; y <= generateRadius; y++) {
        
        // Use different selection strategies for variety
        let selectedTile: IsometricTileData;
        
        // Create interesting patterns based on position
        const distanceFromCenter = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);
        
        // Create a more robust tile selection strategy that ensures variety
        
        // Simplified and more robust tile selection strategy
        
        // Use a more robust approach that ensures we always have valid tiles
        const positionHash = Math.abs(x * 17 + y * 23);
        
        // Create a more reliable tile selection strategy
        if (distanceFromCenter < 3) {
          // Center area: Prefer flat tiles, fallback to any tile
          const flatTiles = allTiles.filter(tile => tile.type === 'flat');
          if (flatTiles.length > 0) {
            selectedTile = flatTiles[positionHash % flatTiles.length];
          } else {
            selectedTile = allTiles[positionHash % allTiles.length];
          }
        } else if (distanceFromCenter < 6) {
          // Inner ring: Prefer cubes and ramps, fallback to any tile
          const structuralTiles = allTiles.filter(tile => tile.type === 'cube' || tile.type === 'ramp');
          if (structuralTiles.length > 0) {
            selectedTile = structuralTiles[positionHash % structuralTiles.length];
          } else {
            selectedTile = allTiles[positionHash % allTiles.length];
          }
        } else if (distanceFromCenter < 10) {
          // Middle ring: Prefer staircases and corners, fallback to any tile
          const stairTiles = allTiles.filter(tile => tile.type === 'staircase' || tile.type === 'corner');
          if (stairTiles.length > 0) {
            selectedTile = stairTiles[positionHash % stairTiles.length];
          } else {
            selectedTile = allTiles[positionHash % allTiles.length];
          }
        } else if (distanceFromCenter < 15) {
          // Outer ring: Prefer pillars and water, fallback to any tile
          const specialTiles = allTiles.filter(tile => tile.type === 'pillar' || tile.type === 'water');
          if (specialTiles.length > 0) {
            selectedTile = specialTiles[positionHash % specialTiles.length];
          } else {
            selectedTile = allTiles[positionHash % allTiles.length];
          }
        } else {
          // Far areas: Use all types
          selectedTile = allTiles[positionHash % allTiles.length];
        }
        
        // Safety check to ensure selectedTile is never undefined
        if (!selectedTile) {
          selectedTile = allTiles[0];
        }
        
        // Debug logging removed to reduce console spam
        
        // Add some elevation variation
        let z = 0;
        if (selectedTile.type === 'cube' || selectedTile.type === 'pillar') {
          z = Math.floor(Math.random() * 2); // 0 or 1 height
        }
        
        const block: Block = {
          id: `generate_${x}_${y}_${z}_${Date.now()}`,
          type: selectedTile.type,
          palette: selectedTile.palette,
          position: { x, y, z },
          rotation: 0, // Keep blocks unrotated for consistent appearance
          properties: {
            walkable: selectedTile.type === 'flat' || selectedTile.type === 'cube',
            climbable: selectedTile.type === 'ramp' || selectedTile.type === 'staircase',
            interactable: selectedTile.type === 'pillar',
            destructible: true
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
    
    console.log(`🏗️ Created ${newBlocks.length} blocks using all tile types`);
    console.log(`🏗️ Tile types used: ${[...new Set(newBlocks.map(b => b.type))].join(', ')}`);
    console.log(`🏗️ Palettes used: ${[...new Set(newBlocks.map(b => b.palette))].join(', ')}`);
    
    // Log detailed statistics
    const generatedTypeCounts = newBlocks.reduce((acc, block) => {
      acc[block.type] = (acc[block.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('🏗️ Generated tile type distribution:', generatedTypeCounts);
    
    const generatedPaletteCounts = newBlocks.reduce((acc, block) => {
      acc[block.palette] = (acc[block.palette] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('🏗️ Generated palette distribution:', generatedPaletteCounts);
    
    // Clear existing blocks and spatial index
    setBlocks([]);
    spatialIndex.clear();
    
    // Add new blocks to state and spatial index
    setBlocks(newBlocks);
    newBlocks.forEach(block => {
      spatialIndex.addBlock(block);
    });
    
    // Update level
    setCurrentLevel(prevLevel => ({
      ...prevLevel,
      blocks: newBlocks,
      modifiedAt: new Date()
    }));
    
    console.log('✅ Generate complete!');
    console.log('🎯 Camera position:', camera.position);
    console.log('🎯 Generated blocks bounds:', visibleBounds);
    
    // Move camera to center of generated blocks
    const centerX = (visibleBounds.minX + visibleBounds.maxX) / 2;
    const centerY = (visibleBounds.minY + visibleBounds.maxY) / 2;
    setCamera(prev => ({
      ...prev,
      position: { x: centerX, y: centerY, z: 0 }
    }));
  }, [spatialIndex, camera, cullingSystem]);

  // ============================================================================
  // HEIGHT MAP MANAGEMENT
  // ============================================================================

  const generateHeightMap = useCallback(() => {
    console.log('🗺️ Generating height map...');
    const heightMap = heightMapGenerator.generateHeightMap(heightMapConfig);
    setCurrentHeightMap(heightMap);
    console.log('🗺️ Height map generated:', heightMap.width, 'x', heightMap.height);
  }, [heightMapGenerator, heightMapConfig]);

  const updateHeightMapConfig = useCallback((newConfig: Partial<HeightMapConfig>) => {
    setHeightMapConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const exportHeightMap = useCallback(() => {
    if (!currentHeightMap) {
      console.warn('No height map to export');
      return;
    }
    
    const dataStr = JSON.stringify(currentHeightMap, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `heightmap_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentHeightMap]);

  // ============================================================================
  // Z-LEVEL MANAGEMENT
  // ============================================================================

  const addZLevel = useCallback((z: number, name: string, description: string = "") => {
    zLevelManager.addLevel(z, name, description);
    console.log(`🏗️ Added Z-level ${z}: ${name}`);
  }, [zLevelManager]);

  const removeZLevel = useCallback((z: number) => {
    const removed = zLevelManager.removeLevel(z);
    if (removed) {
      console.log(`🏗️ Removed Z-level ${z}`);
    }
  }, [zLevelManager]);

  const switchToZLevel = useCallback((z: number) => {
    zLevelManager.setCurrentLevel(z);
    setCurrentZLevel(z);
    console.log(`🏗️ Switched to Z-level ${z}`);
  }, [zLevelManager]);

  const toggleZLevelVisibility = useCallback((z: number) => {
    zLevelManager.toggleLevelVisibility(z);
    console.log(`🏗️ Toggled Z-level ${z} visibility`);
  }, [zLevelManager]);

  const toggleZLevelLock = useCallback((z: number) => {
    zLevelManager.toggleLevelLock(z);
    console.log(`🏗️ Toggled Z-level ${z} lock`);
  }, [zLevelManager]);

  const getVisibleBlocks = useCallback(() => {
    const visibleLevels = zLevelFilter.length > 0 ? zLevelFilter : zLevelManager.getVisibleLevels();
    return blocks.filter(block => visibleLevels.includes(block.position.z));
  }, [blocks, zLevelFilter, zLevelManager]);

  const updateZLevelBlockCounts = useCallback(() => {
    const levelCounts = new Map<number, number>();
    blocks.forEach(block => {
      const count = levelCounts.get(block.position.z) || 0;
      levelCounts.set(block.position.z, count + 1);
    });
    
    levelCounts.forEach((count, z) => {
      // Add Z-level to manager if it doesn't exist
      if (!zLevelManager.getLevel(z)) {
        const levelName = z === 0 ? "Ground" : z === 1 ? "Grass" : z === 2 ? "Orange" : `Level ${z}`;
        zLevelManager.addLevel(z, levelName, `Z-level ${z} with ${count} blocks`);
        console.log(`🏗️ Auto-added Z-level ${z}: ${levelName}`);
      }
      zLevelManager.updateBlockCount(z, count);
    });
  }, [blocks, zLevelManager]);

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
    borderRadius: '0px',
    padding: '4px',
    cursor: 'pointer',
    fontSize: 'var(--font-size-xs)',
    transition: 'all 0.2s ease',
    color: 'var(--color-text-primary)',
    pointerEvents: 'auto' as const,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    minWidth: '32px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  };

  // ============================================================================
  // RENDERING SYSTEM
  // ============================================================================

  const renderBlock = useCallback((ctx: CanvasRenderingContext2D, block: Block, tileSheet: HTMLImageElement) => {
    const { x, y, z } = block.position;
    const tileWidth = 32;
    const tileHeight = 16;
    
    // Isometric projection with increased Z-level spacing for more dramatic elevation
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * (tileHeight * 2); // Doubled Z-level spacing
    
    // Debug: Log only the first few blocks to see if rendering is working
    if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
      console.log(`🎯 Block at grid (${x}, ${y}, ${z}) -> screen (${isoX}, ${isoY}), type: ${block.type}`);
    }
    
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
    
    // Isometric projection with increased Z-level spacing
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * (tileHeight * 2);
    
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
    
    // Calculate isometric position with increased Z-level spacing
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * (tileHeight * 2);
    
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
    
    // Get visible blocks using culling system and z-level filtering
    const culledBlocks = cullingSystem.getVisibleBlocks(camera);
    const visibleBlocks = getVisibleBlocks();
    const filteredBlocks = culledBlocks.filter(block => 
      visibleBlocks.some(vb => vb.id === block.id)
    );
    
    console.log(`🎨 Rendering ${filteredBlocks.length} visible blocks out of ${blocks.length} total blocks`);
    console.log(`📷 Camera position: (${camera.position.x}, ${camera.position.y}, ${camera.position.z}), zoom: ${camera.zoom}`);
    console.log(`🖼️ Canvas dimensions: ${ctx.canvas.width}x${ctx.canvas.height}`);
    console.log(`🏗️ Current Z-level: ${currentZLevel}, Filtered levels: ${zLevelFilter.length > 0 ? zLevelFilter.join(',') : 'all'}`);
    
    // Debug: Log some block positions to see if they're in the right area
    if (filteredBlocks.length > 0) {
      console.log('🎯 First few visible blocks:', filteredBlocks.slice(0, 3).map(b => ({ 
        id: b.id, 
        position: b.position, 
        type: b.type 
      })));
    }
    
    // Sort blocks by depth (z DESC, then y ASC, then x ASC)
    const sortedBlocks = filteredBlocks.sort((a, b) => {
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
    metrics.visibleBlocks = filteredBlocks.length;
    metrics.drawCalls = drawCalls;
    
    // Debug culling info removed
    
    setPerformanceMetrics(metrics);
  }, [camera, blocks, cullingSystem, renderBlock, renderHoverPreview, renderSelectionHighlight, performanceMonitor, renderGrid, showGrid, getVisibleBlocks, currentZLevel, zLevelFilter]);

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
    console.log(`🎨 Rendering ${blocks.length} blocks in fallback mode`);
    blocks.forEach((block, _index) => {
      
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

  // Handle zoom button clicks
  const handleZoomClick = useCallback((zoomLevel: number) => {
    setCamera(prev => ({
      ...prev,
      zoom: zoomLevel
    }));
  }, []);

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

  // ============================================================================
  // LEVEL MANAGEMENT
  // ============================================================================

  const saveLevelDirectly = useCallback(() => {
    const levelToSave: Level = {
      ...currentLevel,
      blocks: [...blocks],
      camera: { ...camera },
      modifiedAt: new Date()
    };
    
    LevelManager.saveLevel(levelToSave);
    setCurrentLevel(levelToSave);
  }, [currentLevel, blocks, camera]);

  const renameLevel = useCallback((newName: string) => {
    if (newName.trim()) {
      const updatedLevel: Level = {
        ...currentLevel,
        name: newName.trim(),
        modifiedAt: new Date()
      };
      setCurrentLevel(updatedLevel);
      LevelManager.saveLevel(updatedLevel);
    }
    setShowRenameDialog(false);
    setLevelNameInput('');
  }, [currentLevel]);

  const openRenameDialog = useCallback(() => {
    setLevelNameInput(currentLevel.name);
    setShowRenameDialog(true);
  }, [currentLevel.name]);

  const saveLevel = useCallback(() => {
    const levelToSave: Level = {
      ...currentLevel,
      blocks: [...blocks],
      camera: { ...camera },
      modifiedAt: new Date()
    };
    
    LevelManager.saveLevel(levelToSave);
    setCurrentLevel(levelToSave);
  }, [currentLevel, blocks, camera]);

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
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            openRenameDialog();
          } else if (selectedBlock) {
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
            saveLevelDirectly();
          }
          break;
        case 'c':
        case 'C':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Toggle all groups collapsed/expanded
            const allCollapsed = Object.values(collapsedGroups).every(collapsed => collapsed);
            setCollapsedGroups({
              camera: !allCollapsed,
              levels: !allCollapsed,
              building: !allCollapsed,
              tools: !allCollapsed,
              heightmap: !allCollapsed,
              zlevels: !allCollapsed
            });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlock, removeBlock, rotateBlock, saveLevelDirectly, openRenameDialog]);



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
    
    // Position camera based on current canvas size with offset
    const canvas = canvasRef.current;
    if (canvas) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const offsetX = centerX - 100; // Offset left to account for UI panels
      const offsetY = centerY - 50;  // Offset up slightly
      setCamera({ position: { x: offsetX, y: offsetY, z: 0 }, zoom: 1, rotation: 0 });
    }
    
    setCurrentLevel(newLevel);
    setSelectedBlock(null);
    setSelectedTile(null);
    spatialIndex.clear();
  }, [spatialIndex]);

  const resetCamera = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const offsetX = centerX - 100; // Offset left to account for UI panels
      const offsetY = centerY - 50;  // Offset up slightly
      setCamera({ position: { x: offsetX, y: offsetY, z: 0 }, zoom: 1, rotation: 0 });
      console.log(`🏛️ Camera reset to (${offsetX}, ${offsetY})`);
    }
  }, []);

  const resetTerrain = useCallback(() => {
    setShowResetConfirmation(true);
  }, []);

  const confirmResetTerrain = useCallback(() => {
    console.log('🏛️ Resetting terrain...');
    setBlocks([]);
    setSelectedBlock(null);
    spatialIndex.clear();
    setShowResetConfirmation(false);
    // The terrain generation useEffect will trigger automatically
  }, [spatialIndex]);

  const toggleGroupCollapse = useCallback((groupName: keyof typeof collapsedGroups) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  }, []);

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
      },
      generateWithAllBlocks: () => {
        console.log('🏛️ Generating map with all blocks via debug function');
        generateWithAllBlocks();
      },
      moveCameraToBlocks: () => {
        console.log('🏛️ Moving camera to blocks');
        if (blocks.length > 0) {
          const centerX = blocks.reduce((sum, b) => sum + b.position.x, 0) / blocks.length;
          const centerY = blocks.reduce((sum, b) => sum + b.position.y, 0) / blocks.length;
          setCamera(prev => ({
            ...prev,
            position: { x: centerX, y: centerY, z: 0 }
          }));
          console.log('🎯 Moved camera to:', { x: centerX, y: centerY });
        } else {
          console.log('❌ No blocks to move camera to');
        }
      },
      showBlockInfo: () => {
        console.log('🏛️ Block information:');
        console.log('Total blocks:', blocks.length);
        if (blocks.length > 0) {
          console.log('First block:', blocks[0]);
          console.log('Last block:', blocks[blocks.length - 1]);
          console.log('Block positions range:', {
            minX: Math.min(...blocks.map(b => b.position.x)),
            maxX: Math.max(...blocks.map(b => b.position.x)),
            minY: Math.min(...blocks.map(b => b.position.y)),
            maxY: Math.max(...blocks.map(b => b.position.y))
          });
        }
      },
      addTestBlocks: () => {
        console.log('🏛️ Adding test blocks at known positions...');
        const testBlocks: Block[] = [];
        
        // Add blocks at positions that should be visible
        for (let x = -5; x <= 5; x++) {
          for (let y = -5; y <= 5; y++) {
            const block: Block = {
              id: `test_${x}_${y}_0_${Date.now()}`,
              type: 'cube',
              palette: 'green',
              position: { x, y, z: 0 },
              rotation: 0,
              properties: {
                walkable: true,
                climbable: false,
                interactable: false,
                destructible: true
              },
              sprite: {
                sourceX: 0,
                sourceY: 0,
                width: 32,
                height: 32,
                sheetPath: TILE_SHEET_CONFIG.imagePath
              }
            };
            testBlocks.push(block);
          }
        }
        
        console.log(`🏛️ Created ${testBlocks.length} test blocks`);
        
        // Add to state and spatial index
        setBlocks(prevBlocks => {
          const updatedBlocks = [...prevBlocks, ...testBlocks];
          console.log('🏛️ Total blocks after test:', updatedBlocks.length);
          
          // Update spatial index
          testBlocks.forEach(block => {
            spatialIndex.addBlock(block);
          });
          
          return updatedBlocks;
        });
      },
      adjustCamera: (x: number, y: number) => {
        console.log(`🏛️ Manually adjusting camera to (${x}, ${y})`);
        setCamera(prev => ({
          ...prev,
          position: { x, y, z: 0 }
        }));
      }
    };
    console.log('🏛️ Debug functions available on window.testSanctuary');
  }, [screenToGrid, gridToScreen, createBlock, addBlock, camera, blocks, tileSheetLoaded, tileSheet, generateProceduralMap, generateWithAllBlocks, setCamera, spatialIndex, setBlocks]);

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
      
      // Use the same positioning logic as resetCamera function
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const offsetX = centerX - 100; // Offset left to account for UI panels
      const offsetY = centerY - 50;  // Offset up slightly
      
      setCamera(prev => ({
        ...prev,
        position: { x: offsetX, y: offsetY, z: 0 }
      }));
      
      console.log(`🏛️ Camera initialized at (${offsetX}, ${offsetY}) for canvas ${canvas.width}x${canvas.height}`);
      console.log(`🏛️ Canvas center would be (${centerX}, ${centerY})`);
      
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
    console.log('🏛️ Initialization effect - blocks.length:', blocks.length, 'isLoaded:', isLoaded);
    if (blocks.length === 0 && isLoaded) {
      console.log('🏛️ Generating initial procedural map...');
      generateProceduralMap('medium');
    }
    
    // Force generate some blocks if none exist after 2 seconds
    if (blocks.length === 0 && isLoaded) {
      const timer = setTimeout(() => {
        console.log('🏛️ Force generating blocks after timeout...');
        generateProceduralMap('small');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [blocks.length, isLoaded, generateProceduralMap]);

  // Update z-level block counts when blocks change
  useEffect(() => {
    updateZLevelBlockCounts();
  }, [blocks, updateZLevelBlockCounts]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Keep camera positioned after resize with offset
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const offsetX = centerX - 100; // Offset left to account for UI panels
        const offsetY = centerY - 50;  // Offset up slightly
        
        setCamera(prev => ({
          ...prev,
          position: { x: offsetX, y: offsetY, z: 0 }
        }));
        
        console.log(`🏛️ Camera repositioned at (${offsetX}, ${offsetY}) after resize to ${canvas.width}x${canvas.height}`);
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
          <h3 className={styles.sanctuaryTitle}>{currentLevel.name}</h3>
          
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
        </div>

        {/* Bottom Row - Action Buttons */}
        <div className={styles.headerBottomRow}>
          {/* Camera Options Group */}
          <div className={styles.buttonGroup}>
            <div 
              className={`${styles.buttonGroupHeader} ${collapsedGroups.camera ? styles.collapsed : ''}`}
              onClick={() => toggleGroupCollapse('camera')}
            >
              <span className={styles.buttonGroupLabel}>Camera</span>
              <span className={styles.collapseIcon}>
                {collapsedGroups.camera ? '▶' : '▼'}
              </span>
            </div>
            {!collapsedGroups.camera && (
              <div className={styles.buttonGroupContent}>
                <div className={styles.zoomControls}>
                  <button 
                    className={`${styles.zoomButton} ${camera.zoom === 1 ? styles.zoomButtonActive : ''}`}
                    onClick={() => handleZoomClick(1)}
                    title="1x Zoom"
                  >
                    [1x]
                  </button>
                  <button 
                    className={`${styles.zoomButton} ${camera.zoom === 2 ? styles.zoomButtonActive : ''}`}
                    onClick={() => handleZoomClick(2)}
                    title="2x Zoom"
                  >
                    [2x]
                  </button>
                  <button 
                    className={`${styles.zoomButton} ${camera.zoom === 4 ? styles.zoomButtonActive : ''}`}
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
              className={`${styles.buttonGroupHeader} ${collapsedGroups.levels ? styles.collapsed : ''}`}
              onClick={() => toggleGroupCollapse('levels')}
            >
              <span className={styles.buttonGroupLabel}>Levels</span>
              <span className={styles.collapseIcon}>
                {collapsedGroups.levels ? '▶' : '▼'}
              </span>
            </div>
            {!collapsedGroups.levels && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => setShowLevelMenu(!showLevelMenu)}
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
              className={`${styles.buttonGroupHeader} ${collapsedGroups.building ? styles.collapsed : ''}`}
              onClick={() => toggleGroupCollapse('building')}
            >
              <span className={styles.buttonGroupLabel}>Building</span>
              <span className={styles.collapseIcon}>
                {collapsedGroups.building ? '▶' : '▼'}
              </span>
            </div>
            {!collapsedGroups.building && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => setIsBlockMenuOpen(!isBlockMenuOpen)}
                  title="Block Selector"
                >
                  {isBlockMenuOpen ? 'CLOSE' : 'BLOCKS'}
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
                  title="Generate map with all available blocks to fill current screen and more"
                >
                  GENERATE
                </button>
              </div>
            )}
          </div>

          {/* Utility Tools Group */}
          <div className={styles.buttonGroup}>
            <div 
              className={`${styles.buttonGroupHeader} ${collapsedGroups.tools ? styles.collapsed : ''}`}
              onClick={() => toggleGroupCollapse('tools')}
            >
              <span className={styles.buttonGroupLabel}>Tools</span>
              <span className={styles.collapseIcon}>
                {collapsedGroups.tools ? '▶' : '▼'}
              </span>
            </div>
            {!collapsedGroups.tools && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => {
                    console.log('🏛️ Instructions toggle clicked, current state:', showInstructions);
                    setShowInstructions(!showInstructions);
                    console.log('🏛️ Instructions state will be:', !showInstructions);
                  }}
                  title="Show/Hide Instructions"
                >
                  HELP
                </button>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => setShowGrid(!showGrid)}
                  title="Show/Hide Grid"
                >
                  {showGrid ? 'GRID' : 'GRID'}
                </button>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => setShowPerformance(!showPerformance)}
                  title="Performance Monitor"
                >
                  STATS
                </button>
              </div>
            )}
          </div>

          {/* Height Map Group */}
          <div className={styles.buttonGroup}>
            <div 
              className={`${styles.buttonGroupHeader} ${collapsedGroups.heightmap ? styles.collapsed : ''}`}
              onClick={() => toggleGroupCollapse('heightmap')}
            >
              <span className={styles.buttonGroupLabel}>Height Map</span>
              <span className={styles.collapseIcon}>
                {collapsedGroups.heightmap ? '▶' : '▼'}
              </span>
            </div>
            {!collapsedGroups.heightmap && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => {
                    console.log('🏝️ Generating island...');
                    generateProceduralMap('small');
                  }}
                  title="Generate Island"
                >
                  GENERATE
                </button>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => setShowHeightMap(!showHeightMap)}
                  title="Show/Hide Height Map"
                >
                  {showHeightMap ? 'HIDE' : 'SHOW'}
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
              className={`${styles.buttonGroupHeader} ${collapsedGroups.zlevels ? styles.collapsed : ''}`}
              onClick={() => toggleGroupCollapse('zlevels')}
            >
              <span className={styles.buttonGroupLabel}>Z-Levels</span>
              <span className={styles.collapseIcon}>
                {collapsedGroups.zlevels ? '▶' : '▼'}
              </span>
            </div>
            {!collapsedGroups.zlevels && (
              <div className={styles.buttonGroupContent}>
                <button 
                  style={unifiedButtonStyle}
                  onClick={() => setShowZLevelManager(!showZLevelManager)}
                  title="Z-Level Manager"
                >
                  MANAGER
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: currentZLevel === 0 ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                  }}
                  onClick={() => switchToZLevel(0)}
                  title="Switch to Ground Level (Z=0)"
                >
                  Z0
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: currentZLevel === 1 ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                  }}
                  onClick={() => switchToZLevel(1)}
                  title="Switch to Level 1 (Z=1)"
                >
                  Z1
                </button>
                <button 
                  style={{
                    ...unifiedButtonStyle,
                    background: currentZLevel === 2 ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)'
                  }}
                  onClick={() => switchToZLevel(2)}
                  title="Switch to Level 2 (Z=2)"
                >
                  Z2
                </button>
              </div>
            )}
          </div>
        </div>
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
            <button onClick={saveLevelDirectly}>Save Level</button>
            <button onClick={openRenameDialog}>Rename Level</button>
            <button onClick={() => setShowAtlasEditor(true)}>Atlas Editor</button>
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

      {/* Reset Terrain Confirmation Dialog */}
      {showResetConfirmation && (
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
                onClick={() => setShowResetConfirmation(false)}
                style={unifiedButtonStyle}
              >
                Cancel
              </button>
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

      {/* Rename Dialog */}
      {showRenameDialog && (
        <div className={styles.renameDialog}>
          <div className={styles.renameDialogContent}>
            <h4>Rename Level</h4>
            <input
              type="text"
              value={levelNameInput}
              onChange={(e) => setLevelNameInput(e.target.value)}
              placeholder="Enter level name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renameLevel(levelNameInput);
                } else if (e.key === 'Escape') {
                  setShowRenameDialog(false);
                  setLevelNameInput('');
                }
              }}
              autoFocus
            />
            <div className={styles.renameDialogActions}>
              <button onClick={() => renameLevel(levelNameInput)}>Rename</button>
              <button onClick={() => {
                setShowRenameDialog(false);
                setLevelNameInput('');
              }}>Cancel</button>
            </div>
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
        </div>
      )}

      {/* Loading Overlay */}
      {(!isLoaded || !tileSheetLoaded) && (
        <div className={styles.loadingOverlay}>
          {!isLoaded ? 'Loading Optimized Sanctuary...' : 'Loading Tile Sheet...'}
        </div>
      )}

      {/* Height Map Display */}
      {showHeightMap && currentHeightMap && (
        <div className={styles.heightMapDisplay}>
          <div className={styles.heightMapHeader}>
            <h4>Height Map Preview</h4>
            <button onClick={() => setShowHeightMap(false)}>✕</button>
          </div>
          <div className={styles.heightMapInfo}>
            <div>Size: {currentHeightMap.width} x {currentHeightMap.height}</div>
            <div>Height Range: {currentHeightMap.minHeight} - {currentHeightMap.maxHeight}</div>
            <div>Seed: {currentHeightMap.seed}</div>
          </div>
          <div className={styles.heightMapCanvas}>
            <canvas
              width={currentHeightMap.width * 2}
              height={currentHeightMap.height * 2}
              style={{
                imageRendering: 'pixelated',
                border: '1px solid var(--color-border-primary)',
                background: '#000'
              }}
              ref={(canvas) => {
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    // Render height map as grayscale
                    const imageData = ctx.createImageData(currentHeightMap.width, currentHeightMap.height);
                    for (let y = 0; y < currentHeightMap.height; y++) {
                      for (let x = 0; x < currentHeightMap.width; x++) {
                        const height = currentHeightMap.data[y][x];
                        const normalizedHeight = (height - currentHeightMap.minHeight) / (currentHeightMap.maxHeight - currentHeightMap.minHeight);
                        const pixelIndex = (y * currentHeightMap.width + x) * 4;
                        const grayValue = Math.floor(normalizedHeight * 255);
                        imageData.data[pixelIndex] = grayValue;     // R
                        imageData.data[pixelIndex + 1] = grayValue; // G
                        imageData.data[pixelIndex + 2] = grayValue; // B
                        imageData.data[pixelIndex + 3] = 255;       // A
                      }
                    }
                    ctx.putImageData(imageData, 0, 0);
                    // Scale up the canvas
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(canvas, 0, 0, currentHeightMap.width, currentHeightMap.height, 0, 0, canvas.width, canvas.height);
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Z-Level Manager */}
      {showZLevelManager && (
        <div className={styles.zLevelManager}>
          <div className={styles.zLevelManagerHeader}>
            <h4>Z-Level Manager</h4>
            <button onClick={() => setShowZLevelManager(false)}>✕</button>
          </div>
          <div className={styles.zLevelManagerContent}>
            <div className={styles.zLevelList}>
              {zLevelManager.getAllLevels().map(level => (
                <div key={level.level} className={styles.zLevelItem}>
                  <div className={styles.zLevelInfo}>
                    <span className={styles.zLevelName}>Z{level.level}: {level.name}</span>
                    <span className={styles.zLevelCount}>{level.blockCount} blocks</span>
                  </div>
                  <div className={styles.zLevelActions}>
                    <button
                      style={{
                        ...unifiedButtonStyle,
                        background: level.isVisible ? 'var(--color-accent-gold)' : 'var(--color-accent-beaver)',
                        fontSize: '10px',
                        padding: '2px 4px'
                      }}
                      onClick={() => toggleZLevelVisibility(level.level)}
                      title={level.isVisible ? 'Hide Level' : 'Show Level'}
                    >
                      {level.isVisible ? '👁️' : '🙈'}
                    </button>
                    <button
                      style={{
                        ...unifiedButtonStyle,
                        background: level.isLocked ? 'var(--color-error)' : 'var(--color-accent-beaver)',
                        fontSize: '10px',
                        padding: '2px 4px'
                      }}
                      onClick={() => toggleZLevelLock(level.level)}
                      title={level.isLocked ? 'Unlock Level' : 'Lock Level'}
                    >
                      {level.isLocked ? '🔒' : '🔓'}
                    </button>
                    {level.level !== 0 && (
                      <button
                        style={{
                          ...unifiedButtonStyle,
                          background: 'var(--color-error)',
                          fontSize: '10px',
                          padding: '2px 4px'
                        }}
                        onClick={() => removeZLevel(level.level)}
                        title="Remove Level"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.zLevelActions}>
              <button
                style={unifiedButtonStyle}
                onClick={() => {
                  const newLevel = zLevelManager.getMaxLevel() + 1;
                  addZLevel(newLevel, `Level ${newLevel}`, `Z-level ${newLevel}`);
                }}
                title="Add New Z-Level"
              >
                ADD LEVEL
              </button>
              <button
                style={unifiedButtonStyle}
                onClick={updateZLevelBlockCounts}
                title="Update Block Counts"
              >
                UPDATE COUNTS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Atlas Editor */}
      <AtlasEditor 
        isOpen={showAtlasEditor}
        onClose={() => setShowAtlasEditor(false)}
      />
    </div>
  );
});

Sanctuary.displayName = 'Sanctuary';

export default Sanctuary; 