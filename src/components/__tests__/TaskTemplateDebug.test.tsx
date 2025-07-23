import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskTemplateDebug } from '../TaskTemplateDebug';

// Mock the useTasks hook
const mockAddTask = jest.fn();
jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    addTask: mockAddTask,
  }),
}));

describe('TaskTemplateDebug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders debug button initially', () => {
    render(<TaskTemplateDebug />);
    expect(screen.getByText('🎲 Start Here')).toBeInTheDocument();
  });

  it('shows modal when button is clicked', () => {
    render(<TaskTemplateDebug />);
    fireEvent.click(screen.getByText('🎲 Start Here'));
    expect(screen.getByText('Task Templates')).toBeInTheDocument();
  });

  it('shows template count information', () => {
    render(<TaskTemplateDebug />);
    fireEvent.click(screen.getByText('🎲 Start Here'));
    expect(screen.getByText(/Total templates:/)).toBeInTheDocument();
  });

  it('has add all templates button', () => {
    render(<TaskTemplateDebug />);
    fireEvent.click(screen.getByText('🎲 Start Here'));
    expect(screen.getByText(/Add All/)).toBeInTheDocument();
  });

  it('has add easy template button', () => {
    render(<TaskTemplateDebug />);
    fireEvent.click(screen.getByText('🎲 Start Here'));
    expect(screen.getByText('Add Easy')).toBeInTheDocument();
  });

  it('can close modal', () => {
    render(<TaskTemplateDebug />);
    fireEvent.click(screen.getByText('🎲 Start Here'));
    expect(screen.getByText('Task Templates')).toBeInTheDocument();
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Task Templates')).not.toBeInTheDocument();
    expect(screen.getByText('🎲 Start Here')).toBeInTheDocument();
  });
}); 