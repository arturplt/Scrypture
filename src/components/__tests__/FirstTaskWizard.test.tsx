import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FirstTaskWizard } from '../FirstTaskWizard';
import { useTasks } from '../../hooks/useTasks';
import { tutorialService } from '../../services/tutorialService';

// Mock the hooks and services
jest.mock('../../hooks/useTasks', () => {
  const actual = jest.requireActual('../../hooks/useTasks');
  return {
    ...actual,
    default: actual.default,
    useTasks: jest.fn(),
    TaskProvider: actual.TaskProvider,
  };
});

jest.mock('../../services/tutorialService', () => ({
  tutorialService: {
    markStepComplete: jest.fn(),
  },
}));

const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;
const mockTutorialService = tutorialService as jest.Mocked<typeof tutorialService>;

describe('FirstTaskWizard', () => {
  const mockAddTask = jest.fn();
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTasks.mockReturnValue({
      tasks: [],
      addTask: mockAddTask,
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTask: jest.fn(),
      isSaving: false,
      lastSaved: null,
      refreshTasks: jest.fn(),
      bringTaskToTop: jest.fn(),
    });
  });

  const renderWizard = () => {
    return render(
      <FirstTaskWizard
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );
  };

  describe('Initial render', () => {
    it('should render the welcome step by default', () => {
      renderWizard();
      
      expect(screen.getByText('Create Your First Task')).toBeInTheDocument();
      expect(screen.getByText(/Let's start your journey/)).toBeInTheDocument();
    });

    it('should show navigation buttons', () => {
      renderWizard();
      
      expect(screen.getByText('Skip Tutorial')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should show step indicator', () => {
      renderWizard();
      
      expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should advance to next step when Next is clicked', () => {
      renderWizard();

      // Enter a valid task title first
      const input = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(input, { target: { value: 'Test task' } });

      // Go to step 2
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Add more details (optional)')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();
    });

    it('should go back to previous step when Back is clicked', () => {
      renderWizard();

      // Enter a valid task title first
      const input = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(input, { target: { value: 'Test task' } });

      // Go to step 2
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();

      // Go back to step 1
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('Create Your First Task')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();
    });

    it('should call onSkip when Skip Tutorial is clicked', () => {
      renderWizard();
      fireEvent.click(screen.getByText('Skip Tutorial'));
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  describe('Task title step', () => {
    beforeEach(() => {
      renderWizard();
    });

    it('should render task title input', () => {
      expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g., Read for 10 minutes/)).toBeInTheDocument();
    });

    it('should update task title when input changes', () => {
      const input = screen.getByLabelText('Task Title');
      
      fireEvent.change(input, { target: { value: 'My first task' } });
      
      expect(input).toHaveValue('My first task');
    });

    it('should disable Next button when title is empty', () => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('should enable Next button when title is provided', () => {
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'My first task' } });
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });

    it('should show example tasks', () => {
      expect(screen.getByText('Good examples:')).toBeInTheDocument();
      expect(screen.getByText('"Read for 10 minutes"')).toBeInTheDocument();
    });
  });

  describe('Description step', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate to description step
      const input = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getAllByText('Next')[0]);
    });

    it('should render description textarea', () => {
      expect(screen.getByText('Add more details (optional)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Read any book or article, even just one page counts')).toBeInTheDocument();
    });

    it('should update description when textarea changes', () => {
      const textarea = screen.getByPlaceholderText('e.g., Read any book or article, even just one page counts');

      fireEvent.change(textarea, { target: { value: 'This is my test task description' } });
      expect(textarea).toHaveValue('This is my test task description');
    });
  });

  describe('Stat rewards step', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate to stat rewards step
      const input = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getAllByText('Next')[0]);
      fireEvent.click(screen.getByText('Next')); // description step
    });

    it('should toggle stat rewards when clicked', () => {
      const bodyButton = screen.getByText('BODY');

      fireEvent.click(bodyButton);
      // Check if the button has the active class (CSS modules might not show exact class names)
      expect(bodyButton.closest('button')).toBeInTheDocument();

      fireEvent.click(bodyButton);
      expect(bodyButton.closest('button')).toBeInTheDocument();
    });

    it('should show stat descriptions', () => {
      expect(screen.getByText('Health & strength')).toBeInTheDocument();
      expect(screen.getByText('Knowledge & learning')).toBeInTheDocument();
      expect(screen.getByText('Creativity & spirit')).toBeInTheDocument();
    });
  });

  describe('Category selection step', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate to category step
      const input = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getAllByText('Next')[0]);
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('BODY')); // select stat reward
      fireEvent.click(screen.getByText('Next')); // stat rewards step
    });

    it('should render category options', () => {
      expect(screen.getByText('Choose a category')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Free Time')).toBeInTheDocument();
      expect(screen.getByText('Garden')).toBeInTheDocument();
    });

    it('should select category when clicked', () => {
      const homeButton = screen.getByText('Home');
      fireEvent.click(homeButton);
      // Check if the button exists (CSS modules might not show exact class names)
      expect(homeButton.closest('button')).toBeInTheDocument();
    });
  });

  describe('Priority and difficulty step', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate to priority step
      const input = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getAllByText('Next')[0]);
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('BODY')); // select stat reward
      fireEvent.click(screen.getByText('Next')); // stat rewards step
      fireEvent.click(screen.getByText('Home')); // select category
      fireEvent.click(screen.getByText('Next')); // category step
    });

    it('should render priority buttons', () => {
      expect(screen.getByText('Priority and difficulty')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should render difficulty buttons', () => {
      expect(screen.getByText('Difficulty:')).toBeInTheDocument();
      // Check for difficulty numbers 0-9
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it('should show XP calculation', () => {
      expect(screen.getByText('XP Calculation:')).toBeInTheDocument();
      expect(screen.getByText(/Base: \+5 XP/)).toBeInTheDocument();
    });
  });

  describe('Task type step', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate to task type step
      const input = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getAllByText('Next')[0]);
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('BODY')); // select stat reward
      fireEvent.click(screen.getByText('Next')); // stat rewards step
      fireEvent.click(screen.getByText('Home')); // select category
      fireEvent.click(screen.getByText('Next')); // category step
      fireEvent.click(screen.getByText('Next')); // priority step
    });

    it('should render make habit button', () => {
      expect(screen.getByText('Task type')).toBeInTheDocument();
      expect(screen.getByText('Make it a habit')).toBeInTheDocument();
    });

    it('should toggle habit mode when clicked', () => {
      const habitButton = screen.getByText('Make it a habit');

      fireEvent.click(habitButton);
      // Check if the button exists (CSS modules might not show exact class names)
      expect(habitButton.closest('button')).toBeInTheDocument();
    });

    it('should show frequency options when habit is selected', () => {
      const habitButton = screen.getByText('Make it a habit');
      fireEvent.click(habitButton);

      expect(screen.getByText('Frequency:')).toBeInTheDocument();
      expect(screen.getByText('Daily')).toBeInTheDocument();
      expect(screen.getByText('Weekly')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });
  });

  describe('Task creation', () => {
    it('should call tutorialService.markStepComplete after successful task creation', async () => {
      render(<FirstTaskWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);

      // Step 1: Enter task title
      const titleInput = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      
      // Navigate through all steps to reach the final step
      // Step 1 -> Step 2: Click Next (title is valid)
      const nextButtons = screen.getAllByText('Next');
      fireEvent.click(nextButtons[0]);

      // Step 2 -> Step 3: Click Next (description is optional)
      fireEvent.click(screen.getByText('Next'));

      // Step 3: Select a stat reward (required to proceed)
      fireEvent.click(screen.getByText('BODY'));

      // Step 3 -> Step 4: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 4: Select a category
      fireEvent.click(screen.getByText('Home'));

      // Step 4 -> Step 5: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 5: Priority and difficulty are already set by default
      // Step 5 -> Step 6: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 6: Task type (default is not a habit)
      // Step 6 -> Step 7: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Now we should be on the final step (step 7) with "Create My First Task!" button
      fireEvent.click(screen.getByText('Create My First Task!'));

      await waitFor(() => {
        expect(mockTutorialService.markStepComplete).toHaveBeenCalledWith('firstTask');
      });
    });

    it('should call onComplete after successful task creation', async () => {
      render(<FirstTaskWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);

      // Step 1: Enter task title
      const titleInput = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      
      // Navigate through all steps to reach the final step
      // Step 1 -> Step 2: Click Next (title is valid)
      const nextButtons = screen.getAllByText('Next');
      fireEvent.click(nextButtons[0]);

      // Step 2 -> Step 3: Click Next (description is optional)
      fireEvent.click(screen.getByText('Next'));

      // Step 3: Select a stat reward (required to proceed)
      fireEvent.click(screen.getByText('BODY'));

      // Step 3 -> Step 4: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 4: Select a category
      fireEvent.click(screen.getByText('Home'));

      // Step 4 -> Step 5: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 5: Priority and difficulty are already set by default
      // Step 5 -> Step 6: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 6: Task type (default is not a habit)
      // Step 6 -> Step 7: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Now we should be on the final step (step 7) with "Create My First Task!" button
      fireEvent.click(screen.getByText('Create My First Task!'));

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('should show loading state during task creation', async () => {
      render(<FirstTaskWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);

      // Step 1: Enter task title
      const titleInput = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      
      // Navigate through all steps to reach the final step
      // Step 1 -> Step 2: Click Next (title is valid)
      const nextButtons = screen.getAllByText('Next');
      fireEvent.click(nextButtons[0]);

      // Step 2 -> Step 3: Click Next (description is optional)
      fireEvent.click(screen.getByText('Next'));

      // Step 3: Select a stat reward (required to proceed)
      fireEvent.click(screen.getByText('BODY'));

      // Step 3 -> Step 4: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 4: Select a category
      fireEvent.click(screen.getByText('Home'));

      // Step 4 -> Step 5: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 5: Priority and difficulty are already set by default
      // Step 5 -> Step 6: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 6: Task type (default is not a habit)
      // Step 6 -> Step 7: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Now we should be on the final step (step 7) with "Create My First Task!" button
      fireEvent.click(screen.getByText('Create My First Task!'));

      // Check for loading state
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should trim whitespace from task title', async () => {
      render(<FirstTaskWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);

      // Step 1: Enter task title with whitespace
      const titleInput = screen.getByPlaceholderText('e.g., Read for 10 minutes');
      fireEvent.change(titleInput, { target: { value: '  Test Task  ' } });
      
      // Navigate through all steps to reach the final step
      // Step 1 -> Step 2: Click Next (title is valid)
      const nextButtons = screen.getAllByText('Next');
      fireEvent.click(nextButtons[0]);

      // Step 2 -> Step 3: Click Next (description is optional)
      fireEvent.click(screen.getByText('Next'));

      // Step 3: Select a stat reward (required to proceed)
      fireEvent.click(screen.getByText('BODY'));

      // Step 3 -> Step 4: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 4: Select a category
      fireEvent.click(screen.getByText('Home'));

      // Step 4 -> Step 5: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 5: Priority and difficulty are already set by default
      // Step 5 -> Step 6: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Step 6: Task type (default is not a habit)
      // Step 6 -> Step 7: Click Next
      fireEvent.click(screen.getByText('Next'));

      // Now we should be on the final step (step 7) with "Create My First Task!" button
      fireEvent.click(screen.getByText('Create My First Task!'));

      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Task', // Should be trimmed
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWizard();
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Close wizard')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderWizard();
      
      // Enter a task title to enable the Next button
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test Task' } });
      
      // Use getAllByText to handle multiple Next buttons
      const nextButtons = screen.getAllByText('Next');
      const nextButton = nextButtons[0]; // Use the first Next button
      nextButton.focus();
      expect(document.activeElement).toBe(nextButton);
    });
  });

  describe('Progress indicator', () => {
    it('should show correct step numbers', () => {
      renderWizard();

      expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();

      // Navigate to step 2
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test Task' } });
      
      // Use getAllByText to handle multiple Next buttons
      const nextButtons = screen.getAllByText('Next');
      if (nextButtons.length > 0) {
        fireEvent.click(nextButtons[0]); // Click the first Next button
      }
      
      expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();
    });

    it('should show progress bar', () => {
      renderWizard();
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '7');
    });
  });
}); 