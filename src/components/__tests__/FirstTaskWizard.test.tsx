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
      
      fireEvent.click(screen.getByText('Next'));
      
      expect(screen.getByText('Add more details (optional)')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();
    });

    it('should go back to previous step when Back is clicked', () => {
      renderWizard();
      
      // Go to step 2
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();
      
      // Go back to step 1
      fireEvent.click(screen.getByText('Back'));
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
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getByText('Next'));
    });

    it('should render description textarea', () => {
      expect(screen.getByText('Add more details (optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
    });

    it('should update description when textarea changes', () => {
      const textarea = screen.getByLabelText('Description (optional)');
      
      fireEvent.change(textarea, { target: { value: 'This is my test task description' } });
      
      expect(textarea).toHaveValue('This is my test task description');
    });

    it('should allow skipping description', () => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Stat rewards step', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate to stat rewards step
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('Next')); // stat rewards step
    });

    it('should render stat reward buttons', () => {
      expect(screen.getByText('Choose stat rewards')).toBeInTheDocument();
      expect(screen.getByText('BODY')).toBeInTheDocument();
      expect(screen.getByText('MIND')).toBeInTheDocument();
      expect(screen.getByText('SOUL')).toBeInTheDocument();
    });

    it('should toggle stat rewards when clicked', () => {
      const bodyButton = screen.getByText('BODY');
      
      fireEvent.click(bodyButton);
      expect(bodyButton.closest('button')).toHaveClass('statButtonActive');
      
      fireEvent.click(bodyButton);
      expect(bodyButton.closest('button')).not.toHaveClass('statButtonActive');
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
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('Next')); // stat rewards step
      fireEvent.click(screen.getByText('Next')); // category step
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
      
      expect(homeButton.closest('button')).toHaveClass('selected');
    });
  });

  describe('Priority and difficulty step', () => {
    beforeEach(() => {
      renderWizard();
      // Navigate to priority step
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('Next')); // stat rewards step
      fireEvent.click(screen.getByText('Next')); // category step
      fireEvent.click(screen.getByText('Next')); // priority step
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
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'Test task' } });
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('Next')); // stat rewards step
      fireEvent.click(screen.getByText('Next')); // category step
      fireEvent.click(screen.getByText('Next')); // priority step
      fireEvent.click(screen.getByText('Next')); // task type step
    });

    it('should render make habit button', () => {
      expect(screen.getByText('Task type')).toBeInTheDocument();
      expect(screen.getByText('Make it a habit')).toBeInTheDocument();
    });

    it('should toggle habit mode when clicked', () => {
      const habitButton = screen.getByText('Make it a habit');
      
      fireEvent.click(habitButton);
      expect(habitButton.closest('button')).toHaveClass('makeHabitButtonActive');
      
      fireEvent.click(habitButton);
      expect(habitButton.closest('button')).not.toHaveClass('makeHabitButtonActive');
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
    beforeEach(() => {
      renderWizard();
      // Navigate through all steps
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: 'My test task' } });
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('Next')); // stat rewards step
      fireEvent.click(screen.getByText('Next')); // category step
      fireEvent.click(screen.getByText('Next')); // priority step
      fireEvent.click(screen.getByText('Next')); // task type step
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
        difficulty: 2,
        isHabit: false,
        habitFrequency: undefined,
        statRewards: { xp: 17 },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      fireEvent.click(screen.getByText('Create My First Task!'));

      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith({
          title: 'My test task',
          categories: ['personal', ''], // selectedCategory is empty by default
          description: '',
          priority: 'medium',
          difficulty: 2,
          completed: false,
          isHabit: false,
          habitFrequency: undefined,
          statRewards: { xp: 17 },
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
        difficulty: 2,
        isHabit: false,
        habitFrequency: undefined,
        statRewards: { xp: 17 },
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
        difficulty: 2,
        isHabit: false,
        habitFrequency: undefined,
        statRewards: { xp: 17 },
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
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('should trim whitespace from task title', async () => {
      renderWizard();
      
      const input = screen.getByLabelText('Task Title');
      fireEvent.change(input, { target: { value: '  My task  ' } });
      
      // Navigate to final step
      fireEvent.click(screen.getByText('Next')); // description step
      fireEvent.click(screen.getByText('Next')); // stat rewards step
      fireEvent.click(screen.getByText('Next')); // category step
      fireEvent.click(screen.getByText('Next')); // priority step
      fireEvent.click(screen.getByText('Next')); // task type step
      
      mockAddTask.mockReturnValue({
        id: 'test-task-id',
        title: 'My task',
        description: '',
        completed: false,
        categories: ['personal'],
        priority: 'medium',
        difficulty: 2,
        isHabit: false,
        habitFrequency: undefined,
        statRewards: { xp: 17 },
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
  });

  describe('Progress indicator', () => {
    it('should show correct step numbers', () => {
      renderWizard();

      expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Next'));
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