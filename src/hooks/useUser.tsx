import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserContextType } from '../types';
import { userService } from '../services/userService';

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
        updatedAt: new Date()
      };
      setUser(updatedUser);
      saveUserWithFeedback(updatedUser);
      console.log('Experience added and auto-saved');
    }
  };

  const addStatRewards = (rewards: { body?: number; mind?: number; soul?: number }) => {
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
      console.log('Stat rewards added and auto-saved');
    }
  };

  const unlockAchievement = (achievementId: string) => {
    const success = userService.unlockAchievement(achievementId);
    if (success && user) {
      // Add the new achievement to the user's achievements
      const newAchievement = {
        id: achievementId,
        name: `Achievement ${achievementId}`,
        description: 'An unlocked achievement',
        unlocked: true,
        unlockedAt: new Date(),
        icon: '🏆',
      };
      const updatedUser = {
        ...user,
        achievements: [...user.achievements, newAchievement],
      };
      setUser(updatedUser);
      saveUserWithFeedback(updatedUser);
      console.log('Achievement unlocked and auto-saved');
    }
  };

  const createUser = (name: string) => {
    const newUser = userService.createUser(name);
    setUser(newUser);
    saveUserWithFeedback(newUser);
    console.log('User created and auto-saved');
    return newUser;
  };

  const value: UserContextType = {
    user,
    updateUser,
    addExperience,
    addStatRewards,
    unlockAchievement,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 