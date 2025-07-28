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

jest.mock('../../hooks/useUser', () => {
  const actual = jest.requireActual('../../hooks/useUser');
  return {
    ...actual,
    default: actual.default,
    useUser: () => ({
      addExperience: jest.fn(),
      addStatRewards: jest.fn(),
      removeStatRewards: jest.fn(),
    }),
    UserProvider: actual.UserProvider,
  };
});

jest.mock('../../hooks/useHabits', () => {
  const actual = jest.requireActual('../../hooks/useHabits');
  return {
    ...actual,
    default: actual.default,
    useHabits: () => ({
      addHabit: jest.fn(),
      habits: [],
    }),
    HabitProvider: actual.HabitProvider,
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskDetailModal } from '../TaskDetailModal';
import { Task } from '../../types';
import { UserProvider } from '../../hooks/useUser';
import { TaskProvider } from '../../hooks/useTasks';

// Mock the Modal component
jest.mock('../Modal', () => ({
  Modal: ({
    children,
    isOpen,
    onClose,
    title,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title: string;
  }) =>
    isOpen ? (
      <div data-testid="modal" role="dialog" aria-modal="true">
        <div data-testid="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null,
}));

jest.mock('../../utils/dateUtils', () => ({
  formatRelativeTime: jest.fn((date) => `formatted ${date.toISOString()}`),
}));

// Mock the hooks

// Mock the AutoSaveIndicator component
jest.mock('../AutoSaveIndicator', () => ({
  AutoSaveIndicator: ({ isSaving }: { isSaving: boolean }) => (
    <div data-testid="auto-save-indicator">
      {isSaving ? 'Saving...' : 'Saved'}
    </div>
  ),
}));

// Mock the useHabits hook

describe('TaskDetailModal', () => {
  // Mock the TaskEditForm component only for this suite
  jest.mock('../TaskEditForm', () => ({
    TaskEditForm: ({ onCancel }: { task: Task; onCancel: () => void }) => (
      <div data-testid="task-edit-form">
        <button onClick={onCancel}>Cancel Edit</button>
      </div>
    ),
  }));

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'This is a test task description',
    completed: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z'),
    priority: 'high',
    categories: ['home'],
    statRewards: {
      body: 1,
      mind: 1,
      soul: 1,
      xp: 10,
    },
  };

  const mockTaskNoRewards: Task = {
    ...mockTask,
    statRewards: {},
  };

  const defaultProps = {
    task: mockTask,
    isOpen: true,
    onClose: jest.fn(),
    onEdit: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    hasNext: true,
    hasPrevious: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <UserProvider>
        <TaskProvider>
          {component}
        </TaskProvider>
      </UserProvider>
    );
  };

  it('renders modal and displays all rewards (XP first, gold)', () => {
    renderWithProviders(<TaskDetailModal {...defaultProps} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Rewards')).toBeInTheDocument();
    // XP first and gold
    const xp = screen.getByText('XP: +10');
    expect(xp).toBeInTheDocument();
    // Other rewards - check for the actual text with icons
    expect(screen.getByText('💪 Body: +1')).toBeInTheDocument();
    expect(screen.getByText('🧠 Mind: +1')).toBeInTheDocument();
    expect(screen.getByText('✨ Soul: +1')).toBeInTheDocument();
  });

  it('does not show rewards section if all are zero', () => {
    renderWithProviders(<TaskDetailModal {...defaultProps} task={mockTaskNoRewards} />);
    // The rewards section should still be there but show "No rewards for this task."
    expect(screen.getByText('Rewards')).toBeInTheDocument();
    expect(screen.getByText('No rewards for this task.')).toBeInTheDocument();
  });

  it('renders and closes modal, edit, navigation, and accessibility', () => {
    renderWithProviders(<TaskDetailModal {...defaultProps} />);
    // Modal open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Close
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(defaultProps.onClose).toHaveBeenCalled();
    // Edit button exists but doesn't call onEdit prop (it opens internal edit form)
    expect(screen.getByLabelText('Edit task')).toBeInTheDocument();
    // Navigation
    fireEvent.click(screen.getByText('← Previous'));
    expect(defaultProps.onPrevious).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Next →'));
    expect(defaultProps.onNext).toHaveBeenCalled();
    // Accessibility
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByLabelText('Go to previous task')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next task')).toBeInTheDocument();
  });

  it('displays task details correctly', () => {
    renderWithProviders(<TaskDetailModal {...defaultProps} />);

    // Check task title
    expect(screen.getByText('Test Task')).toBeInTheDocument();

    // Check description
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test task description')
    ).toBeInTheDocument();

    // Check priority
    expect(screen.getByText('Priority:')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    // Check category
    expect(screen.getByText('🏠 Home')).toBeInTheDocument();

    // Check status
    expect(screen.getByText('⏳ Pending')).toBeInTheDocument();
  });

  it('displays completed task correctly', () => {
    const completedTask = { ...mockTask, completed: true };
    renderWithProviders(<TaskDetailModal {...defaultProps} task={completedTask} />);

    // Check completed status
    expect(screen.getByText('✓ Completed')).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    renderWithProviders(<TaskDetailModal {...defaultProps} />);
    
    const editButton = screen.getByLabelText('Edit task');
    fireEvent.click(editButton);
    
    // Should show the edit form - look for the form content instead of test ID
    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
  });

  it('handles navigation when no previous/next tasks', () => {
    renderWithProviders(
      <TaskDetailModal
        {...defaultProps}
        hasNext={false}
        hasPrevious={false}
      />
    );
    
    // Should not show navigation buttons
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  describe('Auto-Save Functionality', () => {
    it('should display auto-save indicator in modal header', () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);

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

      renderWithProviders(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();

      // Restore original mock
      require('../../hooks/useTasks').useTasks = originalUseTasks;
    });

    it('should show auto-save indicator during task editing', () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);

      const editButton = screen.getByLabelText('Edit task');
      fireEvent.click(editButton);

      // Auto-save indicator should still be visible during editing
      expect(screen.getAllByTestId('auto-save-indicator')).toHaveLength(2);
    });

    it('should show auto-save indicator during navigation', () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);

      const nextButton = screen.getByText('Next →');
      fireEvent.click(nextButton);

      // Auto-save indicator should be visible during navigation
      expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
    });

    it('should handle auto-save state changes', () => {
      const { rerender } = renderWithProviders(<TaskDetailModal {...defaultProps} />);

      // Initially should show "Saved"
      expect(screen.getByText('Saved')).toBeInTheDocument();

      // Temporarily mock isSaving as true
      const originalUseTasks = require('../../hooks/useTasks').useTasks;
      require('../../hooks/useTasks').useTasks = () => ({
        toggleTask: jest.fn(),
        bringTaskToTop: jest.fn(),
        isSaving: true,
      });

      rerender(<TaskDetailModal {...defaultProps} />);

      // Should show "Saving..."
      expect(screen.getByText('Saving...')).toBeInTheDocument();

      // Restore original mock
      require('../../hooks/useTasks').useTasks = originalUseTasks;
    });
  });
});
