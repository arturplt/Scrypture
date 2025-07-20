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
    randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
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
    localStorageMock.clear();
  });

  describe('Storage Availability', () => {
    test('should detect when localStorage is available', () => {
      localStorageMock.setItem.mockImplementation(() => {});
      localStorageMock.removeItem.mockImplementation(() => {});
      
      // Recreate service to test availability check
      const service = (storageService as any).constructor.getInstance();
      expect(service).toBeDefined();
    });

    test('should handle when localStorage is not available', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });
      
      // Recreate service to test unavailability
      const service = (storageService as any).constructor.getInstance();
      expect(service).toBeDefined();
    });
  });

  describe('Task Operations', () => {
    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      priority: 'medium',
      category: 'work',
    };

    test('should save and retrieve tasks', () => {
      const tasks = [mockTask];
      
      const saveResult = storageService.saveTasks(tasks);
      expect(saveResult).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'scrypture_tasks',
        JSON.stringify(tasks)
      );

      localStorageMock.getItem.mockReturnValue(JSON.stringify(tasks));
      const retrievedTasks = storageService.getTasks();
      
      expect(retrievedTasks).toHaveLength(1);
      expect(retrievedTasks[0].id).toBe('1');
      expect(retrievedTasks[0].title).toBe('Test Task');
    });

    test('should handle empty tasks array', () => {
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

      localStorageMock.getItem.mockReturnValue(JSON.stringify([invalidTask]));
      const retrievedTasks = storageService.getTasks();
      
      // Should filter out invalid tasks
      expect(retrievedTasks).toEqual([]);
    });

    test('should handle corrupted task data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      const retrievedTasks = storageService.getTasks();
      
      expect(retrievedTasks).toEqual([]);
    });

    test('should handle localStorage errors during save', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const saveResult = storageService.saveTasks([mockTask]);
      expect(saveResult).toBe(false);
    });

    test('should handle localStorage errors during retrieval', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const retrievedTasks = storageService.getTasks();
      expect(retrievedTasks).toEqual([]);
    });
  });

  describe('Habit Operations', () => {
    const mockHabit: Habit = {
      id: '1',
      name: 'Daily Exercise',
      description: 'Exercise daily',
      streak: 5,
      lastCompleted: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      targetFrequency: 'daily',
    };

    test('should save and retrieve habits', () => {
      const habits = [mockHabit];
      
      const saveResult = storageService.saveHabits(habits);
      expect(saveResult).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'scrypture_habits',
        JSON.stringify(habits)
      );

      localStorageMock.getItem.mockReturnValue(JSON.stringify(habits));
      const retrievedHabits = storageService.getHabits();
      
      expect(retrievedHabits).toHaveLength(1);
      expect(retrievedHabits[0].id).toBe('1');
      expect(retrievedHabits[0].name).toBe('Daily Exercise');
    });

    test('should handle habit with no lastCompleted date', () => {
      const habitWithoutLastCompleted = {
        ...mockHabit,
        lastCompleted: undefined,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([habitWithoutLastCompleted]));
      const retrievedHabits = storageService.getHabits();
      
      expect(retrievedHabits).toHaveLength(1);
      expect(retrievedHabits[0].lastCompleted).toBeUndefined();
    });

    test('should validate habit data structure', () => {
      const invalidHabit = {
        id: '1',
        name: 'Test Habit',
        // Missing required fields
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([invalidHabit]));
      const retrievedHabits = storageService.getHabits();
      
      // Should filter out invalid habits
      expect(retrievedHabits).toEqual([]);
    });
  });

  describe('User Operations', () => {
    test('should save and retrieve user data', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        body: 0,
        mind: 0,
        soul: 0,
        achievements: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      localStorageMock.setItem.mockReturnValue(undefined);

      const saveResult = storageService.saveUser(mockUser);
      expect(saveResult).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('scrypture_user', JSON.stringify(mockUser));

      const retrievedUser = storageService.getUser();
      expect(retrievedUser).toEqual(mockUser);
    });

    test('should handle null user data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storageService.getUser();
      expect(result).toBeNull();
    });

    test('should handle user with achievements', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [
          {
            id: 'achievement1',
            name: 'First Task',
            description: 'Complete your first task',
            unlockedAt: new Date('2024-01-01')
          }
        ]
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      const retrievedUser = storageService.getUser();
      expect(retrievedUser?.achievements).toHaveLength(1);
      expect(retrievedUser?.achievements[0].id).toBe('achievement1');
    });
  });

  describe('Settings Operations', () => {
    test('should save and retrieve settings', () => {
      const settings = { theme: 'dark', notifications: true };
      
      const saveResult = storageService.saveSettings(settings);
      expect(saveResult).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'scrypture_settings',
        JSON.stringify(settings)
      );

      localStorageMock.getItem.mockReturnValue(JSON.stringify(settings));
      const retrievedSettings = storageService.getSettings();
      
      expect(retrievedSettings).toEqual(settings);
    });

    test('should return empty object for no settings', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const retrievedSettings = storageService.getSettings();
      
      expect(retrievedSettings).toEqual({});
    });
  });

  describe('Backup and Restore', () => {
    test('should create backup with all data', () => {
      const mockTasks = [{ id: '1', title: 'Test Task' } as Task];
      const mockHabits = [{ id: '1', name: 'Test Habit' } as Habit];
      const mockUser = { 
        id: '1', 
        name: 'Test User',
        level: 1,
        experience: 0,
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      } as User;
      const mockSettings = { theme: 'dark' };

      // Mock the getter methods
      jest.spyOn(storageService, 'getTasks').mockReturnValue(mockTasks);
      jest.spyOn(storageService, 'getHabits').mockReturnValue(mockHabits);
      jest.spyOn(storageService, 'getUser').mockReturnValue(mockUser);
      jest.spyOn(storageService, 'getSettings').mockReturnValue(mockSettings);

      const backup = storageService.createBackup();
      
      expect(backup.tasks).toEqual(mockTasks);
      expect(backup.habits).toEqual(mockHabits);
      expect(backup.user).toEqual(mockUser);
      expect(backup.settings).toEqual(mockSettings);
      expect(backup.timestamp).toBeDefined();
      expect(backup.version).toBe('1.0.0');
    });

    test('should save and retrieve backup', () => {
      const backup = {
        tasks: [],
        habits: [],
        user: null,
        settings: {},
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      const saveResult = storageService.saveBackup(backup);
      expect(saveResult).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'scrypture_backup',
        JSON.stringify(backup)
      );

      localStorageMock.getItem.mockReturnValue(JSON.stringify(backup));
      const retrievedBackup = storageService.getBackup();
      
      expect(retrievedBackup).toEqual(backup);
    });

    test('should restore from backup', () => {
      const backup = {
        tasks: [{ id: '1', title: 'Test Task' } as Task],
        habits: [{ id: '1', name: 'Test Habit' } as Habit],
        user: { 
          id: '1', 
          name: 'Test User',
          level: 1,
          experience: 0,
          body: 0,
          mind: 0,
          soul: 0,
          achievements: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        } as User,
        settings: { theme: 'dark' },
      };

      const restoreResult = storageService.restoreFromBackup(backup);
      expect(restoreResult).toBe(true);
      
      // Should have called save methods for each data type
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(4);
    });

    test('should handle restore with partial backup data', () => {
      const partialBackup = {
        tasks: [{ id: '1', title: 'Test Task' } as Task],
        // Missing other data types
      };

      const restoreResult = storageService.restoreFromBackup(partialBackup);
      expect(restoreResult).toBe(true);
    });
  });

  describe('Data Export and Import', () => {
    test('should export data as JSON string', () => {
      const mockData = {
        tasks: [{ id: '1', title: 'Test Task' } as Task],
        habits: [{ id: '1', name: 'Test Habit' } as Habit],
        user: { 
          id: '1', 
          name: 'Test User',
          level: 1,
          experience: 0,
          body: 0,
          mind: 0,
          soul: 0,
          achievements: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        } as User,
        settings: { theme: 'dark' },
      };

      jest.spyOn(storageService, 'createBackup').mockReturnValue(mockData);

      const exportedData = storageService.exportData();
      
      expect(typeof exportedData).toBe('string');
      const parsedData = JSON.parse(exportedData);
      // Compare everything except timestamps which are serialized as strings
      expect(parsedData.tasks).toEqual(mockData.tasks);
      expect(parsedData.habits).toEqual(mockData.habits);
      expect(parsedData.settings).toEqual(mockData.settings);
      // For user, compare individual fields except timestamps
      expect(parsedData.user.id).toBe(mockData.user.id);
      expect(parsedData.user.name).toBe(mockData.user.name);
      expect(parsedData.user.level).toBe(mockData.user.level);
      expect(parsedData.user.experience).toBe(mockData.user.experience);
      expect(parsedData.user.body).toBe(mockData.user.body);
      expect(parsedData.user.mind).toBe(mockData.user.mind);
      expect(parsedData.user.soul).toBe(mockData.user.soul);
      expect(parsedData.user.achievements).toEqual(mockData.user.achievements);
    });

    test('should import valid JSON data', () => {
      const mockData = {
        tasks: [{ id: '1', title: 'Test Task' } as Task],
        habits: [{ id: '1', name: 'Test Habit' } as Habit],
        user: { 
          id: '1', 
          name: 'Test User',
          level: 1,
          experience: 0,
          body: 0,
          mind: 0,
          soul: 0,
          achievements: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        } as User,
        settings: { theme: 'dark' },
      };

      const jsonData = JSON.stringify(mockData);
      const importResult = storageService.importData(jsonData);
      
      expect(importResult).toBe(true);
    });

    test('should handle invalid JSON import', () => {
      const invalidJson = 'invalid json data';
      const importResult = storageService.importData(invalidJson);
      
      expect(importResult).toBe(false);
    });
  });

  describe('Storage Statistics', () => {
    test('should calculate storage usage', () => {
      // Mock localStorage to return substantial data
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'scrypture_tasks') return JSON.stringify([
          { id: '1', title: 'Test Task', description: 'A test task', completed: false, createdAt: new Date(), updatedAt: new Date(), priority: 'medium', category: 'body' },
          { id: '2', title: 'Another Task', description: 'Another test task', completed: true, createdAt: new Date(), updatedAt: new Date(), priority: 'high', category: 'mind' }
        ]);
        if (key === 'scrypture_habits') return JSON.stringify([
          { id: '1', name: 'Test Habit', description: 'A test habit', streak: 5, targetFrequency: 'daily', createdAt: new Date() },
          { id: '2', name: 'Another Habit', description: 'Another test habit', streak: 3, targetFrequency: 'weekly', createdAt: new Date() }
        ]);
        if (key === 'scrypture_user') return JSON.stringify({ 
          id: '1', 
          name: 'Test User',
          level: 1,
          experience: 0,
          body: 0,
          mind: 0,
          soul: 0,
          achievements: [],
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date('2024-01-01').toISOString()
        });
        if (key === 'scrypture_settings') return JSON.stringify({ theme: 'dark', notifications: true, autoSave: true });
        return null;
      });

      const stats = storageService.getStorageStats();
      
      expect(stats.used).toBeGreaterThan(0);
      expect(stats.available).toBe(5 * 1024 * 1024); // 5MB
      expect(stats.percentage).toBeGreaterThan(0);
    });

    test('should handle storage unavailability in stats', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const stats = storageService.getStorageStats();
      
      expect(stats.used).toBe(0);
      expect(stats.available).toBe(0);
      expect(stats.percentage).toBe(0);
    });
  });

  describe('Data Clearing', () => {
    test('should clear all data', () => {
      const clearResult = storageService.clearAllData();
      
      expect(clearResult).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(6); // All storage keys
    });

    test('should handle clear errors', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Clear error');
      });

      const clearResult = storageService.clearAllData();
      
      expect(clearResult).toBe(false);
    });
  });
}); 