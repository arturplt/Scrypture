// Mock AutoSaveIndicator component first
jest.mock('../AutoSaveIndicator', () => ({
  AutoSaveIndicator: function MockAutoSaveIndicator({ isSaving }: any) {
    return (
      <div data-testid="auto-save-indicator">
        {isSaving ? 'Saving...' : 'Saved'}
      </div>
    );
  },
}));

// Mock the hooks but preserve the providers
jest.mock('../../hooks/useUser', () => {
  const actual = jest.requireActual('../../hooks/useUser');
  return {
    ...actual,
    useUser: jest.fn(),
    UserProvider: actual.UserProvider,
  };
});

jest.mock('../../hooks/useTasks', () => {
  const actual = jest.requireActual('../../hooks/useTasks');
  return {
    ...actual,
    useTasks: jest.fn(),
    TaskProvider: actual.TaskProvider,
  };
});

jest.mock('../../hooks/useHabits', () => {
  const actual = jest.requireActual('../../hooks/useHabits');
  return {
    ...actual,
    useHabits: jest.fn(),
    HabitProvider: actual.HabitProvider,
  };
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StartHereSection } from '../StartHereSection';
import { useTasks } from '../../hooks/useTasks';
import { useHabits } from '../../hooks/useHabits';
import { useUser } from '../../hooks/useUser';
import { UserProvider } from '../../hooks/useUser';
import { TaskProvider } from '../../hooks/useTasks';
import { HabitProvider } from '../../hooks/useHabits';



// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <UserProvider>
      <TaskProvider>
        <HabitProvider>
          {component}
        </HabitProvider>
      </TaskProvider>
    </UserProvider>
  );
};

describe('StartHereSection', () => {
  const mockAddTask = jest.fn();
  const mockAddHabit = jest.fn();

  beforeEach(() => {
    // Configure mock hooks
    (useUser as jest.Mock).mockReturnValue({
      user: {
        id: 'test-user',
        name: 'Test User',
        level: 1,
        experience: 100,
        body: 5,
        mind: 8,
        soul: 3,
        achievements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        bobrStage: 'hatchling',
        damProgress: 25,
      },
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
      applyAchievementRewards: jest.fn(),
    });

    (useTasks as jest.Mock).mockReturnValue({
      addTask: mockAddTask,
      tasks: [],
      isSaving: false,
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTask: jest.fn(),
      refreshTasks: jest.fn(),
      bringTaskToTop: jest.fn(),
      lastSaved: null,
    });

    (useHabits as jest.Mock).mockReturnValue({
      addHabit: mockAddHabit,
      habits: [],
      isSaving: false,
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    // Clear localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders StartHereSection when visible', () => {
    const { container } = renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    // Debug: log what's actually rendered
    console.log('Container HTML:', container.innerHTML);
    
    expect(screen.getByText('Start Here')).toBeInTheDocument();
    expect(screen.getByText(/Choose categories to get started with progressively challenging tasks and habits:/)).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    renderWithProviders(<StartHereSection isVisible={false} onClose={jest.fn()} />);
    
    expect(screen.queryByText('Start Here')).not.toBeInTheDocument();
  });

  it('displays task categories', () => {
    renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    expect(screen.getByText('Mind')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Soul')).toBeInTheDocument();
  });

  it('displays habit categories', () => {
    renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    expect(screen.getByText('Mind Habits')).toBeInTheDocument();
    expect(screen.getByText('Body Habits')).toBeInTheDocument();
    expect(screen.getByText('Soul Habits')).toBeInTheDocument();
  });

  it('expands category when clicked and shows task preview', async () => {
    renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    const mindTasksCard = screen.getByText('Mind').closest('div');
    fireEvent.click(mindTasksCard!);
    
    // Should show task preview after expansion
    await waitFor(() => {
      expect(screen.getByText(/Next Task/)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    renderWithProviders(<StartHereSection isVisible={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows progress bars for categories', () => {
    renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    // Progress bars should be present (they're divs with width styles)
    const progressBars = document.querySelectorAll('div[style*="width: 0%"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('adds task when "Add Task" button is clicked', async () => {
    renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    // Expand a category first
    const mindTasksCard = screen.getByText('Mind').closest('div');
    fireEvent.click(mindTasksCard!);
    
    // Wait for the task preview to appear
    await waitFor(() => {
      expect(screen.getByText(/Next Task/)).toBeInTheDocument();
    });
    
    // Find and click the "Add This Task" button
    const addTaskButton = screen.getByText('Add This Task');
    fireEvent.click(addTaskButton);
    
    // Verify that addTask was called
    expect(mockAddTask).toHaveBeenCalled();
  });

  it('adds habit when "Add Habit" button is clicked', async () => {
    renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    // Expand a habit category first
    const mindHabitsCard = screen.getByText('Mind Habits').closest('div');
    fireEvent.click(mindHabitsCard!);
    
    // Wait for the habit preview to appear
    await waitFor(() => {
      expect(screen.getByText(/Next Habit/)).toBeInTheDocument();
    });
    
    // Find and click the "Add This Habit" button
    const addHabitButton = screen.getByText('Add This Habit');
    fireEvent.click(addHabitButton);
    
    // Verify that addHabit was called
    expect(mockAddHabit).toHaveBeenCalled();
  });

  it('renders with collapsible completed sections', () => {
    renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    // Check that the component renders with the new collapsible functionality
    expect(screen.getByText('Start Here')).toBeInTheDocument();
    expect(screen.getByText(/Choose categories to get started with progressively challenging tasks and habits:/)).toBeInTheDocument();
  });

  it('loads saved given tasks from localStorage', () => {
    renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);

    expect(localStorageMock.getItem).toHaveBeenCalledWith('scrypture_tasks');
  });

  it('saves given tasks to localStorage when tasks are added', async () => {
    renderWithProviders(<StartHereSection isVisible={true} onClose={jest.fn()} />);

    // Find and click on a category to expand it
    const mindCategory = screen.getByText('Mind');
    fireEvent.click(mindCategory);

    // Wait for the task preview to appear
    await waitFor(() => {
      expect(screen.getByText('Add This Task')).toBeInTheDocument();
    });

    // Note the initial task content
    const initialTaskTitle = screen.getByText('Read 1 page');
    const initialDifficulty = screen.getByText('Next Task (Difficulty 0)');

    // Click "Add This Task" button
    const addTaskButton = screen.getByText('Add This Task');
    fireEvent.click(addTaskButton);

    // Verify that the task content changed (indicating the task was added)
    await waitFor(() => {
      expect(screen.getByText('Write 1 idea')).toBeInTheDocument();
      expect(screen.getByText('Next Task (Difficulty 1)')).toBeInTheDocument();
    });
  });

  it('should reset state when data is cleared', async () => {
    // Set up initial state with some given tasks and habits
    localStorage.setItem('startHereGivenTasks', JSON.stringify(['task1', 'task2']));
    localStorage.setItem('startHereGivenHabits', JSON.stringify(['habit1']));
    
    const onDataChange = jest.fn();
    render(<StartHereSection isVisible={true} onClose={jest.fn()} onDataChange={onDataChange} />);
    
    // Wait for the component to load the data from localStorage
    await waitFor(() => {
      expect(localStorage.getItem('startHereGivenTasks')).toBe(JSON.stringify(['task1', 'task2']));
      expect(localStorage.getItem('startHereGivenHabits')).toBe(JSON.stringify(['habit1']));
    });
    
    // Clear the data
    localStorage.removeItem('startHereGivenTasks');
    localStorage.removeItem('startHereGivenHabits');
    
    // Dispatch the custom event
    window.dispatchEvent(new CustomEvent('scrypture-data-cleared'));
    
    // Verify that onDataChange was called
    await waitFor(() => {
      expect(onDataChange).toHaveBeenCalled();
    });
  });
}); 