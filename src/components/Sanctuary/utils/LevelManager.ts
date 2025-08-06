import { Level } from '../types';

export class LevelManager {
  private static STORAGE_KEY = 'sanctuary_levels';

  static saveLevel(level: Level): void {
    try {
      const levels = this.getAllLevels();
      const existingIndex = levels.findIndex(l => l.id === level.id);
      
      if (existingIndex >= 0) {
        levels[existingIndex] = level;
      } else {
        levels.push(level);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(levels));
    } catch (error) {
      console.error('Failed to save level:', error);
    }
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
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredLevels));
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