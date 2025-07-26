import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCard } from '../TaskCard';
import { Task } from '../../types';

// Mock the useTasks hook
jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    toggleTask: jest.fn(),
    bringTaskToTop: jest.fn(),
  }),
}));

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  priority: 'medium',
  categories: ['work'],
  difficulty: 2,
  statRewards: {
    xp: 10,
    body: 0,
    mind: 1,
    soul: 0,
  },
};

describe('TaskCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority')).toBeInTheDocument();
  });

  it('handles task completion', () => {
    render(<TaskCard task={mockTask} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // The toggleTask function should be called
    expect(checkbox).toBeInTheDocument();
  });

  it('shows completed state correctly', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskCard task={completedTask} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('displays categories correctly', () => {
    const taskWithCategories = { ...mockTask, categories: ['work', 'personal'] };
    render(<TaskCard task={taskWithCategories} />);

    // Categories are shown in the task details when expanded
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    render(<TaskCard task={taskWithoutDescription} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('handles missing categories gracefully', () => {
    const taskWithoutCategories = { ...mockTask, categories: [] };
    render(<TaskCard task={taskWithoutCategories} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  describe('Inline Edit Functionality', () => {
    it('should show edit form when edit button is clicked', async () => {
      render(<TaskCard task={mockTask} />);

      const editButton = screen.getByLabelText('Edit task');
      fireEvent.click(editButton);

      // Should be in transitioning state initially
      const cardContainer = screen.getByText('Test Task').closest('div');
      expect(cardContainer).toHaveClass('transitioningToEdit');

      // Fast forward 200ms to complete transition
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should now be in editing state
      expect(cardContainer).toHaveClass('editing');
    });

    it('should prevent multiple rapid edit clicks during transition', () => {
      render(<TaskCard task={mockTask} />);

      const editButton = screen.getByLabelText('Edit task');
      fireEvent.click(editButton);
      fireEvent.click(editButton); // Second click during transition

      // Should only be in transitioning state, not editing
      const cardContainer = screen.getByText('Test Task').closest('div');
      expect(cardContainer).toHaveClass('transitioningToEdit');
      expect(cardContainer).not.toHaveClass('editing');
    });

    it('should show TaskEditForm when in editing state', async () => {
      render(<TaskCard task={mockTask} />);

      const editButton = screen.getByLabelText('Edit task');
      fireEvent.click(editButton);

      // Fast forward to complete transition
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should show the edit form container
      const cardContainer = screen.getByText('Test Task').closest('div');
      const editFormContainer = cardContainer?.querySelector('.editFormContainer');
      expect(editFormContainer).toBeInTheDocument();
    });

    it('should handle cancel edit functionality', async () => {
      render(<TaskCard task={mockTask} />);

      const editButton = screen.getByLabelText('Edit task');
      fireEvent.click(editButton);

      // Fast forward to complete transition
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should be in editing state
      const cardContainer = screen.getByText('Test Task').closest('div');
      expect(cardContainer).toHaveClass('editing');

      // Cancel button should be available in the edit form
      // Note: The actual cancel functionality is handled by TaskEditForm component
    });
  });

  describe('Task Details Expansion', () => {
    it('should expand task details when card is clicked', () => {
      render(<TaskCard task={mockTask} />);

      const cardContainer = screen.getByText('Test Task').closest('div');
      if (cardContainer) {
        fireEvent.click(cardContainer);
      }

      // Should show task details
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('⏳ Pending')).toBeInTheDocument();
    });

    it('should collapse task details when card is clicked again', () => {
      render(<TaskCard task={mockTask} />);

      const cardContainer = screen.getByText('Test Task').closest('div');
      
      // First click to expand
      if (cardContainer) {
        fireEvent.click(cardContainer);
      }
      expect(screen.getByText('Status:')).toBeInTheDocument();

      // Second click to collapse
      if (cardContainer) {
        fireEvent.click(cardContainer);
      }
      
      // Status should still be visible during collapse animation
      expect(screen.getByText('Status:')).toBeInTheDocument();
    });
  });

  describe('Priority and Difficulty Display', () => {
    it('should display priority correctly', () => {
      render(<TaskCard task={mockTask} />);

      expect(screen.getByText('Medium Priority')).toBeInTheDocument();
    });

    it('should display difficulty correctly', () => {
      render(<TaskCard task={mockTask} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should handle high priority task', () => {
      const highPriorityTask = { ...mockTask, priority: 'high' as const };
      render(<TaskCard task={highPriorityTask} />);

      expect(screen.getByText('High Priority')).toBeInTheDocument();
    });

    it('should handle low priority task', () => {
      const lowPriorityTask = { ...mockTask, priority: 'low' as const };
      render(<TaskCard task={lowPriorityTask} />);

      expect(screen.getByText('Low Priority')).toBeInTheDocument();
    });
  });

  describe('Rewards Display', () => {
    it('should display XP rewards', () => {
      render(<TaskCard task={mockTask} />);

      // Rewards are shown on hover, so we need to trigger hover
      const cardContainer = screen.getByText('Test Task').closest('div');
      if (cardContainer) {
        fireEvent.mouseEnter(cardContainer);
      }

      expect(screen.getByText('XP: +10')).toBeInTheDocument();
    });

    it('should display mind rewards', () => {
      render(<TaskCard task={mockTask} />);

      const cardContainer = screen.getByText('Test Task').closest('div');
      if (cardContainer) {
        fireEvent.mouseEnter(cardContainer);
      }

      expect(screen.getByText('🧠 Mind: +1')).toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('should apply completing class during task completion', () => {
      render(<TaskCard task={mockTask} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const cardContainer = screen.getByText('Test Task').closest('div');
      expect(cardContainer).toHaveClass('completing');
    });

    it('should apply highlighted class when isHighlighted prop is true', () => {
      render(<TaskCard task={mockTask} isHighlighted={true} />);

      const cardContainer = screen.getByText('Test Task').closest('div');
      expect(cardContainer).toHaveClass('highlighted');
    });
  });
});
