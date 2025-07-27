// Bridge between HTML global data and React application
import { Task, Habit, User, Achievement, BobrState } from '../types';

/**
 * Utility functions to interact with global Scrypture data from HTML
 */

// Type-safe access to global Scrypture data
export const getGlobalData = () => {
  if (typeof window !== 'undefined' && window.ScryptureData) {
    return window.ScryptureData;
  }
  return null;
};

export const getGlobalTypes = () => {
  if (typeof window !== 'undefined' && window.ScryptureTypes) {
    return window.ScryptureTypes;
  }
  return null;
};

// Data validation with global types
export const validateTaskWithGlobalTypes = (task: any): task is Task => {
  const globalData = getGlobalData();
  return globalData?.validateTask(task) || false;
};

export const validateHabitWithGlobalTypes = (habit: any): habit is Habit => {
  const globalData = getGlobalData();
  return globalData?.validateHabit(habit) || false;
};

export const validateUserWithGlobalTypes = (user: any): user is User => {
  const globalData = getGlobalData();
  return globalData?.validateUser(user) || false;
};

// Data persistence with global helpers
export const saveDataToGlobalStorage = (key: string, data: any): boolean => {
  const globalData = getGlobalData();
  if (globalData?.saveToLocalStorage) {
    return globalData.saveToLocalStorage(key, data);
  }
  return false;
};

export const loadDataFromGlobalStorage = (key: string): any => {
  const globalData = getGlobalData();
  if (globalData?.loadFromLocalStorage) {
    return globalData.loadFromLocalStorage(key);
  }
  return null;
};

// Initialize global data if not already done
export const initializeGlobalData = (): void => {
  const globalData = getGlobalData();
  if (globalData?.initialize) {
    globalData.initialize();
  }
};

// Type-safe data accessors
export const getGlobalTasks = (): Task[] => {
  const globalData = getGlobalData();
  if (globalData?.tasks) {
    return globalData.tasks.filter(validateTaskWithGlobalTypes);
  }
  return [];
};

export const getGlobalHabits = (): Habit[] => {
  const globalData = getGlobalData();
  if (globalData?.habits) {
    return globalData.habits.filter(validateHabitWithGlobalTypes);
  }
  return [];
};

export const getGlobalUser = (): User | null => {
  const globalData = getGlobalData();
  if (globalData?.user && validateUserWithGlobalTypes(globalData.user)) {
    return globalData.user;
  }
  return null;
};

export const getGlobalAchievements = (): Achievement[] => {
  const globalData = getGlobalData();
  if (globalData?.achievements) {
    return globalData.achievements;
  }
  return [];
};

export const getGlobalBobrState = (): BobrState | null => {
  const globalData = getGlobalData();
  if (globalData?.bobrState) {
    return globalData.bobrState;
  }
  return null;
};

// Data synchronization helpers
export const syncTasksToGlobal = (tasks: Task[]): void => {
  const globalData = getGlobalData();
  if (globalData) {
    globalData.tasks = tasks;
    saveDataToGlobalStorage('tasks', tasks);
  }
};

export const syncHabitsToGlobal = (habits: Habit[]): void => {
  const globalData = getGlobalData();
  if (globalData) {
    globalData.habits = habits;
    saveDataToGlobalStorage('habits', habits);
  }
};

export const syncUserToGlobal = (user: User): void => {
  const globalData = getGlobalData();
  if (globalData) {
    globalData.user = user;
    saveDataToGlobalStorage('user', user);
  }
};

export const syncAchievementsToGlobal = (achievements: Achievement[]): void => {
  const globalData = getGlobalData();
  if (globalData) {
    globalData.achievements = achievements;
    saveDataToGlobalStorage('achievements', achievements);
  }
};

export const syncBobrStateToGlobal = (bobrState: BobrState): void => {
  const globalData = getGlobalData();
  if (globalData) {
    globalData.bobrState = bobrState;
    saveDataToGlobalStorage('bobrState', bobrState);
  }
};

// Check if global data is available
export const isGlobalDataAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         window.ScryptureData !== undefined && 
         window.ScryptureTypes !== undefined;
};

// Debug helper to log global data state
export const logGlobalDataState = (): void => {
  if (isGlobalDataAvailable()) {
    const globalData = getGlobalData();
    console.log('Global Scrypture Data State:', {
      tasksCount: globalData?.tasks?.length || 0,
      habitsCount: globalData?.habits?.length || 0,
      userExists: !!globalData?.user,
      achievementsCount: globalData?.achievements?.length || 0,
      bobrState: globalData?.bobrState
    });
  } else {
    console.log('Global Scrypture Data not available');
  }
}; 