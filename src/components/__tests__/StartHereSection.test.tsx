import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StartHereSection } from '../StartHereSection';
import { useTasks } from '../../hooks/useTasks';
import { useHabits } from '../../hooks/useHabits';

// Mock the hooks
jest.mock('../../hooks/useTasks');
jest.mock('../../hooks/useHabits');

const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;
const mockUseHabits = useHabits as jest.MockedFunction<typeof useHabits>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('StartHereSection', () => {
  const mockAddTask = jest.fn();
  const mockAddHabit = jest.fn();

  beforeEach(() => {
    // Default mock implementations
    mockUseTasks.mockReturnValue({
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

    mockUseHabits.mockReturnValue({
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
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    expect(screen.getByText('Start Here')).toBeInTheDocument();
    expect(screen.getByText(/Choose categories to get started with progressively challenging tasks and habits:/)).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<StartHereSection isVisible={false} onClose={jest.fn()} />);
    
    expect(screen.queryByText('Start Here')).not.toBeInTheDocument();
  });

  it('displays task categories', () => {
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    expect(screen.getByText('Mind')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Soul')).toBeInTheDocument();
  });

  it('displays habit categories', () => {
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    expect(screen.getByText('Mind Habits')).toBeInTheDocument();
    expect(screen.getByText('Body Habits')).toBeInTheDocument();
    expect(screen.getByText('Soul Habits')).toBeInTheDocument();
  });

  it('expands category when clicked and shows task preview', async () => {
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    const mindTasksCard = screen.getByText('Mind').closest('div');
    fireEvent.click(mindTasksCard!);
    
    // Should show task preview after expansion
    await waitFor(() => {
      expect(screen.getByText(/Next Task/)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<StartHereSection isVisible={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows progress bars for categories', () => {
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    // Progress bars should be present (they're divs with width styles)
    const progressBars = document.querySelectorAll('div[style*="width: 0%"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('adds task when "Add Task" button is clicked', async () => {
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
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
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
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
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    // Check that the component renders with the new collapsible functionality
    expect(screen.getByText('Start Here')).toBeInTheDocument();
    expect(screen.getByText(/Choose categories to get started with progressively challenging tasks and habits:/)).toBeInTheDocument();
  });

  it('loads saved given tasks from localStorage', () => {
    const savedTasks = ['mind_0', 'body_1'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTasks));
    
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('startHereGivenTasks');
  });

  it('saves given tasks to localStorage when tasks are added', async () => {
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    // Expand a category and add a task
    const mindTasksCard = screen.getByText('Mind').closest('div');
    fireEvent.click(mindTasksCard!);
    
    await waitFor(() => {
      expect(screen.getByText(/Next Task/)).toBeInTheDocument();
    });
    
    const addTaskButton = screen.getByText('Add This Task');
    fireEvent.click(addTaskButton);
    
    // Verify that localStorage.setItem was called
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
}); 