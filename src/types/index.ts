export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  categories: string[]; // Changed from category?: string to categories: string[]
  statRewards?: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  };
  difficulty?: number; // 0-9, Fibonacci scale
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  streak: number;
  bestStreak?: number;
  lastCompleted?: Date;
  createdAt: Date;
  targetFrequency: 'daily' | 'weekly' | 'monthly';
  categories: string[]; // Added categories for grouping
  statRewards?: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  };
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
  // Bóbr Companion fields
  bobrStage: 'hatchling' | 'young' | 'mature';
  damProgress: number; // 0-100 based on completed tasks
}

export interface AchievementCondition {
  type: 'level_reach' | 'task_complete' | 'habit_streak' | 'stat_reach' | 
        'total_experience' | 'category_tasks' | 'daily_tasks' | 'perfect_week' |
        'difficulty_master' | 'speed_demon' | 'consistency' | 'explorer' |
        'first_task' | 'first_habit' | 'multi_category' | 'streak_master';
  value: number;
  category?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly';
  stat?: 'body' | 'mind' | 'soul';
  difficulty?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'progression' | 'mastery' | 'consistency' | 'exploration' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  conditions: AchievementCondition[];
  rewards?: {
    xp?: number;
    body?: number;
    mind?: number;
    soul?: number;
  };
  icon: string;
  unlockedMessage: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // 0-1 for partially completed achievements
}

export interface AchievementProgress {
  achievementId: string;
  progress: number; // 0-1
  currentValue: number;
  targetValue: number;
  lastUpdated: Date;
}

export interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
}

export interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak'>) => Habit | null;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string) => boolean;
  isSaving: boolean;
}

export interface UserContextType {
  user: User | null;
  updateUser: (updates: Partial<User>) => void;
  addExperience: (amount: number) => void;
  addStatRewards: (rewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  }) => void;
  removeExperience: (amount: number) => void;
  removeStatRewards: (rewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  }) => void;
  unlockAchievement: (achievementId: string) => void;
  createUser: (name: string) => User;
  isSaving: boolean;
  // Bóbr-integrated methods
  addExperienceWithBobr: (amount: number) => { 
    success: boolean; 
    evolved: boolean; 
    damProgressChanged: boolean; 
  };
  addStatRewardsWithBobr: (rewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  }) => { 
    success: boolean; 
    evolved: boolean; 
    damProgressChanged: boolean; 
  };
}

export interface AchievementContextType {
  achievements: Achievement[];
  achievementProgress: AchievementProgress[];
  checkAchievements: (user: User, tasks: Task[], habits: Habit[]) => Achievement[];
  getAchievementProgress: (achievementId: string) => AchievementProgress | null;
  isSaving: boolean;
  lastSaved?: Date;
}

export interface BobrMessage {
  id: string;
  type: 'greeting' | 'task_completion' | 'level_up' | 'achievement' | 'motivation' | 'dam_progress';
  stage: 'hatchling' | 'young' | 'mature';
  context?: {
    taskTitle?: string;
    category?: string;
    newLevel?: number;
    achievementName?: string;
    damPercentage?: number;
  };
  message: string;
  animation?: 'idle' | 'celebrate' | 'build' | 'evolve';
}

export interface BobrState {
  stage: 'hatchling' | 'young' | 'mature';
  damProgress: number;
  lastMessage?: BobrMessage;
  evolutionHistory: {
    stage: 'hatchling' | 'young' | 'mature';
    evolvedAt: Date;
  }[];
}
