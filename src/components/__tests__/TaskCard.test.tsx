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

  it('should start in normal state without animation classes', () => {
    render(<TaskCard task={mockTask} />);
    
    const card = screen.getByText('Test Task').closest('div');
    expect(card).not.toHaveClass('transitioningToEdit');
    expect(card).not.toHaveClass('editing');
    expect(card).not.toHaveClass('exitingEdit');
    expect(card).not.toHaveClass('reentering');
  });

  it('should apply transitioningToEdit class when edit button is clicked', () => {
    render(<TaskCard task={mockTask} />);
    
    const editButton = screen.getByLabelText('Edit task');
    fireEvent.click(editButton);
    
    const card = screen.getByText('Test Task').closest('div');
    expect(card).toHaveClass('transitioningToEdit');
  });

  it('should transition to editing state after 200ms', async () => {
    render(<TaskCard task={mockTask} />);
    
    const editButton = screen.getByLabelText('Edit task');
    fireEvent.click(editButton);
    
    // Should be in transitioning state
    const card = screen.getByText('Test Task').closest('div');
    expect(card).toHaveClass('transitioningToEdit');
    
    // Fast forward 200ms
    jest.advanceTimersByTime(200);
    
    await waitFor(() => {
      expect(card).toHaveClass('editing');
      expect(card).not.toHaveClass('transitioningToEdit');
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
    const card = screen.getByText('Test Task').closest('div');
    expect(card).toHaveClass('transitioningToEdit');
    expect(card).not.toHaveClass('editing');
  });

  it('should apply correct CSS classes for different animation states', () => {
    render(<TaskCard task={mockTask} />);
    
    const card = screen.getByText('Test Task').closest('div');
    const baseClasses = card?.className.split(' ');
    
    // Should have base card class
    expect(baseClasses).toContain('card');
    
    // Should not have animation classes initially
    expect(baseClasses).not.toContain('transitioningToEdit');
    expect(baseClasses).not.toContain('editing');
    expect(baseClasses).not.toContain('exitingEdit');
    expect(baseClasses).not.toContain('reentering');
  });
});
