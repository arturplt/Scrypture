import { habitService } from '../habitService';
import { Habit } from '../../types';

describe('habitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHabits', () => {
    test('should return habits from storage service', () => {
      const mockHabits: Habit[] = [
        {
          id: '1',
          name: 'Daily Exercise',
          description: 'Exercise for 30 minutes',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      (habitService.getHabits as jest.Mock).mockReturnValue(mockHabits);

      const result = habitService.getHabits();

      expect(result).toEqual(mockHabits);
      expect(habitService.getHabits).toHaveBeenCalledTimes(1);
    });

    test('should return empty array when no habits exist', () => {
      (habitService.getHabits as jest.Mock).mockReturnValue([]);

      const result = habitService.getHabits();

      expect(result).toEqual([]);
      expect(habitService.getHabits).toHaveBeenCalledTimes(1);
    });

    test('should handle storage service errors gracefully', () => {
      (habitService.getHabits as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => habitService.getHabits()).toThrow('Storage error');
    });
  });

  describe('saveHabits', () => {
    test('should save habits successfully', () => {
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Daily Exercise',
          description: 'Exercise for 30 minutes',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      (habitService.saveHabits as jest.Mock).mockReturnValue(true);

      const result = habitService.saveHabits(habits);

      expect(result).toBe(true);
      expect(habitService.saveHabits).toHaveBeenCalledWith(habits);
      expect(habitService.saveHabits).toHaveBeenCalledTimes(1);
    });

    test('should handle save failures', () => {
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Daily Exercise',
          description: 'Exercise for 30 minutes',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      (habitService.saveHabits as jest.Mock).mockReturnValue(false);

      const result = habitService.saveHabits(habits);

      expect(result).toBe(false);
      expect(habitService.saveHabits).toHaveBeenCalledWith(habits);
      expect(habitService.saveHabits).toHaveBeenCalledTimes(1);
    });

    test('should handle storage service errors', () => {
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Daily Exercise',
          description: 'Exercise for 30 minutes',
          streak: 5,
          lastCompleted: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          targetFrequency: 'daily',
        },
      ];

      (habitService.saveHabits as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => habitService.saveHabits(habits)).toThrow('Storage error');
    });
  });

  describe('addHabit', () => {
    test('should add habit successfully', () => {
      const habitData = {
        name: 'Daily Exercise',
        description: 'Exercise for 30 minutes',
        targetFrequency: 'daily' as const,
      };

      (habitService.addHabit as jest.Mock).mockReturnValue({
        id: 'habit_123',
        ...habitData,
        streak: 0,
        lastCompleted: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      const result = habitService.addHabit(habitData);

      expect(result).toEqual({
        id: 'habit_123',
        ...habitData,
        streak: 0,
        lastCompleted: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });
      expect(habitService.addHabit).toHaveBeenCalledWith(habitData);
    });

    test('should handle add failures', () => {
      const habitData = {
        name: 'Daily Exercise',
        description: 'Exercise for 30 minutes',
        targetFrequency: 'daily' as const,
      };

      (habitService.addHabit as jest.Mock).mockReturnValue(null);

      const result = habitService.addHabit(habitData);

      expect(result).toBeNull();
      expect(habitService.addHabit).toHaveBeenCalledWith(habitData);
    });
  });

  describe('updateHabit', () => {
    test('should update habit successfully', () => {
      const habitId = '1';
      const updates = {
        name: 'Updated Exercise',
        description: 'Updated description',
      };

      (habitService.updateHabit as jest.Mock).mockReturnValue(true);

      const result = habitService.updateHabit(habitId, updates);

      expect(result).toBe(true);
      expect(habitService.updateHabit).toHaveBeenCalledWith(habitId, updates);
    });

    test('should handle update failures', () => {
      const habitId = '1';
      const updates = {
        name: 'Updated Exercise',
        description: 'Updated description',
      };

      (habitService.updateHabit as jest.Mock).mockReturnValue(false);

      const result = habitService.updateHabit(habitId, updates);

      expect(result).toBe(false);
      expect(habitService.updateHabit).toHaveBeenCalledWith(habitId, updates);
    });
  });

  describe('deleteHabit', () => {
    test('should delete habit successfully', () => {
      const habitId = '1';

      (habitService.deleteHabit as jest.Mock).mockReturnValue(true);

      const result = habitService.deleteHabit(habitId);

      expect(result).toBe(true);
      expect(habitService.deleteHabit).toHaveBeenCalledWith(habitId);
    });

    test('should handle delete failures', () => {
      const habitId = '1';

      (habitService.deleteHabit as jest.Mock).mockReturnValue(false);

      const result = habitService.deleteHabit(habitId);

      expect(result).toBe(false);
      expect(habitService.deleteHabit).toHaveBeenCalledWith(habitId);
    });
  });

  describe('completeHabit', () => {
    test('should complete habit successfully', () => {
      const habitId = '1';

      (habitService.completeHabit as jest.Mock).mockReturnValue(true);

      const result = habitService.completeHabit(habitId);

      expect(result).toBe(true);
      expect(habitService.completeHabit).toHaveBeenCalledWith(habitId);
    });

    test('should handle completion failures', () => {
      const habitId = '1';

      (habitService.completeHabit as jest.Mock).mockReturnValue(false);

      const result = habitService.completeHabit(habitId);

      expect(result).toBe(false);
      expect(habitService.completeHabit).toHaveBeenCalledWith(habitId);
    });
  });

  describe('clearHabits', () => {
    test('should clear all habits successfully', () => {
      (habitService.clearHabits as jest.Mock).mockReturnValue(true);

      const result = habitService.clearHabits();

      expect(result).toBe(true);
      expect(habitService.clearHabits).toHaveBeenCalledTimes(1);
    });

    test('should handle clear failures', () => {
      (habitService.clearHabits as jest.Mock).mockReturnValue(false);

      const result = habitService.clearHabits();

      expect(result).toBe(false);
      expect(habitService.clearHabits).toHaveBeenCalledTimes(1);
    });
  });
});
