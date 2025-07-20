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
jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    addTask: jest.fn(),
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

  it('shows refresh and debug buttons when expanded', () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
    expect(screen.getByText('🔍 Debug')).toBeInTheDocument();
  });

  it('refreshes categories when refresh button is clicked', async () => {
    const mockCustomCategories = [
      { name: 'new-category', icon: '🌟', color: 'var(--color-accent-gold)', points: { body: 1, mind: 1, soul: 1 } }
    ];
    
    mockCategoryService.getCustomCategories.mockReturnValue(mockCustomCategories);
    
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    const refreshButton = screen.getByText('🔄 Refresh');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockCategoryService.getCustomCategories).toHaveBeenCalled();
    });
  });

  it('shows debug information when debug button is clicked', () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue(JSON.stringify([
        { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } }
      ]))
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    render(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    
    const debugButton = screen.getByText('🔍 Debug');
    fireEvent.click(debugButton);
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('scrypture_custom_categories');
  });

  it('submits task with correct data', async () => {
    const mockAddTask = jest.fn();
    jest.doMock('../../hooks/useTasks', () => ({
      useTasks: () => ({
        addTask: mockAddTask,
      }),
    }));
    
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
    });
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
    
    expect(screen.getByText('+2')).toBeInTheDocument(); // Body
    expect(screen.getByText('+1')).toBeInTheDocument(); // Mind
    expect(screen.getByText('+0')).toBeInTheDocument(); // Soul
    expect(screen.getByText('+10')).toBeInTheDocument(); // XP
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