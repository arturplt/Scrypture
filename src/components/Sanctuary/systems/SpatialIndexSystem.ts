import { Block } from '../types';

export interface SpatialIndexConfig {
  cellSize: number;
  maxBlocksPerCell: number;
  enableSubdivision: boolean;
}

export class SpatialIndex {
  private grid = new Map<string, Block[]>();
  private config: SpatialIndexConfig;
  private stats = {
    totalCells: 0,
    totalBlocks: 0,
    averageBlocksPerCell: 0,
    lastUpdate: 0
  };

  constructor(config: Partial<SpatialIndexConfig> = {}) {
    this.config = {
      cellSize: 64, // Increased from 32 for better performance
      maxBlocksPerCell: 100,
      enableSubdivision: true,
      ...config
    };
  }

  private getCellKey(x: number, y: number, z: number): string {
    const cellX = Math.floor(x / this.config.cellSize);
    const cellY = Math.floor(y / this.config.cellSize);
    const cellZ = Math.floor(z / this.config.cellSize);
    return `${cellX},${cellY},${cellZ}`;
  }

  /**
   * Add a block to the spatial index
   */
  addBlock(block: Block): void {
    const key = this.getCellKey(block.position.x, block.position.y, block.position.z);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
      this.stats.totalCells++;
    }
    
    const cell = this.grid.get(key)!;
    cell.push(block);
    this.stats.totalBlocks++;
    
    // Subdivide cell if it has too many blocks
    if (this.config.enableSubdivision && cell.length > this.config.maxBlocksPerCell) {
      this.subdivideCell(key, cell);
    }
  }

  /**
   * Remove a block from the spatial index
   */
  removeBlock(block: Block): void {
    const key = this.getCellKey(block.position.x, block.position.y, block.position.z);
    const cell = this.grid.get(key);
    if (cell) {
      const index = cell.findIndex(b => b.id === block.id);
      if (index !== -1) {
        cell.splice(index, 1);
        this.stats.totalBlocks--;
        
        if (cell.length === 0) {
          this.grid.delete(key);
          this.stats.totalCells--;
        }
      }
    }
  }

  /**
   * Get blocks in a specific area with optimized radius-based query
   */
  getBlocksInArea(x: number, y: number, z: number, radius: number): Block[] {
    const blocks: Block[] = [];
    const centerCell = this.getCellKey(x, y, z);
    const [centerX, centerY, centerZ] = centerCell.split(',').map(Number);
    
    // Calculate how many cells to check based on radius
    const cellsToCheck = Math.ceil(radius / this.config.cellSize);
    
    // Check surrounding cells
    for (let dx = -cellsToCheck; dx <= cellsToCheck; dx++) {
      for (let dy = -cellsToCheck; dy <= cellsToCheck; dy++) {
        for (let dz = -cellsToCheck; dz <= cellsToCheck; dz++) {
          const cellKey = `${centerX + dx},${centerY + dy},${centerZ + dz}`;
          const cellBlocks = this.grid.get(cellKey) || [];
          
          // Filter blocks within the actual radius
          const radiusSquared = radius * radius;
          const filteredBlocks = cellBlocks.filter(block => {
            const dx = block.position.x - x;
            const dy = block.position.y - y;
            const dz = block.position.z - z;
            return (dx * dx + dy * dy + dz * dz) <= radiusSquared;
          });
          
          blocks.push(...filteredBlocks);
        }
      }
    }
    
    return blocks;
  }

  /**
   * Get blocks within a frustum for culling optimization
   */
  getBlocksInFrustum(bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  }): Block[] {
    const blocks: Block[] = [];
    
    // Calculate cell range for the frustum
    const minCellX = Math.floor(bounds.minX / this.config.cellSize);
    const maxCellX = Math.floor(bounds.maxX / this.config.cellSize);
    const minCellY = Math.floor(bounds.minY / this.config.cellSize);
    const maxCellY = Math.floor(bounds.maxY / this.config.cellSize);
    const minCellZ = Math.floor(bounds.minZ / this.config.cellSize);
    const maxCellZ = Math.floor(bounds.maxZ / this.config.cellSize);
    
    // Iterate through cells in the frustum
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ++) {
          const cellKey = `${cellX},${cellY},${cellZ}`;
          const cellBlocks = this.grid.get(cellKey) || [];
          
          // Filter blocks within the exact frustum bounds
          const filteredBlocks = cellBlocks.filter(block => {
            return block.position.x >= bounds.minX && block.position.x <= bounds.maxX &&
                   block.position.y >= bounds.minY && block.position.y <= bounds.maxY &&
                   block.position.z >= bounds.minZ && block.position.z <= bounds.maxZ;
          });
          
          blocks.push(...filteredBlocks);
        }
      }
    }
    
    return blocks;
  }

  /**
   * Get a block at a specific position
   */
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

  /**
   * Get all blocks in the spatial index
   */
  getAllBlocks(): Block[] {
    const allBlocks: Block[] = [];
    this.grid.forEach(cellBlocks => {
      allBlocks.push(...cellBlocks);
    });
    return allBlocks;
  }

  /**
   * Clear all blocks from the spatial index
   */
  clear(): void {
    this.grid.clear();
    this.stats.totalCells = 0;
    this.stats.totalBlocks = 0;
    this.stats.averageBlocksPerCell = 0;
  }

  /**
   * Get spatial index statistics
   */
  getStats() {
    this.stats.averageBlocksPerCell = this.stats.totalCells > 0 
      ? this.stats.totalBlocks / this.stats.totalCells 
      : 0;
    this.stats.lastUpdate = Date.now();
    return { ...this.stats };
  }

  /**
   * Subdivide a cell that has too many blocks
   */
  private subdivideCell(cellKey: string, cellBlocks: Block[]): void {
    const [cellX, cellY, cellZ] = cellKey.split(',').map(Number);
    const halfCellSize = this.config.cellSize / 2;
    
    // Create subcells
    const subcells = new Map<string, Block[]>();
    
    cellBlocks.forEach(block => {
      const subX = Math.floor(block.position.x / halfCellSize);
      const subY = Math.floor(block.position.y / halfCellSize);
      const subZ = Math.floor(block.position.z / halfCellSize);
      const subKey = `${subX},${subY},${subZ}`;
      
      if (!subcells.has(subKey)) {
        subcells.set(subKey, []);
      }
      subcells.get(subKey)!.push(block);
    });
    
    // Replace the original cell with subcells
    this.grid.delete(cellKey);
    this.stats.totalCells--;
    
    subcells.forEach((blocks, subKey) => {
      this.grid.set(subKey, blocks);
      this.stats.totalCells++;
    });
  }

  /**
   * Optimize the spatial index by merging sparse cells
   */
  optimize(): void {
    const cellsToMerge: string[] = [];
    
    this.grid.forEach((blocks, key) => {
      if (blocks.length < this.config.maxBlocksPerCell / 4) {
        cellsToMerge.push(key);
      }
    });
    
    // Merge sparse cells with their neighbors
    cellsToMerge.forEach(cellKey => {
      this.mergeWithNeighbors(cellKey);
    });
  }

  /**
   * Merge a cell with its neighbors if they're sparse
   */
  private mergeWithNeighbors(cellKey: string): void {
    const [cellX, cellY, cellZ] = cellKey.split(',').map(Number);
    const cellBlocks = this.grid.get(cellKey);
    
    if (!cellBlocks || cellBlocks.length === 0) return;
    
    // Check neighbors and merge if possible
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          
          const neighborKey = `${cellX + dx},${cellY + dy},${cellZ + dz}`;
          const neighborBlocks = this.grid.get(neighborKey);
          
          if (neighborBlocks && 
              cellBlocks.length + neighborBlocks.length <= this.config.maxBlocksPerCell) {
            // Merge cells
            cellBlocks.push(...neighborBlocks);
            this.grid.delete(neighborKey);
            this.stats.totalCells--;
          }
        }
      }
    }
  }
} 