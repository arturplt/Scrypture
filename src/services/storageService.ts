import { Task, Habit, User, Achievement } from '../types';

// Storage keys for different data types
export const STORAGE_KEYS = {
  TASKS: 'scrypture_tasks',
  HABITS: 'scrypture_habits',
  USER: 'scrypture_user',
  ACHIEVEMENTS: 'scrypture_achievements',
  SETTINGS: 'scrypture_settings',
  BACKUP: 'scrypture_backup',
} as const;

// Data validation schemas
const validateTask = (task: any): task is Task => {
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    task.createdAt instanceof Date &&
    task.updatedAt instanceof Date &&
    ['low', 'medium', 'high'].includes(task.priority)
  );
};

const validateHabit = (habit: any): habit is Habit => {
  return (
    typeof habit.id === 'string' &&
    typeof habit.name === 'string' &&
    typeof habit.streak === 'number' &&
    habit.createdAt instanceof Date &&
    ['daily', 'weekly', 'monthly'].includes(habit.targetFrequency)
  );
};

const validateUser = (user: any): user is User => {
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.level === 'number' &&
    typeof user.experience === 'number' &&
    typeof user.body === 'number' &&
    typeof user.mind === 'number' &&
    typeof user.soul === 'number' &&
    Array.isArray(user.achievements) &&
    user.createdAt instanceof Date &&
    user.updatedAt instanceof Date
  );
};

export class StorageService {
  private static instance: StorageService;
  private isAvailable: boolean;

  private constructor() {
    this.isAvailable = this.checkStorageAvailability();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private checkStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // Generic storage methods
  private getItem<T>(key: string): T | null {
    if (!this.isAvailable) {
      console.warn('Local storage is not available');
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      return parsed;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  private setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable) {
      console.warn('Local storage is not available');
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  private removeItem(key: string): boolean {
    if (!this.isAvailable) {
      console.warn('Local storage is not available');
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  // Task-specific methods
  getTasks(): Task[] {
    const tasks = this.getItem<any[]>(STORAGE_KEYS.TASKS);
    if (!tasks) return [];

    return tasks
      .map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }))
      .filter(validateTask);
  }

  saveTasks(tasks: Task[]): boolean {
    return this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  // Habit-specific methods
  getHabits(): Habit[] {
    const habits = this.getItem<any[]>(STORAGE_KEYS.HABITS);
    if (!habits) return [];

    return habits
      .map(habit => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        lastCompleted: habit.lastCompleted ? new Date(habit.lastCompleted) : undefined,
      }))
      .filter(validateHabit);
  }

  saveHabits(habits: Habit[]): boolean {
    return this.setItem(STORAGE_KEYS.HABITS, habits);
  }

  // User-specific methods
  getUser(): User | null {
    const user = this.getItem<any>(STORAGE_KEYS.USER);
    
    if (!user) return null;

    const processedUser = {
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      achievements: user.achievements.map((achievement: any) => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
      })),
    };
    
    return validateUser(processedUser) ? processedUser : null;
  }

  saveUser(user: User): boolean {
    return this.setItem(STORAGE_KEYS.USER, user);
  }

  // Settings methods
  getSettings(): Record<string, any> {
    return this.getItem<Record<string, any>>(STORAGE_KEYS.SETTINGS) || {};
  }

  saveSettings(settings: Record<string, any>): boolean {
    return this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // Generic storage methods
  getGenericItem<T>(key: string): T | null {
    return this.getItem<T>(key);
  }

  setGenericItem<T>(key: string, value: T): boolean {
    return this.setItem(key, value);
  }

  removeGenericItem(key: string): boolean {
    return this.removeItem(key);
  }

  // Backup and restore functionality
  createBackup(): Record<string, any> {
    return {
      tasks: this.getTasks(),
      habits: this.getHabits(),
      user: this.getUser(),
      settings: this.getSettings(),
      customCategories: this.getGenericItem('scrypture_custom_categories'),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  saveBackup(backup: Record<string, any>): boolean {
    return this.setItem(STORAGE_KEYS.BACKUP, backup);
  }

  getBackup(): Record<string, any> | null {
    return this.getItem<Record<string, any>>(STORAGE_KEYS.BACKUP);
  }

  restoreFromBackup(backup: Record<string, any>): boolean {
    try {
      if (backup.tasks) this.saveTasks(backup.tasks);
      if (backup.habits) this.saveHabits(backup.habits);
      if (backup.user) this.saveUser(backup.user);
      if (backup.settings) this.saveSettings(backup.settings);
      if (backup.customCategories) this.setGenericItem('scrypture_custom_categories', backup.customCategories);
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  // Data export/import
  exportData(): string {
    const data = this.createBackup();
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      return this.restoreFromBackup(data);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): boolean {
    const keys = Object.values(STORAGE_KEYS);
    let success = true;
    
    keys.forEach(key => {
      if (!this.removeItem(key)) {
        success = false;
      }
    });
    
    return success;
  }

  // Get storage usage statistics
  getStorageStats(): { used: number; available: number; percentage: number } {
    if (!this.isAvailable) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let totalSize = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (typeof item === 'string' && typeof item.length === 'number') {
          totalSize += item.length;
        }
      });

      // Estimate available storage (5MB is typical for localStorage)
      const available = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (totalSize / available) * 100;

      return {
        used: totalSize,
        available,
        percentage: Math.round(percentage * 100) / 100,
      };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance(); 