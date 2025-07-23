import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the useTasks hook
const mockAddTask = jest.fn();
const mockRefreshTasks = jest.fn();
jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    addTask: mockAddTask,
    refreshTasks: mockRefreshTasks,
  }),
}));

import { DifficultySamples } from '../DifficultySamples';

describe('DifficultySamples', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders difficulty samples button initially', () => {
    render(<DifficultySamples />);
    expect(screen.getByText('📊 Difficulty Samples')).toBeInTheDocument();
  });

  it('shows modal when button is clicked', () => {
    render(<DifficultySamples />);
    fireEvent.click(screen.getByText('📊 Difficulty Samples'));
    expect(screen.getByText('Difficulty Samples')).toBeInTheDocument();
  });

  it('has add all samples button', () => {
    render(<DifficultySamples />);
    fireEvent.click(screen.getByText('📊 Difficulty Samples'));
    expect(screen.getByText('Add All Samples')).toBeInTheDocument();
  });

  it('has difficulty level buttons', () => {
    render(<DifficultySamples />);
    fireEvent.click(screen.getByText('📊 Difficulty Samples'));
    expect(screen.getByText('0 (2)')).toBeInTheDocument();
    expect(screen.getByText('1 (3)')).toBeInTheDocument();
    expect(screen.getByText('9 (3)')).toBeInTheDocument();
  });

  it('can close modal', () => {
    render(<DifficultySamples />);
    fireEvent.click(screen.getByText('📊 Difficulty Samples'));
    expect(screen.getByText('Difficulty Samples')).toBeInTheDocument();
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Difficulty Samples')).not.toBeInTheDocument();
    expect(screen.getByText('📊 Difficulty Samples')).toBeInTheDocument();
  });
}); 