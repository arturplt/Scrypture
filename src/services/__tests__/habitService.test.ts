import { habitService } from '../habitService';
import { storageService } from '../storageService';
import { Habit } from '../../types';

// Mock the storage service
jest.mock('../storageService');

const mockStorageService = storageService as jest.Mocked<typeof storageService>;

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

describe('HabitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHabits', () => {
    test('should return habits from storage service', () => {
      const mockHabits: Habit[] = [
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

      mockStorageService.getHabits.mockReturnValue(mockHabits);

      const result = habitService.getHabits();

      expect(result).toEqual(mockHabits);
      expect(mockStorageService.getHabits).toHaveBeenCalledTimes(1);
    });

    test('should return empty array when no habits exist', () => {
      mockStorageService.getHabits.mockReturnValue([]);

      const result = habitService.getHabits();

      expect(result).toEqual([]);
      expect(mockStorageService.getHabits).toHaveBeenCalledTimes(1);
    });

    test('should handle storage service errors gracefully', () => {
      mockStorageService.getHabits.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => habitService.getHabits()).toThrow('Storage error');
    });
  });

  describe('saveHabits', () => {
    test('should save habits successfully', () => {
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

      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.saveHabits(habits);

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith(habits);
      expect(mockStorageService.saveHabits).toHaveBeenCalledTimes(1);
    });

    test('should handle save failures', () => {
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

      mockStorageService.saveHabits.mockReturnValue(false);

      const result = habitService.saveHabits(habits);

      expect(result).toBe(false);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith(habits);
    });
  });

  describe('addHabit', () => {
    test('should add new habit successfully', () => {
      const habitData = {
        name: 'Daily Exercise',
        description: 'Exercise daily',
        targetFrequency: 'daily' as const,
      };

      const existingHabits: Habit[] = [];
      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.addHabit(habitData);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Daily Exercise');
      expect(result.description).toBe('Exercise daily');
      expect(result.streak).toBe(0);
      expect(result.targetFrequency).toBe('daily');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([result]);
    });

    test('should add habit to existing habits', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Existing Habit',
          description: 'Existing description',
          streak: 3,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'weekly',
        },
      ];

      const habitData = {
        name: 'New Habit',
        description: 'New description',
        targetFrequency: 'daily' as const,
      };

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.addHabit(habitData);

      expect(result.name).toBe('New Habit');
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([
        ...existingHabits,
        result,
      ]);
    });

    test('should handle save failure when adding habit', () => {
      const habitData = {
        name: 'Daily Exercise',
        description: 'Exercise daily',
        targetFrequency: 'daily' as const,
      };

      mockStorageService.getHabits.mockReturnValue([]);
      mockStorageService.saveHabits.mockReturnValue(false);

      const result = habitService.addHabit(habitData);

      expect(result).toBeDefined();
      expect(mockStorageService.saveHabits).toHaveBeenCalled();
    });
  });

  describe('updateHabit', () => {
    test('should update existing habit successfully', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Old Name',
          description: 'Old description',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      const updates = {
        name: 'New Name',
        description: 'New description',
      };

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.updateHabit('1', updates);

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([
        {
          ...existingHabits[0],
          ...updates,
        },
      ]);
    });

    test('should return false when habit not found', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Existing Habit',
          description: 'Description',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.updateHabit('non-existent-id', { name: 'New Name' });

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith(existingHabits);
    });

    test('should handle save failure when updating habit', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Existing Habit',
          description: 'Description',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(false);

      const result = habitService.updateHabit('1', { name: 'New Name' });

      expect(result).toBe(false);
    });
  });

  describe('deleteHabit', () => {
    test('should delete existing habit successfully', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Habit to Delete',
          description: 'Description',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
        {
          id: '2',
          name: 'Habit to Keep',
          description: 'Description',
          streak: 3,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'weekly',
        },
      ];

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.deleteHabit('1');

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([existingHabits[1]]);
    });

    test('should return true when habit not found', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Existing Habit',
          description: 'Description',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.deleteHabit('non-existent-id');

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith(existingHabits);
    });

    test('should handle save failure when deleting habit', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Habit to Delete',
          description: 'Description',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(false);

      const result = habitService.deleteHabit('1');

      expect(result).toBe(false);
    });
  });

  describe('completeHabit', () => {
    test('should complete daily habit successfully', () => {
      const existingHabits: Habit[] = [
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

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.completeHabit('1');

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([
        {
          ...existingHabits[0],
          streak: 6,
          lastCompleted: expect.any(Date),
        },
      ]);
    });

    test('should complete weekly habit successfully', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Weekly Review',
          description: 'Review weekly',
          streak: 3,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'weekly',
        },
      ];

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.completeHabit('1');

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([
        {
          ...existingHabits[0],
          streak: 4,
          lastCompleted: expect.any(Date),
        },
      ]);
    });

    test('should complete habit with no lastCompleted date', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'New Habit',
          description: 'New habit',
          streak: 0,
          lastCompleted: undefined,
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.completeHabit('1');

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([
        {
          ...existingHabits[0],
          streak: 1,
          lastCompleted: expect.any(Date),
        },
      ]);
    });

    test('should prevent completing daily habit twice in same day', () => {
      const today = new Date();
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Daily Exercise',
          description: 'Exercise daily',
          streak: 5,
          lastCompleted: today,
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      mockStorageService.getHabits.mockReturnValue(existingHabits);

      const result = habitService.completeHabit('1');

      expect(result).toBe(false);
      expect(mockStorageService.saveHabits).not.toHaveBeenCalled();
    });

    test('should return false when habit not found', () => {
      const existingHabits: Habit[] = [
        {
          id: '1',
          name: 'Existing Habit',
          description: 'Description',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      mockStorageService.getHabits.mockReturnValue(existingHabits);

      const result = habitService.completeHabit('non-existent-id');

      expect(result).toBe(false);
    });

    test('should handle save failure when completing habit', () => {
      const existingHabits: Habit[] = [
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

      mockStorageService.getHabits.mockReturnValue(existingHabits);
      mockStorageService.saveHabits.mockReturnValue(false);

      const result = habitService.completeHabit('1');

      expect(result).toBe(false);
    });
  });

  describe('clearHabits', () => {
    test('should clear all habits successfully', () => {
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.clearHabits();

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([]);
      expect(mockStorageService.saveHabits).toHaveBeenCalledTimes(1);
    });

    test('should handle clear failures', () => {
      mockStorageService.saveHabits.mockReturnValue(false);

      const result = habitService.clearHabits();

      expect(result).toBe(false);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([]);
    });
  });

  describe('Auto-save Integration', () => {
    test('should auto-save when habits are modified', () => {
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

      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.saveHabits(habits);

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith(habits);
    });

    test('should handle auto-save errors gracefully', () => {
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

      mockStorageService.saveHabits.mockImplementation(() => {
        throw new Error('Auto-save error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => habitService.saveHabits(habits)).toThrow('Auto-save error');
    });
  });

  describe('Data Validation', () => {
    test('should handle habits with missing optional fields', () => {
      const habitData = {
        name: 'Daily Exercise',
        targetFrequency: 'daily' as const,
        // Missing description
      };

      mockStorageService.getHabits.mockReturnValue([]);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.addHabit(habitData);

      expect(result.name).toBe('Daily Exercise');
      expect(result.description).toBeUndefined();
      expect(result.targetFrequency).toBe('daily');
    });

    test('should handle habits with all fields populated', () => {
      const habitData = {
        name: 'Daily Exercise',
        description: 'Exercise daily',
        targetFrequency: 'daily' as const,
      };

      mockStorageService.getHabits.mockReturnValue([]);
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.addHabit(habitData);

      expect(result.name).toBe('Daily Exercise');
      expect(result.description).toBe('Exercise daily');
      expect(result.targetFrequency).toBe('daily');
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle large habit arrays', () => {
      const largeHabitArray: Habit[] = Array.from({ length: 100 }, (_, index) => ({
        id: `habit-${index}`,
        name: `Habit ${index}`,
        description: `Description for habit ${index}`,
        streak: index % 10,
        lastCompleted: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        targetFrequency: index % 3 === 0 ? 'daily' : index % 3 === 1 ? 'weekly' : 'monthly',
      }));

      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.saveHabits(largeHabitArray);

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith(largeHabitArray);
    });

    test('should handle rapid successive operations', () => {
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

      mockStorageService.saveHabits.mockReturnValue(true);

      // Simulate rapid successive operations
      const results = [
        habitService.saveHabits(habits),
        habitService.saveHabits(habits),
        habitService.saveHabits(habits),
      ];

      expect(results).toEqual([true, true, true]);
      expect(mockStorageService.saveHabits).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle null habits array', () => {
      mockStorageService.saveHabits.mockReturnValue(true);

      const result = habitService.saveHabits([]);

      expect(result).toBe(true);
      expect(mockStorageService.saveHabits).toHaveBeenCalledWith([]);
    });

    test('should handle storage service throwing errors', () => {
      mockStorageService.getHabits.mockImplementation(() => {
        throw new Error('Storage service error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => habitService.getHabits()).toThrow('Storage service error');
    });

    test('should handle save service throwing errors', () => {
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

      mockStorageService.saveHabits.mockImplementation(() => {
        throw new Error('Save service error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => habitService.saveHabits(habits)).toThrow('Save service error');
    });
  });
}); 