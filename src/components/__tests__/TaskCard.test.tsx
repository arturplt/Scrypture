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
    isSaving: false,
  }),
}));

// Mock the AutoSaveIndicator component
jest.mock('../AutoSaveIndicator', () => ({
  AutoSaveIndicator: ({ isSaving }: { isSaving: boolean }) => (
    <div data-testid="auto-save-indicator">
      {isSaving ? 'Saving...' : 'Saved'}
    </div>
  ),
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
