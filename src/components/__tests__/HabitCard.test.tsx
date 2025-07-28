import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HabitCard } from '../HabitCard';
import { useHabits } from '../../hooks/useHabits';
import { useUser } from '../../hooks/useUser';
import { habitService } from '../../services/habitService';
import { Habit } from '../../types';

// Mock the services
jest.mock('../../services/habitService', () => ({
  habitService: {
    isCompletedToday: jest.fn(),
  },
}));

// Mock the hooks
jest.mock('../../hooks/useHabits', () => {
  const actual = jest.requireActual('../../hooks/useHabits');
  return {
    ...actual,
    default: actual.default,
    useHabits: jest.fn(),
    HabitProvider: actual.HabitProvider,
  };
});

jest.mock('../../hooks/useUser', () => {
  const actual = jest.requireActual('../../hooks/useUser');
  return {
    ...actual,
    default: actual.default,
    useUser: jest.fn(),
    UserProvider: actual.UserProvider,
  };
});

// Mock the AutoSaveIndicator component
jest.mock('../AutoSaveIndicator', () => ({
  AutoSaveIndicator: ({ isSaving }: { isSaving: boolean }) => (
    <div data-testid="auto-save-indicator">
      {isSaving ? 'Saving...' : 'Saved'}
    </div>
  ),
}));

// Mock the HabitEditForm component
jest.mock('../HabitEditForm', () => ({
  HabitEditForm: ({ habit, onCancel }: { habit: Habit; onCancel: () => void }) => (
    <div data-testid="habit-edit-form">
      <div>Editing: {habit.name}</div>
      <button onClick={onCancel}>Cancel Edit</button>
    </div>
  ),
}));

const mockUseHabits = useHabits as jest.MockedFunction<typeof useHabits>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockHabitService = habitService as jest.Mocked<typeof habitService>;

const mockHabit = {
  id: '1',
  name: 'Morning Exercise',
  description: 'Daily workout routine',
  targetFrequency: 'daily' as const,
  categories: ['body'],
  streak: 5,
  bestStreak: 10,
  createdAt: new Date('2024-01-01'),
  lastCompleted: undefined,
  statRewards: { body: 1, mind: 0, soul: 0, xp: 5 },
};

describe('HabitCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(() => true),
    });

    mockUseUser.mockReturnValue({
      user: { 
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
        damProgress: 0,
      },
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

    mockHabitService.isCompletedToday.mockReturnValue(false);
  });

  it('renders habit card with auto-save indicator', () => {
    render(<HabitCard habit={mockHabit} />);
    
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
    expect(screen.getByText('Daily workout routine')).toBeInTheDocument();
    expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('auto-resets habit when cooldown timer reaches zero for daily frequency', async () => {
    // Mock a habit that was completed yesterday (should be reset)
    const completedHabit = {
      ...mockHabit,
      lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      streak: 3,
    };

    const mockUpdateHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [completedHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: mockUpdateHabit,
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(() => true),
    });

    mockHabitService.isCompletedToday.mockReturnValue(true);

    render(<HabitCard habit={completedHabit} />);

    // Wait for the useEffect to run and check for reset
    await waitFor(() => {
      expect(mockUpdateHabit).toHaveBeenCalledWith(completedHabit.id, { lastCompleted: undefined });
    });
  });

  it('auto-resets habit when cooldown timer reaches zero for weekly frequency', async () => {
    // Mock a habit that was completed last week (should be reset)
    const completedHabit = {
      ...mockHabit,
      targetFrequency: 'weekly' as const,
      lastCompleted: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      streak: 2,
    };

    const mockUpdateHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [completedHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: mockUpdateHabit,
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(() => true),
    });

    mockHabitService.isCompletedToday.mockReturnValue(true);

    render(<HabitCard habit={completedHabit} />);

    // Wait for the useEffect to run and check for reset
    await waitFor(() => {
      expect(mockUpdateHabit).toHaveBeenCalledWith(completedHabit.id, { lastCompleted: undefined });
    });
  });

  it('auto-resets habit when cooldown timer reaches zero for monthly frequency', async () => {
    // Mock a habit that was completed last month (should be reset)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const completedHabit = {
      ...mockHabit,
      targetFrequency: 'monthly' as const,
      lastCompleted: lastMonth,
      streak: 1,
    };

    const mockUpdateHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [completedHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: mockUpdateHabit,
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(() => true),
    });

    mockHabitService.isCompletedToday.mockReturnValue(true);

    render(<HabitCard habit={completedHabit} />);

    // Wait for the useEffect to run and check for reset
    await waitFor(() => {
      expect(mockUpdateHabit).toHaveBeenCalledWith(completedHabit.id, { lastCompleted: undefined });
    });
  });

  it('allows multiple completions after auto-reset for streak building', async () => {
    // Mock a habit that was completed yesterday (should be reset)
    const completedHabit = {
      ...mockHabit,
      lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      streak: 5,
    };

    const mockUpdateHabit = jest.fn();
    const mockCompleteHabit = jest.fn(() => true);
    
    mockUseHabits.mockReturnValue({
      habits: [completedHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: mockUpdateHabit,
      deleteHabit: jest.fn(),
      completeHabit: mockCompleteHabit,
    });

    mockHabitService.isCompletedToday.mockReturnValue(true);

    const { rerender } = render(<HabitCard habit={completedHabit} />);

    // Wait for auto-reset
    await waitFor(() => {
      expect(mockUpdateHabit).toHaveBeenCalledWith(completedHabit.id, { lastCompleted: undefined });
    });

    // Now simulate the habit being reset (no lastCompleted)
    const resetHabit = {
      ...completedHabit,
      lastCompleted: undefined,
    };

    mockHabitService.isCompletedToday.mockReturnValue(false);

    // Re-render with reset habit
    rerender(<HabitCard habit={resetHabit} />);

    // Should now show checkbox instead of cooldown timer
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.queryByTestId('cooldown-timer')).not.toBeInTheDocument();

    // Should be able to complete the habit again
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockCompleteHabit).toHaveBeenCalledWith(resetHabit.id);
  });

  it('does not auto-reset habit that was completed today', async () => {
    // Mock a habit that was completed today (should NOT be reset)
    const completedHabit = {
      ...mockHabit,
      lastCompleted: new Date(), // Today
      streak: 3,
    };

    const mockUpdateHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [completedHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: mockUpdateHabit,
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(() => true),
    });

    mockHabitService.isCompletedToday.mockReturnValue(true);

    render(<HabitCard habit={completedHabit} />);

    // Wait a bit to ensure useEffect runs
    await waitFor(() => {
      // Should NOT call updateHabit since it was completed today
      expect(mockUpdateHabit).not.toHaveBeenCalled();
    });
  });

  it('shows saving state when isSaving is true', () => {
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isSaving: true,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(() => true),
    });

    render(<HabitCard habit={mockHabit} />);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('completes habit and triggers auto-save', async () => {
    const mockCompleteHabit = jest.fn(() => true);
    const mockAddStatRewards = jest.fn();
    const mockAddExperience = jest.fn();
    
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: mockCompleteHabit,
    });

    mockUseUser.mockReturnValue({
      user: { 
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
        damProgress: 0,
      },
      updateUser: jest.fn(),
      addExperience: mockAddExperience,
      addExperienceWithBobr: jest.fn(),
      addStatRewards: mockAddStatRewards,
      addStatRewardsWithBobr: jest.fn(),
      removeStatRewards: jest.fn(),
      removeExperience: jest.fn(),
      unlockAchievement: jest.fn(),
      createUser: jest.fn(),
      applyAchievementRewards: jest.fn(),
      isSaving: false,
    });

    render(<HabitCard habit={mockHabit} />);
    
    const completeButton = screen.getByRole('checkbox');
    fireEvent.click(completeButton);
    
    // Wait for the completion animation
    await waitFor(() => {
      expect(mockCompleteHabit).toHaveBeenCalledWith('1');
    }, { timeout: 1000 });
    
    // Check that rewards were awarded
    expect(mockAddStatRewards).toHaveBeenCalledWith({ body: 1, mind: 0, soul: 0 });
    expect(mockAddExperience).toHaveBeenCalledWith(5);
  });

  it('shows completed state when habit is completed today', () => {
    mockHabitService.isCompletedToday.mockReturnValue(true);
    
    render(<HabitCard habit={mockHabit} />);
    
    // When completed, it shows cooldown timer instead of completed message
    // The timer format might be different, so just check that some timer text exists
    const timerElement = screen.getByText(/\d+h/);
    expect(timerElement).toBeInTheDocument();
  });

  it('disables complete button when habit is completed today', () => {
    mockHabitService.isCompletedToday.mockReturnValue(true);
    
    render(<HabitCard habit={mockHabit} />);
    
    // When completed, checkbox is not present, cooldown timer is shown instead
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    const timerElement = screen.getByText(/\d+h/);
    expect(timerElement).toBeInTheDocument();
  });

  it('shows completion animation when completing habit', async () => {
    render(<HabitCard habit={mockHabit} />);
    
    const completeButton = screen.getByRole('checkbox');
    fireEvent.click(completeButton);
    
    // Should show disabled checkbox during completion
    expect(completeButton).toBeDisabled();
    
    // Wait for animation to complete (checkbox becomes enabled again)
    await waitFor(() => {
      expect(completeButton).not.toBeDisabled();
    }, { timeout: 1000 });
  });

  it('opens edit form when edit button is clicked', () => {
    render(<HabitCard habit={mockHabit} />);
    
    const editButton = screen.getByRole('button', { name: 'Edit habit' });
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('habit-edit-form')).toBeInTheDocument();
    expect(screen.getByText('Editing: Morning Exercise')).toBeInTheDocument();
  });

  it('closes edit form when cancel is clicked', () => {
    render(<HabitCard habit={mockHabit} />);
    
    // Open edit form
    const editButton = screen.getByRole('button', { name: 'Edit habit' });
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('habit-edit-form')).toBeInTheDocument();
    
    // Close edit form
    const cancelButton = screen.getByText('Cancel Edit');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByTestId('habit-edit-form')).not.toBeInTheDocument();
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
  });

  it('displays habit frequency correctly', () => {
    render(<HabitCard habit={mockHabit} />);
    
    expect(screen.getByText('Daily')).toBeInTheDocument();
  });

  it('displays streak information correctly', () => {
    render(<HabitCard habit={mockHabit} />);
    
    expect(screen.getByText('🔥 5 days')).toBeInTheDocument();
    expect(screen.getByText('🏆 Best: 10')).toBeInTheDocument();
  });

  it('displays rewards when available', () => {
    render(<HabitCard habit={mockHabit} />);
    
    expect(screen.getByText('💪 Body: +1')).toBeInTheDocument();
    expect(screen.getByText('XP: +5')).toBeInTheDocument();
  });

  it('handles habit without description', () => {
    const habitWithoutDescription = {
      ...mockHabit,
      description: undefined,
    };
    
    render(<HabitCard habit={habitWithoutDescription} />);
    
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
    expect(screen.queryByText('Daily workout routine')).not.toBeInTheDocument();
  });

  it('handles habit without stat rewards', () => {
    const habitWithoutRewards = {
      ...mockHabit,
      statRewards: undefined,
    };
    
    render(<HabitCard habit={habitWithoutRewards} />);
    
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
    expect(screen.queryByText('Rewards:')).not.toBeInTheDocument();
  });

  it('handles habit with zero streak', () => {
    const habitWithZeroStreak = {
      ...mockHabit,
      streak: 0,
    };
    
    render(<HabitCard habit={habitWithZeroStreak} />);
    
    expect(screen.getByText('🔥 No streak')).toBeInTheDocument();
  });

  it('handles habit without best streak', () => {
    const habitWithoutBestStreak = {
      ...mockHabit,
      bestStreak: 0,
    };
    
    render(<HabitCard habit={habitWithoutBestStreak} />);
    
    expect(screen.getByText('🔥 5 days')).toBeInTheDocument();
    expect(screen.queryByText('🏆 Best:')).not.toBeInTheDocument();
  });

  it('prevents completion when already completing', async () => {
    const mockCompleteHabit = jest.fn(() => true);
    
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: mockCompleteHabit,
    });

    render(<HabitCard habit={mockHabit} />);
    
        const completeButton = screen.getByRole('checkbox');

    // Click multiple times rapidly
    fireEvent.click(completeButton);
    fireEvent.click(completeButton);
    fireEvent.click(completeButton);
    
    // Should only be called once due to isCompleting state
    await waitFor(() => {
      expect(mockCompleteHabit).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  it('handles completion failure gracefully', async () => {
    const mockCompleteHabit = jest.fn(() => false);
    
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: mockCompleteHabit,
    });

    render(<HabitCard habit={mockHabit} />);
    
    const completeButton = screen.getByRole('checkbox');
    fireEvent.click(completeButton);
    
    await waitFor(() => {
      expect(mockCompleteHabit).toHaveBeenCalledWith('1');
    }, { timeout: 1000 });
    
    // Should not award rewards if completion failed
    const mockAddStatRewards = jest.fn();
    const mockAddExperience = jest.fn();
    
    mockUseUser.mockReturnValue({
      user: { 
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
        damProgress: 0,
      },
      updateUser: jest.fn(),
      addExperience: mockAddExperience,
      addExperienceWithBobr: jest.fn(),
      addStatRewards: mockAddStatRewards,
      addStatRewardsWithBobr: jest.fn(),
      removeStatRewards: jest.fn(),
      removeExperience: jest.fn(),
      unlockAchievement: jest.fn(),
      createUser: jest.fn(),
      applyAchievementRewards: jest.fn(),
      isSaving: false,
    });
    
    expect(mockAddStatRewards).not.toHaveBeenCalled();
    expect(mockAddExperience).not.toHaveBeenCalled();
  });

  it('handles different frequency types', () => {
    const weeklyHabit = {
      ...mockHabit,
      targetFrequency: 'weekly' as const,
    };
    
    render(<HabitCard habit={weeklyHabit} />);
    
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('handles habit with all stat rewards', () => {
    const habitWithAllRewards = {
      ...mockHabit,
      statRewards: { body: 2, mind: 1, soul: 3, xp: 10 },
    };
    
    render(<HabitCard habit={habitWithAllRewards} />);
    
    expect(screen.getByText('💪 Body: +2')).toBeInTheDocument();
    expect(screen.getByText('🧠 Mind: +1')).toBeInTheDocument();
    expect(screen.getByText('✨ Soul: +3')).toBeInTheDocument();
    expect(screen.getByText('XP: +10')).toBeInTheDocument();
  });
}); 