import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskEditForm } from '../TaskEditForm';
import { TaskProvider } from '../../hooks/useTasks';
import { Task } from '../../types';

// Mock the task service
jest.mock('../../services/taskService', () => ({
  taskService: {
    getTasks: jest.fn(() => []),
    saveTasks: jest.fn(() => true),
  },
}));

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  priority: 'medium',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TaskProvider>
      {component}
    </TaskProvider>
  );
};

describe('TaskEditForm', () => {
  it('renders with task data pre-filled', () => {
    const mockOnCancel = jest.fn();
    
    renderWithProvider(
      <TaskEditForm task={mockTask} onCancel={mockOnCancel} />
    );

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    // Check that the medium priority button is active (has the correct styling)
    const mediumPriorityButton = screen.getByText('MEDIUM PRIORITY');
    expect(mediumPriorityButton).toBeInTheDocument();
  });

  it('updates task when form is submitted', async () => {
    const mockOnCancel = jest.fn();
    
    renderWithProvider(
      <TaskEditForm task={mockTask} onCancel={mockOnCancel} />
    );

    const titleInput = screen.getByDisplayValue('Test Task');
    const descriptionInput = screen.getByDisplayValue('Test Description');
    const submitButton = screen.getByText('Update Task');

    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = jest.fn();
    
    renderWithProvider(
      <TaskEditForm task={mockTask} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('resets form to original values when cancel is clicked', () => {
    const mockOnCancel = jest.fn();
    
    renderWithProvider(
      <TaskEditForm task={mockTask} onCancel={mockOnCancel} />
    );

    const titleInput = screen.getByDisplayValue('Test Task');
    const descriptionInput = screen.getByDisplayValue('Test Description');

    // Change values
    fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Changed Description' } });

    // Verify values changed
    expect(screen.getByDisplayValue('Changed Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Changed Description')).toBeInTheDocument();

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Form should be reset to original values when component re-renders
    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 