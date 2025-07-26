import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCard } from '../TaskCard';

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
    toggleTask: jest.fn(),
    bringTaskToTop: jest.fn(),
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

describe('TaskCard Animation Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render task title and description', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should start in normal state without animation classes', () => {
    render(<TaskCard task={mockTask} />);
    
    // Find the main card container (the outer div with the task content)
    const cardContainer = screen.getByText('Test Task').closest('div');
    expect(cardContainer).not.toHaveClass('transitioningToEdit');
    expect(cardContainer).not.toHaveClass('editing');
    expect(cardContainer).not.toHaveClass('exitingEdit');
    expect(cardContainer).not.toHaveClass('reentering');
  });

  it('should apply transitioningToEdit class when edit button is clicked', () => {
    render(<TaskCard task={mockTask} />);
    
    const editButton = screen.getByLabelText('Edit task');
    fireEvent.click(editButton);
    
    const cardContainer = screen.getByText('Test Task').closest('div');
    expect(cardContainer).toHaveClass('transitioningToEdit');
  });

  it('should transition to editing state after 200ms', async () => {
    render(<TaskCard task={mockTask} />);
    
    const editButton = screen.getByLabelText('Edit task');
    fireEvent.click(editButton);
    
    // Should be in transitioning state
    const cardContainer = screen.getByText('Test Task').closest('div');
    expect(cardContainer).toHaveClass('transitioningToEdit');
    
    // Fast forward 200ms
    jest.advanceTimersByTime(200);
    
    await waitFor(() => {
      expect(cardContainer).toHaveClass('editing');
      expect(cardContainer).not.toHaveClass('transitioningToEdit');
    });
  });

  it('should prevent multiple rapid edit clicks during transition', () => {
    render(<TaskCard task={mockTask} />);
    
    const editButton = screen.getByLabelText('Edit task');
    
    // Click multiple times rapidly
    fireEvent.click(editButton);
    fireEvent.click(editButton);
    fireEvent.click(editButton);
    
    // Should only be in transitioning state, not editing
    const cardContainer = screen.getByText('Test Task').closest('div');
    expect(cardContainer).toHaveClass('transitioningToEdit');
    expect(cardContainer).not.toHaveClass('editing');
  });

  it('should apply correct CSS classes for different animation states', () => {
    render(<TaskCard task={mockTask} />);
    
    const cardContainer = screen.getByText('Test Task').closest('div');
    const baseClasses = cardContainer?.className?.split(' ') || [];
    
    // Should not have animation classes initially
    expect(baseClasses).not.toContain('transitioningToEdit');
    expect(baseClasses).not.toContain('editing');
    expect(baseClasses).not.toContain('exitingEdit');
    expect(baseClasses).not.toContain('reentering');
  });
});
