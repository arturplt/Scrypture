jest.mock('../../hooks/useTasks', () => {
  const actual = jest.requireActual('../../hooks/useTasks');
  return {
    ...actual,
    default: actual.default,
    useTasks: () => ({
      toggleTask: jest.fn(),
      bringTaskToTop: jest.fn(),
      isSaving: false,
    }),
    TaskProvider: actual.TaskProvider,
  };
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCard } from '../TaskCard';
import { Task } from '../../types';

// Mock the AutoSaveIndicator component
jest.mock('../AutoSaveIndicator', () => ({
  AutoSaveIndicator: ({ isSaving }: { isSaving: boolean }) => (
    <div data-testid="auto-save-indicator">
      {isSaving ? 'Saving...' : 'Saved'}
    </div>
  ),
}));

// Mock the hooks
const mockToggleTask = jest.fn();
const mockBringTaskToTop = jest.fn();
const mockIsSaving = false;

jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    toggleTask: mockToggleTask,
    bringTaskToTop: mockBringTaskToTop,
    isSaving: mockIsSaving,
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

describe('TaskCard Auto-Save', () => {
  it('should display auto-save indicator in task card', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('should show saving state when isSaving is true', () => {
    // Temporarily mock isSaving as true
    const originalUseTasks = require('../../hooks/useTasks').useTasks;
    require('../../hooks/useTasks').useTasks = () => ({
      toggleTask: jest.fn(),
      bringTaskToTop: jest.fn(),
      isSaving: true,
    });

    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    // Restore original mock
    require('../../hooks/useTasks').useTasks = originalUseTasks;
  });

  it('should show auto-save indicator during task completion', () => {
    render(<TaskCard task={mockTask} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Auto-save indicator should still be visible during completion
    expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
  });

  it('should handle auto-save state changes', () => {
    const { rerender } = render(<TaskCard task={mockTask} />);

    // Initially should show "Saved"
    expect(screen.getByText('Saved')).toBeInTheDocument();

    // Temporarily mock isSaving as true
    const originalUseTasks = require('../../hooks/useTasks').useTasks;
    require('../../hooks/useTasks').useTasks = () => ({
      toggleTask: jest.fn(),
      bringTaskToTop: jest.fn(),
      isSaving: true,
    });

    rerender(<TaskCard task={mockTask} />);

    // Should show "Saving..."
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    // Restore original mock
    require('../../hooks/useTasks').useTasks = originalUseTasks;
  });
});

describe('TaskCard XP Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call toggleTask when checkbox is clicked', async () => {
    const testTask: Task = {
      id: 'test-task-1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: 'medium',
      categories: ['personal'],
      statRewards: {
        xp: 15,
        body: 2,
        mind: 1,
        soul: 0,
      },
      difficulty: 3,
    };

    render(<TaskCard task={testTask} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockToggleTask).toHaveBeenCalledWith('test-task-1');
    });
  });

  it('should display XP reward when task has statRewards', () => {
    const testTask: Task = {
      id: 'test-task-1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: 'medium',
      categories: ['personal'],
      statRewards: {
        xp: 15,
        body: 2,
        mind: 1,
        soul: 0,
      },
      difficulty: 3,
    };

    render(<TaskCard task={testTask} />);

    // The XP should be displayed in the rewards section
    expect(screen.getByText('XP: +15')).toBeInTheDocument();
    expect(screen.getByText('💪 Body: +2')).toBeInTheDocument();
    expect(screen.getByText('🧠 Mind: +1')).toBeInTheDocument();
  });

  it('should not display XP reward when task has no statRewards', () => {
    const testTask: Task = {
      id: 'test-task-1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: 'medium',
      categories: ['personal'],
      difficulty: 3,
    };

    render(<TaskCard task={testTask} />);

    // Should not display XP rewards
    expect(screen.queryByText(/XP: \+/)).not.toBeInTheDocument();
  });
});
