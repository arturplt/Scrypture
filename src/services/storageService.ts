import { Task, Habit, User } from '../types';

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
const validateTask = (task: unknown): task is Task => {
  return (
    typeof task === 'object' &&
    task !== null &&
    typeof (task as Task).id === 'string' &&
    typeof (task as Task).title === 'string' &&
    typeof (task as Task).completed === 'boolean' &&
    (task as Task).createdAt instanceof Date &&
    (task as Task).updatedAt instanceof Date &&
    ['low', 'medium', 'high'].includes((task as Task).priority)
  );
};

const validateHabit = (habit: unknown): habit is Habit => {
  return (
    typeof habit === 'object' &&
    habit !== null &&
    typeof (habit as Habit).id === 'string' &&
    typeof (habit as Habit).name === 'string' &&
    typeof (habit as Habit).streak === 'number' &&
    (habit as Habit).createdAt instanceof Date &&
    ['daily', 'weekly', 'monthly'].includes((habit as Habit).targetFrequency)
  );
};

const validateUser = (user: unknown): user is User => {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof (user as User).id === 'string' &&
    typeof (user as User).name === 'string' &&
    typeof (user as User).level === 'number' &&
    typeof (user as User).experience === 'number' &&
    typeof (user as User).body === 'number' &&
    typeof (user as User).mind === 'number' &&
    typeof (user as User).soul === 'number' &&
    Array.isArray((user as User).achievements) &&
    (user as User).createdAt instanceof Date &&
    (user as User).updatedAt instanceof Date
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
    const tasks = this.getItem<unknown[]>(STORAGE_KEYS.TASKS);
    if (!tasks) return [];

    return tasks
      .map((task) => ({
        ...(task as Record<string, unknown>),
        createdAt: new Date((task as Record<string, unknown>).createdAt as string),
        updatedAt: new Date((task as Record<string, unknown>).updatedAt as string),
      }))
      .filter(validateTask);
  }

  saveTasks(tasks: Task[]): boolean {
    return this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  // Habit-specific methods
  getHabits(): Habit[] {
    const habits = this.getItem<unknown[]>(STORAGE_KEYS.HABITS);
    if (!habits) return [];

    return habits
      .map((habit) => {
        const habitRecord = habit as Record<string, unknown>;
        return {
          ...habitRecord,
          createdAt: new Date(habitRecord.createdAt as string),
          lastCompleted: habitRecord.lastCompleted
            ? new Date(habitRecord.lastCompleted as string)
            : undefined,
        } as Habit;
      })
      .filter(validateHabit);
  }

  saveHabits(habits: Habit[]): boolean {
    return this.setItem(STORAGE_KEYS.HABITS, habits);
  }

  // User-specific methods
  getUser(): User | null {
    const user = this.getItem<unknown>(STORAGE_KEYS.USER);

    if (!user) return null;

    const userRecord = user as Record<string, unknown>;
    const processedUser = {
      ...userRecord,
      createdAt: new Date(userRecord.createdAt as string),
      updatedAt: new Date(userRecord.updatedAt as string),
      achievements: (userRecord.achievements as Record<string, unknown>[]).map((achievement: Record<string, unknown>) => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt
          ? new Date(achievement.unlockedAt as string)
          : undefined,
      })),
    } as User;

    return validateUser(processedUser) ? processedUser : null;
  }

  saveUser(user: User): boolean {
    return this.setItem(STORAGE_KEYS.USER, user);
  }

  // Settings methods
  getSettings(): Record<string, unknown> {
    return this.getItem<Record<string, unknown>>(STORAGE_KEYS.SETTINGS) || {};
  }

  saveSettings(settings: Record<string, unknown>): boolean {
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
  createBackup(): Record<string, unknown> {
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

  saveBackup(backup: Record<string, unknown>): boolean {
    return this.setItem(STORAGE_KEYS.BACKUP, backup);
  }

  getBackup(): Record<string, unknown> | null {
    return this.getItem<Record<string, unknown>>(STORAGE_KEYS.BACKUP);
  }

  restoreFromBackup(backup: Record<string, unknown>): boolean {
    try {
      if (backup.tasks && Array.isArray(backup.tasks)) {
        this.saveTasks(backup.tasks as Task[]);
      }
      if (backup.habits && Array.isArray(backup.habits)) {
        this.saveHabits(backup.habits as Habit[]);
      }
      if (backup.user && typeof backup.user === 'object') {
        this.saveUser(backup.user as User);
      }
      if (backup.settings && typeof backup.settings === 'object') {
        this.saveSettings(backup.settings as Record<string, unknown>);
      }
      if (backup.customCategories) {
        this.setGenericItem(
          'scrypture_custom_categories',
          backup.customCategories
        );
      }
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

    keys.forEach((key) => {
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
      Object.values(STORAGE_KEYS).forEach((key) => {
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
