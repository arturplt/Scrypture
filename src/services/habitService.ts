import { Habit } from '../types';
import { storageService } from './storageService';

export const habitService = {
  getHabits(): Habit[] {
    return storageService.getHabits();
  },

  saveHabits(habits: Habit[]): boolean {
    return storageService.saveHabits(habits);
  },

  addHabit(
    habit: Omit<Habit, 'id' | 'createdAt' | 'streak'> & {
      statRewards?: {
        body?: number;
        mind?: number;
        soul?: number;
        xp?: number;
      };
    }
  ): Habit {
    const habits = this.getHabits();
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      streak: 0,
      statRewards: habit.statRewards,
    };

    const updatedHabits = [...habits, newHabit];
    this.saveHabits(updatedHabits);
    return newHabit;
  },

  updateHabit(id: string, updates: Partial<Habit>): boolean {
    const habits = this.getHabits();
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, ...updates } : habit
    );

    return this.saveHabits(updatedHabits);
  },

  deleteHabit(id: string): boolean {
    const habits = this.getHabits();
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    return this.saveHabits(updatedHabits);
  },

  completeHabit(id: string): boolean {
    const habits = this.getHabits();
    const habit = habits.find((h) => h.id === id);

    if (!habit) return false;

    const now = new Date();
    const lastCompleted = habit.lastCompleted
      ? new Date(habit.lastCompleted)
      : null;

    // Check if habit can be completed (not already completed today for daily habits)
    if (habit.targetFrequency === 'daily' && lastCompleted) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastCompletedDate = new Date(lastCompleted);
      lastCompletedDate.setHours(0, 0, 0, 0);

      if (today.getTime() === lastCompletedDate.getTime()) {
        return false; // Already completed today
      }
    }

    const updatedHabit = {
      ...habit,
      streak: habit.streak + 1,
      lastCompleted: now,
    };

    return this.updateHabit(id, updatedHabit);
  },

  clearHabits(): boolean {
    return this.saveHabits([]);
  },
};
