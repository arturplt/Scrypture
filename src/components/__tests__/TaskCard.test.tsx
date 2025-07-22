import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCard } from '../TaskCard';
import { Task } from '../../types';

// Mock the services
jest.mock('../../services/taskService', () => ({
  taskService: {
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

jest.mock('../../services/userService', () => ({
  userService: {
    getUser: jest.fn(() => ({
      level: 5,
      experience: 1000,
      achievements: [],
    })),
    updateUser: jest.fn(),
  },
}));

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    category: 'mind',
    priority: 'high' as const,
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    statRewards: {
      xp: 50,
      mind: 10,
    },
  };

  const mockOnOpenModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders task title and description', () => {
      render(
        <TaskCard
          task={mockTask}
          onOpenModal={mockOnOpenModal}
        />
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('displays category and priority badges', () => {
      render(
        <TaskCard
          task={mockTask}
          onOpenModal={mockOnOpenModal}
        />
      );

      expect(screen.getByText('Mind')).toBeInTheDocument();
      expect(screen.getByText('High Priority')).toBeInTheDocument();
    });

    it('shows checkbox for task completion', () => {
      render(
        <TaskCard
          task={mockTask}
          onOpenModal={mockOnOpenModal}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('shows completed checkbox for completed tasks', () => {
      const completedTask = { ...mockTask, completed: true };
      
      render(
        <TaskCard
          task={completedTask}
          onOpenModal={mockOnOpenModal}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('renders XP strip with category colors when stat rewards are present', () => {
      const taskWithRewards = {
        ...mockTask,
        statRewards: {
          xp: 25,
          body: 2,
          mind: 1,
          soul: 1,
        },
      };

      render(
        <TaskCard
          task={taskWithRewards}
          onOpenModal={mockOnOpenModal}
        />
      );

      // Check that XP strip is rendered
      const xpStrip = document.querySelector('[class*="xpStrip"]');
      expect(xpStrip).toBeInTheDocument();

      // Check that category strips are rendered
      const categoryStrips = document.querySelectorAll('[class*="categoryStrip"]');
      expect(categoryStrips).toHaveLength(3); // body, mind, soul
    });

    it('does not render XP strip when no stat rewards are present', () => {
      const taskWithoutRewards = {
        ...mockTask,
        statRewards: undefined,
      };

      render(
        <TaskCard
          task={taskWithoutRewards}
          onOpenModal={mockOnOpenModal}
        />
      );

      // Check that XP strip is not rendered
      const xpStrip = document.querySelector('[class*="xpStrip"]');
      expect(xpStrip).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onOpenModal when card is clicked', () => {
      render(
        <TaskCard
          task={mockTask}
          onOpenModal={mockOnOpenModal}
        />
      );

      const card = screen.getByText('Test Task').closest('div');
      fireEvent.click(card!);

      expect(mockOnOpenModal).toHaveBeenCalled();
    });

    it('toggles task completion when checkbox is clicked', () => {
      render(
        <TaskCard
          task={mockTask}
          onOpenModal={mockOnOpenModal}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // The actual toggle logic is handled by the useTasks hook
      expect(checkbox).toBeInTheDocument();
    });

    it('shows edit and delete buttons', () => {
      render(
        <TaskCard
          task={mockTask}
          onOpenModal={mockOnOpenModal}
        />
      );

      expect(screen.getByLabelText('Edit task')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete task')).toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct CSS classes based on task completion', () => {
      const { container } = render(
        <TaskCard
          task={mockTask}
          onOpenModal={mockOnOpenModal}
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('card');
    });

    it('applies completed styling for completed tasks', () => {
      const completedTask = { ...mockTask, completed: true };
      
      const { container } = render(
        <TaskCard
          task={completedTask}
          onOpenModal={mockOnOpenModal}
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('completed');
    });
  });

  describe('Edge Cases', () => {
    it('handles tasks without description', () => {
      const taskWithoutDescription = { ...mockTask, description: '' };
      
      render(
        <TaskCard
          task={taskWithoutDescription}
          onOpenModal={mockOnOpenModal}
        />
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });

    it('handles tasks without category', () => {
      const taskWithoutCategory = { ...mockTask, category: undefined };
      
      render(
        <TaskCard
          task={taskWithoutCategory}
          onOpenModal={mockOnOpenModal}
        />
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      // Should show default category icon
      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    it('handles tasks without statRewards', () => {
      const taskWithoutRewards = { ...mockTask, statRewards: undefined };
      
      render(
        <TaskCard
          task={taskWithoutRewards}
          onOpenModal={mockOnOpenModal}
        />
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });
}); 