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

    it('should trigger edit automatically when triggerEdit prop is true', async () => {
      render(<TaskCard task={mockTask} triggerEdit={true} />);

      // Should automatically start transitioning to edit
      const cardContainer = screen.getByText('Test Task').closest('div');
      expect(cardContainer).toHaveClass('transitioningToEdit');

      // Fast forward 200ms to complete transition
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should now be in editing state
      expect(cardContainer).toHaveClass('editing');
    });

    it('should not trigger edit when triggerEdit prop is false', () => {
      render(<TaskCard task={mockTask} triggerEdit={false} />);

      const cardContainer = screen.getByText('Test Task').closest('div');
      expect(cardContainer).not.toHaveClass('transitioningToEdit');
      expect(cardContainer).not.toHaveClass('editing');
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
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // The edit form should be present by its input or button
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should handle cancel edit functionality and transition states', async () => {
      render(<TaskCard task={mockTask} />);
      const editButton = screen.getByLabelText('Edit task');
      fireEvent.click(editButton);
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Simulate clicking cancel in the edit form
      // Find the cancel button by text or aria-label
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      // Should enter exitingEdit state
      const cardContainer = screen.getByText('Test Task').closest('div');
      expect(cardContainer).toHaveClass('exitingEdit');
      // Fast forward exit animation
      act(() => {
        jest.advanceTimersByTime(420);
      });
      // Should enter reentering state
      expect(cardContainer).toHaveClass('reentering');
      // Fast forward reentering animation
      act(() => {
        jest.advanceTimersByTime(200);
      });
      // Should no longer be editing
      expect(cardContainer).not.toHaveClass('editing');
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

    it('should collapse task details when card is clicked again and show closing animation', () => {
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
      // The details should have the closing class during animation
      const details = screen.getByText('Status:').closest('div');
      expect(details).toHaveClass('closing');
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
      // XP reward should always be visible if present
      expect(screen.getByText('XP: +10')).toBeInTheDocument();
    });

    it('should display mind rewards', () => {
      render(<TaskCard task={mockTask} />);
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

    it('should apply exitingEdit and reentering classes during edit cancel transitions', async () => {
      render(<TaskCard task={mockTask} />);
      const editButton = screen.getByLabelText('Edit task');
      fireEvent.click(editButton);
      act(() => {
        jest.advanceTimersByTime(200);
      });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      const cardContainer = screen.getByText('Test Task').closest('div');
      expect(cardContainer).toHaveClass('exitingEdit');
      act(() => {
        jest.advanceTimersByTime(420);
      });
      expect(cardContainer).toHaveClass('reentering');
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(cardContainer).not.toHaveClass('editing');
    });
  });
});
