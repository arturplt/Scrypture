import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserContextType } from '../types';
import { userService } from '../services/userService';
import { taskService } from '../services/taskService';

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
        console.log('User data auto-saved successfully');
      } else {
        console.error('Failed to auto-save user data');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
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

    // Get completed tasks count
    const completedTasks = taskService.getTasks().filter(task => task.completed);
    const completedTasksCount = completedTasks.length;

    const result = userService.addExperienceWithBobr(amount, completedTasksCount);
    
    if (result.success) {
      const updatedUser = userService.getUser();
      if (updatedUser) {
        setUser(updatedUser);
        saveUserWithFeedback(updatedUser);
      }
    }

    return result;
  };

  const addStatRewards = (rewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  }) => {
    const success = userService.addStatRewards(rewards);

    if (success && user) {
      const updatedUser = {
        ...user,
        body: user.body + (rewards.body || 0),
        mind: user.mind + (rewards.mind || 0),
        soul: user.soul + (rewards.soul || 0),
        updatedAt: new Date(),
      };
      setUser(updatedUser);
      saveUserWithFeedback(updatedUser);
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
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};
