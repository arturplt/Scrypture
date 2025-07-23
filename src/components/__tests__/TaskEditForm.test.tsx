import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskEditForm from '../TaskEditForm';
import { TaskProvider } from '../../hooks/useTasks';
import { UserProvider } from '../../hooks/useUser';
import { Task } from '../../types';

console.log('TaskEditForm default import:', TaskEditForm);

// Mock the useTasks hook
const mockUpdateTask = jest.fn();
jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    updateTask: mockUpdateTask,
  }),
  TaskProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the useUser hook
jest.mock('../../hooks/useUser', () => ({
  useUser: () => ({
    addExperience: jest.fn(),
    addStatRewards: jest.fn(),
    removeStatRewards: jest.fn(),
  }),
  UserProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  priority: 'medium',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  statRewards: { body: 1, mind: 0, soul: 0 },
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <UserProvider>
      <TaskProvider>
        {component}
      </TaskProvider>
    </UserProvider>
  );
};

describe('TaskEditForm (new system)', () => {
  it('renders with task data pre-filled and toggles', () => {
    const mockOnCancel = jest.fn();
    renderWithProvider(
      <TaskEditForm task={mockTask} onCancel={mockOnCancel} />
    );
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByText('BODY +1')).toBeInTheDocument();
    // Toggle MIND on
    fireEvent.click(screen.getByText('MIND'));
    expect(screen.getByText('MIND +1')).toBeInTheDocument();
    // Toggle BODY off
    fireEvent.click(screen.getByText('BODY'));
    expect(screen.queryByText('BODY +1')).not.toBeInTheDocument();
  });

  it('shows correct XP for each priority', () => {
    const mockOnCancel = jest.fn();
    renderWithProvider(
      <TaskEditForm task={mockTask} onCancel={mockOnCancel} />
    );
    fireEvent.click(screen.getByText('LOW PRIORITY'));
    expect(screen.getByText('+5 XP')).toBeInTheDocument();
    fireEvent.click(screen.getByText('MEDIUM PRIORITY'));
    expect(screen.getByText('+10 XP')).toBeInTheDocument();
    fireEvent.click(screen.getByText('HIGH PRIORITY'));
    expect(screen.getByText('+15 XP')).toBeInTheDocument();
  });

  it('submits edit with correct statRewards', async () => {
    const mockOnCancel = jest.fn();
    renderWithProvider(
      <TaskEditForm task={mockTask} onCancel={mockOnCancel} />
    );
    fireEvent.change(screen.getByDisplayValue('Test Task'), { target: { value: 'Updated Task' } });
    fireEvent.click(screen.getByText('MIND'));
    fireEvent.click(screen.getByText('Update Task'));
    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith('1', expect.objectContaining({
        title: 'Updated Task',
        statRewards: { mind: 1 },
      }));
    });
  });
}); 