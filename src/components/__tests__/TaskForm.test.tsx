import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../TaskForm';
import { categoryService } from '../../services/categoryService';

// Mock the services
jest.mock('../../services/categoryService', () => ({
  categoryService: {
    getCustomCategories: jest.fn(),
    addCustomCategory: jest.fn(),
    getAllCategories: jest.fn(() => []), // <-- Added mock for getAllCategories
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
    const bodySpans = screen.getAllByText('BODY');
    const bodyLabel = bodySpans.find(span => span.parentElement && span.parentElement.textContent?.includes('+1'));
    expect(bodyLabel?.parentElement).toHaveTextContent('BODY +1');
    fireEvent.click(mindBtn);
    const mindSpans = screen.getAllByText('MIND');
    const mindLabel = mindSpans.find(span => span.parentElement && span.parentElement.textContent?.includes('+1'));
    expect(mindLabel?.parentElement).toHaveTextContent('MIND +1');
    fireEvent.click(soulBtn);
    const soulSpans = screen.getAllByText('SOUL');
    const soulLabel = soulSpans.find(span => span.parentElement && span.parentElement.textContent?.includes('+1'));
    expect(soulLabel?.parentElement).toHaveTextContent('SOUL +1');
    // Toggle off
    fireEvent.click(bodyBtn);
    const bodyLabelAfter = screen.getAllByText('BODY').find(span => span.parentElement && span.parentElement.textContent?.includes('+1'));
    expect(bodyLabelAfter).toBeUndefined();
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

  it('renders difficulty buttons 0-9', () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it('selects a difficulty and highlights the button', () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    const button5 = screen.getByText('5');
    fireEvent.click(button5);
    // Check if the button has the correct background style
    expect(button5).toHaveStyle('background: var(--difficulty-6)');
  });

  it('updates total XP when difficulty changes', () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    const medBtn = screen.getByText('MEDIUM PRIORITY');
    fireEvent.click(medBtn);
    const button7 = screen.getByText('7');
    fireEvent.click(button7);
    // Priority XP for medium = 10, Fibonacci XP for 7 = 21
    expect(screen.getByText('+31 XP')).toBeInTheDocument();
  });

  it('submits task with correct difficulty', async () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    fireEvent.change(screen.getByPlaceholderText('Intention'), { target: { value: 'Diff Test' } });
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), { target: { value: 'Diff Desc' } });
    fireEvent.click(screen.getByText('LOW PRIORITY'));
    fireEvent.click(screen.getByText('8'));
    fireEvent.click(screen.getByText('Add Task'));
    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Diff Test',
          description: 'Diff Desc',
          priority: 'low',
          difficulty: 8,
        })
      );
    });
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
      expect(mockAddTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          description: 'Test Desc',
          category: expect.any(String),
          completed: false,
          priority: 'low',
          statRewards: expect.objectContaining({ body: 1, mind: 1 }),
        })
      );
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
    const customCategories = [
      { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
      { name: 'workout', icon: '💪', color: 'var(--color-body)' },
    ];
    mockCategoryService.getCustomCategories.mockReturnValue(customCategories);
    mockCategoryService.getAllCategories.mockReturnValue(customCategories);
    const { container } = render(<TaskForm />);
    fireEvent.click(screen.getByPlaceholderText('Intention'));
    await waitFor(() => {
      expect(container.textContent).toContain('🎯');
      expect(container.textContent?.toLowerCase()).toContain('test');
      expect(container.textContent).toContain('💪');
      expect(container.textContent?.toLowerCase()).toContain('workout');
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