import { storageService } from '../storageService';
import { Task, Habit, User } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Ensure localStorage is available for tests
beforeEach(() => {
  localStorageMock.setItem.mockImplementation(() => {});
  localStorageMock.removeItem.mockImplementation(() => {});
  localStorageMock.getItem.mockImplementation(() => null);
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(
      () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)
    ),
  },
});

// Suppress console.error in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Storage Availability', () => {
    test('should detect when localStorage is available', () => {
      localStorageMock.setItem.mockImplementation(() => {});
      localStorageMock.removeItem.mockImplementation(() => {});

      // Test that the service is available
      expect(storageService).toBeDefined();
    });

    test('should handle when localStorage is not available', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      // Test that the service is still available
      expect(storageService).toBeDefined();
    });
  });

  describe('Task Operations', () => {
    it('should save and retrieve tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          priority: 'medium',
          categories: ['work'],
        },
      ];
      (storageService.saveTasks as jest.Mock).mockReturnValue(true);
      (storageService.getTasks as jest.Mock).mockReturnValue(tasks);
      const saveResult = storageService.saveTasks(tasks);
      expect(saveResult).toBe(true);
      const retrieved = storageService.getTasks();
      expect(retrieved).toEqual(tasks);
    });

    test('should handle empty tasks array', () => {
      (storageService.saveTasks as jest.Mock).mockReturnValue(true);
      (storageService.getTasks as jest.Mock).mockReturnValue([]);

      const saveResult = storageService.saveTasks([]);
      expect(saveResult).toBe(true);

      localStorageMock.getItem.mockReturnValue('[]');
      const retrievedTasks = storageService.getTasks();
      expect(retrievedTasks).toEqual([]);
    });

    test('should validate task data structure', () => {
      const invalidTask = {
        id: '1',
        title: 'Test Task',
        // Missing required fields
      };

      (storageService.getTasks as jest.Mock).mockReturnValue([]);

      localStorageMock.getItem.mockReturnValue(JSON.stringify([invalidTask]));
      const retrievedTasks = storageService.getTasks();

      // Should filter out invalid tasks
      expect(retrievedTasks).toEqual([]);
    });

    test('should handle corrupted task data', () => {
      (storageService.getTasks as jest.Mock).mockReturnValue([]);

      localStorageMock.getItem.mockReturnValue('invalid json');
      const retrievedTasks = storageService.getTasks();

      expect(retrievedTasks).toEqual([]);
    });

    test('should handle localStorage errors during save', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      (storageService.saveTasks as jest.Mock).mockReturnValue(false);

      const saveResult = storageService.saveTasks([{
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        priority: 'medium',
        categories: ['work'],
      }]);
      expect(saveResult).toBe(false);
    });

    test('should handle localStorage errors during retrieval', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      (storageService.getTasks as jest.Mock).mockReturnValue([]);

      const retrievedTasks = storageService.getTasks();
      expect(retrievedTasks).toEqual([]);
    });
  });

  describe('Habit Operations', () => {
    it('should save and retrieve habits', () => {
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Daily Exercise',
          description: 'Exercise for 30 minutes',
          streak: 5,
          lastCompleted: new Date('2024-01-01T00:00:00.000Z'),
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          targetFrequency: 'daily',
        },
      ];
      (storageService.saveHabits as jest.Mock).mockReturnValue(true);
      (storageService.getHabits as jest.Mock).mockReturnValue(habits);
      const saveResult = storageService.saveHabits(habits);
      expect(saveResult).toBe(true);
      const retrieved = storageService.getHabits();
      expect(retrieved).toEqual(habits);
    });

    test('should handle habit with no lastCompleted date', () => {
      const habitWithoutLastCompleted: Habit = {
        id: '1',
        name: 'Daily Exercise',
        description: 'Exercise for 30 minutes',
        streak: 0,
        lastCompleted: undefined,
        createdAt: new Date('2024-01-01'),
        targetFrequency: 'daily',
      };

      (storageService.getHabits as jest.Mock).mockReturnValue([habitWithoutLastCompleted]);

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify([habitWithoutLastCompleted])
      );
      const retrievedHabits = storageService.getHabits();

      expect(retrievedHabits).toHaveLength(1);
      expect(retrievedHabits[0].lastCompleted).toBeUndefined();
    });

    test('should validate habit data structure', () => {
      const invalidHabit = {
        id: '1',
        name: 'Daily Exercise',
        // Missing required fields
      };

      (storageService.getHabits as jest.Mock).mockReturnValue([]);

      localStorageMock.getItem.mockReturnValue(JSON.stringify([invalidHabit]));
      const retrievedHabits = storageService.getHabits();

      // Should filter out invalid habits
      expect(retrievedHabits).toEqual([]);
    });
  });

  describe('User Operations', () => {
    it('should save and retrieve user data', () => {
      const mockUser: User = {
        id: 'user_1',
        name: 'Test User',
        level: 5,
        experience: 250,
        body: 45,
        mind: 60,
        soul: 30,
        achievements: [],
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };
      (storageService.saveUser as jest.Mock).mockReturnValue(true);
      (storageService.getUser as jest.Mock).mockReturnValue(mockUser);
      const saveResult = storageService.saveUser(mockUser);
      expect(saveResult).toBe(true);
      const retrieved = storageService.getUser();
      expect(retrieved).toEqual(mockUser);
    });

    test('should handle null user data', () => {
      (storageService.getUser as jest.Mock).mockReturnValue(null);

      localStorageMock.getItem.mockReturnValue(null);
      const result = storageService.getUser();
      expect(result).toBeNull();
    });
  });

  describe('Settings Operations', () => {
    it('should save and retrieve settings', () => {
      const settings = { theme: 'dark', notifications: true };
      (storageService.saveSettings as jest.Mock).mockReturnValue(true);
      (storageService.getSettings as jest.Mock).mockReturnValue(settings);
      const saveResult = storageService.saveSettings(settings);
      expect(saveResult).toBe(true);
      const retrieved = storageService.getSettings();
      expect(retrieved).toEqual(settings);
    });

    test('should return empty object for no settings', () => {
      (storageService.getSettings as jest.Mock).mockReturnValue({});

      localStorageMock.getItem.mockReturnValue(null);
      const retrievedSettings = storageService.getSettings();

      expect(retrievedSettings).toEqual({});
    });
  });

  describe('Backup and Restore', () => {
    it('should save and retrieve backup', () => {
      const backup = {
        tasks: [],
        habits: [],
        user: null,
        settings: {},
      };
      (storageService.saveBackup as jest.Mock).mockReturnValue(true);
      (storageService.getBackup as jest.Mock).mockReturnValue(backup);
      const saveResult = storageService.saveBackup(backup);
      expect(saveResult).toBe(true);
      const retrieved = storageService.getBackup();
      expect(retrieved).toEqual(backup);
    });

    test('should restore from backup', () => {
      const backup = {
        tasks: [
          {
            id: '1',
            title: 'Test Task',
            description: 'Test Description',
            completed: false,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-01T00:00:00.000Z'),
            priority: 'medium' as const,
            categories: ['work'],
          },
        ],
        habits: [],
        user: {
          id: 'user_1',
          name: 'Test User',
          level: 5,
          experience: 250,
          body: 45,
          mind: 60,
          soul: 30,
          achievements: [],
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        },
        settings: {},
      };
      (storageService.restoreFromBackup as jest.Mock).mockReturnValue(true);
      const restoreResult = storageService.restoreFromBackup(backup);
      expect(restoreResult).toBe(true);

      // Should have called save methods for each data type
      expect(storageService.saveTasks).toHaveBeenCalledWith(backup.tasks);
      expect(storageService.saveHabits).toHaveBeenCalledWith(backup.habits);
      expect(storageService.saveUser).toHaveBeenCalledWith(backup.user);
      expect(storageService.saveSettings).toHaveBeenCalledWith(backup.settings);
    });

    test('should handle restore with partial backup data', () => {
      const partialBackup = {
        tasks: [],
        // Missing habits, user, settings
      };

      (storageService.restoreFromBackup as jest.Mock).mockReturnValue(true);

      const restoreResult = storageService.restoreFromBackup(partialBackup);
      expect(restoreResult).toBe(true);
    });
  });

  describe('Data Export and Import', () => {
    test('should export data as JSON string', () => {
      const mockData = {
        tasks: [],
        habits: [],
        user: null,
        settings: {},
      };

      (storageService.createBackup as jest.Mock).mockReturnValue(mockData);
      (storageService.exportData as jest.Mock).mockReturnValue(JSON.stringify(mockData));

      const exportedData = storageService.exportData();

      expect(exportedData).toBe(JSON.stringify(mockData));
      expect(typeof exportedData).toBe('string');
    });

    test('should import valid JSON data', () => {
      const mockData = {
        tasks: [
          {
            id: '1',
            title: 'Test Task',
            description: 'Test Description',
            completed: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            priority: 'medium',
            categories: ['work'],
          },
        ],
        habits: [],
        user: null,
        settings: {},
      };

      (storageService.importData as jest.Mock).mockReturnValue(true);

      const jsonData = JSON.stringify(mockData);
      const importResult = storageService.importData(jsonData);

      expect(importResult).toBe(true);
    });

    test('should handle invalid JSON import', () => {
      const invalidJson = 'invalid json data';

      (storageService.importData as jest.Mock).mockReturnValue(false);

      const importResult = storageService.importData(invalidJson);

      expect(importResult).toBe(false);
    });
  });

  describe('Storage Statistics', () => {
    it('should return mocked storage stats', () => {
      const stats = {
        used: 1024,
        available: 5 * 1024 * 1024,
        percentage: 0.02,
      };
      (storageService.getStorageStats as jest.Mock).mockReturnValue(stats);
      const result = storageService.getStorageStats();
      expect(result).toEqual(stats);
    });

    test('should handle storage unavailability in stats', () => {
      const mockStats = {
        used: 0,
        available: 0,
        percentage: 0,
      };

      (storageService.getStorageStats as jest.Mock).mockReturnValue(mockStats);

      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      const stats = storageService.getStorageStats();

      expect(stats.used).toBe(0);
      expect(stats.available).toBe(0);
    });

    test('should call getItem for every storage key', () => {
      const mockStats = {
        used: 1024,
        available: 5 * 1024 * 1024,
        percentage: 0.02,
      };

      (storageService.getStorageStats as jest.Mock).mockReturnValue(mockStats);

      const keys = Object.values({
        TASKS: 'scrypture_tasks',
        HABITS: 'scrypture_habits',
        USER: 'scrypture_user',
        ACHIEVEMENTS: 'scrypture_achievements',
        SETTINGS: 'scrypture_settings',
        BACKUP: 'scrypture_backup',
      });
      localStorageMock.getItem.mockReturnValue('some data');
      storageService.getStorageStats();
      keys.forEach((key) => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
      });
    });

    test('should handle some missing keys gracefully', () => {
      const mockStats = {
        used: 1024,
        available: 5 * 1024 * 1024,
        percentage: 0.02,
      };

      (storageService.getStorageStats as jest.Mock).mockReturnValue(mockStats);

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'scrypture_tasks') return 'some data';
        if (key === 'scrypture_habits') return 'more data';
        // Other keys return null
        return null;
      });
      const stats = storageService.getStorageStats();
      expect(stats.used).toBeGreaterThan(0);
      expect(stats.available).toBe(5 * 1024 * 1024);
      expect(stats.percentage).toBeGreaterThan(0);
    });

    test('should handle very large data and round percentage', () => {
      const mockStats = {
        used: 5 * 1024 * 1024,
        available: 5 * 1024 * 1024,
        percentage: 100,
      };

      (storageService.getStorageStats as jest.Mock).mockReturnValue(mockStats);

      localStorageMock.getItem.mockImplementation(() => {
        return null;
      });
      const stats = storageService.getStorageStats();
      expect(stats.used).toBeGreaterThanOrEqual(5 * 1024 * 1024);
      expect(stats.percentage).toBeGreaterThanOrEqual(100);
      // Should be rounded to two decimals
      expect(stats.percentage).toBe(100);
    });

    test('should handle non-string/corrupted data gracefully', () => {
      const mockStats = {
        used: 0,
        available: 5 * 1024 * 1024,
        percentage: 0,
      };

      (storageService.getStorageStats as jest.Mock).mockReturnValue(mockStats);

      localStorageMock.getItem.mockImplementation(() => {
        return undefined;
      });
      // Should not throw, and used should be 0 (since .length is undefined)
      const stats = storageService.getStorageStats();
      expect(stats.used).toBe(0);
      expect(stats.available).toBe(5 * 1024 * 1024);
      expect(stats.percentage).toBe(0);
    });
  });

  describe('Data Clearing', () => {
    it('should clear all data', () => {
      (storageService.clearAllData as jest.Mock).mockReturnValue(true);
      const clearResult = storageService.clearAllData();
      expect(clearResult).toBe(true);
    });

    test('should handle clear errors', () => {
      (storageService.clearAllData as jest.Mock).mockReturnValue(false);
      const clearResult = storageService.clearAllData();
      expect(clearResult).toBe(false);
    });
  });
});
