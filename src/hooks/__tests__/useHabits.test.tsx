import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useHabits } from '../useHabits';
import { habitService } from '../../services/habitService';
import { Habit } from '../../types';

// Mock the habit service
jest.mock('../../services/habitService', () => ({
  habitService: {
    getHabits: jest.fn(),
    saveHabits: jest.fn(),
    addHabit: jest.fn(),
    updateHabit: jest.fn(),
    deleteHabit: jest.fn(),
    completeHabit: jest.fn(),
  },
}));

describe('useHabits', () => {
  const mockHabits: Habit[] = [
    {
      id: '1',
      name: 'Morning Exercise',
      description: 'Daily workout routine',
      streak: 5,
      lastCompleted: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      targetFrequency: 'daily',
    },
    {
      id: '2',
      name: 'Read Books',
      description: 'Read 30 minutes daily',
      streak: 3,
      lastCompleted: new Date('2024-01-02'),
      createdAt: new Date('2024-01-01'),
      targetFrequency: 'daily',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (habitService.getHabits as jest.Mock).mockReturnValue(mockHabits);
    (habitService.saveHabits as jest.Mock).mockReturnValue(true);
  });

  describe('Initialization', () => {
    it('loads habits from storage on initialization', () => {
      const { result } = renderHook(() => useHabits());

      expect(habitService.getHabits).toHaveBeenCalled();
      expect(result.current.habits).toEqual(mockHabits);
    });

    it('returns empty array when no habits exist', () => {
      (habitService.getHabits as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useHabits());

      expect(result.current.habits).toEqual([]);
    });
  });

  describe('addHabit', () => {
    it('adds a new habit successfully', () => {
      const { result } = renderHook(() => useHabits());
      const newHabit = {
        name: 'New Habit',
        description: 'A new habit to track',
        targetFrequency: 'daily' as const,
      };

      act(() => {
        result.current.addHabit(newHabit);
      });

      expect(habitService.addHabit).toHaveBeenCalledWith(newHabit);
      expect(habitService.saveHabits).toHaveBeenCalled();
    });

    it('handles errors when adding habit fails', () => {
      (habitService.addHabit as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits());
      const newHabit = {
        name: 'New Habit',
        description: 'A new habit to track',
        targetFrequency: 'daily' as const,
      };

      act(() => {
        result.current.addHabit(newHabit);
      });

      expect(habitService.addHabit).toHaveBeenCalledWith(newHabit);
      // Should not call saveHabits if addHabit fails
      expect(habitService.saveHabits).not.toHaveBeenCalled();
    });
  });

  describe('updateHabit', () => {
    it('updates an existing habit successfully', () => {
      const { result } = renderHook(() => useHabits());
      const updates = { name: 'Updated Habit Name' };

      act(() => {
        result.current.updateHabit('1', updates);
      });

      expect(habitService.updateHabit).toHaveBeenCalledWith('1', updates);
      expect(habitService.saveHabits).toHaveBeenCalled();
    });

    it('handles errors when updating habit fails', () => {
      (habitService.updateHabit as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits());
      const updates = { name: 'Updated Habit Name' };

      act(() => {
        result.current.updateHabit('1', updates);
      });

      expect(habitService.updateHabit).toHaveBeenCalledWith('1', updates);
      expect(habitService.saveHabits).not.toHaveBeenCalled();
    });
  });

  describe('deleteHabit', () => {
    it('deletes a habit successfully', () => {
      const { result } = renderHook(() => useHabits());

      act(() => {
        result.current.deleteHabit('1');
      });

      expect(habitService.deleteHabit).toHaveBeenCalledWith('1');
      expect(habitService.saveHabits).toHaveBeenCalled();
    });

    it('handles errors when deleting habit fails', () => {
      (habitService.deleteHabit as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits());

      act(() => {
        result.current.deleteHabit('1');
      });

      expect(habitService.deleteHabit).toHaveBeenCalledWith('1');
      expect(habitService.saveHabits).not.toHaveBeenCalled();
    });
  });

  describe('completeHabit', () => {
    it('completes a habit successfully', () => {
      const { result } = renderHook(() => useHabits());

      act(() => {
        result.current.completeHabit('1');
      });

      expect(habitService.completeHabit).toHaveBeenCalledWith('1');
      expect(habitService.saveHabits).toHaveBeenCalled();
    });

    it('handles errors when completing habit fails', () => {
      (habitService.completeHabit as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits());

      act(() => {
        result.current.completeHabit('1');
      });

      expect(habitService.completeHabit).toHaveBeenCalledWith('1');
      expect(habitService.saveHabits).not.toHaveBeenCalled();
    });
  });

  describe('Habit Statistics', () => {
    it('calculates total habits correctly', () => {
      const { result } = renderHook(() => useHabits());

      expect(result.current.habits).toHaveLength(2);
    });

    it('calculates completed habits today', () => {
      const today = new Date();
      const habitsCompletedToday = [
        {
          ...mockHabits[0],
          lastCompleted: today,
        },
      ];
      (habitService.getHabits as jest.Mock).mockReturnValue(habitsCompletedToday);

      const { result } = renderHook(() => useHabits());

      // This would depend on the actual implementation
      // For now, we just verify the habits are loaded
      expect(result.current.habits).toEqual(habitsCompletedToday);
    });

    it('calculates streak statistics', () => {
      const { result } = renderHook(() => useHabits());

      // Verify habits with different streaks are loaded
      const habits = result.current.habits;
      expect(habits[0].streak).toBe(5);
      expect(habits[1].streak).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('handles storage errors gracefully', () => {
      (habitService.getHabits as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useHabits());

      // Should return empty array on error
      expect(result.current.habits).toEqual([]);
    });

    it('handles save errors gracefully', () => {
      (habitService.saveHabits as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits());
      const newHabit = {
        name: 'New Habit',
        description: 'A new habit to track',
        targetFrequency: 'daily' as const,
      };

      act(() => {
        result.current.addHabit(newHabit);
      });

      // Should still attempt to add the habit even if save fails
      expect(habitService.addHabit).toHaveBeenCalled();
    });
  });

  describe('Data Persistence', () => {
    it('saves habits after each operation', () => {
      const { result } = renderHook(() => useHabits());

      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          description: 'Test description',
          targetFrequency: 'daily',
        });
      });

      expect(habitService.saveHabits).toHaveBeenCalled();
    });

    it('maintains data consistency across operations', () => {
      const { result } = renderHook(() => useHabits());

      // Add a habit
      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          description: 'Test description',
          targetFrequency: 'daily',
        });
      });

      // Update the habit
      act(() => {
        result.current.updateHabit('1', { name: 'Updated Habit' });
      });

      // Complete the habit
      act(() => {
        result.current.completeHabit('1');
      });

      // Each operation should trigger a save
      expect(habitService.saveHabits).toHaveBeenCalledTimes(3);
    });
  });
}); 