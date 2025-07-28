import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAchievements, AchievementProvider } from '../useAchievements';
import { UserProvider } from '../useUser';
import { achievementService } from '../../services/achievementService';
import { Achievement, AchievementProgress, User, Task, Habit } from '../../types';

// Mock the achievement service
jest.mock('../../services/achievementService');
const mockAchievementService = achievementService as jest.Mocked<typeof achievementService>;

const TestComponent = () => {
  const { 
    achievements, 
    achievementProgress, 
    checkAchievements, 
    getAchievementProgress,
    isSaving,
    lastSaved
  } = useAchievements();

  const mockUser: User = {
    id: 'test-user',
    name: 'Test User',
    level: 1,
    experience: 100,
    body: 5,
    mind: 10,
    soul: 8,
    achievements: [],
    bobrStage: 'hatchling',
    damProgress: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTasks: Task[] = [];
  const mockHabits: Habit[] = [];

  return (
    <div>
      <div data-testid="achievements-count">{achievements.length}</div>
      <div data-testid="progress-count">{achievementProgress.length}</div>
      <div data-testid="is-saving">{isSaving.toString()}</div>
      <div data-testid="last-saved">{lastSaved?.toISOString() || 'never'}</div>
      <button 
        onClick={() => checkAchievements(mockUser, mockTasks, mockHabits)} 
        data-testid="check-achievements"
      >
        Check Achievements
      </button>
      <button 
        onClick={() => getAchievementProgress('early_bird')} 
        data-testid="get-progress"
      >
        Get Progress
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <UserProvider>
      <AchievementProvider>
        {component}
      </AchievementProvider>
    </UserProvider>
  );
};

describe('useAchievements', () => {
  const mockAchievements: Achievement[] = [
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete 5 tasks before 9 AM',
      icon: 'sunrise',
      category: 'progression',
      rarity: 'common',
      conditions: [{
        type: 'daily_tasks',
        value: 5,
      }],
      unlockedMessage: 'You are an early bird!',
      unlocked: true,
      unlockedAt: new Date(),
    },
  ];

  const mockProgress: AchievementProgress[] = [
    {
      achievementId: 'early_bird',
      progress: 0.6,
      currentValue: 3,
      targetValue: 5,
      lastUpdated: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockAchievementService.getAchievements.mockReturnValue(mockAchievements);
    mockAchievementService.getAllProgress.mockReturnValue(mockProgress);
    mockAchievementService.checkAchievements.mockReturnValue([]);
    mockAchievementService.getAchievementProgress.mockReturnValue(mockProgress[0]);
  });

  it('should throw error when used outside of AchievementProvider', () => {
    const TestComponentWithoutProvider = () => {
      useAchievements();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponentWithoutProvider />)).toThrow(
      'useAchievements must be used within an AchievementProvider'
    );
    
    consoleSpy.mockRestore();
  });

  it('should load achievements and progress on mount', async () => {
    renderWithProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(mockAchievementService.getAchievements).toHaveBeenCalled();
      expect(mockAchievementService.getAllProgress).toHaveBeenCalled();
    });

    expect(screen.getByTestId('achievements-count')).toHaveTextContent('1');
    expect(screen.getByTestId('progress-count')).toHaveTextContent('1');
  });

  it('should handle loading errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAchievementService.getAchievements.mockImplementation(() => {
      throw new Error('Failed to load');
    });

    renderWithProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load achievements:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should check achievements and update state when new achievements are unlocked', async () => {
    const newAchievement: Achievement = {
      id: 'task_master',
      name: 'Task Master',
      description: 'Complete 10 tasks',
      icon: 'trophy',
      category: 'mastery',
      rarity: 'rare',
      conditions: [{
        type: 'task_complete',
        value: 10,
      }],
      unlockedMessage: 'You are a task master!',
      unlocked: true,
      unlockedAt: new Date(),
    };

    const updatedAchievements = [...mockAchievements, newAchievement];
    const updatedProgress = [...mockProgress];

    mockAchievementService.checkAchievements.mockReturnValue([newAchievement]);
    mockAchievementService.getAchievements.mockReturnValue(updatedAchievements);
    mockAchievementService.getAllProgress.mockReturnValue(updatedProgress);

    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('check-achievements').click();
    });

    await waitFor(() => {
      expect(mockAchievementService.checkAchievements).toHaveBeenCalled();
      expect(screen.getByTestId('achievements-count')).toHaveTextContent('2');
    });

    // Should trigger save feedback
    await waitFor(() => {
      expect(screen.getByTestId('is-saving')).toHaveTextContent('false');
      expect(screen.getByTestId('last-saved')).not.toHaveTextContent('never');
    });
  });

  it('should update progress even when no new achievements are unlocked', async () => {
    const updatedProgress: AchievementProgress[] = [
      {
        achievementId: 'early_bird',
        progress: 0.8,
        currentValue: 4,
        targetValue: 5,
        lastUpdated: new Date(),
      },
    ];

    mockAchievementService.checkAchievements.mockReturnValue([]);
    mockAchievementService.getAllProgress.mockReturnValue(updatedProgress);

    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('check-achievements').click();
    });

    await waitFor(() => {
      expect(mockAchievementService.getAllProgress).toHaveBeenCalledTimes(2); // Once on mount, once on check
    });
  });

  it('should handle checkAchievements errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAchievementService.checkAchievements.mockImplementation(() => {
      throw new Error('Check failed');
    });

    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('check-achievements').click();
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to check achievements:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should get achievement progress for specific achievement', () => {
    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('get-progress').click();
    });

    expect(mockAchievementService.getAchievementProgress).toHaveBeenCalledWith('early_bird');
  });

  it('should return empty array when checkAchievements is called with null user', async () => {
    renderWithProvider(<TestComponent />);

    // Modify test component to pass null user
    const TestComponentWithNullUser = () => {
      const { checkAchievements } = useAchievements();
      
      return (
        <button 
          onClick={() => {
            const result = checkAchievements(null as any, [], []);
            expect(result).toEqual([]);
          }} 
          data-testid="check-null-user"
        >
          Check Null User
        </button>
      );
    };

    const { rerender } = renderWithProvider(<TestComponent />);
    rerender(
      <AchievementProvider>
        <TestComponentWithNullUser />
      </AchievementProvider>
    );

    act(() => {
      screen.getByTestId('check-null-user').click();
    });

    expect(mockAchievementService.checkAchievements).not.toHaveBeenCalled();
  });

  it('should show saving state during save operation', async () => {
    const newAchievement: Achievement = {
      id: 'test_achievement',
      name: 'Test Achievement',
      description: 'Test description',
      icon: 'star',
      category: 'special',
      rarity: 'common',
      conditions: [{
        type: 'task_complete',
        value: 1,
      }],
      unlockedMessage: 'Test achievement unlocked!',
      unlocked: true,
      unlockedAt: new Date(),
    };

    mockAchievementService.checkAchievements.mockReturnValue([newAchievement]);
    mockAchievementService.getAchievements.mockReturnValue([...mockAchievements, newAchievement]);

    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('check-achievements').click();
    });

    // Should briefly show saving state
    expect(screen.getByTestId('is-saving')).toHaveTextContent('true');

    // Should complete saving after delay
    await waitFor(() => {
      expect(screen.getByTestId('is-saving')).toHaveTextContent('false');
    }, { timeout: 1000 });
  });

  it('should maintain context value stability', () => {
    let contextValue1: any;
    let contextValue2: any;

    const TestContextStability = () => {
      const context = useAchievements();
      if (!contextValue1) {
        contextValue1 = context;
      } else {
        contextValue2 = context;
      }
      return <div>Test</div>;
    };

    const { rerender } = renderWithProvider(<TestContextStability />);
    rerender(
      <AchievementProvider>
        <TestContextStability />
      </AchievementProvider>
    );

    // Functions should be stable due to useCallback
    expect(contextValue1.checkAchievements).toBe(contextValue2.checkAchievements);
    expect(contextValue1.getAchievementProgress).toBe(contextValue2.getAchievementProgress);
  });

  it('should provide initial state correctly', () => {
    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId('is-saving')).toHaveTextContent('false');
    expect(screen.getByTestId('last-saved')).toHaveTextContent('never');
  });

  it('should handle service returning null progress gracefully', () => {
    mockAchievementService.getAchievementProgress.mockReturnValue(null);

    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('get-progress').click();
    });

    expect(mockAchievementService.getAchievementProgress).toHaveBeenCalledWith('early_bird');
    // Should not crash when service returns null
  });
}); 