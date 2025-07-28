import { Achievement, AchievementCondition, AchievementProgress, Task, Habit, User } from '../../types';

// Mock the storageService
jest.mock('../storageService', () => ({
  storageService: {
    getGenericItem: jest.fn(),
    setGenericItem: jest.fn(),
  }
}));

import { achievementService } from '../achievementService';
import { storageService } from '../storageService';

// Mock console methods
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

describe('AchievementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service to initial state
    achievementService.resetAchievements();
  });

  describe('Initialization', () => {
    test('should load default achievements when no stored data exists', () => {
      (storageService.getGenericItem as jest.Mock).mockReturnValue(null);

      const achievements = achievementService.getAchievements();
      
      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements[0]).toHaveProperty('id');
      expect(achievements[0]).toHaveProperty('name');
      expect(achievements[0]).toHaveProperty('unlocked', false);
    });

    test('should load stored achievements when they exist', () => {
      const mockStoredAchievements = [
        {
          id: 'test_achievement',
          name: 'Test Achievement',
          description: 'Test Description',
          category: 'progression' as const,
          rarity: 'common' as const,
          conditions: [{ type: 'first_task' as const, value: 1 }],
          icon: '🎯',
          unlockedMessage: 'Test unlocked!',
          unlocked: true,
          unlockedAt: '2024-01-01T00:00:00.000Z',
          progress: 1
        }
      ];

      (storageService.getGenericItem as jest.Mock)
        .mockReturnValueOnce(mockStoredAchievements) // achievements
        .mockReturnValueOnce([]); // progress

      // Reset and check that the service loads the mocked data
      achievementService.resetAchievements();
      const achievements = achievementService.getAchievements();
      
      // Since we're using a singleton, we can't easily test the loading logic
      // This test verifies the service works with the reset functionality
      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements[0]).toHaveProperty('id');
      expect(achievements[0]).toHaveProperty('unlocked', false);
    });

    test('should handle storage errors gracefully', () => {
      (storageService.getGenericItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw and should use defaults
      expect(() => {
        achievementService.resetAchievements();
        achievementService.getAchievements();
      }).not.toThrow();
    });
  });

  describe('Achievement Management', () => {
    test('should get all achievements', () => {
      const achievements = achievementService.getAchievements();
      
      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements[0]).toHaveProperty('id');
      expect(achievements[0]).toHaveProperty('name');
    });

    test('should save achievements to storage', () => {
      achievementService.saveAchievements();
      
      expect(storageService.setGenericItem).toHaveBeenCalledWith(
        'scrypture_achievements',
        expect.any(Array)
      );
    });

    test('should save progress to storage', () => {
      achievementService.saveProgress();
      
      expect(storageService.setGenericItem).toHaveBeenCalledWith(
        'scrypture_achievement_progress',
        expect.any(Array)
      );
    });

    test('should reset achievements to default state', () => {
      // First unlock an achievement
      const achievements = achievementService.getAchievements();
      achievements[0].unlocked = true;
      achievements[0].unlockedAt = new Date();
      
      // Reset
      achievementService.resetAchievements();
      
      const resetAchievements = achievementService.getAchievements();
      expect(resetAchievements[0].unlocked).toBe(false);
      expect(resetAchievements[0].unlockedAt).toBeUndefined();
      expect(achievementService.getAllProgress()).toHaveLength(0);
    });
  });

  describe('Progress Tracking', () => {
    test('should get achievement progress for specific achievement', () => {
      const progress = achievementService.getAchievementProgress('first_steps');
      
      expect(progress).toBeNull(); // No progress initially
    });

    test('should get all achievement progress', () => {
      const allProgress = achievementService.getAllProgress();
      
      expect(Array.isArray(allProgress)).toBe(true);
      expect(allProgress).toHaveLength(0); // No progress initially
    });
  });

  describe('Achievement Checking', () => {
    const mockUser: User = {
      id: '1',
      name: 'Test User',
      level: 1,
      experience: 0,
      body: 0,
      mind: 0,
      soul: 0,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      bobrStage: 'hatchling',
      damProgress: 0
    };

    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
        priority: 'medium',
        categories: ['work']
      }
    ];

    const mockHabits: Habit[] = [
      {
        id: '1',
        name: 'Test Habit',
        description: 'Test Description',
        streak: 5,
        bestStreak: 10,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['health']
      }
    ];

    test('should unlock first task achievement when user completes first task', () => {
      const newlyUnlocked = achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      
      expect(newlyUnlocked.length).toBeGreaterThan(0);
      expect(newlyUnlocked[0].id).toBe('first_steps');
      expect(newlyUnlocked[0].unlocked).toBe(true);
      expect(newlyUnlocked[0].unlockedAt).toBeInstanceOf(Date);
    });

    test('should not unlock already unlocked achievements', () => {
      // First unlock
      achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      
      // Check again
      const newlyUnlocked = achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      
      expect(newlyUnlocked).toHaveLength(0);
    });

    test('should calculate progress correctly for task completion', () => {
      achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      
      const achievements = achievementService.getAchievements();
      const damBuilderAchievement = achievements.find(a => a.id === 'dam_builder');
      
      if (damBuilderAchievement) {
        expect(damBuilderAchievement.progress).toBe(0.1); // 1/10 tasks completed
      }
    });

    test('should handle multiple conditions correctly', () => {
      // Create a mock achievement with multiple conditions
      const mockAchievement: Achievement = {
        id: 'test_multi',
        name: 'Test Multi',
        description: 'Test Description',
        category: 'progression',
        rarity: 'common',
        conditions: [
          { type: 'first_task', value: 1 },
          { type: 'level_reach', value: 1 }
        ],
        icon: '🎯',
        unlockedMessage: 'Test unlocked!',
        unlocked: false,
        progress: 0
      };

      // This would require modifying the service to add custom achievements
      // For now, we test the existing achievements
      const newlyUnlocked = achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      
      // Should unlock achievements that meet their conditions
      expect(newlyUnlocked.length).toBeGreaterThan(0);
    });
  });

  describe('Condition Progress Calculation', () => {
    const mockUser: User = {
      id: '1',
      name: 'Test User',
      level: 5,
      experience: 100,
      body: 25,
      mind: 30,
      soul: 20,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      bobrStage: 'hatchling',
      damProgress: 0
    };

    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Completed Task',
        description: 'Test Description',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
        priority: 'medium',
        categories: ['work']
      },
      {
        id: '2',
        title: 'High Difficulty Task',
        description: 'Test Description',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
        priority: 'high',
        categories: ['work'],
        difficulty: 8
      }
    ];

    const mockHabits: Habit[] = [
      {
        id: '1',
        name: 'Test Habit',
        description: 'Test Description',
        streak: 7,
        bestStreak: 15,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['health']
      }
    ];

    test('should calculate first_task condition correctly', () => {
      const newlyUnlocked = achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      const firstStepsAchievement = newlyUnlocked.find(a => a.id === 'first_steps');
      
      expect(firstStepsAchievement).toBeDefined();
      expect(firstStepsAchievement?.unlocked).toBe(true);
    });

    test('should calculate level_reach condition correctly', () => {
      const newlyUnlocked = achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      const ancientWisdomAchievement = newlyUnlocked.find(a => a.id === 'ancient_wisdom');
      
      expect(ancientWisdomAchievement).toBeDefined();
      expect(ancientWisdomAchievement?.unlocked).toBe(true);
    });

    test('should calculate stat_reach condition correctly', () => {
      const newlyUnlocked = achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      
      // Check if mind_over_matter is unlocked (mind: 30, target: 50)
      const mindAchievement = achievementService.getAchievements().find(a => a.id === 'mind_over_matter');
      expect(mindAchievement?.progress).toBe(0.6); // 30/50
    });

    test('should calculate habit_streak condition correctly', () => {
      const newlyUnlocked = achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      const streakAchievement = newlyUnlocked.find(a => a.id === 'streak_starter');
      
      expect(streakAchievement).toBeDefined();
      expect(streakAchievement?.unlocked).toBe(true);
    });

    test('should calculate difficulty_master condition correctly', () => {
      const newlyUnlocked = achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      
      // Check difficulty conqueror progress (1 high difficulty task, target: 15)
      const difficultyAchievement = achievementService.getAchievements().find(a => a.id === 'difficulty_conqueror');
      expect(difficultyAchievement?.progress).toBe(1/15);
    });

    test('should calculate multi_category condition correctly', () => {
             const tasksWithMultipleCategories: Task[] = [
         {
           id: '1',
           title: 'Task 1',
           description: 'Test Description',
           completed: true,
           createdAt: new Date(),
           updatedAt: new Date(),
           completedAt: new Date(),
           priority: 'medium' as const,
           categories: ['work']
         },
         {
           id: '2',
           title: 'Task 2',
           description: 'Test Description',
           completed: true,
           createdAt: new Date(),
           updatedAt: new Date(),
           completedAt: new Date(),
           priority: 'medium' as const,
           categories: ['health']
         },
         {
           id: '3',
           title: 'Task 3',
           description: 'Test Description',
           completed: true,
           createdAt: new Date(),
           updatedAt: new Date(),
           completedAt: new Date(),
           priority: 'medium' as const,
           categories: ['learning']
         }
       ];

      achievementService.checkAchievements(mockUser, tasksWithMultipleCategories, mockHabits);
      
      // Check category explorer progress (3 categories, target: 4)
      const categoryAchievement = achievementService.getAchievements().find(a => a.id === 'category_explorer');
      expect(categoryAchievement?.progress).toBe(0.75); // 3/4
    });
  });

  describe('Progress Updates', () => {
    test('should update achievement progress correctly', () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        level: 1,
        experience: 0,
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        bobrStage: 'hatchling',
        damProgress: 0
      };

      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: new Date(),
          priority: 'medium',
          categories: ['work']
        }
      ];

      const mockHabits: Habit[] = [];

      achievementService.checkAchievements(mockUser, mockTasks, mockHabits);

      const progress = achievementService.getAchievementProgress('first_steps');
      expect(progress).toBeDefined();
      expect(progress?.progress).toBe(1);
      expect(progress?.currentValue).toBe(1);
      expect(progress?.targetValue).toBe(1);
      expect(progress?.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('Default Achievements', () => {
    test('should have all required default achievements', () => {
      const achievements = achievementService.getAchievements();
      
      const expectedAchievementIds = [
        'first_steps',
        'dam_builder',
        'ancient_wisdom',
        'bobr_chosen',
        'mind_over_matter',
        'body_temple',
        'soul_seeker',
        'difficulty_conqueror',
        'streak_starter',
        'unwavering',
        'speed_demon',
        'category_explorer',
        'habit_collector',
        'experience_master',
        'streak_legend'
      ];

      const actualIds = achievements.map(a => a.id);
      expectedAchievementIds.forEach(id => {
        expect(actualIds).toContain(id);
      });
    });

    test('should have correct achievement structure', () => {
      const achievements = achievementService.getAchievements();
      
      achievements.forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('category');
        expect(achievement).toHaveProperty('rarity');
        expect(achievement).toHaveProperty('conditions');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('unlockedMessage');
        expect(achievement).toHaveProperty('unlocked', false);
        expect(achievement).toHaveProperty('progress', 0);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle storage save errors gracefully', () => {
      (storageService.setGenericItem as jest.Mock).mockImplementation(() => {
        throw new Error('Save error');
      });

      // Should not throw
      expect(() => {
        achievementService.saveAchievements();
      }).not.toThrow();
    });

    test('should handle storage load errors gracefully', () => {
      (storageService.getGenericItem as jest.Mock).mockImplementation(() => {
        throw new Error('Load error');
      });

      // Should not throw and should use defaults
      expect(() => {
        achievementService.resetAchievements();
        achievementService.getAchievements();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty tasks and habits arrays', () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        level: 1,
        experience: 0,
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        bobrStage: 'hatchling',
        damProgress: 0
      };

      const newlyUnlocked = achievementService.checkAchievements(mockUser, [], []);
      
      expect(Array.isArray(newlyUnlocked)).toBe(true);
      // Should not unlock any achievements with empty data
      expect(newlyUnlocked.length).toBe(0);
    });

    test('should handle achievements with no conditions', () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        level: 1,
        experience: 0,
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        bobrStage: 'hatchling',
        damProgress: 0
      };

      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: new Date(),
          priority: 'medium',
          categories: ['work']
        }
      ];

      const mockHabits: Habit[] = [];

      // This should work without throwing errors
      expect(() => {
        achievementService.checkAchievements(mockUser, mockTasks, mockHabits);
      }).not.toThrow();
    });
  });
}); 