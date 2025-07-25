import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskEditForm } from '../TaskEditForm';

// Mock task for testing
const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  completed: false,
  priority: 'medium' as const,
  categories: ['body'],
  createdAt: new Date(),
  updatedAt: new Date(),
  statRewards: {
    body: 1,
    xp: 10
  },
  difficulty: 3
};

// Mock the hooks
jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  }),
  TaskProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../hooks/useUser', () => ({
  useUser: () => ({
    addExperience: jest.fn(),
    addStatRewards: jest.fn(),
    removeStatRewards: jest.fn(),
  }),
  UserProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TaskEditForm', () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnCancel.mockClear();
  });

  it('should render with task data', () => {
    render(<TaskEditForm task={mockTask} onCancel={mockOnCancel} />);

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete Task')).toBeInTheDocument();
  });

  it('should have dimmed delete button by default', () => {
    render(<TaskEditForm task={mockTask} onCancel={mockOnCancel} />);

    const deleteButton = screen.getByText('Delete Task');
    expect(deleteButton).toHaveStyle({ opacity: '0.7' });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<TaskEditForm task={mockTask} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should handle priority changes', () => {
    render(<TaskEditForm task={mockTask} onCancel={mockOnCancel} />);

    const prioritySelect = screen.getByDisplayValue('MEDIUM PRIORITY');
    fireEvent.change(prioritySelect, { target: { value: 'high' } });

    expect(prioritySelect).toHaveValue('high');
  });

  it('should handle description changes', () => {
    render(<TaskEditForm task={mockTask} onCancel={mockOnCancel} />);

    const descriptionInput = screen.getByDisplayValue('Test description');
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

    expect(descriptionInput).toHaveValue('Updated description');
  });

  it('should have smooth transition animations', () => {
    render(<TaskEditForm task={mockTask} onCancel={mockOnCancel} />);

    const form = screen.getByText('Update Task').closest('form');
    expect(form).toHaveClass('transitioning');
  });

  it('should maintain task data during editing', () => {
    render(<TaskEditForm task={mockTask} onCancel={mockOnCancel} />);

    // All original task data should be preserved
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('MEDIUM PRIORITY')).toBeInTheDocument();
  });

  it('should handle empty description', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    render(<TaskEditForm task={taskWithoutDescription} onCancel={mockOnCancel} />);

    const descriptionInput = screen.getByPlaceholderText('Description (optional)');
    expect(descriptionInput).toBeInTheDocument();
  });

  it('should handle task with no stat rewards', () => {
    const taskWithoutRewards = { ...mockTask, statRewards: undefined };
    render(<TaskEditForm task={taskWithoutRewards} onCancel={mockOnCancel} />);

    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.getByText('Delete Task')).toBeInTheDocument();
  });
});
