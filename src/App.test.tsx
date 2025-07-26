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

    // Wait for modal to appear and check for modal content
    await waitFor(() => {
      // Look for the modal title
      const modalTitle = screen.getByText('Edit Task');
      expect(modalTitle).toBeInTheDocument();
      
      // Look for the TaskEditForm content
      const updateButton = screen.getByText('Update Task');
      expect(updateButton).toBeInTheDocument();
      
      // Check if the form has the transitioning class
      const form = updateButton.closest('form');
      expect(form).toHaveClass('transitioning');
    }, { timeout: 5000 });
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
      // Look for the modal title
      const modalTitle = screen.getByText('Edit Task');
      expect(modalTitle).toBeInTheDocument();
      
      // Look for the TaskEditForm content
      const updateButton = screen.getByText('Update Task');
      expect(updateButton).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should maintain task list functionality', async () => {
    render(<App />);

    // Should show task list
    expect(screen.getByText('Workout')).toBeInTheDocument();
    expect(screen.getByText('Study Programming')).toBeInTheDocument();
  });

  it('should handle task completion', async () => {
    render(<App />);

    // Get the first checkbox (there are multiple tasks now)
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    
    // Click the checkbox
    fireEvent.click(firstCheckbox);

    // Wait for the task to be moved to completed section
    await waitFor(() => {
      // Look for the completed task in the completed section
      const completedTask = screen.getByText('Read Book');
      expect(completedTask).toBeInTheDocument();
      
      // Find the checkbox in the completed section by looking for the checked attribute
      const completedCheckboxes = screen.getAllByRole('checkbox');
      const completedCheckbox = completedCheckboxes.find(checkbox => 
        checkbox.hasAttribute('checked')
      );
      expect(completedCheckbox).toBeTruthy();
      expect(completedCheckbox).toBeChecked();
    }, { timeout: 3000 });
  });

  it('should debug auto-fill edit functionality', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    const suggestion = screen.getByText('Workout');
    fireEvent.click(suggestion);

    // Check if modal appears
    await waitFor(() => {
      // Look for modal content
      const modalTitle = screen.queryByText('Edit Task');
      console.log('Modal title found:', modalTitle);
      
      // Look for any modal elements
      const modalElements = document.querySelectorAll('[role="dialog"], .modal, .overlay');
      console.log('Modal elements found:', modalElements.length);
      
      // Look for TaskEditForm content
      const editFormElements = screen.queryAllByText(/Update Task|Delete Task/);
      console.log('Edit form elements found:', editFormElements.length);
    }, { timeout: 5000 });
  });

  it('should show auto-fill suggestions when typing', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    
    // Type to trigger auto-fill
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    // Check if auto-fill suggestions appear
    await waitFor(() => {
      const suggestion = screen.getByText('Workout');
      expect(suggestion).toBeInTheDocument();
      console.log('Auto-fill suggestion found:', suggestion.textContent);
    }, { timeout: 3000 });
  });

  it('should debug modal issue step by step', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    
    // Step 1: Type to trigger auto-fill
    fireEvent.change(titleInput, { target: { value: 'workout' } });
    
    // Step 2: Check if auto-fill suggestions appear
    await waitFor(() => {
      const suggestion = screen.getByText('Workout');
      expect(suggestion).toBeInTheDocument();
      console.log('Step 2: Auto-fill suggestion found');
    });
    
    // Step 3: Click on the suggestion
    const suggestion = screen.getByText('Workout');
    console.log('Step 3: Clicking on suggestion');
    fireEvent.click(suggestion);
    
    // Step 4: Check if modal appears
    await waitFor(() => {
      console.log('Step 4: Looking for modal');
      const modalTitle = screen.queryByText('Edit Task');
      console.log('Modal title found:', modalTitle);
      
      if (modalTitle) {
        console.log('Modal is visible!');
      } else {
        console.log('Modal not found');
        // Check if onEditTask was called
        console.log('Checking if handleEditTask was called...');
      }
    }, { timeout: 5000 });
  });
}); 

describe('Modal Tests', () => {
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

  it('should open edit modal when auto-fill suggestion is clicked', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    
    // Type to trigger auto-fill
    fireEvent.change(titleInput, { target: { value: 'workout' } });
    
    // Wait for auto-fill suggestion to appear
    await waitFor(() => {
      const suggestion = screen.getByText('Workout');
      expect(suggestion).toBeInTheDocument();
    });
    
    // Click on the suggestion
    const suggestion = screen.getByText('Workout');
    fireEvent.click(suggestion);
    
    // Wait for modal to appear
    await waitFor(() => {
      const modalTitle = screen.getByText('Edit Task');
      expect(modalTitle).toBeInTheDocument();
    }, { timeout: 5000 });
  });
}); 