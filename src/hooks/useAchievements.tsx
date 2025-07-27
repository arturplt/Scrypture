import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Achievement, AchievementProgress, AchievementContextType, Task, Habit, User } from '../types';
import { achievementService } from '../services/achievementService';
import { userService } from '../services/userService';
import { taskService } from '../services/taskService';

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementProviderProps {
  children: React.ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();

  // Load achievements on mount
  useEffect(() => {
    const loadAchievements = () => {
      try {
        const loadedAchievements = achievementService.getAchievements();
        const loadedProgress = achievementService.getAllProgress();
        
        setAchievements(loadedAchievements);
        setAchievementProgress(loadedProgress);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };

    loadAchievements();
  }, []);

  // Auto-save functionality with debouncing
  const saveWithFeedback = useCallback(async () => {
    setIsSaving(true);
    
    // Simulate save delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setIsSaving(false);
    setLastSaved(new Date());
  }, []);

  // Check achievements and update state
  const checkAchievements = useCallback((user: User, tasks: Task[], habits: Habit[]): Achievement[] => {
    if (!user) return [];

    try {
      const newlyUnlocked = achievementService.checkAchievements(user, tasks, habits);
      
      if (newlyUnlocked.length > 0) {
        console.log('🏆 Achievement(s) unlocked:', newlyUnlocked.map(a => a.name));

        // Apply achievement rewards to the user (XP, body, mind, soul)
        const completedTasks = taskService.getTasks().filter(task => task.completed);
        const completedTasksCount = completedTasks.length;
        
        const rewardResult = userService.applyAchievementRewards(newlyUnlocked, completedTasksCount);
        
        if (rewardResult.success) {
          console.log('🏆 Achievement rewards applied successfully:', rewardResult.totalRewards);
          
          // Log Bóbr evolution status
          if (rewardResult.evolved) {
            console.log('🦫 Bóbr evolved from achievement rewards!');
          }
          if (rewardResult.damProgressChanged) {
            console.log('🌊 Dam progress changed from achievement rewards!');
          }
        } else {
          console.error('❌ Failed to apply achievement rewards');
        }

        // Update local achievement state
        const updatedAchievements = achievementService.getAchievements();
        const updatedProgress = achievementService.getAllProgress();
        
        setAchievements(updatedAchievements);
        setAchievementProgress(updatedProgress);
        
        // Trigger save feedback
        saveWithFeedback();
      } else {
        // Update progress even if no new achievements unlocked
        const updatedProgress = achievementService.getAllProgress();
        setAchievementProgress(updatedProgress);
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Failed to check achievements:', error);
      return [];
    }
  }, [saveWithFeedback]);

  // Get achievement progress for a specific achievement
  const getAchievementProgress = useCallback((achievementId: string): AchievementProgress | null => {
    return achievementService.getAchievementProgress(achievementId);
  }, []);

  // Reset achievements (for testing/debugging) - unused for now
  // const resetAchievements = useCallback(() => {
  //   achievementService.resetAchievements();
  //   const resetAchievements = achievementService.getAchievements();
  //   const resetProgress = achievementService.getAllProgress();
  //   
  //   setAchievements(resetAchievements);
  //   setAchievementProgress(resetProgress);
  //   saveWithFeedback();
  // }, [saveWithFeedback]);

  const contextValue: AchievementContextType = {
    achievements,
    achievementProgress,
    checkAchievements,
    getAchievementProgress,
    isSaving,
    lastSaved,
  };

  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = (): AchievementContextType => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}; 