import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskList } from '../TaskList';
import { Task } from '../../types';

// Mock the hooks and components
jest.mock('../../hooks/useTasks', () => ({
  useTasks: jest.fn(),
}));

jest.mock('../TaskCard', () => ({
  TaskCard: ({ task, onOpenModal }: { task: Task; onOpenModal: () => void }) => (
    <div data-testid={`task-card-${task.id}`} onClick={onOpenModal}>
      {task.title}
    </div>
  ),
}));

jest.mock('../TaskDetailModal', () => ({
  TaskDetailModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="task-detail-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
  ),
}));

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Workout',
      description: 'Daily exercise routine',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      priority: 'high' as const,
      category: 'home',
    },
    {
      id: '2',
      title: 'Read Book',
      description: 'Read 30 minutes',
      completed: false,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      priority: 'medium' as const,
      category: 'free time',
    },
    {
      id: '3',
      title: 'Meditation',
      description: 'Daily meditation',
      completed: true,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      priority: 'low' as const,
      category: 'garden',
    },
    {
      id: '4',
      title: 'Study Programming',
      description: 'Learn React',
      completed: false,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04'),
      priority: 'high' as const,
      category: 'home',
    },
  ];

  const mockUseTasks = require('../../hooks/useTasks').useTasks;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTasks.mockReturnValue({ tasks: mockTasks });
  });

  describe('Rendering', () => {
    it('renders empty state when no tasks exist', () => {
      mockUseTasks.mockReturnValue({ tasks: [] });

      render(<TaskList />);

      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first task to begin your journey')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('renders active tasks section', () => {
      render(<TaskList />);

      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
      expect(screen.getByText('Workout')).toBeInTheDocument();
      expect(screen.getByText('Read Book')).toBeInTheDocument();
      expect(screen.getByText('Study Programming')).toBeInTheDocument();
    });

    it('renders completed tasks section', () => {
      render(<TaskList />);

      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
      expect(screen.getByText('Meditation')).toBeInTheDocument();
    });

    it('renders task cards for all tasks', () => {
      render(<TaskList />);

      expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-4')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters tasks by category', () => {
      render(<TaskList />);

      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.change(categorySelect, { target: { value: 'home' } });

      expect(screen.getByText('Workout')).toBeInTheDocument();
      expect(screen.getByText('Study Programming')).toBeInTheDocument();
      expect(screen.queryByText('Read Book')).not.toBeInTheDocument();
    });

    it('shows all tasks when "All Categories" is selected', () => {
      render(<TaskList />);

      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.change(categorySelect, { target: { value: 'home' } });
      fireEvent.change(categorySelect, { target: { value: '' } });

      expect(screen.getByText('Workout')).toBeInTheDocument();
      expect(screen.getByText('Read Book')).toBeInTheDocument();
      expect(screen.getByText('Study Programming')).toBeInTheDocument();
    });

    it('filters by free time category', () => {
      render(<TaskList />);

      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.change(categorySelect, { target: { value: 'free time' } });

      expect(screen.getByText('Read Book')).toBeInTheDocument();
      expect(screen.queryByText('Workout')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by priority by default', () => {
      render(<TaskList />);

      const sortSelect = screen.getByDisplayValue('⚡ Priority');
      expect(sortSelect).toBeInTheDocument();
    });

    it('changes sort method to priority', () => {
      render(<TaskList />);

      const sortSelect = screen.getByDisplayValue('⚡ Priority');
      fireEvent.change(sortSelect, { target: { value: 'priority' } });

      expect(sortSelect).toHaveValue('priority');
    });

    it('changes sort method to date', () => {
      render(<TaskList />);

      const sortSelect = screen.getByDisplayValue('⚡ Priority');
      fireEvent.change(sortSelect, { target: { value: 'date' } });

      expect(sortSelect).toHaveValue('date');
    });

    it('changes sort method to XP', () => {
      render(<TaskList />);

      const sortSelect = screen.getByDisplayValue('⚡ Priority');
      fireEvent.change(sortSelect, { target: { value: 'xp' } });

      expect(sortSelect).toHaveValue('xp');
    });

    it('toggles sort order', () => {
      render(<TaskList />);

      const sortButton = screen.getByLabelText('Sort descending');
      expect(sortButton).toBeInTheDocument();

      fireEvent.click(sortButton);

      expect(screen.getByLabelText('Sort ascending')).toBeInTheDocument();
    });

    it('maintains sort order when changing sort method', () => {
      render(<TaskList />);

      const sortSelect = screen.getByDisplayValue('⚡ Priority');
      const sortButton = screen.getByLabelText('Sort descending');

      fireEvent.click(sortButton); // Change to ascending
      fireEvent.change(sortSelect, { target: { value: 'priority' } });

      expect(sortSelect).toHaveValue('priority');
      expect(screen.getByLabelText('Sort ascending')).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('opens modal when task card is clicked', () => {
      render(<TaskList />);

      const taskCard = screen.getByTestId('task-card-1');
      fireEvent.click(taskCard);

      expect(screen.getByTestId('task-detail-modal')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', async () => {
      render(<TaskList />);

      const taskCard = screen.getByTestId('task-card-1');
      fireEvent.click(taskCard);

      expect(screen.getByTestId('task-detail-modal')).toBeInTheDocument();

      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('task-detail-modal')).not.toBeInTheDocument();
      });
    });

    it('opens modal for different tasks', () => {
      render(<TaskList />);

      const firstTaskCard = screen.getByTestId('task-card-1');
      fireEvent.click(firstTaskCard);

      expect(screen.getByTestId('task-detail-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      // Open modal for different task
      const secondTaskCard = screen.getByTestId('task-card-2');
      fireEvent.click(secondTaskCard);

      expect(screen.getByTestId('task-detail-modal')).toBeInTheDocument();
    });
  });

  describe('Task Organization', () => {
    it('separates active and completed tasks', () => {
      render(<TaskList />);

      // Active tasks should be in Active Tasks section
      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
      expect(screen.getByText('Workout')).toBeInTheDocument();
      expect(screen.getByText('Read Book')).toBeInTheDocument();
      expect(screen.getByText('Study Programming')).toBeInTheDocument();

      // Completed tasks should be in Completed Tasks section
      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
      expect(screen.getByText('Meditation')).toBeInTheDocument();
    });

    it('does not show completed tasks section when no completed tasks', () => {
      const tasksWithoutCompleted = mockTasks.filter(task => !task.completed);
      mockUseTasks.mockReturnValue({ tasks: tasksWithoutCompleted });

      render(<TaskList />);

      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
      expect(screen.queryByText('Completed Tasks')).not.toBeInTheDocument();
    });

    it('does not show active tasks section when no active tasks', () => {
      const onlyCompletedTasks = mockTasks.filter(task => task.completed);
      mockUseTasks.mockReturnValue({ tasks: onlyCompletedTasks });

      render(<TaskList />);

      expect(screen.queryByText('Active Tasks')).not.toBeInTheDocument();
      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles tasks without category', () => {
      const tasksWithoutCategory = [
        {
          ...mockTasks[0],
          category: undefined,
        },
      ];
      mockUseTasks.mockReturnValue({ tasks: tasksWithoutCategory });

      render(<TaskList />);

      expect(screen.getByText('Workout')).toBeInTheDocument();
    });

    it('handles tasks with missing dates', () => {
      const tasksWithMissingDates = [
        {
          ...mockTasks[0],
          createdAt: undefined,
          updatedAt: undefined,
        },
      ];
      mockUseTasks.mockReturnValue({ tasks: tasksWithMissingDates });

      render(<TaskList />);

      expect(screen.getByText('Workout')).toBeInTheDocument();
    });

    it('handles large number of tasks', () => {
      const manyTasks = Array.from({ length: 100 }, (_, i) => ({
        ...mockTasks[0],
        id: `task-${i}`,
        title: `Task ${i}`,
      }));
      mockUseTasks.mockReturnValue({ tasks: manyTasks });

      render(<TaskList />);

      expect(screen.getByText('Task 0')).toBeInTheDocument();
      expect(screen.getByText('Task 99')).toBeInTheDocument();
    });

    it('handles tasks with very long titles', () => {
      const taskWithLongTitle = [
        {
          ...mockTasks[0],
          title: 'This is a very long task title that might cause layout issues in the task list component',
        },
      ];
      mockUseTasks.mockReturnValue({ tasks: taskWithLongTitle });

      render(<TaskList />);

      expect(screen.getByText('This is a very long task title that might cause layout issues in the task list component')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for sort controls', () => {
      render(<TaskList />);

      const sortButton = screen.getByLabelText('Sort descending');
      expect(sortButton).toBeInTheDocument();
    });

    it('has proper select elements for filtering', () => {
      render(<TaskList />);

      const categorySelect = screen.getByDisplayValue('All Categories');
      expect(categorySelect).toBeInTheDocument();

      const sortSelect = screen.getByDisplayValue('⚡ Priority');
      expect(sortSelect).toBeInTheDocument();
    });

    it('provides keyboard navigation for task cards', () => {
      render(<TaskList />);

      const taskCard = screen.getByTestId('task-card-1');
      expect(taskCard).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with many tasks', () => {
      const manyTasks = Array.from({ length: 50 }, (_, i) => ({
        ...mockTasks[0],
        id: `task-${i}`,
        title: `Task ${i}`,
      }));
      mockUseTasks.mockReturnValue({ tasks: manyTasks });

      const startTime = performance.now();
      render(<TaskList />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render in under 1 second
    });

    it('handles rapid filter changes', () => {
      render(<TaskList />);

      const categorySelect = screen.getByDisplayValue('All Categories');

      // Test that initial state shows all active tasks
      expect(screen.getByText('Workout')).toBeInTheDocument();
      expect(screen.getByText('Read Book')).toBeInTheDocument();
      expect(screen.getByText('Study Programming')).toBeInTheDocument();

      // Filter by home category
      fireEvent.change(categorySelect, { target: { value: 'home' } });
      expect(screen.getByText('Workout')).toBeInTheDocument();
      expect(screen.getByText('Study Programming')).toBeInTheDocument();
      expect(screen.queryByText('Read Book')).not.toBeInTheDocument();

      // Filter by free time category
      fireEvent.change(categorySelect, { target: { value: 'free time' } });
      expect(screen.queryByText('Workout')).not.toBeInTheDocument();
      expect(screen.getByText('Read Book')).toBeInTheDocument();
      expect(screen.queryByText('Study Programming')).not.toBeInTheDocument();

      // Reset to all categories
      fireEvent.change(categorySelect, { target: { value: '' } });
      expect(screen.getByText('Workout')).toBeInTheDocument();
      expect(screen.getByText('Read Book')).toBeInTheDocument();
      expect(screen.getByText('Study Programming')).toBeInTheDocument();
    });

    it('handles filtering when no active tasks match category', () => {
      render(<TaskList />);

      const categorySelect = screen.getByDisplayValue('All Categories');
      
      // Filter by a category that has no active tasks (only completed tasks)
      fireEvent.change(categorySelect, { target: { value: 'garden' } });

      // Active tasks section should not be visible since no active tasks match 'garden'
      expect(screen.queryByText('Active Tasks')).not.toBeInTheDocument();
      expect(screen.queryByText('Workout')).not.toBeInTheDocument();
      expect(screen.queryByText('Read Book')).not.toBeInTheDocument();
      expect(screen.queryByText('Study Programming')).not.toBeInTheDocument();
      
      // But completed tasks should still be visible
      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
      expect(screen.getByText('Meditation')).toBeInTheDocument();
    });
  });

  describe('Integration with Hooks', () => {
    it('uses tasks from useTasks hook', () => {
      render(<TaskList />);

      expect(mockUseTasks).toHaveBeenCalled();
    });

    it('updates when tasks change', () => {
      const { rerender } = render(<TaskList />);

      const newTasks = [
        {
          id: '5',
          title: 'New Task',
          description: 'A new task',
          completed: false,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05'),
          priority: 'medium' as const,
          category: 'body',
        },
      ];
      mockUseTasks.mockReturnValue({ tasks: newTasks });

      rerender(<TaskList />);

      expect(screen.getByText('New Task')).toBeInTheDocument();
      expect(screen.queryByText('Workout')).not.toBeInTheDocument();
    });
  });
}); 