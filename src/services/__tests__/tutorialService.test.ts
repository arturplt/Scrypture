import { tutorialService } from '../tutorialService';
import { storageService } from '../storageService';

// Mock the storage service
jest.mock('../storageService', () => ({
  storageService: {
    getGenericItem: jest.fn(() => null), // Return null by default for clean state
    setGenericItem: jest.fn(),
  },
}));

const mockStorageService = storageService as jest.Mocked<typeof storageService>;

describe('tutorialService', () => {
  beforeEach(() => {
    // Clear any mocked localStorage
    jest.clearAllMocks();
    
    // Ensure getGenericItem returns null for fresh state by default
    mockStorageService.getGenericItem.mockReturnValue(null);
    
    // Completely reinitialize tutorial service for each test
    tutorialService.reinitialize();
    
    // Mock window.dispatchEvent
    Object.defineProperty(window, 'dispatchEvent', {
      writable: true,
      value: jest.fn(),
    });
  });

  describe('getTutorialState', () => {
    it('should return the current tutorial state', () => {
      const state = tutorialService.getTutorialState();
      
      expect(state).toHaveProperty('completed', false);
      expect(state).toHaveProperty('currentStep', null);
      expect(state).toHaveProperty('steps');
      expect(state.steps).toHaveProperty('welcome');
      expect(state.steps).toHaveProperty('bobrIntroduction');
      expect(state.steps).toHaveProperty('firstTask');
    });

    it('should return a copy of the state, not the original', () => {
      const state1 = tutorialService.getTutorialState();
      const state2 = tutorialService.getTutorialState();
      
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('isTutorialCompleted', () => {
    it('should return false for new tutorial', () => {
      expect(tutorialService.isTutorialCompleted()).toBe(false);
    });

    it('should return true when tutorial is completed', () => {
      tutorialService.skipTutorial();
      expect(tutorialService.isTutorialCompleted()).toBe(true);
    });
  });

  describe('getCurrentStep', () => {
    it('should return null for new tutorial', () => {
      expect(tutorialService.getCurrentStep()).toBe(null);
    });

    it('should return current step after starting tutorial', () => {
      tutorialService.startTutorial();
      expect(tutorialService.getCurrentStep()).toBe('bobrIntroduction');
    });
  });

  describe('getTutorialSteps', () => {
    it('should return all tutorial steps', () => {
      const steps = tutorialService.getTutorialSteps();
      
      expect(steps).toHaveLength(7);
      expect(steps.find(s => s.id === 'welcome')).toBeDefined();
      expect(steps.find(s => s.id === 'bobrIntroduction')).toBeDefined();
      expect(steps.find(s => s.id === 'firstTask')).toBeDefined();
      expect(steps.find(s => s.id === 'completion')).toBeDefined();
    });
  });

  describe('getTutorialStep', () => {
    it('should return specific step when it exists', () => {
      const step = tutorialService.getTutorialStep('welcome');
      
      expect(step).toEqual({
        id: 'welcome',
        title: 'Welcome to Scrypture',
        completed: false,
        required: true,
      });
    });

    it('should return null for non-existent step', () => {
      const step = tutorialService.getTutorialStep('nonexistent');
      expect(step).toBe(null);
    });
  });

  describe('startTutorial', () => {
    it('should mark welcome step as complete and move to next step', () => {
      tutorialService.startTutorial();
      
      const state = tutorialService.getTutorialState();
      expect(state.steps.welcome.completed).toBe(true);
      expect(state.currentStep).toBe('bobrIntroduction');
    });

    it('should save state when starting tutorial', () => {
      tutorialService.startTutorial();
      expect(mockStorageService.setGenericItem).toHaveBeenCalled();
    });
  });

  describe('markStepComplete', () => {
    beforeEach(() => {
      tutorialService.startTutorial();
    });

    it('should mark step as completed and move to next step', () => {
      const result = tutorialService.markStepComplete('bobrIntroduction');
      
      expect(result).toBe(true);
      const state = tutorialService.getTutorialState();
      expect(state.steps.bobrIntroduction.completed).toBe(true);
      expect(state.currentStep).toBe('damMetaphor');
    });

    it('should return false for non-existent step', () => {
      const result = tutorialService.markStepComplete('nonexistent');
      expect(result).toBe(false);
    });

    it('should complete tutorial when all required steps are done', () => {
      // Complete all steps except the last one
      tutorialService.markStepComplete('bobrIntroduction');
      tutorialService.markStepComplete('damMetaphor');
      tutorialService.markStepComplete('firstTask');
      tutorialService.markStepComplete('taskCompletion');
      tutorialService.markStepComplete('hatchlingEvolution');
      
      // Complete the final step
      tutorialService.markStepComplete('completion');
      
      const state = tutorialService.getTutorialState();
      expect(state.completed).toBe(true);
      expect(state.currentStep).toBe(null);
      expect(state.completedAt).toBeInstanceOf(Date);
    });

    it('should trigger completion event when tutorial is completed', () => {
      // Complete all steps
      const steps = ['bobrIntroduction', 'damMetaphor', 'firstTask', 'taskCompletion', 'hatchlingEvolution', 'completion'];
      steps.forEach(step => tutorialService.markStepComplete(step));
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tutorialCompleted',
          detail: expect.objectContaining({
            completedAt: expect.any(Date),
            progress: 100,
          }),
        })
      );
    });
  });

  describe('getTutorialProgress', () => {
    it('should return 0 for new tutorial', () => {
      expect(tutorialService.getTutorialProgress()).toBe(0);
    });

    it('should calculate progress correctly', () => {
      tutorialService.startTutorial(); // Completes welcome step
      expect(tutorialService.getTutorialProgress()).toBe(14); // 1/7 steps = ~14%
      
      tutorialService.markStepComplete('bobrIntroduction');
      expect(tutorialService.getTutorialProgress()).toBe(29); // 2/7 steps = ~29%
    });

    it('should return 100 when tutorial is completed', () => {
      tutorialService.skipTutorial();
      expect(tutorialService.getTutorialProgress()).toBe(100);
    });
  });

  describe('shouldShowStep', () => {
    it('should return false for new tutorial', () => {
      expect(tutorialService.shouldShowStep('welcome')).toBe(false);
    });

    it('should return true for current step that is not completed', () => {
      tutorialService.startTutorial();
      expect(tutorialService.shouldShowStep('bobrIntroduction')).toBe(true);
    });

    it('should return false for completed step', () => {
      tutorialService.startTutorial();
      tutorialService.markStepComplete('bobrIntroduction');
      expect(tutorialService.shouldShowStep('bobrIntroduction')).toBe(false);
    });

    it('should return false for step that is not current', () => {
      tutorialService.startTutorial();
      expect(tutorialService.shouldShowStep('firstTask')).toBe(false);
    });
  });

  describe('skipTutorial', () => {
    it('should mark all steps as completed', () => {
      tutorialService.skipTutorial();
      
      const state = tutorialService.getTutorialState();
      const allCompleted = Object.values(state.steps).every(step => step.completed);
      expect(allCompleted).toBe(true);
    });

    it('should complete the tutorial', () => {
      tutorialService.skipTutorial();
      
      const state = tutorialService.getTutorialState();
      expect(state.completed).toBe(true);
      expect(state.currentStep).toBe(null);
      expect(state.completedAt).toBeInstanceOf(Date);
    });

    it('should trigger completion event', () => {
      tutorialService.skipTutorial();
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tutorialCompleted',
        })
      );
    });
  });

  describe('resetTutorial', () => {
    it('should reset tutorial to initial state', () => {
      // First complete some steps
      tutorialService.startTutorial();
      tutorialService.markStepComplete('bobrIntroduction');
      
      // Then reset
      tutorialService.resetTutorial();
      
      const state = tutorialService.getTutorialState();
      expect(state.completed).toBe(false);
      expect(state.currentStep).toBe(null);
      expect(state.completedAt).toBeUndefined();
      
      const allIncomplete = Object.values(state.steps).every(step => !step.completed);
      expect(allIncomplete).toBe(true);
    });

    it('should save reset state', () => {
      tutorialService.resetTutorial();
      expect(mockStorageService.setGenericItem).toHaveBeenCalled();
    });
  });

  describe('storage integration', () => {
    it('should load saved state from storage', () => {
      const savedState = {
        completed: false,
        currentStep: 'firstTask',
        steps: {
          welcome: { id: 'welcome', title: 'Welcome', completed: true, required: true },
          bobrIntroduction: { id: 'bobrIntroduction', title: 'Bobr Intro', completed: true, required: true },
          firstTask: { id: 'firstTask', title: 'First Task', completed: false, required: true },
        },
      };
      
      mockStorageService.getGenericItem.mockReturnValue(savedState);
      
      // Create new service instance to trigger loading
      const newService = new (tutorialService.constructor as any)();
      const state = newService.getTutorialState();
      
      expect(state.currentStep).toBe('firstTask');
      expect(state.steps.welcome.completed).toBe(true);
      expect(state.steps.bobrIntroduction.completed).toBe(true);
    });

    it('should handle missing storage gracefully', () => {
      mockStorageService.getGenericItem.mockReturnValue(null);
      
      // Create new service instance
      const newService = new (tutorialService.constructor as any)();
      const state = newService.getTutorialState();
      
      expect(state.completed).toBe(false);
      expect(state.currentStep).toBe(null);
      expect(Object.keys(state.steps)).toHaveLength(7);
    });

    it('should merge new tutorial steps with saved state for backwards compatibility', () => {
      const savedState = {
        completed: false,
        currentStep: 'welcome',
        steps: {
          welcome: { id: 'welcome', title: 'Welcome', completed: false, required: true },
          // Missing newer steps
        },
      };
      
      mockStorageService.getGenericItem.mockReturnValue(savedState);
      
      const newService = new (tutorialService.constructor as any)();
      const state = newService.getTutorialState();
      
      // Should have all current tutorial steps
      expect(Object.keys(state.steps)).toHaveLength(7);
      expect(state.steps.bobrIntroduction).toBeDefined();
      expect(state.steps.completion).toBeDefined();
    });
  });

  describe('step progression', () => {
    it('should follow correct step order', () => {
      const expectedOrder = [
        'welcome',
        'bobrIntroduction', 
        'damMetaphor',
        'firstTask',
        'taskCompletion',
        'hatchlingEvolution',
        'completion'
      ];
      
      tutorialService.startTutorial();
      expect(tutorialService.getCurrentStep()).toBe('bobrIntroduction');
      
      for (let i = 1; i < expectedOrder.length - 1; i++) {
        tutorialService.markStepComplete(expectedOrder[i]);
        expect(tutorialService.getCurrentStep()).toBe(expectedOrder[i + 1]);
      }
    });

    it('should set currentStep to null after completing final step', () => {
      tutorialService.startTutorial();
      
      const steps = ['bobrIntroduction', 'damMetaphor', 'firstTask', 'taskCompletion', 'hatchlingEvolution', 'completion'];
      steps.forEach(step => tutorialService.markStepComplete(step));
      
      expect(tutorialService.getCurrentStep()).toBe(null);
    });
  });
}); 