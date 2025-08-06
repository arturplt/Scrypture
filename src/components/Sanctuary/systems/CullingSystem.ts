import { Block, Camera, ViewFrustum } from '../types';
import { SpatialIndex } from './SpatialIndexSystem';
import { WebGLUtils } from '../utils/WebGLUtils';

export class CullingSystem {
  private spatialIndex: SpatialIndex;
  private frustum: ViewFrustum;
  private isometricMatrix: Float32Array;
  private cullingEnabled: boolean = true;
  private maxRenderDistance: number = 200;
  private cullingStats = {
    totalBlocks: 0,
    culledBlocks: 0,
    visibleBlocks: 0,
    lastUpdate: 0
  };

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
    this.isometricMatrix = WebGLUtils.createIsometricMatrix();
  }

  /**
   * Update frustum based on camera position and canvas dimensions
   */
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

  /**
   * Get visible blocks with proper frustum culling
   */
  getVisibleBlocks(camera: Camera, maxDistance: number = this.maxRenderDistance): Block[] {
    const allBlocks = this.spatialIndex.getAllBlocks();
    this.cullingStats.totalBlocks = allBlocks.length;
    this.cullingStats.culledBlocks = 0;
    
    if (!this.cullingEnabled) {
      this.cullingStats.visibleBlocks = allBlocks.length;
      return allBlocks;
    }

    const visibleBlocks = allBlocks.filter(block => {
      // Frustum culling
      if (!this.isInFrustum(block, camera)) {
        this.cullingStats.culledBlocks++;
        return false;
      }
      
      // Distance culling
      const distance = this.getDistance(block, camera);
      if (distance > maxDistance) {
        this.cullingStats.culledBlocks++;
        return false;
      }
      
      return true;
    });

    this.cullingStats.visibleBlocks = visibleBlocks.length;
    this.cullingStats.lastUpdate = Date.now();
    
    return visibleBlocks;
  }

  /**
   * Enhanced frustum culling with isometric projection
   */
  private isInFrustum(block: Block, camera: Camera): boolean {
    const { x, y, z } = block.position;
    
    // Convert grid coordinates to world coordinates using isometric projection
    const worldPos = WebGLUtils.gridToWorld(x, y, z);
    
    // Apply camera transform
    const cameraX = worldPos.x - camera.position.x;
    const cameraY = worldPos.y - camera.position.y;
    const cameraZ = z - camera.position.z;
    
    // Check if the block's world position is within the frustum
    return cameraX >= this.frustum.left && cameraX <= this.frustum.right &&
           cameraY >= this.frustum.bottom && cameraY <= this.frustum.top &&
           cameraZ >= this.frustum.near && cameraZ <= this.frustum.far;
  }

  /**
   * Calculate distance from camera to block in world space
   */
  private getDistance(block: Block, camera: Camera): number {
    const { x, y, z } = block.position;
    const worldPos = WebGLUtils.gridToWorld(x, y, z);
    
    const dx = worldPos.x - camera.position.x;
    const dy = worldPos.y - camera.position.y;
    const dz = z - camera.position.z;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get visible area bounds in grid coordinates for spatial indexing optimization
   */
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
    
    // Calculate visible area in world coordinates
    const halfWidth = canvasWidth / (2 * zoom);
    const halfHeight = canvasHeight / (2 * zoom);
    
    const worldLeft = camera.position.x - halfWidth;
    const worldRight = camera.position.x + halfWidth;
    const worldTop = camera.position.y + halfHeight;
    const worldBottom = camera.position.y - halfHeight;
    
    // Convert world bounds to grid coordinates
    const gridBounds = this.worldBoundsToGridBounds(worldLeft, worldRight, worldTop, worldBottom);
    
    return {
      minX: gridBounds.minX - 10, // Add margin
      maxX: gridBounds.maxX + 10,
      minY: gridBounds.minY - 10,
      maxY: gridBounds.maxY + 10,
      minZ: 0,
      maxZ: 10
    };
  }

  /**
   * Convert world bounds to grid bounds using inverse isometric projection
   */
  private worldBoundsToGridBounds(
    worldLeft: number, 
    worldRight: number, 
    worldTop: number, 
    worldBottom: number
  ): { minX: number; maxX: number; minY: number; maxY: number } {
    const tileWidth = 32;
    const tileHeight = 16;
    
    // Convert world coordinates back to grid coordinates using WebGLUtils.worldToGrid
    // This ensures consistency with the corrected isometric projection
    const topLeft = WebGLUtils.worldToGrid(worldLeft, worldTop, 0, tileWidth, tileHeight);
    const topRight = WebGLUtils.worldToGrid(worldRight, worldTop, 0, tileWidth, tileHeight);
    const bottomLeft = WebGLUtils.worldToGrid(worldLeft, worldBottom, 0, tileWidth, tileHeight);
    const bottomRight = WebGLUtils.worldToGrid(worldRight, worldBottom, 0, tileWidth, tileHeight);
    
    // Find the bounding box of all four corners
    const minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    const maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    const minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
    const maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
    
    return {
      minX,
      maxX,
      minY,
      maxY
    };
  }

  /**
   * Get blocks in a specific area using spatial indexing
   */
  getBlocksInArea(x: number, y: number, z: number, radius: number): Block[] {
    return this.spatialIndex.getBlocksInArea(x, y, z, radius);
  }

  /**
   * Enable or disable culling for debugging
   */
  setCullingEnabled(enabled: boolean): void {
    this.cullingEnabled = enabled;
  }

  /**
   * Set maximum render distance
   */
  setMaxRenderDistance(distance: number): void {
    this.maxRenderDistance = distance;
  }

  /**
   * Get culling statistics for performance monitoring
   */
  getCullingStats() {
    return { ...this.cullingStats };
  }

  /**
   * Get frustum for debugging
   */
  getFrustum(): ViewFrustum {
    return { ...this.frustum };
  }
} 