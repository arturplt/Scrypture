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

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskForm } from '../TaskForm';
import { Task } from '../../types';
import { categoryService } from '../../services/categoryService';
import { useTasks } from '../../hooks/useTasks';
import { useHabits } from '../../hooks/useHabits';

// Mock the services
jest.mock('../../services/categoryService', () => ({
  categoryService: {
    getCustomCategories: jest.fn(),
    addCustomCategory: jest.fn(),
    getAllCategories: jest.fn(() => []),
  },
}));

const mockCategoryService = categoryService as jest.Mocked<
  typeof categoryService
>;

// Mock the AutoSaveIndicator component
jest.mock('../AutoSaveIndicator', () => ({
  AutoSaveIndicator: ({ isSaving }: { isSaving: boolean }) => (
    <div data-testid="auto-save-indicator">
      {isSaving ? 'Saving...' : 'Saved'}
    </div>
  ),
}));

// Mock the useTasks hook
const mockAddTask = jest.fn();
const mockUpdateTask = jest.fn();
const mockIsSaving = false;
const mockTasks = [
  {
    id: '1',
    title: 'Workout',
    description: 'Daily exercise routine',
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    priority: 'high' as const,
    categories: ['body'],
  },
  {
    id: '2',
    title: 'Read Book',
    description: 'Read 30 minutes',
    completed: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    priority: 'medium' as const,
    categories: ['mind'],
  },
  {
    id: '3',
    title: 'Study Programming',
    description: 'Learn React development',
    completed: false,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    priority: 'high' as const,
    categories: ['skills'],
  },
  {
    id: '4',
    title: 'Clean Kitchen',
    description: 'Clean the kitchen area',
    completed: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    priority: 'medium' as const,
    categories: ['home'],
  },
];

const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;
const mockUseHabits = useHabits as jest.MockedFunction<typeof useHabits>;

describe('TaskForm (new system)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoryService.getCustomCategories.mockReturnValue([]);
    
    // Configure the mock hooks
    mockUseTasks.mockReturnValue({
      addTask: mockAddTask,
      updateTask: mockUpdateTask,
      tasks: mockTasks,
      isSaving: mockIsSaving,
      lastSaved: new Date(),
      refreshTasks: jest.fn(),
      bringTaskToTop: jest.fn(),
      deleteTask: jest.fn(),
      toggleTask: jest.fn(),
    });
    
    mockUseHabits.mockReturnValue({
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
      habits: [],
      isSaving: false,
    });
  });

  it('renders collapsed form initially', () => {
    render(<TaskForm />);
    expect(screen.getByPlaceholderText('Intention')).toBeInTheDocument();
    expect(screen.queryByText('Category:')).not.toBeInTheDocument();
  });

  it('expands when title is clicked', () => {
    render(<TaskForm />);
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    expect(screen.getByText('Category:')).toBeInTheDocument();
    expect(screen.getByText('Priority:')).toBeInTheDocument();
    expect(screen.getByText('Core Attributes:')).toBeInTheDocument();
  });

  it('shows category buttons based on existing tasks', () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    // The categories should be derived from existing tasks
    expect(screen.getByText('+ Add Category')).toBeInTheDocument();
  });

  it('submits form with correct data', () => {
    render(<TaskForm />);
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    const submitBtn = screen.getByText('Create Task');
    fireEvent.click(submitBtn);
    expect(mockAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Task',
        priority: 'medium',
      })
    );
  });

  it('validates required fields', () => {
    render(<TaskForm />);
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    const submitBtn = screen.getByText('Create Task');
    fireEvent.click(submitBtn);
    expect(screen.getByText('Please fill this field')).toBeInTheDocument();
  });

  it('expands form when title is clicked', () => {
    render(<TaskForm />);
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    expect(screen.getByText('Category:')).toBeInTheDocument();
    expect(screen.getByText('Priority:')).toBeInTheDocument();
    expect(screen.getByText('Core Attributes:')).toBeInTheDocument();
  });

  it('shows auto-save indicator when form is expanded', () => {
    render(<TaskForm />);
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    expect(screen.getAllByTestId('auto-save-indicator')).toHaveLength(2);
    expect(screen.getAllByText('Saved')).toHaveLength(2);
  });
}); 