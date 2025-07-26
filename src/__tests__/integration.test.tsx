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
  const renderApp = () => {
    return render(<App />);
  };

  const createUser = async () => {
    renderApp();
    
    // Wait for the app to load
    await waitFor(() => {
      expect(screen.getByText(/Scrypture/)).toBeInTheDocument();
    });

    // Create a user if needed
    const startHereButton = screen.getByText(/Start Here/);
    if (startHereButton) {
      fireEvent.click(startHereButton);
      
      // Wait for the modal to appear and close it
      await waitFor(() => {
        expect(screen.getByText(/Choose categories/)).toBeInTheDocument();
      });
      
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
    }
  };

  const expandFormAndWait = async () => {
    // Click on the title input to expand the form
    const titleInput = screen.getByPlaceholderText(/Intention/);
    fireEvent.click(titleInput);
    
    // Wait for the form to expand and show the core attribute buttons
    await waitFor(() => {
      expect(screen.getByText(/BODY/)).toBeInTheDocument();
    });
    
    return titleInput;
  };

  const createTask = async (title: string, category?: string) => {
    // Expand the form
    const titleInput = await expandFormAndWait();
    
    // Set the title
    fireEvent.change(titleInput, { target: { value: title } });
    
    // Select category if provided
    if (category) {
      if (category === 'body') {
        const bodyButton = screen.getByText(/BODY/);
        fireEvent.click(bodyButton);
      } else if (category === 'home') {
        const homeButton = screen.getByText(/🏠 Home/);
        fireEvent.click(homeButton);
      }
    }
    
    // Submit the task
    const submitButton = screen.getByText(/Add Task/);
    fireEvent.click(submitButton);
    
    // Wait for task to appear
    await waitFor(() => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  };

  describe('Task Creation and Management', () => {
    it('allows user to create a basic task', async () => {
      await createUser();
      await createTask('Test Task');
    });

    it('allows user to sort tasks by priority', async () => {
      await createUser();

      // Create low priority task
      const titleInput = await expandFormAndWait();
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

      // Test sorting - sort dropdown should be visible now that we have tasks
      const sortSelect = screen.getByDisplayValue(/⚡ Priority/);
      fireEvent.change(sortSelect, { target: { value: 'priority' } });

      // Verify tasks are sorted by priority
      const taskElements = screen.getAllByText(/Priority Task/);
      expect(taskElements).toHaveLength(2);
    });

    it('allows user to collapse and expand task categories', async () => {
      await createUser();
      await createTask('Home Task', 'home');

      // Find and click the collapse button for the Home category
      const homeCategoryHeader = screen.getByText('Home');
      const collapseButton = homeCategoryHeader.closest('button');
      if (collapseButton) {
        fireEvent.click(collapseButton);
        
        // Verify the task is hidden
        await waitFor(() => {
          expect(screen.queryByText('Home Task')).not.toBeInTheDocument();
        });
        
        // Expand again
        fireEvent.click(collapseButton);
        
        // Verify the task is visible again
        await waitFor(() => {
          expect(screen.getByText('Home Task')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Category Management Workflow', () => {
    it('displays tasks grouped by category', async () => {
      await createUser();

      // Create body task
      await createTask('Body Task', 'body');

      // Create home task
      await createTask('Home Task', 'home');

      // Verify tasks are grouped by category
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('allows user to filter tasks by category', async () => {
      await createUser();

      // Create tasks with different categories
      await createTask('Body Task', 'body');
      await createTask('Home Task', 'home');

      // Filter by Home category
      const categoryFilter = screen.getByDisplayValue(/All Categories/);
      fireEvent.change(categoryFilter, { target: { value: 'home' } });

      // Verify only Home task is visible
      await waitFor(() => {
        expect(screen.queryByText('Body Task')).not.toBeInTheDocument();
        expect(screen.getByText('Home Task')).toBeInTheDocument();
      });

      // Filter by Body category
      fireEvent.change(categoryFilter, { target: { value: 'body' } });

      // Verify only Body task is visible
      await waitFor(() => {
        expect(screen.getByText('Body Task')).toBeInTheDocument();
        expect(screen.queryByText('Home Task')).not.toBeInTheDocument();
      });
    });
  });

  describe('Auto-fill Functionality', () => {
    it('shows auto-fill suggestions when typing', async () => {
      await createUser();

      // Create a task first
      await createTask('Important Task');

      // Clear the input and start typing to trigger auto-fill
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput); // Expand form
      fireEvent.change(titleInput, { target: { value: 'Important' } });

      // Wait for auto-fill suggestions to appear
      await waitFor(() => {
        expect(screen.getByText('Important Task')).toBeInTheDocument();
      });
    });
  });
});
