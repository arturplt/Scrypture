import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BobrInteraction } from '../BobrInteraction';
import { useUser } from '../../hooks/useUser';
import { useTasks } from '../../hooks/useTasks';
import { useHabits } from '../../hooks/useHabits';

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

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;
const mockUseHabits = useHabits as jest.MockedFunction<typeof useHabits>;

describe('BobrInteraction', () => {
  const mockOnClose = jest.fn();
  const mockAddTask = jest.fn();
  const mockUser = {
    id: '1',
    name: 'Test User',
    level: 5,
    experience: 100,
    body: 10,
    mind: 10,
    soul: 10,
    achievements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    bobrStage: 'young' as const,
    damProgress: 50
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseUser.mockReturnValue({
      user: mockUser,
      updateUser: jest.fn(),
      addExperience: jest.fn(),
      addStatRewards: jest.fn(),
      removeExperience: jest.fn(),
      removeStatRewards: jest.fn(),
      unlockAchievement: jest.fn(),
      createUser: jest.fn(),
      isSaving: false,
      addExperienceWithBobr: jest.fn(),
      addStatRewardsWithBobr: jest.fn(),
      applyAchievementRewards: jest.fn()
    });

    mockUseTasks.mockReturnValue({
      tasks: [],
      addTask: mockAddTask,
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTask: jest.fn(),
      isSaving: false,
      lastSaved: null,
      refreshTasks: jest.fn(),
      bringTaskToTop: jest.fn()
    });

    mockUseHabits.mockReturnValue({
      habits: [],
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
      isSaving: false
    });
  });

  it('should not render when isOpen is false', () => {
    render(<BobrInteraction isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Hello, Test User!')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', async () => {
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    // Wait for the greeting to appear
    await waitFor(() => {
      expect(screen.getByText(/Hello, Test User!/)).toBeInTheDocument();
    });
  });

  it('should show feeling options after greeting', async () => {
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    // Feeling options should appear immediately
    expect(screen.getByText('Energized')).toBeInTheDocument();
    expect(screen.getByText('Focused')).toBeInTheDocument();
    expect(screen.getByText('Tired')).toBeInTheDocument();
    expect(screen.getByText('Stressed')).toBeInTheDocument();
    expect(screen.getByText('Creative')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
  });

  it('should show task suggestions when a feeling is selected', async () => {
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    // Feeling options should appear immediately
    expect(screen.getByText('Energized')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Energized'));
    
    // Check for Bobr's response and suggestions
    await waitFor(() => {
      expect(screen.getByText(/Your energy is contagious!/)).toBeInTheDocument();
      expect(screen.getByText('Start a new project')).toBeInTheDocument();
      expect(screen.getByText('Exercise or workout')).toBeInTheDocument();
    });
  });

  it('should allow creating a task from a suggestion', async () => {
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    // Navigate through the flow
    expect(screen.getByText('Energized')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Energized'));
    
    await waitFor(() => {
      expect(screen.getByText('Start a new project')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Start a new project'));
    
    // Check for task creation form
    await waitFor(() => {
      expect(screen.getByText('Create Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Start a new project')).toBeInTheDocument();
    });
  });

  it('should create a task when form is submitted', async () => {
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    // Navigate through the flow
    expect(screen.getByText('Energized')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Energized'));
    
    await waitFor(() => {
      expect(screen.getByText('Start a new project')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Start a new project'));
    
    // Submit the form
    await waitFor(() => {
      expect(screen.getByText('Create Task')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Create Task'));
    
    // Check that addTask was called
    expect(mockAddTask).toHaveBeenCalledWith({
      title: 'Start a new project',
      description: 'Suggested by Bobr based on your feeling: Energized',
      completed: false,
      categories: ['personal'],
      priority: 'medium',
      difficulty: 2,
      statRewards: {
        body: 1,
        mind: 1,
        soul: 1,
        xp: 10
      }
    });
  });

  it('should close when Maybe Later is clicked', async () => {
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    // Navigate to task creation
    expect(screen.getByText('Energized')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Energized'));
    
    await waitFor(() => {
      expect(screen.getByText('Start a new project')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Start a new project'));
    
    // Click Maybe Later
    await waitFor(() => {
      expect(screen.getByText('Maybe Later')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Maybe Later'));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close when clicking outside the modal', async () => {
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    // Modal should be rendered immediately
    expect(screen.getByText(/Hello, Test User!/)).toBeInTheDocument();
    
    // Click on the overlay (outside the modal)
    const overlay = screen.getByText(/Hello, Test User!/).closest('div');
    if (overlay) {
      fireEvent.click(overlay);
    }
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show different responses for different feelings', async () => {
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    // Test Energized
    expect(screen.getByText('Energized')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Energized'));
    
    await waitFor(() => {
      expect(screen.getByText(/Your energy is contagious!/)).toBeInTheDocument();
    });
    
    // Close and reopen to test another feeling
    fireEvent.click(screen.getByText('Maybe Later'));
    
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Tired')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Tired'));
    
    await waitFor(() => {
      expect(screen.getByText(/It's okay to rest, friend/)).toBeInTheDocument();
    });
  });

  it('should disable Create Task button when input is empty', async () => {
    render(<BobrInteraction isOpen={true} onClose={mockOnClose} />);
    
    // Navigate to task creation
    expect(screen.getByText('Energized')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Energized'));
    
    await waitFor(() => {
      expect(screen.getByText('Start a new project')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Start a new project'));
    
    // Clear the input
    await waitFor(() => {
      const input = screen.getByDisplayValue('Start a new project');
      fireEvent.change(input, { target: { value: '' } });
    });
    
    // Check that Create Task button is disabled
    const createButton = screen.getByText('Create Task');
    expect(createButton).toBeDisabled();
  });
}); 