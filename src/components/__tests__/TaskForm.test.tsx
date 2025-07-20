import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../TaskForm';
import { categoryService } from '../../services/categoryService';
import { taskService } from '../../services/taskService';

// Mock the services
jest.mock('../../services/categoryService', () => ({
  categoryService: {
    getCustomCategories: jest.fn(),
    addCustomCategory: jest.fn(),
  }
}));

jest.mock('../../services/taskService', () => ({
  taskService: {
    calculateStatRewards: jest.fn(),
  }
}));

const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;
const mockTaskService = taskService as jest.Mocked<typeof taskService>;

// Mock the useTasks hook
const mockAddTask = jest.fn();
jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    addTask: mockAddTask,
  }),
}));

describe('TaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoryService.getCustomCategories.mockReturnValue([]);
    mockTaskService.calculateStatRewards.mockReturnValue({
      body: 1,
      mind: 0,
      soul: 0,
      xp: 20
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
    expect(screen.getByText('Rewards:')).toBeInTheDocument();
  });

  it('shows default categories when expanded', () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    expect(screen.getByText('💪 BODY')).toBeInTheDocument();
    expect(screen.getByText('🧠 MIND')).toBeInTheDocument();
    expect(screen.getByText('✨ SOUL')).toBeInTheDocument();
  });

  it('loads and displays custom categories', async () => {
    const mockCustomCategories = [
      { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } },
      { name: 'workout', icon: '💪', color: 'var(--color-body)', points: { body: 2, mind: 0, soul: 1 } }
    ];
    
    mockCategoryService.getCustomCategories.mockReturnValue(mockCustomCategories);
    
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    await waitFor(() => {
      expect(screen.getByText('🎯 TEST')).toBeInTheDocument();
      expect(screen.getByText('💪 WORKOUT')).toBeInTheDocument();
    });
  });

  it('allows selecting categories', () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    const mindButton = screen.getByText('🧠 MIND');
    fireEvent.click(mindButton);
    
    expect(mindButton).toHaveClass('categoryButtonActive');
  });

  it('allows selecting priority levels', () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    const highPriorityButton = screen.getByText('HIGH PRIORITY');
    fireEvent.click(highPriorityButton);
    
    expect(highPriorityButton).toHaveClass('priorityButtonActive');
  });

  it('shows add category button when expanded', () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    expect(screen.getByText('+ Add Category')).toBeInTheDocument();
  });



  it('submits task with correct data', async () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    // Fill in the form
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    
    const descriptionInput = screen.getByPlaceholderText('Description (optional)');
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    const submitButton = screen.getByText('Add Task');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        category: 'body',
        completed: false,
        priority: 'medium',
      });
    }, { timeout: 5000 });
  });

  it('calculates rewards correctly for different categories', () => {
    mockTaskService.calculateStatRewards.mockReturnValue({
      body: 2,
      mind: 1,
      soul: 0,
      xp: 10
    });
    
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    // Wait for rewards to be calculated
    waitFor(() => {
      expect(screen.getByText('+2')).toBeInTheDocument(); // Body
      expect(screen.getByText('+1')).toBeInTheDocument(); // Mind
      expect(screen.getByText('+0')).toBeInTheDocument(); // Soul
      expect(screen.getByText('+10')).toBeInTheDocument(); // XP
    }, { timeout: 5000 });
  });

  it('prevents form from minimizing when clicking inside expanded form', () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    // Click on a category button
    const mindButton = screen.getByText('🧠 MIND');
    fireEvent.click(mindButton);
    
    // Form should still be expanded
    expect(screen.getByText('Category:')).toBeInTheDocument();
    expect(screen.getByText('Priority:')).toBeInTheDocument();
  });

  it('minimizes form when title is empty and clicking outside', () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    // Blur the input without entering any text
    fireEvent.blur(titleInput);
    
    // Form should be minimized
    expect(screen.queryByText('Category:')).not.toBeInTheDocument();
  });

  it('keeps form expanded when title has content and clicking outside', () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    // Enter some text
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    
    // Blur the input
    fireEvent.blur(titleInput);
    
    // Form should still be expanded
    expect(screen.getByText('Category:')).toBeInTheDocument();
  });

  it('handles category service errors gracefully', () => {
    mockCategoryService.getCustomCategories.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    // Should still show default categories even if custom categories fail to load
    expect(screen.getByText('💪 BODY')).toBeInTheDocument();
    expect(screen.getByText('🧠 MIND')).toBeInTheDocument();
    expect(screen.getByText('✨ SOUL')).toBeInTheDocument();
  });
}); 