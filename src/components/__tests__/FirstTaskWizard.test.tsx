import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FirstTaskWizard } from '../FirstTaskWizard';
import { useTasks } from '../../hooks/useTasks';
import { tutorialService } from '../../services/tutorialService';

// Mock the hooks and services
jest.mock('../../hooks/useTasks', () => ({
  useTasks: jest.fn(),
}));

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
      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    it('should show navigation buttons', () => {
      renderWizard();
      
      expect(screen.getByText('Skip Tutorial')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should show step indicator', () => {
      renderWizard();
      
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should advance to next step when Next is clicked', () => {
      renderWizard();
      
      fireEvent.click(screen.getByText('Next'));
      
      expect(screen.getByText('What do you want to accomplish?')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    });

    it('should go back to previous step when Back is clicked', () => {
      renderWizard();
      
      // Go to step 2
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
      
      // Go back to step 1
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
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
      fireEvent.click(screen.getByText('Next')); // Go to title step
    });

    it('should render task title input', () => {
      expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g., Read for 30 minutes/)).toBeInTheDocument();
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
      expect(screen.getByText('Good task examples:')).toBeInTheDocument();
      expect(screen.getByText('"Read one chapter of my book"')).toBeInTheDocument();
    });
  });

  describe('Category selection step', () => {
    beforeEach(() => {
      renderWizard();
      fireEvent.click(screen.getByText('Next')); // Go to title step
      
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getByText('Next')); // Go to category step
    });

    it('should render category options', () => {
      expect(screen.getByText('What type of task is this?')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
    });

    it('should select category when clicked', () => {
      const workButton = screen.getByText('Work');
      fireEvent.click(workButton);
      
      // Check if the work category button appears selected
      expect(workButton.closest('button')).toHaveClass('selected');
    });

    it('should have personal category selected by default', () => {
      const personalButton = screen.getByText('Personal');
      expect(personalButton.closest('button')).toHaveClass('selected');
    });
  });

  describe('Description step', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate to description step
      fireEvent.click(screen.getByText('Next')); // title step
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getByText('Next')); // category step
      fireEvent.click(screen.getByText('Next')); // description step
    });

    it('should render description textarea', () => {
      expect(screen.getByText('Add more details (optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Task Description')).toBeInTheDocument();
    });

    it('should update description when textarea changes', () => {
      const textarea = screen.getByLabelText('Task Description');
      
      fireEvent.change(textarea, { target: { value: 'This is my test task description' } });
      
      expect(textarea).toHaveValue('This is my test task description');
    });

    it('should allow skipping description', () => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Rewards step', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate to rewards step
      fireEvent.click(screen.getByText('Next')); // title step
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getByText('Next')); // category step
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('Next')); // rewards step
    });

    it('should render stat reward sliders', () => {
      expect(screen.getByText('Choose your rewards')).toBeInTheDocument();
      expect(screen.getByText('💪 Body')).toBeInTheDocument();
      expect(screen.getByText('🧠 Mind')).toBeInTheDocument();
      expect(screen.getByText('✨ Soul')).toBeInTheDocument();
    });

    it('should update reward values when sliders change', () => {
      const bodySlider = screen.getByLabelText('Body reward');
      
      fireEvent.change(bodySlider, { target: { value: '3' } });
      
      expect(bodySlider).toHaveValue('3');
    });

    it('should show total points', () => {
      expect(screen.getByText(/Total Points:/)).toBeInTheDocument();
    });
  });

  describe('Task creation', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate through all steps
      fireEvent.click(screen.getByText('Next')); // title step
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'My test task' } });
      fireEvent.click(screen.getByText('Next')); // category step
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('Next')); // rewards step
    });

    it('should show Create Task button on final step', () => {
      expect(screen.getByText('Create My First Task!')).toBeInTheDocument();
    });

    it('should create task when Create Task is clicked', async () => {
      mockAddTask.mockReturnValue({
        id: 'test-task-id',
        title: 'My test task',
        description: '',
        completed: false,
        categories: ['personal'],
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      fireEvent.click(screen.getByText('Create My First Task!'));

      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith({
          title: 'My test task',
          description: '',
          completed: false,
          categories: ['personal'],
          priority: 'medium',
          statRewards: {
            body: 0,
            mind: 0,
            soul: 0,
            xp: 0,
          },
        });
      });
    });

    it('should mark tutorial step complete after task creation', async () => {
      mockAddTask.mockReturnValue({
        id: 'test-task-id',
        title: 'My test task',
        description: '',
        completed: false,
        categories: ['personal'],
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      fireEvent.click(screen.getByText('Create My First Task!'));

      await waitFor(() => {
        expect(mockTutorialService.markStepComplete).toHaveBeenCalledWith('firstTask');
      });
    });

    it('should call onComplete after successful task creation', async () => {
      mockAddTask.mockReturnValue({
        id: 'test-task-id',
        title: 'My test task',
        description: '',
        completed: false,
        categories: ['personal'],
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      fireEvent.click(screen.getByText('Create My First Task!'));

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('should show loading state during task creation', () => {
      fireEvent.click(screen.getByText('Create My First Task!'));
      
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should not allow advancing from title step without a title', () => {
      renderWizard();
      fireEvent.click(screen.getByText('Next')); // Go to title step
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('should trim whitespace from task title', async () => {
      renderWizard();
      fireEvent.click(screen.getByText('Next')); // title step
      
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: '  My task  ' } });
      
      // Navigate to final step
      fireEvent.click(screen.getByText('Next')); // category step
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('Next')); // rewards step
      
      mockAddTask.mockReturnValue({
        id: 'test-task-id',
        title: 'My task',
        description: '',
        completed: false,
        categories: ['personal'],
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      fireEvent.click(screen.getByText('Create My First Task!'));

      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'My task', // Should be trimmed
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
      
      const nextButton = screen.getByText('Next');
      nextButton.focus();
      expect(document.activeElement).toBe(nextButton);
    });

    it('should auto-focus task title input when reaching that step', () => {
      renderWizard();
      fireEvent.click(screen.getByText('Next')); // Go to title step
      
      const input = screen.getByLabelText('Task Title');
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Progress indicator', () => {
        it('should show correct step numbers', () => {
      renderWizard();

      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();
    });

    it('should show progress bar', () => {
      renderWizard();
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '6');
    });
  });
}); 