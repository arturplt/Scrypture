import { User, Achievement } from '../types';
import { storageService } from './storageService';
import { bobrService } from './bobrService';

export const userService = {
  getUser(): User | null {
    return storageService.getUser();
  },

  saveUser(user: User): boolean {
    return storageService.saveUser(user);
  },

  createUser(name: string): User {
    const newUser: User = {
      id: this.generateId(),
      name,
      level: 1,
      experience: 0,
      body: 0,
      mind: 0,
      soul: 0,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      // Bóbr Companion defaults
      bobrStage: 'hatchling',
      damProgress: 0,
    };

    this.saveUser(newUser);
    return newUser;
  },

  generateId(): string {
    // Use crypto.randomUUID if available, otherwise fallback to a simple UUID generation
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for test environments
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  updateUser(updates: Partial<User>): boolean {
    const user = this.getUser();

    if (!user) return false;

    const updatedUser = { ...user, ...updates };
    return this.saveUser(updatedUser);
  },

  /**
   * Update user with Bóbr companion integration
   */
  updateUserWithBobr(updates: Partial<User>, completedTasksCount?: number): { 
    user: User | null; 
    evolved: boolean; 
    damProgressChanged: boolean; 
  } {
    const user = this.getUser();
    if (!user) return { user: null, evolved: false, damProgressChanged: false };

    const updatedUser = { ...user, ...updates };
    
    // Update Bóbr status if completed tasks count is provided
    if (completedTasksCount !== undefined) {
      const bobrUpdate = bobrService.updateBobrStatus(updatedUser, completedTasksCount);
      updatedUser.bobrStage = bobrUpdate.user.bobrStage;
      updatedUser.damProgress = bobrUpdate.user.damProgress;
      updatedUser.updatedAt = new Date();

      const success = this.saveUser(updatedUser);
      return { 
        user: success ? updatedUser : null, 
        evolved: bobrUpdate.evolved, 
        damProgressChanged: bobrUpdate.damProgressChanged 
      };
    }

    const success = this.updateUser(updates);
    return { 
      user: success ? updatedUser : null, 
      evolved: false, 
      damProgressChanged: false 
    };
  },

  addExperience(amount: number): boolean {
    const user = this.getUser();

    if (!user) return false;

    const newExperience = user.experience + amount;
    const newLevel = Math.floor(newExperience / 100) + 1; // Simple level calculation

    const updates: Partial<User> = {
      experience: newExperience,
      level: newLevel,
      updatedAt: new Date(),
    };

    return this.updateUser(updates);
  },

  /**
   * Add experience with Bóbr integration
   */
  addExperienceWithBobr(amount: number, completedTasksCount: number): { 
    success: boolean; 
    evolved: boolean; 
    damProgressChanged: boolean; 
  } {
    const user = this.getUser();
    if (!user) return { success: false, evolved: false, damProgressChanged: false };

    const newExperience = user.experience + amount;
    const newLevel = Math.floor(newExperience / 100) + 1;

    const updates: Partial<User> = {
      experience: newExperience,
      level: newLevel,
      updatedAt: new Date(),
    };

    const result = this.updateUserWithBobr(updates, completedTasksCount);
    return { 
      success: result.user !== null, 
      evolved: result.evolved, 
      damProgressChanged: result.damProgressChanged 
    };
  },

  addStatRewards(rewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  }): boolean {
    const user = this.getUser();
    if (!user) {
      console.error('❌ No user found for stat rewards');
      return false;
    }

    console.log('🔧 UserService: Adding stat rewards:', rewards);
    console.log('🔧 UserService: Current user stats:', { body: user.body, mind: user.mind, soul: user.soul });

    const updates: Partial<User> = {
      body: user.body + (rewards.body || 0),
      mind: user.mind + (rewards.mind || 0),
      soul: user.soul + (rewards.soul || 0),
      updatedAt: new Date(),
    };

    console.log('🔧 UserService: Updates to apply:', updates);
    const success = this.updateUser(updates);
    console.log('🔧 UserService: Update success:', success);
    
    return success;
  },

  /**
   * Add stat rewards with Bóbr integration
   */
  addStatRewardsWithBobr(
    rewards: {
      body?: number;
      mind?: number;
      soul?: number;
      xp?: number;
    },
    completedTasksCount: number
  ): { 
    success: boolean; 
    evolved: boolean; 
    damProgressChanged: boolean; 
  } {
    const user = this.getUser();
    if (!user) return { success: false, evolved: false, damProgressChanged: false };

    const updates: Partial<User> = {
      body: user.body + (rewards.body || 0),
      mind: user.mind + (rewards.mind || 0),
      soul: user.soul + (rewards.soul || 0),
      updatedAt: new Date(),
    };

    // Also handle XP if provided
    if (rewards.xp) {
      const newExperience = user.experience + rewards.xp;
      const newLevel = Math.floor(newExperience / 100) + 1;
      updates.experience = newExperience;
      updates.level = newLevel;
    }

    const result = this.updateUserWithBobr(updates, completedTasksCount);
    return { 
      success: result.user !== null, 
      evolved: result.evolved, 
      damProgressChanged: result.damProgressChanged 
    };
  },

  removeStatRewards(rewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  }): boolean {
    const user = this.getUser();
    if (!user) return false;

    const updates: Partial<User> = {
      body: Math.max(0, user.body - (rewards.body || 0)),
      mind: Math.max(0, user.mind - (rewards.mind || 0)),
      soul: Math.max(0, user.soul - (rewards.soul || 0)),
      updatedAt: new Date(),
    };

    return this.updateUser(updates);
  },

  removeExperience(amount: number): boolean {
    const user = this.getUser();

    if (!user) return false;

    const newExperience = Math.max(0, user.experience - amount);
    const newLevel = Math.floor(newExperience / 100) + 1; // Simple level calculation

    const updates: Partial<User> = {
      experience: newExperience,
      level: newLevel,
      updatedAt: new Date(),
    };

    return this.updateUser(updates);
  },

  unlockAchievement(achievementId: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    // Check if achievement is already unlocked
    const alreadyUnlocked = user.achievements.some(
      (a) => a.id === achievementId
    );
    if (alreadyUnlocked) return false;

    // In a real app, you'd fetch achievement data from a database
    // For now, we'll create a simple achievement (this is legacy code, should use achievementService)
    const newAchievement: Achievement = {
      id: achievementId,
      name: `Achievement ${achievementId}`,
      description: 'An unlocked achievement',
      category: 'special',
      rarity: 'common',
      conditions: [],
      rewards: {},
      icon: '🏆',
      unlockedMessage: 'Achievement unlocked!',
      unlocked: true,
      unlockedAt: new Date(),
    };

    const updatedAchievements = [...user.achievements, newAchievement];
    return this.updateUser({ achievements: updatedAchievements });
  },

  /**
   * Apply achievement rewards to the user (XP, body, mind, soul stats)
   * 
   * Example: When "First Steps" achievement is unlocked (complete 1 task):
   * - User gets +50 XP
   * - User level may increase based on total XP
   * - Bóbr companion may evolve based on progress
   * - Achievement is added to user's achievement list
   */
  applyAchievementRewards(
    achievements: Achievement[], 
    completedTasksCount: number = 0
  ): { 
    success: boolean; 
    evolved: boolean; 
    damProgressChanged: boolean; 
    totalRewards: { xp: number; body: number; mind: number; soul: number; };
  } {
    if (!achievements.length) {
      return { 
        success: true, 
        evolved: false, 
        damProgressChanged: false,
        totalRewards: { xp: 0, body: 0, mind: 0, soul: 0 }
      };
    }

    const user = this.getUser();
    if (!user) {
      console.error('❌ No user found for applying achievement rewards');
      return { 
        success: false, 
        evolved: false, 
        damProgressChanged: false,
        totalRewards: { xp: 0, body: 0, mind: 0, soul: 0 }
      };
    }

    // Calculate total rewards from all achievements
    const totalRewards = achievements.reduce((total, achievement) => {
      const rewards = achievement.rewards || {};
      return {
        xp: total.xp + (rewards.xp || 0),
        body: total.body + (rewards.body || 0),
        mind: total.mind + (rewards.mind || 0),
        soul: total.soul + (rewards.soul || 0),
      };
    }, { xp: 0, body: 0, mind: 0, soul: 0 });

    console.log('🏆 UserService: Applying achievement rewards:', totalRewards);
    console.log('🏆 UserService: From achievements:', achievements.map(a => a.name));

    // Add the unlocked achievements to user's achievement list
    const newUserAchievements = achievements.filter(achievement => 
      !user.achievements.some(userAch => userAch.id === achievement.id)
    );

    const updatedAchievements = [...user.achievements, ...newUserAchievements];

    // Apply stat and XP rewards using the existing method
    const rewardResult = this.addStatRewardsWithBobr(totalRewards, completedTasksCount);

    // Update user's achievements list if rewards were applied successfully
    if (rewardResult.success) {
      const achievementUpdateSuccess = this.updateUser({ 
        achievements: updatedAchievements,
        updatedAt: new Date()
      });

      if (!achievementUpdateSuccess) {
        console.error('❌ Failed to update user achievements list');
      }
    }

    console.log('🏆 UserService: Achievement rewards result:', {
      success: rewardResult.success,
      evolved: rewardResult.evolved,
      damProgressChanged: rewardResult.damProgressChanged,
      totalRewards
    });

    return {
      success: rewardResult.success,
      evolved: rewardResult.evolved,
      damProgressChanged: rewardResult.damProgressChanged,
      totalRewards
    };
  },

  getSettings(): Record<string, unknown> {
    return storageService.getSettings();
  },

  saveSettings(settings: Record<string, unknown>): boolean {
    return storageService.saveSettings(settings);
  },

  updateSetting(key: string, value: unknown): boolean {
    const settings = this.getSettings();
    const updatedSettings = { ...settings, [key]: value };
    return this.saveSettings(updatedSettings);
  },

  // Data management
  exportUserData(): string {
    return storageService.exportData();
  },

  importUserData(jsonData: string): boolean {
    return storageService.importData(jsonData);
  },

  createBackup(): Record<string, unknown> {
    return storageService.createBackup();
  },

  restoreFromBackup(backup: Record<string, unknown>): boolean {
    return storageService.restoreFromBackup(backup);
  },

  clearAllData(): boolean {
    return storageService.clearAllData();
  },

  getStorageStats(): { used: number; available: number; percentage: number } {
    return storageService.getStorageStats();
  },

  // Backup methods
  saveBackup(backup: Record<string, unknown>): boolean {
    return storageService.saveBackup(backup);
  },

  getBackup(): Record<string, unknown> | null {
    return storageService.getBackup();
  },
};
