import React, { createContext, useContext, useState, useEffect } from 'react';
import { Habit, HabitContextType } from '../types';
import { habitService } from '../services/habitService';

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

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak'>) => {
    const newHabit = habitService.addHabit(habitData);
    if (newHabit) {
      setHabits(prev => {
        const updated = [...prev, newHabit];
        saveHabitsWithFeedback(updated);
        return updated;
      });
      console.log('Habit created and auto-saved');
    }
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    const success = habitService.updateHabit(id, updates);
    if (success) {
      setHabits(prev => {
        const updated = prev.map(habit => habit.id === id ? { ...habit, ...updates } : habit);
        saveHabitsWithFeedback(updated);
        return updated;
      });
      console.log('Habit updated and auto-saved');
    }
  };

  const deleteHabit = (id: string) => {
    const success = habitService.deleteHabit(id);
    if (success) {
      setHabits(prev => {
        const updated = prev.filter(habit => habit.id !== id);
        saveHabitsWithFeedback(updated);
        return updated;
      });
      console.log('Habit deleted and auto-saved');
    }
  };

  const completeHabit = (id: string) => {
    const success = habitService.completeHabit(id);
    if (success) {
      setHabits(prev => {
        const updated = prev.map(habit => {
          if (habit.id === id) {
            return {
              ...habit,
              streak: habit.streak + 1,
              lastCompleted: new Date(),
            };
          }
          return habit;
        });
        saveHabitsWithFeedback(updated);
        return updated;
      });
      console.log('Habit completed and auto-saved');
    }
    return success;
  };

  const value: HabitContextType = {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    isSaving, // <-- add this line
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}; 