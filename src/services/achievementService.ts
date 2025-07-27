import { Achievement, AchievementCondition, AchievementProgress, Task, Habit, User } from '../types';
import { storageService } from './storageService';

class AchievementService {
  private achievements: Achievement[] = [];
  private achievementProgress: AchievementProgress[] = [];
  private readonly STORAGE_KEY = 'scrypture_achievements';
  private readonly PROGRESS_STORAGE_KEY = 'scrypture_achievement_progress';

  constructor() {
    this.loadAchievements();
    this.loadProgress();
  }

  // Load achievements from storage or initialize with defaults
  private loadAchievements(): void {
    try {
      const stored = storageService.getGenericItem<Achievement[]>(this.STORAGE_KEY);
      if (stored && Array.isArray(stored)) {
        this.achievements = stored;
      } else {
        this.achievements = this.getDefaultAchievements();
        this.saveAchievements();
      }
    } catch (error) {
      console.warn('Failed to load achievements, using defaults:', error);
      this.achievements = this.getDefaultAchievements();
    }
  }

  // Load achievement progress from storage
  private loadProgress(): void {
    try {
      const stored = storageService.getGenericItem<AchievementProgress[]>(this.PROGRESS_STORAGE_KEY);
      if (stored && Array.isArray(stored)) {
        this.achievementProgress = stored;
      }
    } catch (error) {
      console.warn('Failed to load achievement progress:', error);
      this.achievementProgress = [];
    }
  }

  // Save achievements to storage
  saveAchievements(): void {
    try {
      storageService.setGenericItem(this.STORAGE_KEY, this.achievements);
      console.log('🏆 Achievements saved to storage');
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  // Save achievement progress to storage
  saveProgress(): void {
    try {
      storageService.setGenericItem(this.PROGRESS_STORAGE_KEY, this.achievementProgress);
      console.log('📊 Achievement progress saved to storage');
    } catch (error) {
      console.error('Failed to save achievement progress:', error);
    }
  }

  // Get all achievements
  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  // Get achievement progress for a specific achievement
  getAchievementProgress(achievementId: string): AchievementProgress | null {
    return this.achievementProgress.find(p => p.achievementId === achievementId) || null;
  }

  // Get all achievement progress
  getAllProgress(): AchievementProgress[] {
    return [...this.achievementProgress];
  }

  // Check achievements and return newly unlocked ones
  checkAchievements(user: User, tasks: Task[], habits: Habit[]): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (achievement.unlocked) continue;

      const progress = this.calculateAchievementProgress(achievement, user, tasks, habits);
      const isUnlocked = progress >= 1;

      // Update progress
      this.updateAchievementProgress(achievement.id, progress, user, tasks, habits);

      if (isUnlocked) {
        // Unlock the achievement
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        achievement.progress = 1;
        newlyUnlocked.push(achievement);
      } else {
        achievement.progress = progress;
      }
    }

    if (newlyUnlocked.length > 0) {
      this.saveAchievements();
    }

    return newlyUnlocked;
  }

  // Calculate progress for a specific achievement (0-1)
  private calculateAchievementProgress(
    achievement: Achievement,
    user: User,
    tasks: Task[],
    habits: Habit[]
  ): number {
    if (achievement.conditions.length === 0) return 0;

    // For multiple conditions, all must be met (AND logic)
    let totalProgress = 0;
    
    for (const condition of achievement.conditions) {
      const conditionProgress = this.calculateConditionProgress(condition, user, tasks, habits);
      totalProgress += conditionProgress;
    }

    // Return average progress across all conditions
    return Math.min(1, totalProgress / achievement.conditions.length);
  }

  // Calculate progress for a single condition
  private calculateConditionProgress(
    condition: AchievementCondition,
    user: User,
    tasks: Task[],
    habits: Habit[]
  ): number {
    const completedTasks = tasks.filter(t => t.completed);
    
    switch (condition.type) {
      case 'first_task':
        return completedTasks.length >= 1 ? 1 : 0;

      case 'task_complete':
        return Math.min(1, completedTasks.length / condition.value);

      case 'level_reach':
        return Math.min(1, user.level / condition.value);

      case 'total_experience':
        return Math.min(1, user.experience / condition.value);

      case 'stat_reach':
        if (!condition.stat) return 0;
        const statValue = user[condition.stat];
        return Math.min(1, statValue / condition.value);

      case 'habit_streak':
        const maxStreak = Math.max(0, ...habits.map(h => h.streak));
        return Math.min(1, maxStreak / condition.value);

      case 'category_tasks':
        if (!condition.category) return 0;
        const categoryTasks = completedTasks.filter(t => 
          t.categories.includes(condition.category!)
        );
        return Math.min(1, categoryTasks.length / condition.value);

      case 'difficulty_master':
        if (condition.difficulty === undefined) return 0;
        const difficultyTasks = completedTasks.filter(t => 
          t.difficulty && t.difficulty >= condition.difficulty!
        );
        return Math.min(1, difficultyTasks.length / condition.value);

      case 'multi_category':
        const uniqueCategories = new Set(
          completedTasks.flatMap(t => t.categories)
        );
        return Math.min(1, uniqueCategories.size / condition.value);

      case 'first_habit':
        return habits.length >= 1 ? 1 : 0;

      case 'streak_master':
        const bestStreak = Math.max(0, ...habits.map(h => h.bestStreak || 0));
        return Math.min(1, bestStreak / condition.value);

      case 'speed_demon':
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayTasks = completedTasks.filter(t => 
          t.completedAt && new Date(t.completedAt) >= todayStart
        );
        return Math.min(1, todayTasks.length / condition.value);

      default:
        return 0;
    }
  }

  // Update achievement progress
  private updateAchievementProgress(
    achievementId: string,
    progress: number,
    user: User,
    tasks: Task[],
    habits: Habit[]
  ): void {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    const currentValue = this.getCurrentValue(achievement.conditions[0], user, tasks, habits);
    const targetValue = achievement.conditions[0].value;

    const existingProgress = this.achievementProgress.find(p => p.achievementId === achievementId);
    
    if (existingProgress) {
      existingProgress.progress = progress;
      existingProgress.currentValue = currentValue;
      existingProgress.targetValue = targetValue;
      existingProgress.lastUpdated = new Date();
    } else {
      this.achievementProgress.push({
        achievementId,
        progress,
        currentValue,
        targetValue,
        lastUpdated: new Date()
      });
    }

    this.saveProgress();
  }

  // Get current value for progress display
  private getCurrentValue(
    condition: AchievementCondition,
    user: User,
    tasks: Task[],
    habits: Habit[]
  ): number {
    const completedTasks = tasks.filter(t => t.completed);

    switch (condition.type) {
      case 'first_task':
      case 'task_complete':
        return completedTasks.length;
      case 'level_reach':
        return user.level;
      case 'total_experience':
        return user.experience;
      case 'stat_reach':
        return condition.stat ? user[condition.stat] : 0;
      case 'habit_streak':
        return Math.max(0, ...habits.map(h => h.streak));
      case 'category_tasks':
        return condition.category ? 
          completedTasks.filter(t => t.categories.includes(condition.category!)).length : 0;
      case 'difficulty_master':
        return condition.difficulty !== undefined ?
          completedTasks.filter(t => t.difficulty && t.difficulty >= condition.difficulty!).length : 0;
      case 'multi_category':
        return new Set(completedTasks.flatMap(t => t.categories)).size;
      case 'first_habit':
        return habits.length;
      case 'streak_master':
        return Math.max(0, ...habits.map(h => h.bestStreak || 0));
      case 'speed_demon':
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return completedTasks.filter(t => 
          t.completedAt && new Date(t.completedAt) >= todayStart
        ).length;
      default:
        return 0;
    }
  }

  // Get default achievements catalog
  private getDefaultAchievements(): Achievement[] {
    return [
      // Progression Achievements
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first task and begin your mystical journey with Bóbr',
        category: 'progression',
        rarity: 'common',
        conditions: [{ type: 'first_task', value: 1 }],
        rewards: { xp: 50 },
        icon: '🌱',
        unlockedMessage: 'Bóbr nods approvingly. Your dam-building journey has begun!',
        unlocked: false,
        progress: 0
      },
      {
        id: 'dam_builder',
        name: 'Dam Builder',
        description: 'Complete 10 tasks and start building your knowledge dam',
        category: 'progression',
        rarity: 'common',
        conditions: [{ type: 'task_complete', value: 10 }],
        rewards: { xp: 100, body: 5, mind: 5, soul: 5 },
        icon: '🏗️',
        unlockedMessage: 'Your dam grows stronger! Bóbr sees great potential in you.',
        unlocked: false,
        progress: 0
      },
      {
        id: 'ancient_wisdom',
        name: 'Ancient Wisdom',
        description: 'Reach level 5 and unlock deeper mystical understanding',
        category: 'progression',
        rarity: 'uncommon',
        conditions: [{ type: 'level_reach', value: 5 }],
        rewards: { xp: 200, soul: 15 },
        icon: '🔮',
        unlockedMessage: 'The ancient secrets whisper to you. Bóbr shares his wisdom.',
        unlocked: false,
        progress: 0
      },
      {
        id: 'bobr_chosen',
        name: "Bóbr's Chosen",
        description: 'Reach level 10 and become a true companion to the mystical Bóbr',
        category: 'progression',
        rarity: 'rare',
        conditions: [{ type: 'level_reach', value: 10 }],
        rewards: { xp: 500, body: 20, mind: 20, soul: 20 },
        icon: '👑',
        unlockedMessage: 'Bóbr bows deeply. You are now a true keeper of the ancient ways.',
        unlocked: false,
        progress: 0
      },

      // Mastery Achievements
      {
        id: 'mind_over_matter',
        name: 'Mind Over Matter',
        description: 'Reach 50 Mind stat and master intellectual pursuits',
        category: 'mastery',
        rarity: 'uncommon',
        conditions: [{ type: 'stat_reach', value: 50, stat: 'mind' }],
        rewards: { xp: 150, mind: 25 },
        icon: '🧠',
        unlockedMessage: 'Your intellect shines like starlight. Bóbr admires your wisdom.',
        unlocked: false,
        progress: 0
      },
      {
        id: 'body_temple',
        name: 'Body Temple',
        description: 'Reach 50 Body stat and achieve physical excellence',
        category: 'mastery',
        rarity: 'uncommon',
        conditions: [{ type: 'stat_reach', value: 50, stat: 'body' }],
        rewards: { xp: 150, body: 25 },
        icon: '💪',
        unlockedMessage: 'Your body is a temple of strength. Bóbr respects your dedication.',
        unlocked: false,
        progress: 0
      },
      {
        id: 'soul_seeker',
        name: 'Soul Seeker',
        description: 'Reach 50 Soul stat and connect with the spiritual realm',
        category: 'mastery',
        rarity: 'uncommon',
        conditions: [{ type: 'stat_reach', value: 50, stat: 'soul' }],
        rewards: { xp: 150, soul: 25 },
        icon: '✨',
        unlockedMessage: 'Your soul resonates with ancient energies. Bóbr feels the connection.',
        unlocked: false,
        progress: 0
      },
      {
        id: 'difficulty_conqueror',
        name: 'Difficulty Conqueror',
        description: 'Complete 15 high-difficulty tasks (7+ difficulty)',
        category: 'mastery',
        rarity: 'rare',
        conditions: [{ type: 'difficulty_master', value: 15, difficulty: 7 }],
        rewards: { xp: 300, body: 10, mind: 10, soul: 10 },
        icon: '⚔️',
        unlockedMessage: 'No challenge is too great! Bóbr celebrates your courage.',
        unlocked: false,
        progress: 0
      },

      // Consistency Achievements
      {
        id: 'streak_starter',
        name: 'Streak Starter',
        description: 'Maintain a 7-day habit streak',
        category: 'consistency',
        rarity: 'common',
        conditions: [{ type: 'habit_streak', value: 7 }],
        rewards: { xp: 100, body: 5, mind: 5, soul: 5 },
        icon: '🔥',
        unlockedMessage: 'Consistency is the key to power. Bóbr sees your dedication.',
        unlocked: false,
        progress: 0
      },
      {
        id: 'unwavering',
        name: 'Unwavering',
        description: 'Maintain a 30-day habit streak',
        category: 'consistency',
        rarity: 'rare',
        conditions: [{ type: 'habit_streak', value: 30 }],
        rewards: { xp: 400, body: 15, mind: 15, soul: 15 },
        icon: '🌟',
        unlockedMessage: 'Your unwavering spirit inspires even Bóbr himself!',
        unlocked: false,
        progress: 0
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete 5 tasks in a single day',
        category: 'consistency',
        rarity: 'uncommon',
        conditions: [{ type: 'speed_demon', value: 5 }],
        rewards: { xp: 200, body: 10 },
        icon: '⚡',
        unlockedMessage: 'Lightning fast! Bóbr can barely keep up with your pace.',
        unlocked: false,
        progress: 0
      },

      // Exploration Achievements
      {
        id: 'category_explorer',
        name: 'Category Explorer',
        description: 'Complete tasks in 4 different categories',
        category: 'exploration',
        rarity: 'uncommon',
        conditions: [{ type: 'multi_category', value: 4 }],
        rewards: { xp: 150, body: 5, mind: 5, soul: 5 },
        icon: '🗺️',
        unlockedMessage: 'You explore all paths of growth. Bóbr appreciates your curiosity.',
        unlocked: false,
        progress: 0
      },
      {
        id: 'habit_collector',
        name: 'Habit Collector',
        description: 'Create your first habit and begin building routines',
        category: 'exploration',
        rarity: 'common',
        conditions: [{ type: 'first_habit', value: 1 }],
        rewards: { xp: 75, mind: 5 },
        icon: '📚',
        unlockedMessage: 'Habits shape destiny. Bóbr nods with ancient knowing.',
        unlocked: false,
        progress: 0
      },

      // Special Achievements
      {
        id: 'experience_master',
        name: 'Experience Master',
        description: 'Accumulate 1000 total experience points',
        category: 'special',
        rarity: 'epic',
        conditions: [{ type: 'total_experience', value: 1000 }],
        rewards: { xp: 250, body: 20, mind: 20, soul: 20 },
        icon: '💎',
        unlockedMessage: 'Your experience crystallizes into wisdom. Bóbr grants you his blessing.',
        unlocked: false,
        progress: 0
      },
      {
        id: 'streak_legend',
        name: 'Streak Legend',
        description: 'Achieve a 100-day best streak with any habit',
        category: 'special',
        rarity: 'legendary',
        conditions: [{ type: 'streak_master', value: 100 }],
        rewards: { xp: 1000, body: 50, mind: 50, soul: 50 },
        icon: '🏆',
        unlockedMessage: 'LEGENDARY! Even the ancient spirits bow to your dedication. Bóbr is speechless.',
        unlocked: false,
        progress: 0
      }
    ];
  }

  // Reset all achievements (for testing)
  resetAchievements(): void {
    this.achievements = this.getDefaultAchievements();
    this.achievementProgress = [];
    this.saveAchievements();
    this.saveProgress();
  }
}

export const achievementService = new AchievementService(); 