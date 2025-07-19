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
    setHabits(prev => [...prev, newHabit]);
    // Auto-save is handled by the service, but we can add additional feedback
    console.log('Habit created and auto-saved');
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    const success = habitService.updateHabit(id, updates);
    if (success) {
      setHabits(prev => 
        prev.map(habit => 
          habit.id === id ? { ...habit, ...updates } : habit
        )
      );
      console.log('Habit updated and auto-saved');
    }
  };

  const deleteHabit = (id: string) => {
    const success = habitService.deleteHabit(id);
    if (success) {
      setHabits(prev => prev.filter(habit => habit.id !== id));
      console.log('Habit deleted and auto-saved');
    }
  };

  const completeHabit = (id: string) => {
    const success = habitService.completeHabit(id);
    if (success) {
      setHabits(prev => 
        prev.map(habit => {
          if (habit.id === id) {
            return {
              ...habit,
              streak: habit.streak + 1,
              lastCompleted: new Date(),
            };
          }
          return habit;
        })
      );
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
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}; 