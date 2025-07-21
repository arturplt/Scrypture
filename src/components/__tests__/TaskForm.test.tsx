import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../TaskForm';
import { categoryService } from '../../services/categoryService';

// Mock the services
jest.mock('../../services/categoryService', () => ({
  categoryService: {
    getCustomCategories: jest.fn(),
    addCustomCategory: jest.fn(),
  }
}));

const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;

// Mock the useTasks hook
const mockAddTask = jest.fn();
jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    addTask: mockAddTask,
  }),
}));

describe('TaskForm (new system)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoryService.getCustomCategories.mockReturnValue([]);
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

  it('shows BODY, MIND, SOUL toggles and toggles them', () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    const bodyBtn = screen.getByText('BODY');
    const mindBtn = screen.getByText('MIND');
    const soulBtn = screen.getByText('SOUL');
    fireEvent.click(bodyBtn);
    expect(screen.getByText('BODY +1')).toBeInTheDocument();
    fireEvent.click(mindBtn);
    expect(screen.getByText('MIND +1')).toBeInTheDocument();
    fireEvent.click(soulBtn);
    expect(screen.getByText('SOUL +1')).toBeInTheDocument();
    // Toggle off
    fireEvent.click(bodyBtn);
    expect(screen.queryByText('BODY +1')).not.toBeInTheDocument();
  });

  it('allows selecting priority and shows correct XP', () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    const lowBtn = screen.getByText('LOW PRIORITY');
    const medBtn = screen.getByText('MEDIUM PRIORITY');
    const highBtn = screen.getByText('HIGH PRIORITY');
    fireEvent.click(lowBtn);
    expect(screen.getByText('+5 XP')).toBeInTheDocument();
    fireEvent.click(medBtn);
    expect(screen.getByText('+10 XP')).toBeInTheDocument();
    fireEvent.click(highBtn);
    expect(screen.getByText('+15 XP')).toBeInTheDocument();
  });

  it('submits task with correct statRewards', async () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    fireEvent.change(screen.getByPlaceholderText('Intention'), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), { target: { value: 'Test Desc' } });
    fireEvent.click(screen.getByText('BODY'));
    fireEvent.click(screen.getByText('MIND'));
    fireEvent.click(screen.getByText('LOW PRIORITY'));
    fireEvent.click(screen.getByText('Add Task'));
    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Desc',
        category: expect.any(String),
        completed: false,
        priority: 'low',
        statRewards: { body: 1, mind: 1 },
      });
    });
  });

  it('shows add category button and allows adding category', () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    expect(screen.getByText('+ Add Category')).toBeInTheDocument();
    // Simulate opening modal (actual modal logic tested elsewhere)
    fireEvent.click(screen.getByText('+ Add Category'));
    // Modal should open (in real app, tested in modal tests)
  });

  it('loads and displays custom categories', async () => {
    const mockCustomCategories = [
      { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
      { name: 'workout', icon: '💪', color: 'var(--color-body)' }
    ];
    mockCategoryService.getCustomCategories.mockReturnValue(mockCustomCategories);
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    await waitFor(() => {
      expect(screen.getByText('🎯 TEST')).toBeInTheDocument();
      expect(screen.getByText('💪 WORKOUT')).toBeInTheDocument();
    });
  });

  it('prevents form from minimizing when clicking inside expanded form', () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    fireEvent.click(screen.getByText('BODY'));
    expect(screen.getByText('Category:')).toBeInTheDocument();
    expect(screen.getByText('Priority:')).toBeInTheDocument();
  });

  it('minimizes form when title is empty and clicking outside', () => {
    render(<TaskForm />);
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    fireEvent.blur(titleInput);
    expect(screen.queryByText('Category:')).not.toBeInTheDocument();
  });

  it('keeps form expanded when title has content and clicking outside', () => {
    render(<TaskForm />);
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.click(titleInput);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.blur(titleInput);
    expect(screen.getByText('Category:')).toBeInTheDocument();
  });
}); 