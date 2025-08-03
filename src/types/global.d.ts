// Global type declarations for Scrypture application
declare global {
  interface ImportMeta {
    env: {
      MODE: string;
      DEV: boolean;
      PROD: boolean;
      BASE_URL: string;
    };
  }
  interface Window {
    ScryptureTypes: {
      Task: {
        id: string;
        title: string;
        description?: string;
        completed: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt?: Date;
        priority: 'low' | 'medium' | 'high';
        categories: string[];
        statRewards?: {
          body?: number;
          mind?: number;
          soul?: number;
          xp?: number;
        };
        difficulty?: number;
      };

      Habit: {
        id: string;
        name: string;
        description?: string;
        streak: number;
        bestStreak?: number;
        lastCompleted?: Date;
        createdAt: Date;
        targetFrequency: 'daily' | 'weekly' | 'monthly';
        categories: string[];
        statRewards?: {
          body?: number;
          mind?: number;
          soul?: number;
          xp?: number;
        };
      };

      User: {
        id: string;
        name: string;
        level: number;
        experience: number;
        body: number;
        mind: number;
        soul: number;
        achievements: any[];
        createdAt: Date;
        updatedAt: Date;
        bobrStage: 'hatchling' | 'young' | 'mature';
        damProgress: number;
      };

      AchievementCondition: {
        type: 'level_reach' | 'task_complete' | 'habit_streak' | 'stat_reach' | 
              'total_experience' | 'category_tasks' | 'daily_tasks' | 'perfect_week' |
              'difficulty_master' | 'speed_demon' | 'consistency' | 'explorer' |
              'first_task' | 'first_habit' | 'multi_category' | 'streak_master';
        value: number;
        category?: string;
        timeframe?: 'daily' | 'weekly' | 'monthly';
        stat?: 'body' | 'mind' | 'soul';
        difficulty?: number;
      };

      Achievement: {
        id: string;
        name: string;
        description: string;
        category: 'progression' | 'mastery' | 'consistency' | 'exploration' | 'special';
        rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
        conditions: any[];
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
        progress?: number;
      };

      AchievementProgress: {
        achievementId: string;
        progress: number;
        currentValue: number;
        targetValue: number;
        lastUpdated: Date;
      };

      BobrMessage: {
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
      };

      BobrState: {
        stage: 'hatchling' | 'young' | 'mature';
        damProgress: number;
        lastMessage?: any;
        evolutionHistory: {
          stage: 'hatchling' | 'young' | 'mature';
          evolvedAt: Date;
        }[];
      };
    };

    ScryptureData: {
      tasks: any[];
      habits: any[];
      user: any;
      achievements: any[];
      achievementProgress: any[];
      bobrState: {
        stage: 'hatchling' | 'young' | 'mature';
        damProgress: number;
        lastMessage?: any;
        evolutionHistory: any[];
      };

      validateTask: (task: any) => boolean;
      validateHabit: (habit: any) => boolean;
      validateUser: (user: any) => boolean;
      saveToLocalStorage: (key: string, data: any) => boolean;
      loadFromLocalStorage: (key: string) => any;
      initialize: () => void;
    };
  }

  interface WindowEventMap {
    'scrypture-data-cleared': CustomEvent;
  }
}

export {}; 