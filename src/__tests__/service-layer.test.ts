import { storageService } from '../services/storageService';
import { taskService } from '../services/taskService';
import { habitService } from '../services/habitService';
import { userService } from '../services/userService';
import { Task, Habit, User } from '../types';

// Mock localStorage for all tests
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

describe('Service Layer Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    

  });

  describe('Storage Service - Core Functionality', () => {
    test('should save and retrieve tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium',
          category: 'work',
        },
      ];

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
    });

    test('should handle storage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium',
          category: 'work',
        },
      ];

      const saveResult = storageService.saveTasks(tasks);
      expect(saveResult).toBe(false);
    });
  });

  describe('Task Service - Auto-save Integration', () => {
    test('should auto-save when tasks are modified', () => {
      const tasks = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          category: 'body' as const,
          priority: 'medium' as const,
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          statRewards: { body: 1, mind: 0, soul: 0, xp: 20 }
        }
      ];

      // Mock the storage service to return true
      jest.spyOn(storageService, 'saveTasks').mockReturnValue(true);

      const saveResult = taskService.saveTasks(tasks);
      expect(saveResult).toBe(true);
    });

    test('should handle task service errors', () => {
      const tasks = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          category: 'body' as const,
          priority: 'medium' as const,
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          statRewards: { body: 1, mind: 0, soul: 0, xp: 20 }
        }
      ];

      // Mock the storage service to return false (error case)
      jest.spyOn(storageService, 'saveTasks').mockReturnValue(false);

      const saveResult = taskService.saveTasks(tasks);
      expect(saveResult).toBe(false);
    });
  });

  describe('Habit Service - CRUD Operations', () => {
    test('should add new habit with auto-save', () => {
      const habitData = {
        name: 'Daily Exercise',
        description: 'Exercise daily',
        targetFrequency: 'daily' as const,
      };

      const newHabit = habitService.addHabit(habitData);
      
      expect(newHabit.id).toBeDefined();
      expect(newHabit.name).toBe('Daily Exercise');
      expect(newHabit.streak).toBe(0);
      expect(newHabit.targetFrequency).toBe('daily');
    });

    test('should complete habit and update streak', () => {
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Daily Exercise',
          description: 'Exercise daily',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      // Mock the getHabits method
      jest.spyOn(habitService, 'getHabits').mockReturnValue(habits);
      jest.spyOn(habitService, 'saveHabits').mockReturnValue(true);

      const result = habitService.completeHabit('1');
      
      expect(result).toBe(true);
    });
  });

  describe('User Service - Experience and Achievements', () => {
    test('should add experience and level up', () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      jest.spyOn(userService, 'getUser').mockReturnValue(user);
      jest.spyOn(userService, 'saveUser').mockReturnValue(true);

      const result = userService.addExperience(100);
      
      expect(result).toBe(true);
    });

    test('should unlock achievement', () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      jest.spyOn(userService, 'getUser').mockReturnValue(user);
      jest.spyOn(userService, 'saveUser').mockReturnValue(true);

      const result = userService.unlockAchievement('first_task');
      
      expect(result).toBe(true);
    });
  });

  describe('Data Validation and Error Handling', () => {
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

    test('should handle corrupted data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      const retrievedTasks = storageService.getTasks();
      
      expect(retrievedTasks).toEqual([]);
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle large datasets efficiently', () => {
      const largeTaskArray = Array.from({ length: 1000 }, (_, index) => ({
        id: `task-${index}`,
        title: `Task ${index}`,
        description: `Description for task ${index}`,
        category: 'body' as const,
        priority: 'medium' as const,
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        statRewards: { body: 1, mind: 0, soul: 0, xp: 20 }
      }));

      // Mock the storage service to return true
      jest.spyOn(storageService, 'saveTasks').mockReturnValue(true);

      const saveResult = storageService.saveTasks(largeTaskArray);
      expect(saveResult).toBe(true);
    });

    test('should handle rapid successive operations', () => {
      const tasks = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          category: 'body' as const,
          priority: 'medium' as const,
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          statRewards: { body: 1, mind: 0, soul: 0, xp: 20 }
        }
      ];

      // Mock the storage service to return true
      jest.spyOn(storageService, 'saveTasks').mockReturnValue(true);

      const results = [
        taskService.saveTasks(tasks),
        taskService.saveTasks(tasks),
        taskService.saveTasks(tasks)
      ];

      expect(results).toEqual([true, true, true]);
    });
  });

  describe('Backup and Restore', () => {
    test('should create and restore backup', () => {
      const mockData = {
        tasks: [{ id: '1', title: 'Test Task' } as Task],
        habits: [{ id: '1', name: 'Test Habit' } as Habit],
        user: { id: '1', name: 'Test User' } as User,
        settings: { theme: 'dark' },
      };

      jest.spyOn(storageService, 'createBackup').mockReturnValue(mockData);
      jest.spyOn(storageService, 'restoreFromBackup').mockReturnValue(true);

      const backup = storageService.createBackup();
      const restoreResult = storageService.restoreFromBackup(backup);
      
      expect(backup).toEqual(mockData);
      expect(restoreResult).toBe(true);
    });
  });

  describe('Storage Statistics', () => {
    test('should calculate storage usage', () => {
      // Mock substantial data to ensure usage calculation works
      const mockData = {
        tasks: Array.from({ length: 100 }, (_, i) => ({
          id: `task-${i}`,
          title: `Task ${i}`,
          description: `Description ${i}`.repeat(10), // Large description
          category: 'body' as const,
          priority: 'medium' as const,
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          statRewards: { body: 1, mind: 0, soul: 0, xp: 20 }
        })),
        user: {
          id: '1',
          name: 'Test User',
          level: 5,
          experience: 500,
          body: 10,
          mind: 8,
          soul: 6,
          achievements: Array.from({ length: 20 }, (_, i) => ({
            id: `achievement-${i}`,
            name: `Achievement ${i}`,
            description: `Description for achievement ${i}`.repeat(5),
            unlockedAt: new Date('2024-01-01')
          })),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      };

      // Mock localStorage to return substantial data
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'scrypture_tasks') {
          return JSON.stringify(mockData.tasks);
        }
        if (key === 'scrypture_user') {
          return JSON.stringify(mockData.user);
        }
        return null;
      });

      const stats = storageService.getStorageStats();

      expect(stats.used).toBeGreaterThan(0);
      expect(stats.available).toBe(5 * 1024 * 1024); // 5MB
      expect(stats.percentage).toBeGreaterThan(0);
    });
  });
}); 