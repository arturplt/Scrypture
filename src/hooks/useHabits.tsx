import React, { createContext, useContext, useState, useEffect } from 'react';
import { Habit, HabitContextType } from '../types';
import { habitService } from '../services/habitService';
import { useUser } from './useUser';

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

interface HabitProviderProps {
  children: React.ReactNode;
}

export const HabitProvider: React.FC<HabitProviderProps> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { addExperienceWithBobr, addStatRewards } = useUser();

  useEffect(() => {
    // Load habits from storage on mount
    const savedHabits = habitService.getHabits();
    setHabits(savedHabits);
  }, []);

  const saveHabitsWithFeedback = async (updatedHabits: Habit[]) => {
    setIsSaving(true);
    try {
      const success = habitService.saveHabits(updatedHabits);
      if (success) {
        console.log('Habits auto-saved successfully');
      } else {
        console.error('Failed to auto-save habits');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak'>) => {
    console.log('🔄 useHabits.addHabit called with:', habitData);
    try {
      const newHabit = habitService.addHabit(habitData);
      console.log('📦 habitService.addHabit returned:', newHabit);
      if (newHabit) {
        setHabits((prev) => {
          const updated = [...prev, newHabit];
          console.log('✅ Updating habits state, new count:', updated.length);
          saveHabitsWithFeedback(updated);
          return updated;
        });
        console.log('Habit created and auto-saved');
        return newHabit; // Return the habit for success confirmation
      } else {
        console.error('❌ Failed to create habit - service returned null');
        return null;
      }
    } catch (error) {
      console.error('❌ Error in addHabit:', error);
      return null;
    }
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    const success = habitService.updateHabit(id, updates);
    if (success) {
      setHabits((prev) => {
        const updated = prev.map((habit) =>
          habit.id === id ? { ...habit, ...updates } : habit
        );
        saveHabitsWithFeedback(updated);
        return updated;
      });
      console.log('Habit updated and auto-saved');
    }
  };

  const deleteHabit = (id: string) => {
    const success = habitService.deleteHabit(id);
    if (success) {
      setHabits((prev) => {
        const updated = prev.filter((habit) => habit.id !== id);
        saveHabitsWithFeedback(updated);
        return updated;
      });
      console.log('Habit deleted and auto-saved');
    }
  };

  const completeHabit = (id: string): boolean => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return false;

    const success = habitService.completeHabit(id);
    if (success) {
      // Reload habits from service to get updated streak and bestStreak
      const updatedHabits = habitService.getHabits();
      setHabits(updatedHabits);
      saveHabitsWithFeedback(updatedHabits);
      console.log('Habit completed and auto-saved');

      // Award experience and stat rewards when completing a habit
      console.log('🎯 Habit completion triggered for habit:', habit);
      console.log('🎯 Habit statRewards:', habit.statRewards);
      
      if (habit.statRewards) {
        console.log('🎯 Applying stat rewards:', habit.statRewards);
        
        // Use addExperienceWithBobr to handle XP + Bóbr evolution
        const xpAmount = habit.statRewards.xp || 10;
        console.log('🎯 Adding XP:', xpAmount);
        addExperienceWithBobr(xpAmount);
        
        // Add the specific stat rewards (body, mind, soul)
        if (habit.statRewards.body || habit.statRewards.mind || habit.statRewards.soul) {
          console.log('🎯 Adding stat rewards:', {
            body: habit.statRewards.body,
            mind: habit.statRewards.mind,
            soul: habit.statRewards.soul,
          });
          addStatRewards({
            body: habit.statRewards.body,
            mind: habit.statRewards.mind,
            soul: habit.statRewards.soul,
          });
        }
      } else {
        console.log('⚠️  No stat rewards found, applying default XP');
        // Fallback to base XP if no stat rewards
        addExperienceWithBobr(10);
      }
    }
    return success;
  };

  const refreshHabits = () => {
    const savedHabits = habitService.getHabits();
    setHabits(savedHabits);
  };

  const value: HabitContextType = {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    isSaving,
    lastSaved: null,
    refreshHabits,
  };

  return (
    <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
  );
};
