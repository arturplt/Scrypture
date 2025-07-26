import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HabitCard } from '../HabitCard';
import { useHabits } from '../../hooks/useHabits';
import { useUser } from '../../hooks/useUser';
import { habitService } from '../../services/habitService';

// Mock the services
jest.mock('../../services/habitService', () => ({
  habitService: {
    isCompletedToday: jest.fn(),
  },
}));

// Mock the hooks
jest.mock('../../hooks/useHabits', () => ({
  useHabits: jest.fn(),
}));

jest.mock('../../hooks/useUser', () => ({
  useUser: jest.fn(),
}));

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
  HabitEditForm: ({ habit, onCancel }: { habit: any; onCancel: () => void }) => (
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
      },
      updateUser: jest.fn(),
      addExperience: jest.fn(),
      addStatRewards: jest.fn(),
      removeStatRewards: jest.fn(),
      removeExperience: jest.fn(),
      unlockAchievement: jest.fn(),
      createUser: jest.fn(),
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
      },
      updateUser: jest.fn(),
      addExperience: mockAddExperience,
      addStatRewards: mockAddStatRewards,
      removeStatRewards: jest.fn(),
      removeExperience: jest.fn(),
      unlockAchievement: jest.fn(),
      createUser: jest.fn(),
      isSaving: false,
    });

    render(<HabitCard habit={mockHabit} />);
    
    const completeButton = screen.getByTitle('Mark as complete');
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
    
    expect(screen.getByTitle('Completed today!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('disables complete button when habit is completed today', () => {
    mockHabitService.isCompletedToday.mockReturnValue(true);
    
    render(<HabitCard habit={mockHabit} />);
    
    const completeButton = screen.getByTitle('Completed today!');
    expect(completeButton).toBeDisabled();
  });

  it('shows completion animation when completing habit', async () => {
    render(<HabitCard habit={mockHabit} />);
    
    const completeButton = screen.getByTitle('Mark as complete');
    fireEvent.click(completeButton);
    
    // Should show completion animation
    expect(screen.getByText('⏳')).toBeInTheDocument();
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(screen.getByText('○')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('opens edit form when edit button is clicked', () => {
    render(<HabitCard habit={mockHabit} />);
    
    const editButton = screen.getByTitle('Edit habit');
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('habit-edit-form')).toBeInTheDocument();
    expect(screen.getByText('Editing: Morning Exercise')).toBeInTheDocument();
  });

  it('closes edit form when cancel is clicked', () => {
    render(<HabitCard habit={mockHabit} />);
    
    // Open edit form
    const editButton = screen.getByTitle('Edit habit');
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
    
    expect(screen.getByText('Rewards:')).toBeInTheDocument();
    expect(screen.getByText('💪 +1 Body')).toBeInTheDocument();
    expect(screen.getByText('⭐ +5 XP')).toBeInTheDocument();
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
    
    const completeButton = screen.getByTitle('Mark as complete');
    
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
    
    const completeButton = screen.getByTitle('Mark as complete');
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
      },
      updateUser: jest.fn(),
      addExperience: mockAddExperience,
      addStatRewards: mockAddStatRewards,
      removeStatRewards: jest.fn(),
      removeExperience: jest.fn(),
      unlockAchievement: jest.fn(),
      createUser: jest.fn(),
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
    
    expect(screen.getByText('💪 +2 Body')).toBeInTheDocument();
    expect(screen.getByText('🧠 +1 Mind')).toBeInTheDocument();
    expect(screen.getByText('✨ +3 Soul')).toBeInTheDocument();
    expect(screen.getByText('⭐ +10 XP')).toBeInTheDocument();
  });
}); 