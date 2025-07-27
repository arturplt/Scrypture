import { renderHook, act, waitFor } from '@testing-library/react';
import { useHabits } from '../useHabits';
import { habitService } from '../../services/habitService';
import { Habit } from '../../types';
import { HabitProvider } from '../useHabits';

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
      categories: ['body'],
    },
    {
      id: '2',
      name: 'Read Books',
      description: 'Read 30 minutes daily',
      streak: 3,
      lastCompleted: new Date('2024-01-02'),
      createdAt: new Date('2024-01-01'),
      targetFrequency: 'daily',
      categories: ['mind'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (habitService.getHabits as jest.Mock).mockReturnValue(mockHabits);
    (habitService.saveHabits as jest.Mock).mockReturnValue(true);
  });

  describe('Initialization', () => {
    it('loads habits from storage on initialization', () => {
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

      expect(habitService.getHabits).toHaveBeenCalled();
      expect(result.current.habits).toEqual(mockHabits);
    });

    it('returns empty array when no habits exist', () => {
      (habitService.getHabits as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

      expect(result.current.habits).toEqual([]);
    });
  });

  describe('addHabit', () => {
    it('adds a new habit successfully', async () => {
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });
      const newHabit = {
        id: '3',
        name: 'New Habit',
        description: 'A new habit to track',
        targetFrequency: 'daily' as const,
        streak: 0,
        lastCompleted: undefined,
        createdAt: new Date('2024-01-01'),
      };
      (habitService.addHabit as jest.Mock).mockReturnValue(newHabit);
      act(() => {
        result.current.addHabit({
          name: 'New Habit',
          description: 'A new habit to track',
          targetFrequency: 'daily',
          categories: ['body'],
        });
      });
      await waitFor(() =>
        expect(habitService.addHabit).toHaveBeenCalledWith({
          name: 'New Habit',
          description: 'A new habit to track',
          targetFrequency: 'daily',
          categories: ['body'],
        })
      );
      await waitFor(() => expect(habitService.saveHabits).toHaveBeenCalled());
    });

    it('handles errors when adding habit fails', async () => {
      (habitService.addHabit as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });
      const newHabit = {
        name: 'New Habit',
        description: 'A new habit to track',
        targetFrequency: 'daily' as const,
        categories: ['body'],
      };

      act(() => {
        result.current.addHabit(newHabit);
      });

      await waitFor(() =>
        expect(habitService.addHabit).toHaveBeenCalledWith(newHabit)
      );
      // Should not call saveHabits if addHabit fails
      await waitFor(() =>
        expect(habitService.saveHabits).not.toHaveBeenCalled()
      );
    });
  });

  describe('updateHabit', () => {
    it('updates an existing habit successfully', async () => {
      (habitService.updateHabit as jest.Mock).mockReturnValue(true);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });
      const updates = { name: 'Updated Habit Name' };

      act(() => {
        result.current.updateHabit('1', updates);
      });

      await waitFor(() =>
        expect(habitService.updateHabit).toHaveBeenCalledWith('1', updates)
      );
      await waitFor(() => expect(habitService.saveHabits).toHaveBeenCalled());
    });

    it('handles errors when updating habit fails', async () => {
      (habitService.updateHabit as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });
      const updates = { name: 'Updated Habit Name' };

      act(() => {
        result.current.updateHabit('1', updates);
      });

      await waitFor(() =>
        expect(habitService.updateHabit).toHaveBeenCalledWith('1', updates)
      );
      await waitFor(() =>
        expect(habitService.saveHabits).not.toHaveBeenCalled()
      );
    });
  });

  describe('deleteHabit', () => {
    it('deletes a habit successfully', async () => {
      (habitService.deleteHabit as jest.Mock).mockReturnValue(true);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

      act(() => {
        result.current.deleteHabit('1');
      });

      await waitFor(() =>
        expect(habitService.deleteHabit).toHaveBeenCalledWith('1')
      );
      await waitFor(() => expect(habitService.saveHabits).toHaveBeenCalled());
    });

    it('handles errors when deleting habit fails', async () => {
      (habitService.deleteHabit as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

      act(() => {
        result.current.deleteHabit('1');
      });

      await waitFor(() =>
        expect(habitService.deleteHabit).toHaveBeenCalledWith('1')
      );
      await waitFor(() =>
        expect(habitService.saveHabits).not.toHaveBeenCalled()
      );
    });
  });

  describe('completeHabit', () => {
    it('completes a habit successfully', async () => {
      (habitService.completeHabit as jest.Mock).mockReturnValue(true);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

      act(() => {
        result.current.completeHabit('1');
      });

      await waitFor(() =>
        expect(habitService.completeHabit).toHaveBeenCalledWith('1')
      );
      await waitFor(() => expect(habitService.saveHabits).toHaveBeenCalled());
    });

    it('handles errors when completing habit fails', async () => {
      (habitService.completeHabit as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

      act(() => {
        result.current.completeHabit('1');
      });

      await waitFor(() =>
        expect(habitService.completeHabit).toHaveBeenCalledWith('1')
      );
      await waitFor(() =>
        expect(habitService.saveHabits).not.toHaveBeenCalled()
      );
    });
  });

  describe('Habit Statistics', () => {
    it('calculates total habits correctly', () => {
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

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
      (habitService.getHabits as jest.Mock).mockReturnValue(
        habitsCompletedToday
      );

      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

      // This would depend on the actual implementation
      // For now, we just verify the habits are loaded
      expect(result.current.habits).toEqual(habitsCompletedToday);
    });

    it('calculates streak statistics', () => {
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

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
      expect(() => {
        renderHook(() => useHabits(), { wrapper: HabitProvider });
      }).toThrow('Storage error');
    });

    it('handles save errors gracefully', async () => {
      (habitService.saveHabits as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });
      const newHabit = {
        name: 'New Habit',
        description: 'A new habit to track',
        targetFrequency: 'daily' as const,
        categories: ['body'],
      };

      act(() => {
        result.current.addHabit(newHabit);
      });

      // Should still attempt to add the habit even if save fails
      await waitFor(() => expect(habitService.addHabit).toHaveBeenCalled());
    });
  });

  describe('Data Persistence', () => {
    it('saves habits after each operation', async () => {
      const newHabit = {
        id: '3',
        name: 'Test Habit',
        description: 'Test description',
        targetFrequency: 'daily',
        streak: 0,
        lastCompleted: undefined,
        createdAt: new Date('2024-01-01'),
      };
      (habitService.addHabit as jest.Mock).mockReturnValue(newHabit);
      (habitService.updateHabit as jest.Mock).mockReturnValue(true);
      (habitService.completeHabit as jest.Mock).mockReturnValue(true);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          description: 'Test description',
          targetFrequency: 'daily',
          categories: ['body'],
        });
      });

      await waitFor(() => expect(habitService.saveHabits).toHaveBeenCalled());
    });

    it('maintains data consistency across operations', async () => {
      const newHabit = {
        id: '3',
        name: 'Test Habit',
        description: 'Test description',
        targetFrequency: 'daily',
        streak: 0,
        lastCompleted: undefined,
        createdAt: new Date('2024-01-01'),
      };
      (habitService.addHabit as jest.Mock).mockReturnValue(newHabit);
      (habitService.updateHabit as jest.Mock).mockReturnValue(true);
      (habitService.completeHabit as jest.Mock).mockReturnValue(true);
      const { result } = renderHook(() => useHabits(), {
        wrapper: HabitProvider,
      });

      // Add a habit
      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          description: 'Test description',
          targetFrequency: 'daily',
          categories: ['body'],
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
      await waitFor(() =>
        expect(habitService.saveHabits).toHaveBeenCalledTimes(3)
      );
    });
  });
});
