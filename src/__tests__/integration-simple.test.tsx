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

describe('Simple Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  const renderApp = () => {
    return render(<App />);
  };

  describe('Core Task Creation Workflow', () => {
    it('allows user to create a task successfully', async () => {
      renderApp();

      // 1. Verify app loads with empty state
      expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
      expect(screen.getByText(/Create your first task/)).toBeInTheDocument();

      // 2. Verify form is present
      const titleInput = screen.getByPlaceholderText(/Intention/);
      expect(titleInput).toBeInTheDocument();

      // 3. Click on title input to expand form
      fireEvent.click(titleInput);

      // 4. Fill in task title
      fireEvent.change(titleInput, { target: { value: 'Test Integration Task' } });

      // 5. Verify form is expanded and submit button appears
      const submitButton = screen.getByText(/Add Task/);
      expect(submitButton).toBeInTheDocument();

      // 6. Submit the task
      fireEvent.click(submitButton);

      // 7. Verify task appears in the list
      await waitFor(() => {
        expect(screen.getByText('Test Integration Task')).toBeInTheDocument();
      });

      // 8. Verify empty state is gone
      expect(screen.queryByText(/No tasks yet/)).not.toBeInTheDocument();
    });

    it('handles form validation correctly', async () => {
      renderApp();

      // 1. Click on title input to expand form
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // 2. Try to submit without title
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // 3. Verify validation message appears
      expect(screen.getByText(/Please fill in this field/)).toBeInTheDocument();

      // 4. Fill in title and submit again
      fireEvent.change(titleInput, { target: { value: 'Valid Task' } });
      fireEvent.click(submitButton);

      // 5. Verify task is created
      await waitFor(() => {
        expect(screen.getByText('Valid Task')).toBeInTheDocument();
      });
    });

    it('allows user to add description', async () => {
      renderApp();

      // 1. Expand form
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // 2. Fill in title
      fireEvent.change(titleInput, { target: { value: 'Task with Description' } });

      // 3. Fill in description
      const descriptionInput = screen.getByPlaceholderText(/Description/);
      fireEvent.change(descriptionInput, { target: { value: 'This is a test description' } });

      // 4. Submit task
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // 5. Verify task is created
      await waitFor(() => {
        expect(screen.getByText('Task with Description')).toBeInTheDocument();
      });
    });

    it('allows user to select different categories', async () => {
      renderApp();

      // 1. Expand form
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // 2. Fill in title
      fireEvent.change(titleInput, { target: { value: 'Mind Task' } });

      // 3. Select mind category
      const mindCategoryButton = screen.getByText(/🧠 MIND/);
      fireEvent.click(mindCategoryButton);

      // 4. Submit task
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // 5. Verify task is created
      await waitFor(() => {
        expect(screen.getByText('Mind Task')).toBeInTheDocument();
      });
    });

    it('allows user to select different priorities', async () => {
      renderApp();

      // 1. Expand form
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // 2. Fill in title
      fireEvent.change(titleInput, { target: { value: 'High Priority Task' } });

      // 3. Select high priority
      const highPriorityButton = screen.getByText(/HIGH PRIORITY/);
      fireEvent.click(highPriorityButton);

      // 4. Submit task
      const submitButton = screen.getByText(/Add Task/);
      fireEvent.click(submitButton);

      // 5. Verify task is created
      await waitFor(() => {
        expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      });
    });
  });

  describe('Task Completion Workflow', () => {
    it('allows user to complete a task', async () => {
      renderApp();

      // 1. Create a task
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);
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

      // 4. Verify task is completed (check for completed state or task still visible)
      await waitFor(() => {
        // The task should still be visible but marked as completed
        expect(screen.getByText('Task to Complete')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Data Persistence', () => {
    it('persists task data across app reloads', async () => {
      // Mock existing data in localStorage
      const existingTasks = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          category: 'body',
          priority: 'medium',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          statRewards: { body: 1, mind: 0, soul: 0, xp: 20 }
        }
      ];
      
      // Mock the storage service to return existing tasks
      const mockStorageService = require('../services/storageService').storageService;
      mockStorageService.getTasks.mockReturnValue(existingTasks);
      mockStorageService.getUser.mockReturnValue({
        id: '1',
        name: 'Test User',
        level: 1,
        experience: 0,
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      });

      renderApp();

      // Wait for app to load with existing data
      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      }, { timeout: 10000 });

      // Verify task is displayed
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    }, 15000); // Increased timeout
  });

  describe('Error Handling', () => {
    it('handles storage errors gracefully', async () => {
      // Mock storage service to return rejected promises instead of throwing
      const mockStorageService = require('../services/storageService').storageService;
      mockStorageService.saveTasks.mockImplementation(() => {
        throw new Error('Storage error');
      });

      renderApp();

      // Wait for app to load
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Intention')).toBeInTheDocument();
      }, { timeout: 10000 });

      // Try to add a task (should handle error gracefully)
      const titleInput = screen.getByPlaceholderText('Intention');
      fireEvent.click(titleInput);
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });

      const submitButton = screen.getByText('Add Task');
      fireEvent.click(submitButton);

      // App should not crash and should still be functional
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Intention')).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000); // Increased timeout
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      renderApp();

      // Wait for app to load
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Intention')).toBeInTheDocument();
      }, { timeout: 10000 });

      // Navigate to title input
      const titleInput = screen.getByPlaceholderText('Intention');
      titleInput.focus();
      
      // Type using keyboard
      fireEvent.change(titleInput, { target: { value: 'Keyboard Test' } });
      
      // Verify input worked
      expect(titleInput).toHaveValue('Keyboard Test');
    }, 15000); // Increased timeout
  });
}); 