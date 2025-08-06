import { ZLevelInfo } from '../types';

export class ZLevelManager {
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