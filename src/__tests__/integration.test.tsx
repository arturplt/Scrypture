import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { TaskProvider } from '../hooks/useTasks';
import { UserProvider } from '../hooks/useUser';

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

// Mock the services
jest.mock('../services/storageService', () => ({
  storageService: {
    saveTasks: jest.fn(() => true),
    getTasks: jest.fn(() => []),
    saveUser: jest.fn(() => true),
    getUser: jest.fn(() => ({
      id: '1',
      name: 'Test User',
      level: 1,
      experience: 0,
      achievements: [],
      createdAt: new Date('2024-01-01'),
    })),
    getHabits: jest.fn(() => []),
    saveHabits: jest.fn(() => true),
    getStorageStats: jest.fn(() => ({
      used: 1024,
      available: 5 * 1024 * 1024,
      percentage: 0.02,
    })),
    backupData: jest.fn(() => ({ success: true })),
    restoreData: jest.fn(() => ({ success: true })),
  },
}));

jest.mock('../services/categoryService', () => ({
  categoryService: {
    getCustomCategories: jest.fn(() => []),
    saveCustomCategories: jest.fn(() => true),
    addCustomCategory: jest.fn(() => true),
  },
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  const renderApp = () => {
    return render(<App />);
  };

  describe('Complete Task Creation Workflow', () => {
    it('allows user to create a complete task from start to finish', async () => {
      renderApp();

      // 1. User opens the app and sees empty state
      expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
      expect(screen.getByText(/Create your first task/)).toBeInTheDocument();

      // 2. User sees the task form
      const taskForm = screen.getByRole('form');
      expect(taskForm).toBeInTheDocument();

      // 3. User clicks on the title input to expand the form
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // 4. User fills in task details
      fireEvent.change(titleInput, { target: { value: 'Complete Integration Test Task' } });
      
      // 5. User fills in description (textarea appears when form is expanded)
      const descriptionInput = screen.getByPlaceholderText(/Description/);
      fireEvent.change(descriptionInput, { target: { value: 'This is a test task for integration testing' } });

      // 6. User selects category (body should be default)
      const bodyCategoryButton = screen.getByText(/💪 BODY/);
      expect(bodyCategoryButton).toBeInTheDocument();

      // 7. User selects priority (medium should be default)
      const mediumPriorityButton = screen.getByText(/MEDIUM PRIORITY/);
      expect(mediumPriorityButton).toBeInTheDocument();

      // 8. User submits the task
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // 7. Task appears in the task list
      await waitFor(() => {
        expect(screen.getByText('Complete Integration Test Task')).toBeInTheDocument();
      });

      // 8. Task shows correct details
      expect(screen.getByText('This is a test task for integration testing')).toBeInTheDocument();
      expect(screen.getByText(/💪/)).toBeInTheDocument(); // Body category icon
    });

    it('handles task creation with different categories and priorities', async () => {
      renderApp();

      // Click on title input to expand form
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // Fill in task details
      fireEvent.change(titleInput, { target: { value: 'Mind Task' } });
      
      const descriptionInput = screen.getByPlaceholderText(/Description/);
      fireEvent.change(descriptionInput, { target: { value: 'A mind-focused task' } });

      // Select mind category
      const mindCategoryButton = screen.getByText(/🧠 MIND/);
      fireEvent.click(mindCategoryButton);

      // Select high priority
      const highPriorityButton = screen.getByText(/HIGH PRIORITY/);
      fireEvent.click(highPriorityButton);

      // Submit task
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Verify task appears with correct category and priority
      await waitFor(() => {
        expect(screen.getByText('Mind Task')).toBeInTheDocument();
      });
      expect(screen.getByText(/🧠/)).toBeInTheDocument(); // Mind category icon
    });
  });

  describe('Task Completion Workflow', () => {
    it('allows user to complete a task and see it in completed section', async () => {
      renderApp();

      // 1. Create a task first
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form
      fireEvent.change(titleInput, { target: { value: 'Task to Complete' } });
      
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // 2. Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText('Task to Complete')).toBeInTheDocument();
      });

      // 3. Find and click the completion checkbox
      const taskCard = screen.getByText('Task to Complete').closest('div');
      const checkbox = taskCard?.querySelector('input[type="checkbox"]');
      
      if (checkbox) {
        fireEvent.click(checkbox);
      }

      // 4. Verify task moves to completed section
      await waitFor(() => {
        expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
        expect(screen.getByText('Task to Complete')).toBeInTheDocument();
      });
    });

    it('handles multiple task completions and maintains state', async () => {
      renderApp();

      // Create multiple tasks
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form once
      
      // Create first task
      fireEvent.change(titleInput, { target: { value: 'First Task' } });
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Create second task
      fireEvent.change(titleInput, { target: { value: 'Second Task' } });
      fireEvent.click(submitButton);

      // Create third task
      fireEvent.change(titleInput, { target: { value: 'Third Task' } });
      fireEvent.click(submitButton);

      // Wait for all tasks to appear
      await waitFor(() => {
        expect(screen.getByText('First Task')).toBeInTheDocument();
        expect(screen.getByText('Second Task')).toBeInTheDocument();
        expect(screen.getByText('Third Task')).toBeInTheDocument();
      });

      // Complete first and third tasks
      const firstTaskCard = screen.getByText('First Task').closest('div');
      const thirdTaskCard = screen.getByText('Third Task').closest('div');

      const firstCheckbox = firstTaskCard?.querySelector('input[type="checkbox"]');
      const thirdCheckbox = thirdTaskCard?.querySelector('input[type="checkbox"]');

      if (firstCheckbox) fireEvent.click(firstCheckbox);
      if (thirdCheckbox) fireEvent.click(thirdCheckbox);

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
      renderApp();

      // 1. Create a task
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.change(titleInput, { target: { value: 'Task to Edit' } });
      
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
        expect(screen.getByText('Task to Edit')).toBeInTheDocument();
      });

      // 5. Click edit button
      const editButton = screen.getByLabelText(/Edit task/);
      fireEvent.click(editButton);

      // 6. Verify edit form appears (this would be handled by TaskEditForm)
      // The actual edit functionality would be tested in TaskEditForm tests
    });

    it('handles task navigation in modal', async () => {
      renderApp();

      // Create multiple tasks
      const titleInput = screen.getByPlaceholderText(/Intention/);
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
        expect(screen.getByText('First Task')).toBeInTheDocument();
      });

      // Navigate to next task
      const nextButton = screen.getByLabelText(/Go to next task/);
      fireEvent.click(nextButton);

      // Verify second task is now displayed
      await waitFor(() => {
        expect(screen.getByText('Second Task')).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence Workflow', () => {
    it('persists task data across app reloads', async () => {
      // Mock existing data in localStorage
      const existingTasks = [
        {
          id: '1',
          title: 'Persistent Task',
          description: 'This task should persist',
          completed: false,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
          priority: 'medium' as const,
          category: 'body',
        },
      ];

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'scrypture_tasks') {
          return JSON.stringify(existingTasks);
        }
        return null;
      });

      renderApp();

      // Verify existing task is loaded
      await waitFor(() => {
        expect(screen.getByText('Persistent Task')).toBeInTheDocument();
      });

      // Create a new task
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.change(titleInput, { target: { value: 'New Persistent Task' } });
      
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Verify both tasks are visible
      await waitFor(() => {
        expect(screen.getByText('Persistent Task')).toBeInTheDocument();
        expect(screen.getByText('New Persistent Task')).toBeInTheDocument();
      });
    });

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
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering and Sorting Workflow', () => {
    it('allows user to filter tasks by category', async () => {
      renderApp();

      // Create tasks with different categories
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form

      // Create body task
      fireEvent.change(titleInput, { target: { value: 'Body Task' } });
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // Create mind task
      const mindCategoryButton = screen.getByText(/🧠 MIND/);
      fireEvent.click(mindCategoryButton);
      fireEvent.change(titleInput, { target: { value: 'Mind Task' } });
      fireEvent.click(submitButton);

      // Wait for tasks to appear
      await waitFor(() => {
        expect(screen.getByText('Body Task')).toBeInTheDocument();
        expect(screen.getByText('Mind Task')).toBeInTheDocument();
      });

      // Filter by mind category
      const categoryFilter = screen.getByDisplayValue(/All Categories/);
      fireEvent.change(categoryFilter, { target: { value: 'mind' } });

      // Verify only mind task is visible
      expect(screen.getByText('Mind Task')).toBeInTheDocument();
      expect(screen.queryByText('Body Task')).not.toBeInTheDocument();

      // Reset filter
      fireEvent.change(categoryFilter, { target: { value: '' } });

      // Verify both tasks are visible again
      expect(screen.getByText('Body Task')).toBeInTheDocument();
      expect(screen.getByText('Mind Task')).toBeInTheDocument();
    });

    it('allows user to sort tasks by different criteria', async () => {
      renderApp();

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

      // Change sort to priority
      const sortSelect = screen.getByDisplayValue(/📂 Category/);
      fireEvent.change(sortSelect, { target: { value: 'priority' } });

      // Verify sort order changed (high priority should appear first)
      const taskCards = screen.getAllByText(/Task/);
      expect(taskCards[0]).toHaveTextContent('High Priority Task');
    });
  });

  describe('Error Handling Workflow', () => {
    it('handles storage errors gracefully', async () => {
      // Mock storage service to throw errors
      const mockStorageService = require('../services/storageService').storageService;
      mockStorageService.saveTasks.mockImplementation(() => {
        throw new Error('Storage error');
      });

      renderApp();

      // Try to create a task
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form
      fireEvent.change(titleInput, { target: { value: 'Error Test Task' } });
      
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // App should not crash and should handle the error gracefully
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });

    it('handles network errors during data operations', async () => {
      // Mock services to simulate network errors
      const mockStorageService = require('../services/storageService').storageService;
      mockStorageService.getTasks.mockImplementation(() => {
        throw new Error('Network error');
      });

      renderApp();

      // App should load with empty state or error handling
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Workflow', () => {
    it('handles large number of tasks efficiently', async () => {
      renderApp();

      const titleInput = screen.getByPlaceholderText(/Intention/);
      const submitButton = screen.getByText(/Add Task/);

      // Create 10 tasks quickly
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        fireEvent.change(titleInput, { target: { value: `Task ${i + 1}` } });
        fireEvent.click(submitButton);
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      // Verify all tasks were created
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 10')).toBeInTheDocument();
      });

      // Performance should be reasonable (under 2 seconds for 10 tasks)
      expect(creationTime).toBeLessThan(2000);
    });

    it('handles rapid user interactions without breaking', async () => {
      renderApp();

      const titleInput = screen.getByPlaceholderText(/Intention/);
      const submitButton = screen.getByText(/Add Task/);

      // Rapidly create and interact with tasks
      for (let i = 0; i < 5; i++) {
        fireEvent.change(titleInput, { target: { value: `Rapid Task ${i + 1}` } });
        fireEvent.click(submitButton);
        
        // Rapidly change categories
        const mindButton = screen.getByText(/🧠 MIND/);
        const bodyButton = screen.getByText(/💪 BODY/);
        fireEvent.click(mindButton);
        fireEvent.click(bodyButton);
      }

      // App should remain functional
      await waitFor(() => {
        expect(screen.getByText('Rapid Task 1')).toBeInTheDocument();
        expect(screen.getByText('Rapid Task 5')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Workflow', () => {
    it('supports keyboard navigation throughout the app', async () => {
      renderApp();

      // Navigate to title input
      const titleInput = screen.getByPlaceholderText(/Intention/);
      titleInput.focus();

      // Type task title using keyboard
      fireEvent.change(titleInput, { target: { value: 'Keyboard Task' } });

      // Navigate to submit button using Tab
      const submitButton = screen.getByText(/Add Task/);
      submitButton.focus();

      // Submit using Enter key
      fireEvent.keyDown(submitButton, { key: 'Enter', code: 'Enter' });

      // Verify task was created
      await waitFor(() => {
        expect(screen.getByText('Keyboard Task')).toBeInTheDocument();
      });
    });

    it('provides proper ARIA labels and roles', async () => {
      renderApp();

      // Check for proper form role
      expect(screen.getByRole('form')).toBeInTheDocument();

      // Check for proper input labels
      const titleInput = screen.getByPlaceholderText(/Intention/);
      expect(titleInput).toBeInTheDocument();

      // Check for proper button labels
      const submitButton = screen.getByText(/Add Task/);
      expect(submitButton).toBeInTheDocument();
    });
  });
}); 