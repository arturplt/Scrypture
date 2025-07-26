import { StorageService } from '../storageService';
import { Task, User, Habit } from '../../types';

// Create test-specific storage keys
const TEST_STORAGE_KEYS = {
  TASKS: 'test_scrypture_tasks',
  USER: 'test_scrypture_user',
  SETTINGS: 'test_scrypture_settings',
  HABITS: 'test_scrypture_habits',
  STATS: 'test_scrypture_stats',
  CATEGORIES: 'test_scrypture_categories',
  ACHIEVEMENTS: 'test_scrypture_achievements',
  BACKUPS: 'test_scrypture_backups'
};

describe('StorageService', () => {
  let storageService: StorageService;

  // Helper function to clear all test data
  const clearAllTestData = () => {
    Object.values(TEST_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  beforeEach(() => {
    // Clear all test data before each test
    clearAllTestData();
    
    // Reset singleton instance
    (StorageService as any).instance = undefined;
    
    // Get fresh instance
    storageService = StorageService.getInstance();
  });

  afterEach(() => {
    // Clean up test data after each test
    clearAllTestData();
    (StorageService as any).instance = undefined;
  });

  describe('Basic Operations', () => {
    it('should set and get generic items', () => {
      const key = 'test_key';
      const value = 'test_value';

      const setResult = storageService.setGenericItem(key, value);
      const getResult = storageService.getGenericItem(key);

      expect(setResult).toBe(true);
      expect(getResult).toBe(value);
    });

    it('should return null for non-existent items', () => {
      const result = storageService.getGenericItem('non_existent_key');
      expect(result).toBeNull();
    });

    it('should remove generic items', () => {
      const key = 'test_key';
      const value = 'test_value';

      storageService.setGenericItem(key, value);
      const removeResult = storageService.removeGenericItem(key);
      const getResult = storageService.getGenericItem(key);

      expect(removeResult).toBe(true);
      expect(getResult).toBeNull();
    });

    it('should clear all data', () => {
      // Set some scrypture-specific data
      const testTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        priority: 'medium' as const,
        difficulty: 2,
        categories: ['test'],
        statRewards: { mind: 1, xp: 10 }
      };
      
      const testUser: User = {
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
      };

      storageService.saveTasks([testTask]);
      storageService.saveUser(testUser);

      // Clear all data
      const result = storageService.clearAllData();

      expect(result).toBe(true);
      // Verify scrypture data is cleared
      expect(storageService.getTasks()).toEqual([]);
      expect(storageService.getUser()).toBeNull();
    });
  });

  describe('Task Operations', () => {
    it('should save and get tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium' as const,
          difficulty: 2,
          categories: ['test'],
          statRewards: { mind: 1, xp: 10 }
        },
        {
          id: '2',
          title: 'Another Task',
          description: 'Another Description',
          completed: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          priority: 'high' as const,
          difficulty: 3,
          categories: ['test2'],
          statRewards: { body: 1, xp: 15 }
        }
      ];

      // Use test storage keys by mocking localStorage
      const originalSetItem = localStorage.setItem;
      const originalGetItem = localStorage.getItem;
      
      const mockStorage: { [key: string]: string } = {};
      
      localStorage.setItem = jest.fn((key: string, value: string) => {
        if (key === 'scrypture_tasks') {
          mockStorage[TEST_STORAGE_KEYS.TASKS] = value;
        } else {
          mockStorage[key] = value;
        }
      });
      
      localStorage.getItem = jest.fn((key: string) => {
        if (key === 'scrypture_tasks') {
          return mockStorage[TEST_STORAGE_KEYS.TASKS] || null;
        }
        return mockStorage[key] || null;
      });

      const saveResult = storageService.saveTasks(tasks);
      const getTasks = storageService.getTasks();

      expect(saveResult).toBe(true);
      expect(getTasks).toHaveLength(2);
      expect(getTasks[0].title).toBe('Test Task');
      expect(getTasks[1].title).toBe('Another Task');

      // Restore original methods
      localStorage.setItem = originalSetItem;
      localStorage.getItem = originalGetItem;
    });

    it('should return empty array when no tasks exist', () => {
      const result = storageService.getTasks();
      expect(result).toEqual([]);
    });

    it('should handle corrupted JSON data gracefully', () => {
      // Manually set corrupted data
      localStorage.setItem('scrypture_tasks', 'invalid json');

      const result = storageService.getTasks();
      expect(result).toEqual([]);
    });

    it('should filter out invalid task objects', () => {
      const mixedData = [
        {
          id: '1',
          title: 'Valid Task',
          description: 'Valid Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium' as const,
          difficulty: 2,
          categories: ['test'],
          statRewards: { mind: 1, xp: 10 }
        },
        { invalid: 'object' }, // Invalid task
        {
          id: '2',
          title: 'Another Valid Task',
          description: 'Another Valid Description',
          completed: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          priority: 'low' as const,
          difficulty: 1,
          categories: ['test2'],
          statRewards: { soul: 1, xp: 5 }
        }
      ];

      localStorage.setItem('scrypture_tasks', JSON.stringify(mixedData));

      const result = storageService.getTasks();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Valid Task');
      expect(result[1].title).toBe('Another Valid Task');
    });

    it('should handle invalid date strings', () => {
      const taskWithInvalidDate = {
        id: '1',
        title: 'Task with Invalid Date',
        createdAt: 'invalid-date',
        updatedAt: 'invalid-date'
      };

      localStorage.setItem('scrypture_tasks', JSON.stringify([taskWithInvalidDate]));

      const result = storageService.getTasks();
      expect(result).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow', () => {
      // Create test user
      const testUser: User = {
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
      };

      // Create test task
      const testTask: Task = {
        id: '1',
        title: 'Integration Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        priority: 'medium' as const,
        difficulty: 2,
        categories: ['integration'],
        statRewards: { mind: 1, xp: 10 }
      };

      // Save data
      storageService.saveUser(testUser);
      storageService.saveTasks([testTask]);

      // Retrieve data
      const retrievedUser = storageService.getUser();
      const retrievedTasks = storageService.getTasks();

      // Verify retrieval
      expect(retrievedUser?.name).toBe('Test User');
      expect(retrievedTasks).toHaveLength(1);
      expect(retrievedTasks[0].title).toBe('Integration Test Task');
    });

    it('should handle backup and restore', () => {
      // Create and save test data
      const testTasks: Task[] = [{
        id: '1',
        title: 'Backup Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        priority: 'medium' as const,
        difficulty: 2,
        categories: ['backup'],
        statRewards: { mind: 1, xp: 10 }
      }];

      storageService.saveTasks(testTasks);

      // Create backup
      const backup = storageService.createBackup();
      expect(backup).toBeDefined();

      // Clear data
      storageService.clearAllData();

      // Verify data is cleared
      expect(storageService.getTasks()).toEqual([]);

      // Restore from backup
      const restored = storageService.restoreFromBackup(backup);
      expect(restored).toBe(true);

      // Verify data is restored
      const restoredTasks = storageService.getTasks();
      expect(restoredTasks).toHaveLength(1);
      expect(restoredTasks[0].title).toBe('Backup Test Task');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      // Create large dataset
      const largeTasks: Task[] = Array.from({ length: 50 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: `Description ${i}`,
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        priority: 'medium' as const,
        difficulty: 2,
        categories: ['performance'],
        statRewards: { mind: 1, xp: 10 }
      }));

      const startTime = performance.now();
      storageService.saveTasks(largeTasks);
      const saveTime = performance.now() - startTime;

      const retrieveStartTime = performance.now();
      const retrievedTasks = storageService.getTasks();
      const retrieveTime = performance.now() - retrieveStartTime;

      expect(retrievedTasks).toHaveLength(50);
      expect(saveTime).toBeLessThan(100); // Should complete within 100ms
      expect(retrieveTime).toBeLessThan(50); // Should complete within 50ms
    });

    it('should handle corrupted data gracefully', () => {
      // Set corrupted data in multiple keys
      localStorage.setItem('scrypture_tasks', 'corrupted json');
      localStorage.setItem('scrypture_user', '{"incomplete": true');

      const result = storageService.getTasks();

      expect(result).toEqual([]);
    });
  });
});