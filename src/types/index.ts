export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  statRewards?: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  };
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  streak: number;
  lastCompleted?: Date;
  createdAt: Date;
  targetFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface User {
  id: string;
  name: string;
  level: number;
  experience: number;
  body: number;
  mind: number;
  soul: number;
  achievements: Achievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
  icon: string;
}

export interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
}

export interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string) => void;
}

export interface UserContextType {
  user: User | null;
  updateUser: (updates: Partial<User>) => void;
  addExperience: (amount: number) => void;
  addStatRewards: (rewards: { body?: number; mind?: number; soul?: number; xp?: number }) => void;
  unlockAchievement: (achievementId: string) => void;
  createUser: (name: string) => User;
} 