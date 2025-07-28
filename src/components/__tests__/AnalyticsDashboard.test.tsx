import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsDashboard from '../AnalyticsDashboard';
import { useUser } from '../../hooks/useUser';
import { useTasks } from '../../hooks/useTasks';
import { useHabits } from '../../hooks/useHabits';
import { useAchievements } from '../../hooks/useAchievements';

// Mock the hooks
jest.mock('../../hooks/useUser', () => {
  const actual = jest.requireActual('../../hooks/useUser');
  return {
    ...actual,
    default: actual.default,
    useUser: jest.fn(),
    UserProvider: actual.UserProvider,
  };
});
jest.mock('../../hooks/useTasks', () => {
  const actual = jest.requireActual('../../hooks/useTasks');
  return {
    ...actual,
    default: actual.default,
    useTasks: jest.fn(),
    TaskProvider: actual.TaskProvider,
  };
});
jest.mock('../../hooks/useHabits', () => {
  const actual = jest.requireActual('../../hooks/useHabits');
  return {
    ...actual,
    default: actual.default,
    useHabits: jest.fn(),
    HabitProvider: actual.HabitProvider,
  };
});
jest.mock('../../hooks/useAchievements');

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;
const mockUseHabits = useHabits as jest.MockedFunction<typeof useHabits>;
const mockUseAchievements = useAchievements as jest.MockedFunction<typeof useAchievements>;

describe('AnalyticsDashboard', () => {
  const mockOnClose = jest.fn();

  const createMockUser = () => ({
    id: 'test-user',
    name: 'Test User',
    level: 5,
    experience: 250,
    body: 10,
    mind: 15,
    soul: 8,
    achievements: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    bobrStage: 'young' as const,
    damProgress: 45,
  });

  const createMockTasks = () => [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      completed: true,
      priority: 'medium' as const,
      categories: ['work'],
      statRewards: { body: 1, mind: 0, soul: 0, xp: 10 },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      completedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      completed: false,
      priority: 'high' as const,
      categories: ['personal'],
      statRewards: { body: 0, mind: 1, soul: 0, xp: 15 },
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
    {
      id: '3',
      title: 'Task 3',
      description: 'Description 3',
      completed: true,
      priority: 'low' as const,
      categories: ['health'],
      statRewards: { body: 0, mind: 0, soul: 1, xp: 20 },
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17'),
      completedAt: new Date('2024-01-17'),
    },
  ];

  const createMockHabits = () => [
    {
      id: '1',
      name: 'Morning Exercise',
      description: 'Daily workout',
      targetFrequency: 'daily' as const,
      categories: ['health'],
      statRewards: { body: 2, mind: 0, soul: 1, xp: 15 },
      streak: 5,
      bestStreak: 10,
      lastCompleted: new Date('2024-01-17'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-17'),
    },
    {
      id: '2',
      name: 'Reading',
      description: 'Daily reading',
      targetFrequency: 'daily' as const,
      categories: ['learning'],
      statRewards: { body: 0, mind: 2, soul: 1, xp: 12 },
      streak: 3,
      bestStreak: 7,
      lastCompleted: new Date('2024-01-16'),
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-16'),
    },
  ];

  const createMockAchievements = () => [
    {
      id: '1',
      name: 'First Steps',
      title: 'First Steps',
      description: 'Complete your first task',
      unlocked: true,
      unlockedAt: new Date('2024-01-15'),
      category: 'progression' as const,
      icon: '🎯',
      xpReward: 50,
      rarity: 'common' as const,
      conditions: [{ type: 'task_complete' as const, value: 1 }],
      unlockedMessage: 'You completed your first task!',
    },
    {
      id: '2',
      name: 'Habit Former',
      title: 'Habit Former',
      description: 'Create your first habit',
      unlocked: true,
      unlockedAt: new Date('2024-01-10'),
      category: 'consistency' as const,
      icon: '🔄',
      xpReward: 75,
      rarity: 'common' as const,
      conditions: [{ type: 'consistency' as const, value: 1 }],
      unlockedMessage: 'You created your first habit!',
    },
    {
      id: '3',
      name: 'Level Master',
      title: 'Level Master',
      description: 'Reach level 10',
      unlocked: false,
      category: 'progression' as const,
      icon: '⭐',
      xpReward: 100,
      rarity: 'rare' as const,
      conditions: [{ type: 'level_reach' as const, value: 10 }],
      unlockedMessage: 'You reached level 10!',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseUser.mockReturnValue({
      user: createMockUser(),
      updateUser: jest.fn(),
      addExperience: jest.fn(),
      addExperienceWithBobr: jest.fn(),
      addStatRewards: jest.fn(),
      addStatRewardsWithBobr: jest.fn(),
      removeStatRewards: jest.fn(),
      removeExperience: jest.fn(),
      unlockAchievement: jest.fn(),
      createUser: jest.fn(),
      applyAchievementRewards: jest.fn(),
      isSaving: false,
    });

    mockUseTasks.mockReturnValue({
      tasks: createMockTasks(),
      addTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTask: jest.fn(),
      isSaving: false,
      lastSaved: new Date(),
      refreshTasks: jest.fn(),
      bringTaskToTop: jest.fn(),
    });

    mockUseHabits.mockReturnValue({
      habits: createMockHabits(),
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    mockUseAchievements.mockReturnValue({
      achievements: createMockAchievements(),
      achievementProgress: [],
      checkAchievements: jest.fn(),
      getAchievementProgress: jest.fn(),
      refreshAchievements: jest.fn(),
      isSaving: false,
    });
  });

  describe('Visibility and basic rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <AnalyticsDashboard isOpen={false} onClose={mockOnClose} />
      );

      expect(screen.queryByText('Analytics Dashboard')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    it('should render all tab buttons', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Progress' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Habits' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Achievements' })).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();
    });
  });

  describe('Tab navigation', () => {
    it('should start with Overview tab content visible', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      // Overview content should be visible by default
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
      expect(screen.getByText('Total XP')).toBeInTheDocument();
    });

    it('should switch to Progress tab when clicked', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const progressTab = screen.getByRole('button', { name: 'Progress' });
      fireEvent.click(progressTab);

      expect(screen.getByText('Weekly Progress')).toBeInTheDocument();
    });

    it('should switch to Habits tab when clicked', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const habitsTab = screen.getByRole('button', { name: 'Habits' });
      fireEvent.click(habitsTab);

      expect(screen.getByText('Habit Performance')).toBeInTheDocument();
    });

    it('should switch to Achievements tab when clicked', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const achievementsTab = screen.getByRole('button', { name: 'Achievements' });
      fireEvent.click(achievementsTab);

      expect(screen.getByText('Achievement Progress')).toBeInTheDocument();
    });
  });

  describe('Overview tab content', () => {
    it('should display correct completion rate', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      // 2 completed out of 3 total = 66.7%
      expect(screen.getByText('66.7%')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    });

    it('should display total XP', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('Total XP')).toBeInTheDocument();
    });

    it('should display best streak from habits', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Best Streak')).toBeInTheDocument();
    });

    it('should display category breakdown', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('Category Distribution')).toBeInTheDocument();
      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('personal')).toBeInTheDocument();
      expect(screen.getByText('health')).toBeInTheDocument();
    });
  });

  describe('Progress tab content', () => {
    it('should display weekly progress chart', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const progressTab = screen.getByRole('button', { name: 'Progress' });
      fireEvent.click(progressTab);

      expect(screen.getByText('Weekly Progress')).toBeInTheDocument();
    });

    it('should display progress bars for each day', () => {
      const { container } = render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const progressTab = screen.getByRole('button', { name: 'Progress' });
      fireEvent.click(progressTab);

      const progressBars = container.querySelectorAll('.progressBar');
      expect(progressBars.length).toBe(7); // 7 days
    });
  });

  describe('Habits tab content', () => {
    it('should display habit performance section', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const habitsTab = screen.getByRole('button', { name: 'Habits' });
      fireEvent.click(habitsTab);

      expect(screen.getByText('Habit Performance')).toBeInTheDocument();
    });

    it('should display all habits with their stats', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const habitsTab = screen.getByRole('button', { name: 'Habits' });
      fireEvent.click(habitsTab);

      expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
      expect(screen.getByText('Reading')).toBeInTheDocument();
    });

    it('should display current and best streaks for habits', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const habitsTab = screen.getByRole('button', { name: 'Habits' });
      fireEvent.click(habitsTab);

      expect(screen.getByText('Current:')).toBeInTheDocument();
      expect(screen.getByText('Best:')).toBeInTheDocument();
    });

    it('should show empty state when no habits exist', () => {
      mockUseHabits.mockReturnValue({
        habits: [],
        isSaving: false,
        addHabit: jest.fn(),
        updateHabit: jest.fn(),
        deleteHabit: jest.fn(),
        completeHabit: jest.fn(),
      });

      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const habitsTab = screen.getByRole('button', { name: 'Habits' });
      fireEvent.click(habitsTab);

      expect(screen.getByText('No habits created yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first habit to see analytics here')).toBeInTheDocument();
    });
  });

  describe('Achievements tab content', () => {
    it('should display achievement progress section', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const achievementsTab = screen.getByRole('button', { name: 'Achievements' });
      fireEvent.click(achievementsTab);

      expect(screen.getByText('Achievement Progress')).toBeInTheDocument();
    });

    it('should display achievement statistics', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const achievementsTab = screen.getByRole('button', { name: 'Achievements' });
      fireEvent.click(achievementsTab);

      expect(screen.getByText('2')).toBeInTheDocument(); // Unlocked
      expect(screen.getByText('3')).toBeInTheDocument(); // Total
      expect(screen.getByText('67%')).toBeInTheDocument(); // Completion percentage
    });
  });

  describe('User interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const closeButton = screen.getByRole('button', { name: '✕' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      const { container } = render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const overlay = container.querySelector('.overlay');
      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', () => {
      const { container } = render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const modal = container.querySelector('.modal');
      fireEvent.click(modal!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Data calculations', () => {
    it('should calculate completion rate correctly with no tasks', () => {
      mockUseTasks.mockReturnValue({
        tasks: [],
        addTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        toggleTask: jest.fn(),
        isSaving: false,
        lastSaved: new Date(),
        refreshTasks: jest.fn(),
        bringTaskToTop: jest.fn(),
      });

      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should calculate longest streak correctly with no habits', () => {
      mockUseHabits.mockReturnValue({
        habits: [],
        isSaving: false,
        addHabit: jest.fn(),
        updateHabit: jest.fn(),
        deleteHabit: jest.fn(),
        completeHabit: jest.fn(),
      });

      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const closeButton = screen.getByRole('button', { name: '✕' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const overviewTab = screen.getByRole('button', { name: 'Overview' });
      const progressTab = screen.getByRole('button', { name: 'Progress' });

      overviewTab.focus();
      expect(document.activeElement).toBe(overviewTab);

      fireEvent.keyDown(overviewTab, { key: 'Tab' });
      progressTab.focus();
      expect(document.activeElement).toBe(progressTab);
    });
  });

  describe('Edge cases', () => {
    it('should handle null user gracefully', () => {
      mockUseUser.mockReturnValue({
        user: null,
        updateUser: jest.fn(),
        addExperience: jest.fn(),
        addExperienceWithBobr: jest.fn(),
        addStatRewards: jest.fn(),
        addStatRewardsWithBobr: jest.fn(),
        removeStatRewards: jest.fn(),
        removeExperience: jest.fn(),
        unlockAchievement: jest.fn(),
        createUser: jest.fn(),
        applyAchievementRewards: jest.fn(),
        isSaving: false,
      });

      expect(() => {
        render(<AnalyticsDashboard isOpen={true} onClose={mockOnClose} />);
      }).not.toThrow();
    });

    it('should handle tasks without categories gracefully', () => {
      const tasksWithoutCategories = createMockTasks().map(task => ({
        ...task,
        categories: [],
      }));

      mockUseTasks.mockReturnValue({
        tasks: tasksWithoutCategories,
        addTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        toggleTask: jest.fn(),
        isSaving: false,
        lastSaved: new Date(),
        refreshTasks: jest.fn(),
        bringTaskToTop: jest.fn(),
      });

      expect(() => {
        render(<AnalyticsDashboard isOpen={true} onClose={mockOnClose} />);
      }).not.toThrow();
    });

    it('should handle rapid tab switching', () => {
      render(
        <AnalyticsDashboard isOpen={true} onClose={mockOnClose} />
      );

      const overviewTab = screen.getByRole('button', { name: 'Overview' });
      const progressTab = screen.getByRole('button', { name: 'Progress' });
      const habitsTab = screen.getByRole('button', { name: 'Habits' });

      fireEvent.click(progressTab);
      fireEvent.click(habitsTab);
      fireEvent.click(overviewTab);

      expect(overviewTab).toHaveClass('active');
    });
  });
}); 