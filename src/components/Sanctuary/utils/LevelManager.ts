import { Level } from '../types';

export class LevelManager {
  private static STORAGE_KEY = 'sanctuary_levels';
  private static MAX_PRUNE_ATTEMPTS = 50; // safety cap
  private static MAX_LEVELS_BEFORE_AGGRESSIVE_PRUNING = 10; // Start aggressive pruning when we have many levels
  private static MAX_STORAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit (increased from 4.5MB)

  // Compress block data by removing redundant information
  private static compressBlocks(blocks: any[]): any[] {
    return blocks.map(block => ({
      id: block.id,
      type: block.type,
      position: block.position,
      rotation: block.rotation,
      palette: block.palette,
      // Only store essential properties, omit defaults
      properties: {
        walkable: block.properties.walkable !== true ? false : undefined,
        climbable: block.properties.climbable || undefined,
        interactable: block.properties.interactable || undefined,
        destructible: block.properties.destructible !== true ? false : undefined,
      },
      // Store sprite data more efficiently
      sprite: {
        sourceX: block.sprite.sourceX,
        sourceY: block.sprite.sourceY,
        width: block.sprite.width,
        height: block.sprite.height,
        // Don't store sheetPath if it's the default
        sheetPath: block.sprite.sheetPath !== '/src/assets/tiles/isometric-tiles.png' ? block.sprite.sheetPath : undefined,
      }
    })).map(block => {
      // Remove undefined properties to save space
      const cleanBlock: any = { ...block };
      if (cleanBlock.properties) {
        Object.keys(cleanBlock.properties).forEach(key => {
          if (cleanBlock.properties[key] === undefined) {
            delete cleanBlock.properties[key];
          }
        });
        if (Object.keys(cleanBlock.properties).length === 0) {
          delete cleanBlock.properties;
        }
      }
      if (cleanBlock.sprite.sheetPath === undefined) {
        delete cleanBlock.sprite.sheetPath;
      }
      return cleanBlock;
    });
  }

  // Decompress block data by restoring defaults
  private static decompressBlocks(compressedBlocks: any[]): any[] {
    return compressedBlocks.map(block => ({
      id: block.id,
      type: block.type,
      position: block.position,
      rotation: block.rotation || 0,
      palette: block.palette || 'green',
      properties: {
        walkable: block.properties?.walkable !== false,
        climbable: block.properties?.climbable || false,
        interactable: block.properties?.interactable || false,
        destructible: block.properties?.destructible !== false,
      },
      sprite: {
        sourceX: block.sprite.sourceX,
        sourceY: block.sprite.sourceY,
        width: block.sprite.width,
        height: block.sprite.height,
        sheetPath: block.sprite.sheetPath || '/src/assets/tiles/isometric-tiles.png',
      }
    }));
  }

  // Estimate storage size of levels
  private static estimateStorageSize(levels: Level[]): number {
    const compressedLevels = levels.map(level => ({
      ...level,
      blocks: this.compressBlocks(level.blocks)
    }));
    return new Blob([JSON.stringify(compressedLevels)]).size;
  }

  // Smart pruning strategy that considers data size and level count
  private static smartPruning(levels: Level[]): Level[] {
    const working: Level[] = [...levels];
    
    // Sort by modifiedAt (oldest first)
    working.sort((a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime());
    
    // If we have too many levels, be more aggressive
    if (working.length > this.MAX_LEVELS_BEFORE_AGGRESSIVE_PRUNING) {
      // Remove levels until we're under the limit
      while (working.length > this.MAX_LEVELS_BEFORE_AGGRESSIVE_PRUNING) {
        const removed = working.shift();
        if (removed) {
          console.warn(`Storage quota reached. Removing level "${removed.name}" (${removed.blocks.length} blocks)`);
        }
      }
    }
    
    return working;
  }

  private static trySaveLevelsWithPruning(levels: Level[]): void {
    // Work on a copy to avoid mutating caller arrays
    let working: Level[] = [...levels];
    let attempts = 0;
    
    // Apply smart pruning first
    working = this.smartPruning(working);
    
    // Compress blocks to reduce storage size
    const compressedLevels = working.map(level => ({
      ...level,
      blocks: this.compressBlocks(level.blocks)
    }));

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const dataToStore = JSON.stringify(compressedLevels);
        const estimatedSize = new Blob([dataToStore]).size;
        
        // Check if we're approaching storage limits
        if (estimatedSize > this.MAX_STORAGE_SIZE_BYTES) {
          console.warn(`Estimated storage size (${(estimatedSize / 1024 / 1024).toFixed(2)}MB) exceeds limit. Pruning...`);
        }
        
        localStorage.setItem(this.STORAGE_KEY, dataToStore);
        return; // success
      } catch (err: any) {
        const isQuota = typeof err === 'object' && err !== null && (
          err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        );
        if (!isQuota) {
          throw err;
        }
        if (working.length <= 1 || attempts >= this.MAX_PRUNE_ATTEMPTS) {
          // Cannot prune further, rethrow for caller to handle
          throw err;
        }
        // Remove oldest level and retry
        const removed = working.shift();
        // Optional: log once in console to surface pruning
        if (removed && attempts === 0) {
          console.warn('Storage quota reached for sanctuary levels. Pruning oldest levels to free space...');
        }
        attempts += 1;
        
        // Re-compress after pruning
        const recompressedLevels = working.map(level => ({
          ...level,
          blocks: this.compressBlocks(level.blocks)
        }));
        working = recompressedLevels.map(level => ({
          ...level,
          blocks: this.decompressBlocks(level.blocks)
        }));
        
        continue;
      }
    }
  }

  static saveLevel(level: Level): void {
    const levels = this.getAllLevels();
    const existingIndex = levels.findIndex(l => l.id === level.id);
    
    if (existingIndex >= 0) {
      levels[existingIndex] = level;
    } else {
      levels.push(level);
    }
    
    // Try to save with pruning on quota exceed
    this.trySaveLevelsWithPruning(levels);
  }

  static loadLevel(levelId: string): Level | null {
    try {
      const levels = this.getAllLevels();
      const level = levels.find(l => l.id === levelId);
      return level ? {
        ...level,
        createdAt: new Date(level.createdAt),
        modifiedAt: new Date(level.modifiedAt),
        blocks: this.decompressBlocks(level.blocks)
      } : null;
    } catch (error) {
      console.error('Failed to load level:', error);
      return null;
    }
  }

  static getAllLevels(): Level[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const compressedLevels = JSON.parse(stored);
      return compressedLevels.map((level: any) => ({
        ...level,
        createdAt: new Date(level.createdAt),
        modifiedAt: new Date(level.modifiedAt),
        blocks: this.decompressBlocks(level.blocks)
      }));
    } catch (error) {
      console.error('Failed to load levels:', error);
      return [];
    }
  }

  static deleteLevel(levelId: string): boolean {
    try {
      const levels = this.getAllLevels();
      const filteredLevels = levels.filter(l => l.id !== levelId);
      this.trySaveLevelsWithPruning(filteredLevels);
      return true;
    } catch (error) {
      console.error('Failed to delete level:', error);
      return false;
    }
  }

  // Get storage statistics
  static getStorageStats(): { totalLevels: number; totalBlocks: number; estimatedSize: string; levels: Array<{ name: string; blocks: number; size: string }> } {
    try {
      const levels = this.getAllLevels();
      const totalBlocks = levels.reduce((sum, level) => sum + level.blocks.length, 0);
      const estimatedSize = this.estimateStorageSize(levels);
      
      const levelStats = levels.map(level => {
        const levelSize = this.estimateStorageSize([level]);
        return {
          name: level.name,
          blocks: level.blocks.length,
          size: `${(levelSize / 1024).toFixed(1)}KB`
        };
      });
      
      return {
        totalLevels: levels.length,
        totalBlocks,
        estimatedSize: `${(estimatedSize / 1024 / 1024).toFixed(2)}MB`,
        levels: levelStats
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { totalLevels: 0, totalBlocks: 0, estimatedSize: '0MB', levels: [] };
    }
  }

  // Clear all levels (emergency cleanup)
  static clearAllLevels(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('All sanctuary levels cleared');
    } catch (error) {
      console.error('Failed to clear levels:', error);
    }
  }

  static createNewLevel(name: string = 'New Level'): Level {
    return {
      id: `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: '',
      author: 'Unknown',
      createdAt: new Date(),
      modifiedAt: new Date(),
      blocks: [],
      camera: {
        position: { x: 0, y: 0, z: 0 },
        zoom: 1,
        rotation: 0
      },
      settings: {
        gravity: false
      }
    };
  }
} 