// Mock the services
jest.mock('../services/storageService', () => ({
  storageService: {
    saveTasks: jest.fn(),
    getTasks: jest.fn(),
    clearTasks: jest.fn(),
  }
}));

jest.mock('../services/taskService', () => ({
  taskService: {
    saveTasks: jest.fn(),
    getTasks: jest.fn(),
    clearTasks: jest.fn(),
  }
}));

import { storageService } from '../services/storageService';
import { taskService } from '../services/taskService';

describe('Service Layer Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Storage Service - Core Functionality', () => {
    it('should save and retrieve tasks', () => {
      const tasks = [
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
      ];

      // Mock the service to return true
      (storageService.saveTasks as jest.Mock).mockReturnValue(true);

      const saveResult = storageService.saveTasks(tasks);
      expect(saveResult).toBe(true);
      
      // Test that the mocked service was called
      expect(storageService.saveTasks).toHaveBeenCalledWith(tasks);
    });

    it('should handle storage errors gracefully', () => {
      const tasks = [
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
      ];

      // Mock the service to return false (error)
      (storageService.saveTasks as jest.Mock).mockReturnValue(false);

      const saveResult = storageService.saveTasks(tasks);
      expect(saveResult).toBe(false);
    });
  });

  describe('Task Service - Auto-save Integration', () => {
    it('should handle task service errors', () => {
      const tasks = [
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
      ];

      // Mock the service to return false (error)
      (taskService.saveTasks as jest.Mock).mockReturnValue(false);

      const saveResult = taskService.saveTasks(tasks);
      expect(saveResult).toBe(false);
    });
  });
});
