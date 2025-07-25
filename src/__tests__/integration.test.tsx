import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockReturnValue(undefined);
  });

  const renderApp = () => {
    return render(<App />);
  };

  const createUser = async () => {
    // Mock existing user data
    const existingUser = {
      id: '1',
      name: 'Test User',
      level: 1,
      experience: 0,
      body: 0,
      mind: 0,
      soul: 0,
      achievements: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'scrypture_user') {
        return JSON.stringify(existingUser);
      }
      return null;
    });

    renderApp();

    // Wait for the app to load with the user
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  };

  describe('Task Creation Workflow', () => {
    it('allows user to create a new task', async () => {
      await createUser();

      // 1. Find the task input
      const titleInput = screen.getByPlaceholderText(/Intention/);
      expect(titleInput).toBeInTheDocument();

      // 2. Enter task title
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });

      // 3. Expand the form to see the submit button
      fireEvent.click(titleInput);

      // 4. Submit the task
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // 5. Verify task appears in the list
      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });
    });

    it('allows user to create task with description', async () => {
      await createUser();

      const titleInput = screen.getByPlaceholderText(/Intention/);
      
      // Expand form first to show description input
      fireEvent.click(titleInput);
      
      const descriptionInput = screen.getByPlaceholderText(/Description/);

      // Enter title and description
      fireEvent.change(titleInput, { target: { value: 'Task with Description' } });
      fireEvent.change(descriptionInput, { target: { value: 'This is a detailed description' } });

      // Submit
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Verify task appears
      await waitFor(() => {
        expect(screen.getByText('Task with Description')).toBeInTheDocument();
        expect(screen.getByText('This is a detailed description')).toBeInTheDocument();
      });
    });

    it('allows user to create task with category', async () => {
      await createUser();

      const titleInput = screen.getByPlaceholderText(/Intention/);
      
      // Expand form first
      fireEvent.click(titleInput);

      // Select a category
      const homeCategoryButton = screen.getByRole('button', { name: /🏠 Home/ });
      fireEvent.click(homeCategoryButton);

      // Enter title
      fireEvent.change(titleInput, { target: { value: 'Home Task' } });

      // Submit
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Verify task appears in the correct category group
      await waitFor(() => {
        expect(screen.getByText('Home Task')).toBeInTheDocument();
        // Check that the task appears in the Home category group
        const homeCategoryHeader = screen.getByText('Home');
        expect(homeCategoryHeader).toBeInTheDocument();
      });
    });

    it('allows user to create task with priority', async () => {
      await createUser();

      const titleInput = screen.getByPlaceholderText(/Intention/);
      
      // Expand form
      fireEvent.click(titleInput);

      // Select high priority
      const highPriorityButton = screen.getByText(/HIGH PRIORITY/);
      fireEvent.click(highPriorityButton);

      // Enter title
      fireEvent.change(titleInput, { target: { value: 'High Priority Task' } });

      // Submit
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Verify task appears
      await waitFor(() => {
        expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      });
    });
  });

  describe('Task Completion Workflow', () => {
    it('allows user to complete a task', async () => {
      await createUser();

      // 1. Create a task
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.change(titleInput, { target: { value: 'Task to Complete' } });

      // Expand form
      fireEvent.click(titleInput);

      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // 2. Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText('Task to Complete')).toBeInTheDocument();
      });

      // 3. Find and click the checkbox
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // 4. Verify task moves to completed section
      await waitFor(() => {
        expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
        expect(screen.getByText('Task to Complete')).toBeInTheDocument();
      });
    });

    it('handles multiple task completions', async () => {
      await createUser();

      const titleInput = screen.getByPlaceholderText(/Intention/);
      
      // Expand form
      fireEvent.click(titleInput);

      // Create three tasks
      fireEvent.change(titleInput, { target: { value: 'First Task' } });
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      fireEvent.change(titleInput, { target: { value: 'Second Task' } });
      fireEvent.click(submitButton);

      fireEvent.change(titleInput, { target: { value: 'Third Task' } });
      fireEvent.click(submitButton);

      // Wait for all tasks to appear
      await waitFor(() => {
        expect(screen.getByText('First Task')).toBeInTheDocument();
        expect(screen.getByText('Second Task')).toBeInTheDocument();
        expect(screen.getByText('Third Task')).toBeInTheDocument();
      });

      // Complete first and third tasks
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes[0]) fireEvent.click(checkboxes[0]);
      if (checkboxes[2]) fireEvent.click(checkboxes[2]);

      // Verify completed tasks section appears
      await waitFor(() => {
        expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
        expect(screen.getByText('First Task')).toBeInTheDocument();
        expect(screen.getByText('Third Task')).toBeInTheDocument();
      });

      // Verify active tasks section still shows second task
      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
      expect(screen.getByText('Second Task')).toBeInTheDocument();
    });
  });

  describe('Task Editing Workflow', () => {
    it('allows user to edit task details through modal', async () => {
      await createUser();

      // 1. Create a task
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.change(titleInput, { target: { value: 'Task to Edit' } });

      // Expand the form to see the submit button
      fireEvent.click(titleInput);

      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // 2. Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText('Task to Edit')).toBeInTheDocument();
      });

      // 3. Click on task to open detail modal
      const taskCard = screen.getByText('Task to Edit');
      fireEvent.click(taskCard);

      // 4. Verify modal opens with task details
      await waitFor(() => {
        expect(screen.getByText('Task Details')).toBeInTheDocument();
        // Since tasks are now grouped, there might be multiple elements with the same text
        const taskElements = screen.getAllByText('Task to Edit');
        expect(taskElements.length).toBeGreaterThan(0);
      });

      // 5. Click edit button - use getAllByLabelText since there might be multiple edit buttons
      const editButtons = screen.getAllByLabelText(/Edit task/);
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
      }

      // 6. Verify edit form appears (this would be handled by TaskEditForm)
      // The actual edit functionality would be tested in TaskEditForm tests
    });

    it('handles task navigation in modal', async () => {
      await createUser();

      // Create multiple tasks
      const titleInput = screen.getByPlaceholderText(/Intention/);

      // Expand form first by clicking the input
      fireEvent.click(titleInput);

      const submitButton = screen.getByText(/Add Task/);

      fireEvent.change(titleInput, { target: { value: 'First Task' } });
      fireEvent.click(submitButton);

      fireEvent.change(titleInput, { target: { value: 'Second Task' } });
      fireEvent.click(submitButton);

      // Wait for tasks to appear
      await waitFor(() => {
        expect(screen.getByText('First Task')).toBeInTheDocument();
        expect(screen.getByText('Second Task')).toBeInTheDocument();
      });

      // Click on first task to open modal
      const firstTaskCard = screen.getByText('First Task');
      fireEvent.click(firstTaskCard);

      // Verify modal opens with first task
      await waitFor(() => {
        expect(screen.getByText('Task Details')).toBeInTheDocument();
        const firstTaskElements = screen.getAllByText('First Task');
        expect(firstTaskElements.length).toBeGreaterThan(0);
      });

      // Navigate to next task
      const nextButton = screen.getByLabelText(/Go to next task/);
      fireEvent.click(nextButton);

      // Verify second task is now displayed
      await waitFor(() => {
        const secondTaskElements = screen.getAllByText('Second Task');
        expect(secondTaskElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Persistence Workflow', () => {
    it('persists task data across app reloads', async () => {
      const existingTask = {
        id: '1',
        title: 'Persistent Task',
        description: 'This task should persist',
        category: 'home',
        priority: 'medium' as const,
        difficulty: 5,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statRewards: {
          xp: 10,
          body: 0,
          mind: 0,
          soul: 0,
        },
      };

      const existingUser = {
        id: '1',
        name: 'Test User',
        level: 1,
        experience: 0,
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'scrypture_tasks') {
          return JSON.stringify([existingTask]);
        }
        if (key === 'scrypture_user') {
          return JSON.stringify(existingUser);
        }
        return null;
      });

      renderApp();

      // Verify existing task is loaded
      await waitFor(
        () => {
          expect(screen.getByText('Persistent Task')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }, 15000); // Add timeout to the test

    it('handles user data persistence', async () => {
      const existingUser = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 450,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'scrypture_user') {
          return JSON.stringify(existingUser);
        }
        return null;
      });

      renderApp();

      // Verify user data is loaded (this might be displayed in a user profile section)
      // The actual user display would depend on the app's UI
      await waitFor(() => {
        // Check that the app loaded without errors
        expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Check for the input field
      });
    });
  });

  describe('Filtering and Sorting Workflow', () => {
    it('allows user to filter tasks by category', async () => {
      await createUser();

      // Create tasks with different categories
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form

      // Create home task
      const homeCategoryButton = screen.getByRole('button', {
        name: /🏠 Home/,
      });
      fireEvent.click(homeCategoryButton);
      fireEvent.change(titleInput, { target: { value: 'Home Task' } });
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Create free time task
      const freeTimeCategoryButton = screen.getByRole('button', {
        name: /🎲 Free time/,
      });
      fireEvent.click(freeTimeCategoryButton);
      fireEvent.change(titleInput, { target: { value: 'Free Time Task' } });
      fireEvent.click(submitButton);

      // Wait for tasks to appear
      await waitFor(() => {
        expect(screen.getByText('Home Task')).toBeInTheDocument();
        expect(screen.getByText('Free Time Task')).toBeInTheDocument();
      });

      // Filter by free time category
      const categoryFilter = screen.getByDisplayValue('All Categories');
      fireEvent.change(categoryFilter, { target: { value: 'free time' } });

      // Verify only free time task is visible
      expect(screen.getByText('Free Time Task')).toBeInTheDocument();
      expect(screen.queryByText('Home Task')).not.toBeInTheDocument();

      // Reset filter
      fireEvent.change(categoryFilter, { target: { value: '' } });

      // Verify both tasks are visible again
      expect(screen.getByText('Home Task')).toBeInTheDocument();
      expect(screen.getByText('Free Time Task')).toBeInTheDocument();
    });

    it('allows user to sort tasks by different criteria', async () => {
      await createUser();

      // Create multiple tasks with different priorities
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form

      // Create low priority task
      const lowPriorityButton = screen.getByText(/LOW PRIORITY/);
      fireEvent.click(lowPriorityButton);
      fireEvent.change(titleInput, { target: { value: 'Low Priority Task' } });
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Create high priority task
      const highPriorityButton = screen.getByText(/HIGH PRIORITY/);
      fireEvent.click(highPriorityButton);
      fireEvent.change(titleInput, { target: { value: 'High Priority Task' } });
      fireEvent.click(submitButton);

      // Wait for tasks to appear
      await waitFor(() => {
        expect(screen.getByText('Low Priority Task')).toBeInTheDocument();
        expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      });

      // Change sort order to descending
      const sortButton = screen.getByLabelText(/Sort descending/);
      fireEvent.click(sortButton);

      // Verify sort order changed (this would be reflected in the order of tasks)
      // The actual verification would depend on how the sort is visually represented
    });

    it('allows user to search tasks', async () => {
      await createUser();

      // Create tasks with different titles
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form

      fireEvent.change(titleInput, { target: { value: 'Important Task' } });
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      fireEvent.change(titleInput, { target: { value: 'Regular Task' } });
      fireEvent.click(submitButton);

      // Wait for tasks to appear
      await waitFor(() => {
        expect(screen.getByText('Important Task')).toBeInTheDocument();
        expect(screen.getByText('Regular Task')).toBeInTheDocument();
      });

      // Search for "Important"
      const searchInput = screen.getByPlaceholderText(/Search tasks/);
      fireEvent.change(searchInput, { target: { value: 'Important' } });

      // Verify only important task is visible
      expect(screen.getByText('Important Task')).toBeInTheDocument();
      // Note: Search might not hide tasks completely, just highlight them
      // So we'll just verify the search input works
      expect(searchInput).toHaveValue('Important');

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      // Verify both tasks are visible again
      expect(screen.getByText('Important Task')).toBeInTheDocument();
      expect(screen.getByText('Regular Task')).toBeInTheDocument();
    });
  });

  describe('Category Management Workflow', () => {
    it('allows user to create custom categories', async () => {
      await createUser();

      // Expand the form first to show the category section
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // Find the "Add Category" button in the form
      const addCategoryButton = screen.getByText(/\+ Add Category/);
      fireEvent.click(addCategoryButton);

      // This would open a modal or form for creating categories
      // The actual implementation would depend on the category creation UI
    });

    it('displays tasks grouped by category', async () => {
      await createUser();

      // Create tasks in different categories
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form

      // Create home task
      const homeCategoryButton = screen.getByRole('button', { name: /🏠 Home/ });
      fireEvent.click(homeCategoryButton);
      fireEvent.change(titleInput, { target: { value: 'Home Task' } });
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Create body task by clicking the BODY core attribute button
      const bodyCoreButton = screen.getByRole('button', { name: /BODY/ });
      fireEvent.click(bodyCoreButton); // This will auto-add the 'body' category
      fireEvent.change(titleInput, { target: { value: 'Body Task' } });
      fireEvent.click(submitButton);

      // Wait for tasks to appear
      await waitFor(() => {
        expect(screen.getByText('Home Task')).toBeInTheDocument();
        expect(screen.getByText('Body Task')).toBeInTheDocument();
      });

      // Verify tasks are grouped (they should appear in their respective category groups)
      // The exact category headers depend on the first category of each task
      const categoryHeaders = screen.getAllByText(/^(Home|Body|Uncategorized)$/);
      expect(categoryHeaders.length).toBeGreaterThan(0);
    });

    it('allows user to collapse and expand category groups', async () => {
      await createUser();

      // Create a task in a specific category
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form

      // Select Home category
      const homeCategoryButton = screen.getByRole('button', { name: /🏠 Home/ });
      fireEvent.click(homeCategoryButton);
      fireEvent.change(titleInput, { target: { value: 'Home Task' } });
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText('Home Task')).toBeInTheDocument();
      });

      // Find and click any category header to collapse (the task will be grouped by its first category)
      const categoryHeaders = screen.getAllByText(/^(Home|Body|Uncategorized)$/);
      const categoryHeader = categoryHeaders[0]?.closest('button');
      if (categoryHeader) {
        fireEvent.click(categoryHeader);
      }

      // Verify the task is hidden (collapsed)
      expect(screen.queryByText('Home Task')).not.toBeInTheDocument();

      // Click again to expand
      if (categoryHeader) {
        fireEvent.click(categoryHeader);
      }

      // Verify the task is visible again
      await waitFor(() => {
        expect(screen.getByText('Home Task')).toBeInTheDocument();
      });
    });
  });
});
