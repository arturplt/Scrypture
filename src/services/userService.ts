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
    if (!user) return false;

    const updates: Partial<User> = {
      body: user.body + (rewards.body || 0),
      mind: user.mind + (rewards.mind || 0),
      soul: user.soul + (rewards.soul || 0),
      updatedAt: new Date(),
    };

    return this.updateUser(updates);
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
