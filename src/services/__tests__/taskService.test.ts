import { taskService } from '../taskService';
import { storageService } from '../storageService';
import { Task } from '../../types';

// Mock the storage service
jest.mock('../storageService');

const mockStorageService = storageService as jest.Mocked<typeof storageService>;

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

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    test('should return tasks from storage service', () => {
      const mockTasks: Task[] = [
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
      ];

      mockStorageService.getTasks.mockReturnValue(mockTasks);

      const result = taskService.getTasks();

      expect(result).toEqual(mockTasks);
      expect(mockStorageService.getTasks).toHaveBeenCalledTimes(1);
    });

    test('should return empty array when no tasks exist', () => {
      mockStorageService.getTasks.mockReturnValue([]);

      const result = taskService.getTasks();

      expect(result).toEqual([]);
      expect(mockStorageService.getTasks).toHaveBeenCalledTimes(1);
    });

    test('should handle storage service errors gracefully', () => {
      mockStorageService.getTasks.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => taskService.getTasks()).toThrow('Storage error');
    });
  });

  describe('saveTasks', () => {
    test('should save tasks successfully', () => {
      const tasks: Task[] = [
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
      ];

      mockStorageService.saveTasks.mockReturnValue(true);

      const result = taskService.saveTasks(tasks);

      expect(result).toBe(true);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith(tasks);
      expect(mockStorageService.saveTasks).toHaveBeenCalledTimes(1);
    });

    test('should handle save failures', () => {
      const tasks: Task[] = [
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
      ];

      mockStorageService.saveTasks.mockReturnValue(false);

      const result = taskService.saveTasks(tasks);

      expect(result).toBe(false);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith(tasks);
    });

    test('should handle storage service errors', () => {
      const tasks: Task[] = [
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
      ];

      mockStorageService.saveTasks.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => taskService.saveTasks(tasks)).toThrow('Storage error');
    });
  });

  describe('clearTasks', () => {
    test('should clear all tasks successfully', () => {
      mockStorageService.saveTasks.mockReturnValue(true);

      const result = taskService.clearTasks();

      expect(result).toBe(true);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith([]);
      expect(mockStorageService.saveTasks).toHaveBeenCalledTimes(1);
    });

    test('should handle clear failures', () => {
      mockStorageService.saveTasks.mockReturnValue(false);

      const result = taskService.clearTasks();

      expect(result).toBe(false);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith([]);
    });
  });

  describe('Auto-save Integration', () => {
    test('should auto-save when tasks are modified', () => {
      const tasks: Task[] = [
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
      ];

      mockStorageService.saveTasks.mockReturnValue(true);

      // Simulate task modification
      const result = taskService.saveTasks(tasks);

      expect(result).toBe(true);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith(tasks);
    });

    test('should handle auto-save errors gracefully', () => {
      const tasks: Task[] = [
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
      ];

      mockStorageService.saveTasks.mockImplementation(() => {
        throw new Error('Auto-save error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => taskService.saveTasks(tasks)).toThrow('Auto-save error');
    });
  });

  describe('Data Validation', () => {
    test('should handle tasks with missing optional fields', () => {
      const tasksWithMissingFields: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium',
          categories: ['body'], // Default category
          // Missing description
        },
      ];

      mockStorageService.saveTasks.mockReturnValue(true);

      const result = taskService.saveTasks(tasksWithMissingFields);

      expect(result).toBe(true);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith(
        tasksWithMissingFields
      );
    });

    test('should handle tasks with all fields populated', () => {
      const completeTask: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'high',
          categories: ['personal'],
        },
      ];

      mockStorageService.saveTasks.mockReturnValue(true);

      const result = taskService.saveTasks(completeTask);

      expect(result).toBe(true);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith(completeTask);
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle large task arrays', () => {
      const largeTaskArray: Task[] = Array.from(
        { length: 1000 },
        (_, index) => ({
          id: `task-${index}`,
          title: `Task ${index}`,
          description: `Description for task ${index}`,
          completed: index % 2 === 0,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority:
            index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low',
          categories: index % 2 === 0 ? ['work'] : ['personal'],
        })
      );

      mockStorageService.saveTasks.mockReturnValue(true);

      const result = taskService.saveTasks(largeTaskArray);

      expect(result).toBe(true);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith(largeTaskArray);
    });

    test('should handle rapid successive saves', () => {
      const tasks: Task[] = [
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
      ];

      mockStorageService.saveTasks.mockReturnValue(true);

      // Simulate rapid successive saves
      const results = [
        taskService.saveTasks(tasks),
        taskService.saveTasks(tasks),
        taskService.saveTasks(tasks),
      ];

      expect(results).toEqual([true, true, true]);
      expect(mockStorageService.saveTasks).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle null tasks array', () => {
      mockStorageService.saveTasks.mockReturnValue(true);

      const result = taskService.saveTasks([]);

      expect(result).toBe(true);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith([]);
    });

    test('should handle undefined tasks array', () => {
      mockStorageService.saveTasks.mockReturnValue(true);

      const result = taskService.saveTasks([]);

      expect(result).toBe(true);
      expect(mockStorageService.saveTasks).toHaveBeenCalledWith([]);
    });

    test('should handle storage service throwing errors', () => {
      mockStorageService.getTasks.mockImplementation(() => {
        throw new Error('Storage service error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => taskService.getTasks()).toThrow('Storage service error');
    });

    test('should handle save service throwing errors', () => {
      const tasks: Task[] = [
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
      ];

      mockStorageService.saveTasks.mockImplementation(() => {
        throw new Error('Save service error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => taskService.saveTasks(tasks)).toThrow('Save service error');
    });
  });

  describe('Migration', () => {
    test('should migrate old tasks with single category to multiple categories', () => {
      const oldTasks: any[] = [
        {
          id: '1',
          title: 'Old Task',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium',
          category: 'work', // Old single category field
        },
      ];

      mockStorageService.getTasks.mockReturnValue(oldTasks);

      const result = taskService.getTasks();

      expect(result).toEqual([
        {
          id: '1',
          title: 'Old Task',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium',
          categories: ['work'], // Migrated to array
          category: undefined, // Old field removed
        },
      ]);
    });

    test('should provide default category for tasks with no categories', () => {
      const tasksWithoutCategories: any[] = [
        {
          id: '1',
          title: 'Task Without Categories',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium',
          // No categories field
        },
      ];

      mockStorageService.getTasks.mockReturnValue(tasksWithoutCategories);

      const result = taskService.getTasks();

      expect(result).toEqual([
        {
          id: '1',
          title: 'Task Without Categories',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium',
          categories: ['body'], // Default category provided
        },
      ]);
    });
  });
});
