import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserContextType } from '../types';
import { userService } from '../services/userService';
import { taskService } from '../services/taskService';
import { Achievement } from '../types';
import { logger } from '../utils/logger';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load user from storage on mount
    const savedUser = userService.getUser();
    setUser(savedUser);
  }, []);

  const saveUserWithFeedback = async (updatedUser: User) => {
    setIsSaving(true);
    try {
      const success = userService.saveUser(updatedUser);
      if (success) {
        logger.info('User data auto-saved successfully');
      } else {
        logger.error('Failed to auto-save user data');
      }
    } catch (error) {
      logger.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    const success = userService.updateUser(updates);
    if (success && user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      saveUserWithFeedback(updatedUser);
    }
  };

  const addExperience = (amount: number) => {
    const success = userService.addExperience(amount);

    if (success && user) {
      const newExperience = user.experience + amount;
      const newLevel = Math.floor(newExperience / 100) + 1;
      const updatedUser = {
        ...user,
        experience: newExperience,
        level: newLevel,
        updatedAt: new Date(),
      };
      setUser(updatedUser);
      saveUserWithFeedback(updatedUser);
    }
  };

  /**
   * Add experience with Bóbr integration - returns evolution status
   */
  const addExperienceWithBobr = (amount: number): { 
    success: boolean; 
    evolved: boolean; 
    damProgressChanged: boolean; 
  } => {
    if (!user) return { success: false, evolved: false, damProgressChanged: false };

    logger.info('⭐ Adding experience with Bóbr:', amount);
    logger.info('👤 Current user XP before:', user.experience);

    // Get completed tasks count
    const completedTasks = taskService.getTasks().filter(task => task.completed);
    const completedTasksCount = completedTasks.length;

    const result = userService.addExperienceWithBobr(amount, completedTasksCount);
    
    if (result.success) {
      const updatedUser = userService.getUser();
      if (updatedUser) {
        logger.info('👤 User XP after update:', updatedUser.experience);
        setUser(updatedUser);
        saveUserWithFeedback(updatedUser);
      }
    } else {
      logger.error('❌ Failed to add experience');
    }

    return result;
  };

  const addStatRewards = (rewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  }) => {
    logger.info('💪 Adding stat rewards to user:', rewards);
    logger.info('👤 Current user stats before:', { body: user?.body, mind: user?.mind, soul: user?.soul });
    
    const success = userService.addStatRewards(rewards);

    if (success && user) {
      const updatedUser = {
        ...user,
        body: user.body + (rewards.body || 0),
        mind: user.mind + (rewards.mind || 0),
        soul: user.soul + (rewards.soul || 0),
        updatedAt: new Date(),
      };
      logger.info('👤 User stats after update:', { body: updatedUser.body, mind: updatedUser.mind, soul: updatedUser.soul });
      setUser(updatedUser);
      saveUserWithFeedback(updatedUser);
    } else {
      logger.error('❌ Failed to add stat rewards');
    }
  };

  /**
   * Add stat rewards with Bóbr integration - returns evolution status
   */
  const addStatRewardsWithBobr = (rewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  }): { 
    success: boolean; 
    evolved: boolean; 
    damProgressChanged: boolean; 
  } => {
    if (!user) return { success: false, evolved: false, damProgressChanged: false };

    // Get completed tasks count
    const completedTasks = taskService.getTasks().filter(task => task.completed);
    const completedTasksCount = completedTasks.length;

    const result = userService.addStatRewardsWithBobr(rewards, completedTasksCount);
    
    if (result.success) {
      const updatedUser = userService.getUser();
      if (updatedUser) {
        setUser(updatedUser);
        saveUserWithFeedback(updatedUser);
      }
    }

    return result;
  };

  const removeExperience = (amount: number) => {
    const success = userService.removeExperience(amount);

    if (success && user) {
      const newExperience = Math.max(0, user.experience - amount);
      const newLevel = Math.floor(newExperience / 100) + 1;
      const updatedUser = {
        ...user,
        experience: newExperience,
        level: newLevel,
        updatedAt: new Date(),
      };
      setUser(updatedUser);
      saveUserWithFeedback(updatedUser);
    }
  };

  const removeStatRewards = (rewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  }) => {
    const success = userService.removeStatRewards(rewards);

    if (success && user) {
      const updatedUser = {
        ...user,
        body: Math.max(0, user.body - (rewards.body || 0)),
        mind: Math.max(0, user.mind - (rewards.mind || 0)),
        soul: Math.max(0, user.soul - (rewards.soul || 0)),
        updatedAt: new Date(),
      };
      setUser(updatedUser);
      saveUserWithFeedback(updatedUser);
    }
  };

  const unlockAchievement = (achievementId: string) => {
    const success = userService.unlockAchievement(achievementId);

    if (success && user) {
      // This is a simplified implementation
      // In practice, you'd fetch the full achievement data
      const updatedUser = userService.getUser();
      if (updatedUser) {
        setUser(updatedUser);
        saveUserWithFeedback(updatedUser);
      }
    }
  };

  const createUser = (name: string): User => {
    const newUser = userService.createUser(name);
    setUser(newUser);
    return newUser;
  };

  /**
   * Apply achievement rewards and update React state
   */
  const applyAchievementRewards = (
    achievements: Achievement[], 
    completedTasksCount: number = 0
  ): { 
    success: boolean; 
    evolved: boolean; 
    damProgressChanged: boolean; 
    totalRewards: { xp: number; body: number; mind: number; soul: number; };
  } => {
    if (!user) {
      return { 
        success: false, 
        evolved: false, 
        damProgressChanged: false,
        totalRewards: { xp: 0, body: 0, mind: 0, soul: 0 }
      };
    }

    logger.info('🏆 UserContext: Applying achievement rewards for:', achievements.map(a => a.name));
    
    const result = userService.applyAchievementRewards(achievements, completedTasksCount);
    
    if (result.success) {
      // Force refresh the user state from storage to reflect the changes
      const updatedUser = userService.getUser();
      if (updatedUser) {
        logger.info('🏆 UserContext: Refreshing user state after achievement rewards');
        setUser(updatedUser);
        saveUserWithFeedback(updatedUser);
      }
    }

    return result;
  };

  const contextValue: UserContextType = {
    user,
    updateUser,
    addExperience,
    addStatRewards,
    removeExperience,
    removeStatRewards,
    unlockAchievement,
    createUser,
    isSaving,
    // Add Bóbr-integrated methods
    addExperienceWithBobr,
    addStatRewardsWithBobr,
    applyAchievementRewards,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};
