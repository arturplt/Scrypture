import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock all the services that depend on storageService
jest.mock('./services/storageService', () => ({
  storageService: {
    getUser: jest.fn(() => ({
      id: '1',
      name: 'Test User',
      level: 1,
      experience: 0,
      body: 0,
      mind: 0,
      soul: 0,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })),
    saveUser: jest.fn(() => true),
    getTasks: jest.fn(() => [
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
    ]),
    saveTasks: jest.fn(() => true),
    getHabits: jest.fn(() => []),
    saveHabits: jest.fn(() => true),
    getGenericItem: jest.fn(() => null),
    setGenericItem: jest.fn(() => true),
    removeGenericItem: jest.fn(() => true),
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

  it('should show suggestion-to-edit functionality', () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    // Should show suggestions
    const suggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
    expect(suggestions.length).toBeGreaterThan(0);
    expect(screen.getByText('Edit task')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('should navigate to task and trigger inline edit when suggestion is clicked', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    // Find the auto-fill suggestion specifically
    const suggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
    expect(suggestions.length).toBeGreaterThan(0);
    const suggestion = suggestions[0];
    fireEvent.click(suggestion);

    // Should navigate to the task in the list (no modal)
    await waitFor(() => {
      // The task should be visible in the task list
      const workoutTasks = screen.getAllByText('Workout');
      expect(workoutTasks.length).toBeGreaterThan(0);
      
      // The task should start editing inline (no modal)
      expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
    });
  });

  it('should close suggestions with Escape key', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    // Wait for suggestions to appear
    await waitFor(() => {
      const suggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
      expect(suggestions.length).toBeGreaterThan(0);
    });

    fireEvent.keyDown(titleInput, { key: 'Escape' });
    const workoutSuggestions = screen.queryAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
    expect(workoutSuggestions.length).toBe(0);
  });

  it('should filter suggestions by multiple criteria', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');

    // Search by title
    fireEvent.change(titleInput, { target: { value: 'Study' } });
    const studySuggestions = screen.getAllByText('Study Programming').filter(el => el.textContent?.includes('Edit task'));
    expect(studySuggestions.length).toBeGreaterThan(0);

    // Search by category
    fireEvent.change(titleInput, { target: { value: 'workout' } });
    const suggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
    expect(suggestions.length).toBeGreaterThan(0);

    // Search by description
    fireEvent.change(titleInput, { target: { value: 'exercise' } });
    const workoutSuggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
    expect(workoutSuggestions.length).toBeGreaterThan(0);
  });

  // it('should have dimmed delete button in edit form', async () => {
  //   render(<App />);

  //   const titleInput = screen.getByPlaceholderText('Intention');
  //   fireEvent.change(titleInput, { target: { value: 'workout' } });

  //   const suggestion = screen.getByText('Workout');
  //   fireEvent.click(suggestion);

  //   await waitFor(() => {
  //     const deleteButton = screen.getByText('Delete Task');
  //     expect(deleteButton).toHaveStyle({ opacity: '0.7' });
  //   });
  // });

  // it('should show smooth animations during transitions', async () => {
  //   render(<App />);

  //   const titleInput = screen.getByPlaceholderText('Intention');
  //   fireEvent.change(titleInput, { target: { value: 'workout' } });

  //   const suggestion = screen.getByText('Workout');
  //   fireEvent.click(suggestion);

  //   // Wait for modal to appear and check for modal content
  //   await waitFor(() => {
  //     // Look for the modal title
  //     const modalTitle = screen.getByText('Edit Task');
  //     expect(modalTitle).toBeInTheDocument();
      
  //     // Look for the TaskEditForm content
  //     const updateButton = screen.getByText('Update Task');
  //     expect(updateButton).toBeInTheDocument();
      
  //     // Check if the form has the transitioning class
  //     const form = updateButton.closest('form');
  //     expect(form).toHaveClass('transitioning');
  //   }, { timeout: 5000 });
  // });

  // it('should handle multiple rapid clicks gracefully', async () => {
  //   render(<App />);

  //   const titleInput = screen.getByPlaceholderText('Intention');
  //   fireEvent.change(titleInput, { target: { value: 'workout' } });

  //   const suggestion = screen.getByText('Workout');
  
  //   // Click multiple times rapidly
  //   fireEvent.click(suggestion);
  //   fireEvent.click(suggestion);
  //   fireEvent.click(suggestion);

  //   // Should only show one modal
  //   await waitFor(() => {
  //     // Look for the modal title
  //     const modalTitle = screen.getByText('Edit Task');
  //     expect(modalTitle).toBeInTheDocument();
      
  //     // Look for the TaskEditForm content
  //     const updateButton = screen.getByText('Update Task');
  //     expect(updateButton).toBeInTheDocument();
  //   }, { timeout: 5000 });
  // });

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
      // Look for the completed task in the completed section - it should be "Workout"
      const completedTask = screen.getByText('Workout');
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

    // Find the auto-fill suggestion specifically
    const suggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
    expect(suggestions.length).toBeGreaterThan(0);
    const suggestion = suggestions[0];
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

  it('should show auto-fill suggestions when typing', () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    // Should show suggestions
    const suggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
    expect(suggestions.length).toBeGreaterThan(0);
    expect(screen.getByText('Edit task')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('should debug modal issue step by step', async () => {
    render(<App />);

    // Step 1: Type in the input
    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    // Check if auto-fill suggestions appear
    await waitFor(() => {
      const suggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
      expect(suggestions.length).toBeGreaterThan(0);
      console.log('Auto-fill suggestion found:', suggestions[0].textContent);
    });

    // Step 2: Check if the task appears in the task list
    await waitFor(() => {
      const workoutTasks = screen.getAllByText('Workout');
      expect(workoutTasks.length).toBeGreaterThan(0);
      console.log('Step 2: Task found in list');
    });

    // Step 3: Click the edit button on the first task (Workout)
    const editButtons = screen.getAllByLabelText('Edit task');
    fireEvent.click(editButtons[0]);

    // Check if modal appears
    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });
  });

  it('should trigger click handler when auto-fill suggestion is clicked', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('Intention');
    fireEvent.change(titleInput, { target: { value: 'workout' } });

    // Wait for suggestions to appear
    await waitFor(() => {
      const suggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
      expect(suggestions.length).toBeGreaterThan(0);
    });

    // Find the auto-fill suggestion specifically
    const suggestions = screen.getAllByText('Workout').filter(el => el.textContent?.includes('Edit task'));
    const suggestion = suggestions[0];
    
    // Try clicking on the text content directly
    const workoutText = within(suggestion).getByText('Workout');
    fireEvent.click(workoutText);
    
    // Check if the debug logs appear (this will help us verify the click is working)
    // The debug info should show "editingTask: SET" if the click worked
    await waitFor(() => {
      const debugInfo = screen.getByText(/editingTask:/);
      expect(debugInfo).toBeInTheDocument();
    }, { timeout: 5000 });
  });
}); 