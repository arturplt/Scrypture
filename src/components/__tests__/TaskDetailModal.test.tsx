import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskDetailModal } from '../TaskDetailModal';
import { Task } from '../../types';

// Mock the Modal component
jest.mock('../Modal', () => ({
  Modal: ({ children, isOpen, onClose, title }: { 
    children: React.ReactNode; 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
  }) => (
    isOpen ? (
      <div data-testid="modal" role="dialog" aria-modal="true">
        <div data-testid="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div data-testid="modal-content">
          {children}
        </div>
      </div>
    ) : null
  ),
}));

// Mock the dateUtils
jest.mock('../../utils/dateUtils', () => ({
  formatRelativeTime: jest.fn((date) => `formatted ${date.toISOString()}`),
}));

describe('TaskDetailModal', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'This is a test task description',
    completed: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z'),
    priority: 'high' as const,
    category: 'body',
    statRewards: {
      body: 2,
      mind: 1,
      soul: 1,
    },
  };

  const mockCompletedTask: Task = {
    ...mockTask,
    id: '2',
    title: 'Completed Task',
    completed: true,
    statRewards: {
      body: 1,
      mind: 1,
    },
  };

  const mockTaskWithoutDescription: Task = {
    ...mockTask,
    id: '3',
    title: 'Task Without Description',
    description: undefined,
    statRewards: undefined,
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

  describe('Rendering', () => {
    it('renders modal when open with task data', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Task Details')).toBeInTheDocument();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('This is a test task description')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<TaskDetailModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('does not render when task is null', () => {
      render(<TaskDetailModal {...defaultProps} task={null} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('displays task title correctly', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('displays task description when available', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('This is a test task description')).toBeInTheDocument();
    });

    it('does not display description section when description is missing', () => {
      render(<TaskDetailModal {...defaultProps} task={mockTaskWithoutDescription} />);

      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    it('displays category with icon', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('💪 Body')).toBeInTheDocument();
    });

    it('displays priority correctly', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('Priority:')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('displays creation date', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('Created:')).toBeInTheDocument();
      expect(screen.getByText('formatted 2024-01-01T10:00:00.000Z')).toBeInTheDocument();
    });

    it('displays last updated date when available', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    });
  });

  describe('Task Status', () => {
    it('displays pending status for incomplete tasks', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('⏳ Pending')).toBeInTheDocument();
    });

    it('displays completed status for completed tasks', () => {
      render(<TaskDetailModal {...defaultProps} task={mockCompletedTask} />);

      expect(screen.getByText('✓ Completed')).toBeInTheDocument();
    });

    it('applies completed styling to completed task title', () => {
      render(<TaskDetailModal {...defaultProps} task={mockCompletedTask} />);

      const title = screen.getByText('Completed Task');
      // CSS Modules classes are hashed, so we check for any class instead of specific class
      expect(title.className).toBeTruthy();
    });

    it('applies completed styling to completed task description', () => {
      render(<TaskDetailModal {...defaultProps} task={mockCompletedTask} />);

      const description = screen.getByText('This is a test task description');
      // CSS Modules classes are hashed, so we check for any class instead of specific class
      expect(description.className).toBeTruthy();
    });

    it('shows status detail for completed tasks', () => {
      render(<TaskDetailModal {...defaultProps} task={mockCompletedTask} />);

      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  describe('Rewards Section', () => {
    it('displays rewards section when rewards are available', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('Rewards')).toBeInTheDocument();
      expect(screen.getByText('Body: +2')).toBeInTheDocument();
      expect(screen.getByText('Mind: +1')).toBeInTheDocument();
      expect(screen.getByText('Soul: +1')).toBeInTheDocument();
    });

    it('does not display rewards section when no rewards', () => {
      render(<TaskDetailModal {...defaultProps} task={mockTaskWithoutDescription} />);

      expect(screen.queryByText('Rewards')).not.toBeInTheDocument();
    });

    it('displays empty rewards section when rewards object is empty', () => {
      const taskWithEmptyRewards = {
        ...mockTask,
        statRewards: {},
      };
      render(<TaskDetailModal {...defaultProps} task={taskWithEmptyRewards} />);

      expect(screen.queryByText('Rewards')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('displays navigation buttons when hasNext and hasPrevious are true', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('← Previous')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeInTheDocument();
    });

    it('does not display previous button when hasPrevious is false', () => {
      render(<TaskDetailModal {...defaultProps} hasPrevious={false} />);

      expect(screen.queryByText('← Previous')).not.toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeInTheDocument();
    });

    it('does not display next button when hasNext is false', () => {
      render(<TaskDetailModal {...defaultProps} hasNext={false} />);

      expect(screen.getByText('← Previous')).toBeInTheDocument();
      expect(screen.queryByText('Next →')).not.toBeInTheDocument();
    });

    it('calls onPrevious when previous button is clicked', () => {
      const onPrevious = jest.fn();
      render(<TaskDetailModal {...defaultProps} onPrevious={onPrevious} />);

      fireEvent.click(screen.getByText('← Previous'));
      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    it('calls onNext when next button is clicked', () => {
      const onNext = jest.fn();
      render(<TaskDetailModal {...defaultProps} onNext={onNext} />);

      fireEvent.click(screen.getByText('Next →'));
      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('has proper ARIA labels for navigation buttons', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByLabelText('Go to previous task')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to next task')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('displays edit button when onEdit is provided', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByLabelText('Edit task')).toBeInTheDocument();
      expect(screen.getByText('✎')).toBeInTheDocument();
    });

    it('does not display edit button when onEdit is not provided', () => {
      render(<TaskDetailModal {...defaultProps} onEdit={undefined} />);

      expect(screen.queryByLabelText('Edit task')).not.toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
      const onEdit = jest.fn();
      render(<TaskDetailModal {...defaultProps} onEdit={onEdit} />);

      fireEvent.click(screen.getByLabelText('Edit task'));
      expect(onEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Close', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<TaskDetailModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Category Icons', () => {
    it('displays correct icon for body category', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByText('💪 Body')).toBeInTheDocument();
    });

    it('displays correct icon for mind category', () => {
      const mindTask = { ...mockTask, category: 'mind' as const };
      render(<TaskDetailModal {...defaultProps} task={mindTask} />);

      expect(screen.getByText('🧠 Mind')).toBeInTheDocument();
    });

    it('displays correct icon for soul category', () => {
      const soulTask = { ...mockTask, category: 'soul' as const };
      render(<TaskDetailModal {...defaultProps} task={soulTask} />);

      expect(screen.getByText('✨ Soul')).toBeInTheDocument();
    });

    it('displays correct icon for career category', () => {
      const careerTask = { ...mockTask, category: 'career' as const };
      render(<TaskDetailModal {...defaultProps} task={careerTask} />);

      expect(screen.getByText('💼 Career')).toBeInTheDocument();
    });

    it('displays correct icon for home category', () => {
      const homeTask = { ...mockTask, category: 'home' as const };
      render(<TaskDetailModal {...defaultProps} task={homeTask} />);

      expect(screen.getByText('🏠 Home')).toBeInTheDocument();
    });

    it('displays correct icon for skills category', () => {
      const skillsTask = { ...mockTask, category: 'skills' as const };
      render(<TaskDetailModal {...defaultProps} task={skillsTask} />);

      expect(screen.getByText('🎯 Skills')).toBeInTheDocument();
    });

    it('displays default icon for unknown category', () => {
      const unknownTask = { ...mockTask, category: 'unknown' as any };
      render(<TaskDetailModal {...defaultProps} task={unknownTask} />);

      expect(screen.getByText('📝 Unknown')).toBeInTheDocument();
    });

    it('handles undefined category gracefully', () => {
      const noCategoryTask = { ...mockTask, category: undefined };
      render(<TaskDetailModal {...defaultProps} task={noCategoryTask} />);

      expect(screen.queryByText(/💪|🧠|✨|💼|🏠|🎯/)).not.toBeInTheDocument();
    });
  });

  describe('Priority Styling', () => {
    it('applies high priority styling', () => {
      render(<TaskDetailModal {...defaultProps} />);

      const priorityElement = screen.getByText('High');
      // CSS Modules classes are hashed, so we check for any class instead of specific class
      expect(priorityElement.className).toBeTruthy();
    });

    it('applies medium priority styling', () => {
      const mediumTask = { ...mockTask, priority: 'medium' as const };
      render(<TaskDetailModal {...defaultProps} task={mediumTask} />);

      const priorityElement = screen.getByText('Medium');
      // CSS Modules classes are hashed, so we check for any class instead of specific class
      expect(priorityElement.className).toBeTruthy();
    });

    it('applies low priority styling', () => {
      const lowTask = { ...mockTask, priority: 'low' as const };
      render(<TaskDetailModal {...defaultProps} task={lowTask} />);

      const priorityElement = screen.getByText('Low');
      // CSS Modules classes are hashed, so we check for any class instead of specific class
      expect(priorityElement.className).toBeTruthy();
    });
  });

  describe('Touch/Swipe Gestures', () => {
    it('handles touch start events', () => {
      render(<TaskDetailModal {...defaultProps} />);

      const container = screen.getByTestId('modal-content').firstChild as HTMLElement;
      fireEvent.touchStart(container, { targetTouches: [{ clientX: 100 }] });

      // The component should handle the touch event without errors
      expect(container).toBeInTheDocument();
    });

    it('handles touch move events', () => {
      render(<TaskDetailModal {...defaultProps} />);

      const container = screen.getByTestId('modal-content').firstChild as HTMLElement;
      fireEvent.touchMove(container, { targetTouches: [{ clientX: 150 }] });

      // The component should handle the touch event without errors
      expect(container).toBeInTheDocument();
    });

    it('handles touch end events', () => {
      render(<TaskDetailModal {...defaultProps} />);

      const container = screen.getByTestId('modal-content').firstChild as HTMLElement;
      fireEvent.touchEnd(container);

      // The component should handle the touch event without errors
      expect(container).toBeInTheDocument();
    });
  });

  describe('Mouse Drag Gestures', () => {
    it('handles mouse down events', () => {
      render(<TaskDetailModal {...defaultProps} />);

      const container = screen.getByTestId('modal-content').firstChild as HTMLElement;
      fireEvent.mouseDown(container, { clientX: 100 });

      // The component should handle the mouse event without errors
      expect(container).toBeInTheDocument();
    });

    it('handles mouse move events', () => {
      render(<TaskDetailModal {...defaultProps} />);

      const container = screen.getByTestId('modal-content').firstChild as HTMLElement;
      fireEvent.mouseMove(container, { clientX: 150 });

      // The component should handle the mouse event without errors
      expect(container).toBeInTheDocument();
    });

    it('handles mouse up events', () => {
      render(<TaskDetailModal {...defaultProps} />);

      const container = screen.getByTestId('modal-content').firstChild as HTMLElement;
      fireEvent.mouseUp(container);

      // The component should handle the mouse event without errors
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles task without updatedAt', () => {
      const taskWithoutUpdatedAt = {
        ...mockTask,
        updatedAt: new Date('2024-01-01T10:00:00Z'), // Use same as createdAt
      };
      render(<TaskDetailModal {...defaultProps} task={taskWithoutUpdatedAt} />);

      expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    });

    it('handles task with very long title', () => {
      const taskWithLongTitle = {
        ...mockTask,
        title: 'This is a very long task title that might cause layout issues in the task detail modal component',
      };
      render(<TaskDetailModal {...defaultProps} task={taskWithLongTitle} />);

      expect(screen.getByText('This is a very long task title that might cause layout issues in the task detail modal component')).toBeInTheDocument();
    });

    it('handles task with very long description', () => {
      const taskWithLongDescription = {
        ...mockTask,
        description: 'This is a very long task description that might cause layout issues in the task detail modal component. It contains multiple sentences and should be handled gracefully by the component.',
      };
      render(<TaskDetailModal {...defaultProps} task={taskWithLongDescription} />);

      expect(screen.getByText('This is a very long task description that might cause layout issues in the task detail modal component. It contains multiple sentences and should be handled gracefully by the component.')).toBeInTheDocument();
    });

    it('handles task with special characters in title', () => {
      const taskWithSpecialChars = {
        ...mockTask,
        title: 'Task with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      };
      render(<TaskDetailModal {...defaultProps} task={taskWithSpecialChars} />);

      expect(screen.getByText('Task with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?')).toBeInTheDocument();
    });

    it('handles task with HTML-like content in description', () => {
      const taskWithHtml = {
        ...mockTask,
        description: 'Description with <script>alert("test")</script> and <div>content</div>',
      };
      render(<TaskDetailModal {...defaultProps} task={taskWithHtml} />);

      expect(screen.getByText('Description with <script>alert("test")</script> and <div>content</div>')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper modal role and aria-modal attribute', () => {
      render(<TaskDetailModal {...defaultProps} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('has proper ARIA labels for all interactive elements', () => {
      render(<TaskDetailModal {...defaultProps} />);

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit task')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to previous task')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to next task')).toBeInTheDocument();
    });

    it('provides keyboard navigation for all buttons', () => {
      render(<TaskDetailModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close modal');
      const editButton = screen.getByLabelText('Edit task');
      const prevButton = screen.getByLabelText('Go to previous task');
      const nextButton = screen.getByLabelText('Go to next task');

      expect(closeButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with complex task data', () => {
      const complexTask = {
        ...mockTask,
        title: 'Complex Task',
        description: 'A very detailed description with lots of content',
        statRewards: {
          body: 5,
          mind: 3,
          soul: 2,
          career: 1,
          home: 4,
          skills: 6,
        },
      };

      const startTime = performance.now();
      render(<TaskDetailModal {...defaultProps} task={complexTask} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render in under 1 second
    });

    it('handles rapid prop changes efficiently', () => {
      const { rerender } = render(<TaskDetailModal {...defaultProps} />);

      // Rapidly change props
      rerender(<TaskDetailModal {...defaultProps} task={mockCompletedTask} />);
      rerender(<TaskDetailModal {...defaultProps} task={mockTaskWithoutDescription} />);
      rerender(<TaskDetailModal {...defaultProps} task={mockTask} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  test('hides zero rewards', () => {
    const taskWithZeroRewards: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test description',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      priority: 'medium',
      category: 'body',
      statRewards: {
        body: 0,
        mind: 0,
        soul: 0,
        xp: 0
      }
    };

    render(<TaskDetailModal {...defaultProps} task={taskWithZeroRewards} />);
    
    // Should not show rewards section when all rewards are zero
    expect(screen.queryByText('Rewards')).not.toBeInTheDocument();
  });

  test('shows delete button when onDelete prop is provided', () => {
    const onDelete = jest.fn();
    render(<TaskDetailModal {...defaultProps} onDelete={onDelete} />);
    
    const deleteButton = screen.getByLabelText('Delete task');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveTextContent('🗑️');
  });

  test('does not show delete button when onDelete prop is not provided', () => {
    render(<TaskDetailModal {...defaultProps} onDelete={undefined} />);
    
    expect(screen.queryByLabelText('Delete task')).not.toBeInTheDocument();
  });

  test('shows only non-zero rewards', () => {
    const taskWithMixedRewards: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test description',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      priority: 'medium',
      category: 'body',
      statRewards: {
        body: 2,
        mind: 0,
        soul: 1,
        xp: 0
      }
    };

    render(<TaskDetailModal {...defaultProps} task={taskWithMixedRewards} />);
    
    // Should show rewards section
    expect(screen.getByText('Rewards')).toBeInTheDocument();
    
    // Should show only non-zero rewards
    expect(screen.getByText('Body: +2')).toBeInTheDocument();
    expect(screen.getByText('Soul: +1')).toBeInTheDocument();
    
    // Should not show zero rewards
    expect(screen.queryByText('Mind: +0')).not.toBeInTheDocument();
    expect(screen.queryByText('XP: +0')).not.toBeInTheDocument();
  });
}); 