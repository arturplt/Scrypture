import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the services to avoid localStorage issues
jest.mock('./services/storageService', () => ({
  storageService: {
    getTasks: () => [
      {
        id: '1',
        title: 'Workout',
        description: 'Daily exercise routine',
        completed: false,
        priority: 'medium',
        categories: ['body'],
        createdAt: new Date(),
        updatedAt: new Date(),
        statRewards: { body: 1, xp: 10 },
        difficulty: 3
      },
      {
        id: '2',
        title: 'Study Programming',
        description: 'Learn new programming concepts',
        completed: false,
        priority: 'high',
        categories: ['mind'],
        createdAt: new Date(),
        updatedAt: new Date(),
        statRewards: { mind: 1, xp: 15 },
        difficulty: 5
      }
    ],
    saveTasks: jest.fn(),
    getUsers: () => [{ id: '1', name: 'Test User', level: 1, experience: 0 }],
    saveUsers: jest.fn(),
    getHabits: () => [],
    saveHabits: jest.fn()
  }
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it('should render the main app components', () => {
    render(<App />);

    expect(screen.getByText('Scrypture')).toBeInTheDocument();
    expect(screen.getByText('Grimorium Vivendi')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Start Here')).toBeInTheDocument();
  });

  it('should show suggestion-to-edit functionality', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    // Should show suggestions
    expect(screen.getByText('Workout')).toBeInTheDocument();
    expect(screen.getByText('Edit task')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('should open edit modal when suggestion is clicked', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    const suggestion = screen.getByText('Workout');
    fireEvent.click(suggestion);

    // Should show edit modal
    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Workout')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Daily exercise routine')).toBeInTheDocument();
    });
  });

  it('should close edit modal when cancel is clicked', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    const suggestion = screen.getByText('Workout');
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
    });
  });

  it('should update task when form is submitted in edit modal', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    const suggestion = screen.getByText('Workout');
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    const editTitleInput = screen.getByDisplayValue('Workout');
    fireEvent.change(editTitleInput, { target: { value: 'Updated Workout' } });

    const updateButton = screen.getByText('Update Task');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
    });
  });

  it('should show delete confirmation when delete is clicked', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    const suggestion = screen.getByText('Workout');
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Task');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this task?')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation in suggestions', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    // Navigate down
    fireEvent.keyDown(titleInput, { key: 'ArrowDown' });
    expect(screen.getByText('Study Programming')).toHaveClass('autoFillSuggestionSelected');

    // Navigate up
    fireEvent.keyDown(titleInput, { key: 'ArrowUp' });
    expect(screen.getByText('Workout')).toHaveClass('autoFillSuggestionSelected');

    // Select with Enter
    fireEvent.keyDown(titleInput, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });
  });

  it('should close suggestions with Escape key', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    expect(screen.getByText('Workout')).toBeInTheDocument();

    fireEvent.keyDown(titleInput, { key: 'Escape' });

    expect(screen.queryByText('Workout')).not.toBeInTheDocument();
  });

  it('should filter suggestions by multiple criteria', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');

    // Search by title
    fireEvent.change(titleInput, { target: { value: 'Study' } });
    expect(screen.getByText('Study Programming')).toBeInTheDocument();

    // Search by category
    fireEvent.change(titleInput, { target: { value: 'mind' } });
    expect(screen.getByText('Study Programming')).toBeInTheDocument();

    // Search by description
    fireEvent.change(titleInput, { target: { value: 'exercise' } });
    expect(screen.getByText('Workout')).toBeInTheDocument();
  });

  it('should have dimmed delete button in edit form', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    const suggestion = screen.getByText('Workout');
    fireEvent.click(suggestion);

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Task');
      expect(deleteButton).toHaveStyle({ opacity: '0.7' });
    });
  });

  it('should show smooth animations during transitions', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    const suggestion = screen.getByText('Workout');
    fireEvent.click(suggestion);

    await waitFor(() => {
      const form = screen.getByText('Update Task').closest('form');
      expect(form).toHaveClass('transitioning');
    });
  });

  it('should handle multiple rapid clicks gracefully', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    const suggestion = screen.getByText('Workout');
    
    // Click multiple times rapidly
    fireEvent.click(suggestion);
    fireEvent.click(suggestion);
    fireEvent.click(suggestion);

    // Should only show one modal
    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });
  });

  it('should maintain task list functionality', async () => {
    render(<App />);

    // Should show task list
    expect(screen.getByText('Workout')).toBeInTheDocument();
    expect(screen.getByText('Study Programming')).toBeInTheDocument();
  });

  it('should handle task completion', () => {
    render(<App />);

    // Get the first checkbox (there are multiple tasks now)
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    fireEvent.click(firstCheckbox);

    // Task should be marked as completed
    expect(firstCheckbox).toBeChecked();
  });
}); 