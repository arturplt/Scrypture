import { Level } from '../types';

export class LevelManager {
  private static STORAGE_KEY = 'sanctuary_levels';
  private static MAX_PRUNE_ATTEMPTS = 50; // safety cap

  private static trySaveLevelsWithPruning(levels: Level[]): void {
    // Attempt to persist, pruning oldest levels on quota errors
    // Work on a copy to avoid mutating caller arrays
    const working: Level[] = [...levels];
    let attempts = 0;
    // Sort by modifiedAt (oldest first). Ensure Date instances are handled.
    working.sort((a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime());

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(working));
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
        modifiedAt: new Date(level.modifiedAt)
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
      
      const levels = JSON.parse(stored);
      return levels.map((level: any) => ({
        ...level,
        createdAt: new Date(level.createdAt),
        modifiedAt: new Date(level.modifiedAt)
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