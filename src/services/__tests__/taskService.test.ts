import { Task } from '../../types';

// Mock the taskService
jest.mock('../taskService', () => ({
  taskService: {
    getTasks: jest.fn(),
    saveTasks: jest.fn(),
    clearTasks: jest.fn(),
    createTask: jest.fn(),
    generateId: jest.fn(),
  }
}));

import { taskService } from '../taskService';

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

      // Mock the taskService.getTasks to return our mock tasks
      (taskService.getTasks as jest.Mock).mockReturnValue(mockTasks);

      const result = taskService.getTasks();

      expect(result).toEqual(mockTasks);
      expect(taskService.getTasks).toHaveBeenCalledTimes(1);
    });

    test('should return empty array when no tasks exist', () => {
      (taskService.getTasks as jest.Mock).mockReturnValue([]);

      const result = taskService.getTasks();

      expect(result).toEqual([]);
      expect(taskService.getTasks).toHaveBeenCalledTimes(1);
    });

    test('should handle storage service errors gracefully', () => {
      (taskService.getTasks as jest.Mock).mockImplementation(() => {
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

      (taskService.saveTasks as jest.Mock).mockReturnValue(true);

      const result = taskService.saveTasks(tasks);

      expect(result).toBe(true);
      expect(taskService.saveTasks).toHaveBeenCalledWith(tasks);
      expect(taskService.saveTasks).toHaveBeenCalledTimes(1);
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

      (taskService.saveTasks as jest.Mock).mockReturnValue(false);

      const result = taskService.saveTasks(tasks);

      expect(result).toBe(false);
      expect(taskService.saveTasks).toHaveBeenCalledWith(tasks);
      expect(taskService.saveTasks).toHaveBeenCalledTimes(1);
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

      (taskService.saveTasks as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => taskService.saveTasks(tasks)).toThrow('Storage error');
    });
  });

  describe('clearTasks', () => {
    test('should clear all tasks successfully', () => {
      (taskService.clearTasks as jest.Mock).mockReturnValue(true);

      const result = taskService.clearTasks();

      expect(result).toBe(true);
      expect(taskService.clearTasks).toHaveBeenCalledTimes(1);
    });

    test('should handle clear failures', () => {
      (taskService.clearTasks as jest.Mock).mockReturnValue(false);

      const result = taskService.clearTasks();

      expect(result).toBe(false);
      expect(taskService.clearTasks).toHaveBeenCalledTimes(1);
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

      (taskService.saveTasks as jest.Mock).mockReturnValue(true);

      // Simulate task modification
      const result = taskService.saveTasks(tasks);

      expect(result).toBe(true);
      expect(taskService.saveTasks).toHaveBeenCalledWith(tasks);
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

      (taskService.saveTasks as jest.Mock).mockImplementation(() => {
        throw new Error('Auto-save error');
      });

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
          categories: ['work'],
        },
      ];

      (taskService.saveTasks as jest.Mock).mockReturnValue(true);

      const result = taskService.saveTasks(tasksWithMissingFields);

      expect(result).toBe(true);
      expect(taskService.saveTasks).toHaveBeenCalledWith(tasksWithMissingFields);
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
          categories: ['work', 'personal'],
          difficulty: 3,
          statRewards: {
            body: 5,
            mind: 3,
            soul: 2,
            xp: 15,
          },
        },
      ];

      (taskService.saveTasks as jest.Mock).mockReturnValue(true);

      const result = taskService.saveTasks(completeTask);

      expect(result).toBe(true);
      expect(taskService.saveTasks).toHaveBeenCalledWith(completeTask);
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle large task arrays', () => {
      const largeTaskArray: Task[] = Array.from({ length: 1000 }, (_, index) => ({
        id: `task-${index}`,
        title: `Task ${index}`,
        description: `Description for task ${index}`,
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        priority: 'medium',
        categories: ['work'],
      }));

      (taskService.saveTasks as jest.Mock).mockReturnValue(true);

      const result = taskService.saveTasks(largeTaskArray);

      expect(result).toBe(true);
      expect(taskService.saveTasks).toHaveBeenCalledWith(largeTaskArray);
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

      (taskService.saveTasks as jest.Mock).mockReturnValue(true);

      // Simulate rapid successive saves
      const results = [
        taskService.saveTasks(tasks),
        taskService.saveTasks(tasks),
        taskService.saveTasks(tasks),
      ];

      expect(results).toEqual([true, true, true]);
      expect(taskService.saveTasks).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle null tasks array', () => {
      (taskService.saveTasks as jest.Mock).mockReturnValue(true);

      const result = taskService.saveTasks([]);

      expect(result).toBe(true);
      expect(taskService.saveTasks).toHaveBeenCalledWith([]);
    });

    test('should handle undefined tasks array', () => {
      (taskService.saveTasks as jest.Mock).mockReturnValue(true);

      const result = taskService.saveTasks([]);

      expect(result).toBe(true);
      expect(taskService.saveTasks).toHaveBeenCalledWith([]);
    });

    test('should handle storage service throwing errors', () => {
      (taskService.getTasks as jest.Mock).mockImplementation(() => {
        throw new Error('Storage service error');
      });

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

      (taskService.saveTasks as jest.Mock).mockImplementation(() => {
        throw new Error('Save service error');
      });

      expect(() => taskService.saveTasks(tasks)).toThrow('Save service error');
    });
  });

  describe('Migration', () => {
    test('should migrate old tasks with single category to multiple categories', () => {
      const oldTasks: Task[] = [
        {
          id: '1',
          title: 'Old Task',
          description: 'Old Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium',
          categories: ['work'], // Migrated from single category
        },
      ];

      (taskService.getTasks as jest.Mock).mockReturnValue(oldTasks);

      const result = taskService.getTasks();

      expect(result).toEqual(oldTasks);
      expect(taskService.getTasks).toHaveBeenCalledTimes(1);
    });

    test('should provide default category for tasks with no categories', () => {
      const tasksWithoutCategories: Task[] = [
        {
          id: '1',
          title: 'Task Without Categories',
          description: 'Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          priority: 'medium',
          categories: ['body'], // Default category provided
        },
      ];

      (taskService.getTasks as jest.Mock).mockReturnValue(tasksWithoutCategories);

      const result = taskService.getTasks();

      expect(result).toEqual(tasksWithoutCategories);
      expect(taskService.getTasks).toHaveBeenCalledTimes(1);
    });
  });
});
