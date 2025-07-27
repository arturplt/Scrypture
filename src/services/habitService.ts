import { Habit } from '../types';
import { storageService } from './storageService';

export const habitService = {
  getHabits(): Habit[] {
    return storageService.getHabits();
  },

  saveHabits(habits: Habit[]): boolean {
    return storageService.saveHabits(habits);
  },

  /**
   * Check if there are any incomplete habits
   * A habit is considered incomplete if it hasn't been completed today
   */
  hasIncompleteHabits(): boolean {
    const habits = this.getHabits();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return habits.some(habit => {
      if (!habit.lastCompleted) {
        // Habit has never been completed
        return true;
      }
      
      const lastCompleted = new Date(habit.lastCompleted);
      lastCompleted.setHours(0, 0, 0, 0);
      
      // Check if habit was completed today
      return lastCompleted.getTime() !== today.getTime();
    });
  },

  /**
   * Get the first incomplete habit
   */
  getFirstIncompleteHabit(): Habit | null {
    const habits = this.getHabits();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return habits.find(habit => {
      if (!habit.lastCompleted) {
        // Habit has never been completed
        return true;
      }
      
      const lastCompleted = new Date(habit.lastCompleted);
      lastCompleted.setHours(0, 0, 0, 0);
      
      // Check if habit was completed today
      return lastCompleted.getTime() !== today.getTime();
    }) || null;
  },

  addHabit(
    habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak'> & {
      statRewards?: {
        body?: number;
        mind?: number;
        soul?: number;
        xp?: number;
      };
    }
  ): Habit | null {
    try {
      console.log('🏪 habitService.addHabit called with:', habit);
      
      // Check if there are incomplete habits
      if (this.hasIncompleteHabits()) {
        const incompleteHabit = this.getFirstIncompleteHabit();
        console.log('❌ Cannot create new habit - incomplete habit exists:', incompleteHabit?.name);
        return null;
      }
      
      const habits = this.getHabits();
      console.log('📊 Current habits in storage:', habits.length);
      
      const newHabit: Habit = {
        ...habit,
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        streak: 0,
        bestStreak: 0,
        statRewards: habit.statRewards,
      };
      console.log('🆕 New habit created:', newHabit);

      const updatedHabits = [...habits, newHabit];
      console.log('💾 Attempting to save habits, new count:', updatedHabits.length);
      
      const saveSuccess = this.saveHabits(updatedHabits);
      console.log('💾 Save result:', saveSuccess);
      
      if (!saveSuccess) {
        console.error('❌ Failed to save habits to storage');
        return null;
      }
      
      return newHabit;
    } catch (error) {
      console.error('❌ Error in habitService.addHabit:', error);
      return null;
    }
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
    // const lastCompleted = habit.lastCompleted
    //   ? new Date(habit.lastCompleted)
    //   : null; // Unused variable

    // Check if habit can be completed based on frequency
    if (!this.canCompleteHabit(habit)) {
      return false;
    }

    // Calculate new streak
    const newStreak = this.calculateNewStreak(habit, now);
    const bestStreak = Math.max(habit.bestStreak || 0, newStreak);

    const updatedHabit = {
      ...habit,
      streak: newStreak,
      bestStreak: bestStreak,
      lastCompleted: now,
    };

    return this.updateHabit(id, updatedHabit);
  },

  canCompleteHabit(habit: Habit): boolean {
    if (!habit.lastCompleted) return true;

    const now = new Date();
    const lastCompleted = new Date(habit.lastCompleted);

    switch (habit.targetFrequency) {
      case 'daily': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastCompletedDate = new Date(lastCompleted);
        lastCompletedDate.setHours(0, 0, 0, 0);
        return today.getTime() !== lastCompletedDate.getTime();
      }
      case 'weekly': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastCompleted < weekAgo;
      }
      case 'monthly': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return lastCompleted < monthAgo;
      }
      default:
        return true;
    }
  },

  calculateNewStreak(habit: Habit, completionDate: Date): number {
    if (!habit.lastCompleted) return 1;

    const lastCompleted = new Date(habit.lastCompleted);
    const daysDiff = Math.floor((completionDate.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

    switch (habit.targetFrequency) {
      case 'daily':
        // If completed yesterday or today, continue streak; otherwise reset
        return daysDiff <= 1 ? habit.streak + 1 : 1;
      case 'weekly':
        // If completed within reasonable weekly range, continue streak
        return daysDiff <= 10 ? habit.streak + 1 : 1;
      case 'monthly':
        // If completed within reasonable monthly range, continue streak
        return daysDiff <= 35 ? habit.streak + 1 : 1;
      default:
        return habit.streak + 1;
    }
  },

  getBestStreak(id: string): number {
    const habits = this.getHabits();
    const habit = habits.find((h) => h.id === id);
    return habit?.bestStreak || 0;
  },

  getHabitStats(): { total: number; completedToday: number; activeStreaks: number } {
    const habits = this.getHabits();
    const now = new Date();
    
    let completedToday = 0;
    let activeStreaks = 0;

    habits.forEach(habit => {
      if (habit.lastCompleted) {
        // const lastCompleted = new Date(habit.lastCompleted); // Unused variable
        const isCompletedToday = this.isCompletedToday(habit, now);
        
        if (isCompletedToday) {
          completedToday++;
        }
        
        if (habit.streak > 0) {
          activeStreaks++;
        }
      }
    });

    return {
      total: habits.length,
      completedToday,
      activeStreaks
    };
  },

  isCompletedToday(habit: Habit, referenceDate: Date = new Date()): boolean {
    if (!habit.lastCompleted) return false;

    const lastCompleted = new Date(habit.lastCompleted);
    
    switch (habit.targetFrequency) {
      case 'daily': {
        const today = new Date(referenceDate);
        today.setHours(0, 0, 0, 0);
        const completed = new Date(lastCompleted);
        completed.setHours(0, 0, 0, 0);
        return today.getTime() === completed.getTime();
      }
      case 'weekly': {
        const weekStart = new Date(referenceDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return lastCompleted >= weekStart;
      }
      case 'monthly': {
        const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
        return lastCompleted >= monthStart;
      }
      default:
        return false;
    }
  },

  clearHabits(): boolean {
    return this.saveHabits([]);
  },
};
