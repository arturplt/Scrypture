import { storageService } from './storageService';

export interface TutorialStep {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
}

export interface TutorialState {
  completed: boolean;
  currentStep: string | null;
  steps: { [stepId: string]: TutorialStep };
  completedAt?: Date;
}

const TUTORIAL_STORAGE_KEY = 'tutorial_state';

class TutorialService {
  private tutorialSteps: { [stepId: string]: TutorialStep } = {
    welcome: { 
      id: 'welcome', 
      title: 'Welcome to Scrypture', 
      completed: false, 
      required: true 
    },
    bobrIntroduction: { 
      id: 'bobrIntroduction', 
      title: 'Meet your companion Bóbr', 
      completed: false, 
      required: true 
    },
    damMetaphor: { 
      id: 'damMetaphor', 
      title: 'Learn about the dam building metaphor', 
      completed: false, 
      required: true 
    },
    firstTask: { 
      id: 'firstTask', 
      title: 'Create your first task', 
      completed: false, 
      required: true 
    },
    taskCompletion: { 
      id: 'taskCompletion', 
      title: 'Complete your first task', 
      completed: false, 
      required: true 
    },
    hatchlingEvolution: { 
      id: 'hatchlingEvolution', 
      title: 'See Bóbr grow with your progress', 
      completed: false, 
      required: true 
    },
    completion: { 
      id: 'completion', 
      title: 'Tutorial completed', 
      completed: false, 
      required: true 
    }
  };

  private currentState: TutorialState;

  constructor() {
    this.currentState = this.loadTutorialState();
  }

  /**
   * Get the current tutorial state
   */
  getTutorialState(): TutorialState {
    return { ...this.currentState };
  }

  /**
   * Check if the tutorial is completed
   */
  isTutorialCompleted(): boolean {
    return this.currentState.completed;
  }

  /**
   * Get the current step
   */
  getCurrentStep(): string | null {
    return this.currentState.currentStep;
  }

  /**
   * Get all tutorial steps
   */
  getTutorialSteps(): TutorialStep[] {
    return Object.values(this.currentState.steps);
  }

  /**
   * Get a specific tutorial step
   */
  getTutorialStep(stepId: string): TutorialStep | null {
    return this.currentState.steps[stepId] || null;
  }

  /**
   * Start the tutorial from the beginning
   */
  startTutorial(): void {
    // Start with the welcome step and mark it as completed
    this.currentState.currentStep = 'welcome';
    this.currentState.steps.welcome.completed = true;
    
    // Move to the next step
    this.currentState.currentStep = this.getNextStep('welcome');
    
    this.saveTutorialState();
  }

  /**
   * Mark a tutorial step as completed
   */
  markStepComplete(stepId: string): boolean {
    if (this.currentState.steps[stepId]) {
      this.currentState.steps[stepId].completed = true;
      
      // Move to next step if not completed
      if (!this.currentState.completed) {
        this.currentState.currentStep = this.getNextStep(stepId);
      }
      
      this.saveTutorialState();
      
      // Check if tutorial is now completed
      if (this.checkTutorialCompletion()) {
        this.completeTutorial();
      }
      
      return true;
    }
    return false;
  }

  /**
   * Get the next step in the tutorial sequence
   */
  private getNextStep(currentStepId: string): string | null {
    const stepOrder = [
      'welcome',
      'bobrIntroduction', 
      'damMetaphor',
      'firstTask',
      'taskCompletion',
      'hatchlingEvolution',
      'completion'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStepId);
    if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
      return stepOrder[currentIndex + 1];
    }
    
    return null;
  }

  /**
   * Check if all required tutorial steps are completed
   */
  private checkTutorialCompletion(): boolean {
    return Object.values(this.currentState.steps)
      .filter(step => step.required)
      .every(step => step.completed);
  }

  /**
   * Complete the tutorial
   */
  private completeTutorial(): void {
    this.currentState.completed = true;
    this.currentState.currentStep = null;
    this.currentState.completedAt = new Date();
    this.saveTutorialState();
    
    // Trigger completion celebration
    this.triggerTutorialCompletionEvent();
  }

  /**
   * Reset the tutorial (for testing or re-onboarding)
   */
  resetTutorial(): void {
    // Reset all steps to incomplete state
    Object.keys(this.currentState.steps).forEach(stepId => {
      this.currentState.steps[stepId].completed = false;
    });
    
    this.currentState = {
      completed: false,
      currentStep: null,
      steps: this.currentState.steps,
      completedAt: undefined
    };
    this.saveTutorialState();
  }

  /**
   * Reinitialize the tutorial service completely (for testing)
   */
  reinitialize(): void {
    // Reset to original template steps by creating fresh copies
    this.tutorialSteps = {
      welcome: { 
        id: 'welcome', 
        title: 'Welcome to Scrypture', 
        completed: false, 
        required: true 
      },
      bobrIntroduction: { 
        id: 'bobrIntroduction', 
        title: 'Meet your companion Bóbr', 
        completed: false, 
        required: true 
      },
      damMetaphor: { 
        id: 'damMetaphor', 
        title: 'Learn about the dam building metaphor', 
        completed: false, 
        required: true 
      },
      firstTask: { 
        id: 'firstTask', 
        title: 'Create your first task', 
        completed: false, 
        required: true 
      },
      taskCompletion: { 
        id: 'taskCompletion', 
        title: 'Complete your first task', 
        completed: false, 
        required: true 
      },
      hatchlingEvolution: { 
        id: 'hatchlingEvolution', 
        title: 'See Bóbr grow with your progress', 
        completed: false, 
        required: true 
      },
      completion: { 
        id: 'completion', 
        title: 'Tutorial completed', 
        completed: false, 
        required: true 
      }
    };
    
    this.currentState = {
      completed: false,
      currentStep: null,
      steps: { ...this.tutorialSteps },
      completedAt: undefined
    };
    
    // Don't save to storage during reinitialization for tests
  }

  /**
   * Get tutorial progress percentage
   */
  getTutorialProgress(): number {
    const totalSteps = Object.values(this.currentState.steps).filter(step => step.required).length;
    const completedSteps = Object.values(this.currentState.steps)
      .filter(step => step.required && step.completed).length;
    
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }

  /**
   * Check if a specific step should be shown now
   */
  shouldShowStep(stepId: string): boolean {
    const result = this.currentState.currentStep === stepId && 
           !this.currentState.steps[stepId]?.completed;
    return result;
  }

  /**
   * Skip the tutorial entirely
   */
  skipTutorial(): void {
    // Mark all steps as completed
    Object.keys(this.currentState.steps).forEach(stepId => {
      this.currentState.steps[stepId].completed = true;
    });
    
    this.completeTutorial();
  }

  /**
   * Load tutorial state from storage
   */
  private loadTutorialState(): TutorialState {
    const saved = storageService.getGenericItem<TutorialState>(TUTORIAL_STORAGE_KEY);
    
    if (saved) {
      // Ensure all current tutorial steps are included (for backwards compatibility)
      const mergedSteps = { ...this.tutorialSteps };
      if (saved.steps) {
        Object.keys(saved.steps).forEach(stepId => {
          if (mergedSteps[stepId]) {
            mergedSteps[stepId] = { ...mergedSteps[stepId], ...saved.steps[stepId] };
          }
        });
      }
      
      return {
        completed: saved.completed || false,
        currentStep: saved.currentStep || null,
        steps: mergedSteps,
        completedAt: saved.completedAt ? new Date(saved.completedAt) : undefined
      };
    }

    // Default state for new users
    return {
      completed: false,
      currentStep: null,
      steps: { ...this.tutorialSteps },
      completedAt: undefined
    };
  }

  /**
   * Save tutorial state to storage
   */
  private saveTutorialState(): void {
    storageService.setGenericItem(TUTORIAL_STORAGE_KEY, this.currentState);
  }

  /**
   * Trigger tutorial completion event for other parts of the app to listen to
   */
  private triggerTutorialCompletionEvent(): void {
    // Dispatch custom event for tutorial completion
    const event = new CustomEvent('tutorialCompleted', {
      detail: {
        completedAt: this.currentState.completedAt,
        progress: this.getTutorialProgress()
      }
    });
    window.dispatchEvent(event);
  }
}

// Export singleton instance
export const tutorialService = new TutorialService(); 