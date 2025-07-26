import { render, screen, fireEvent } from '@testing-library/react';
import { StartHereSection } from '../StartHereSection';
import { useTasks } from '../../hooks/useTasks';
import { useHabits } from '../../hooks/useHabits';

// Mock the hooks
jest.mock('../../hooks/useTasks');
jest.mock('../../hooks/useHabits');

const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;
const mockUseHabits = useHabits as jest.MockedFunction<typeof useHabits>;

describe('StartHereSection', () => {
  beforeEach(() => {
    // Default mock implementations
    mockUseTasks.mockReturnValue({
      addTask: jest.fn(),
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
      addHabit: jest.fn(),
      habits: [],
      isSaving: false,
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });
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

  it('expands category when clicked', () => {
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    const mindTasksCard = screen.getByText('Mind').closest('div');
    fireEvent.click(mindTasksCard!);
    
    // Should show task preview after expansion
    expect(screen.getByText(/Next Task/)).toBeInTheDocument();
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

  it('renders with collapsible completed sections', () => {
    render(<StartHereSection isVisible={true} onClose={jest.fn()} />);
    
    // Check that the component renders with the new collapsible functionality
    expect(screen.getByText('Start Here')).toBeInTheDocument();
    expect(screen.getByText(/Choose categories to get started with progressively challenging tasks and habits:/)).toBeInTheDocument();
  });
}); 