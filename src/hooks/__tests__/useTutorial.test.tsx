import React from 'react';
import { render, act, waitFor, screen } from '@testing-library/react';
import { useTutorial, TutorialProvider } from '../useTutorial';
import { tutorialService } from '../../services/tutorialService';

// Mock the tutorial service
jest.mock('../../services/tutorialService', () => ({
  tutorialService: {
    getTutorialState: jest.fn(),
    shouldShowStep: jest.fn(),
    markStepComplete: jest.fn(),
    startTutorial: jest.fn(),
    skipTutorial: jest.fn(),
    resetTutorial: jest.fn(),
    getCurrentStep: jest.fn(),
    getTutorialProgress: jest.fn(),
    isTutorialCompleted: jest.fn(),
  },
}));

const mockTutorialService = tutorialService as jest.Mocked<typeof tutorialService>;

// Test component to access the hook
const TestComponent = () => {
  const {
    tutorialState,
    isNewUser,
    shouldShowStep,
    markStepComplete,
    startTutorial,
    skipTutorial,
    resetTutorial,
    getCurrentStep,
    getTutorialProgress,
    isTutorialCompleted,
  } = useTutorial();

  return (
    <div>
      <div data-testid="tutorial-completed">{tutorialState.completed.toString()}</div>
      <div data-testid="is-new-user">{isNewUser.toString()}</div>
      <div data-testid="current-step">{tutorialState.currentStep || 'none'}</div>
      <button onClick={() => shouldShowStep('welcome')} data-testid="should-show-step">
        Should Show Step
      </button>
      <button onClick={() => markStepComplete('welcome')} data-testid="mark-complete">
        Mark Complete
      </button>
      <button onClick={startTutorial} data-testid="start-tutorial">
        Start Tutorial
      </button>
      <button onClick={skipTutorial} data-testid="skip-tutorial">
        Skip Tutorial
      </button>
      <button onClick={resetTutorial} data-testid="reset-tutorial">
        Reset Tutorial
      </button>
      <button onClick={getCurrentStep} data-testid="get-current-step">
        Get Current Step
      </button>
      <button onClick={getTutorialProgress} data-testid="get-progress">
        Get Progress
      </button>
      <button onClick={isTutorialCompleted} data-testid="is-completed">
        Is Completed
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TutorialProvider>
      {component}
    </TutorialProvider>
  );
};

describe('useTutorial', () => {
  const mockTutorialState = {
    completed: false,
    currentStep: 'welcome',
    steps: {
      welcome: { id: 'welcome', title: 'Welcome', completed: false, required: true },
      firstTask: { id: 'firstTask', title: 'First Task', completed: false, required: true },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTutorialService.getTutorialState.mockReturnValue(mockTutorialState);
    mockTutorialService.shouldShowStep.mockReturnValue(true);
    mockTutorialService.markStepComplete.mockReturnValue(true);
    mockTutorialService.getCurrentStep.mockReturnValue('welcome');
    mockTutorialService.getTutorialProgress.mockReturnValue(25);
    mockTutorialService.isTutorialCompleted.mockReturnValue(false);
  });

  it('should throw error when used outside of TutorialProvider', () => {
    const TestComponentWithoutProvider = () => {
      useTutorial();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponentWithoutProvider />)).toThrow(
      'useTutorial must be used within a TutorialProvider'
    );
    
    consoleSpy.mockRestore();
  });

  it('should provide initial tutorial state', () => {
    renderWithProvider(<TestComponent />);
    
    expect(screen.getByTestId('tutorial-completed')).toHaveTextContent('false');
    expect(screen.getByTestId('current-step')).toHaveTextContent('welcome');
    expect(mockTutorialService.getTutorialState).toHaveBeenCalled();
  });

  it('should identify new user correctly', () => {
    // Mock state with no completed steps
    const newUserState = {
      ...mockTutorialState,
      steps: {
        welcome: { id: 'welcome', title: 'Welcome', completed: false, required: true },
        firstTask: { id: 'firstTask', title: 'First Task', completed: false, required: true },
      },
    };
    mockTutorialService.getTutorialState.mockReturnValue(newUserState);

    renderWithProvider(<TestComponent />);
    
    expect(screen.getByTestId('is-new-user')).toHaveTextContent('true');
  });

  it('should identify existing user correctly', () => {
    // Mock state with some completed steps
    const existingUserState = {
      ...mockTutorialState,
      steps: {
        welcome: { id: 'welcome', title: 'Welcome', completed: true, required: true },
        firstTask: { id: 'firstTask', title: 'First Task', completed: false, required: true },
      },
    };
    mockTutorialService.getTutorialState.mockReturnValue(existingUserState);

    renderWithProvider(<TestComponent />);
    
    expect(screen.getByTestId('is-new-user')).toHaveTextContent('false');
  });

  it('should handle shouldShowStep', () => {
    renderWithProvider(<TestComponent />);
    
    act(() => {
      screen.getByTestId('should-show-step').click();
    });

    expect(mockTutorialService.shouldShowStep).toHaveBeenCalledWith('welcome');
  });

  it('should handle markStepComplete and update state', async () => {
    const updatedState = {
      ...mockTutorialState,
      steps: {
        ...mockTutorialState.steps,
        welcome: { ...mockTutorialState.steps.welcome, completed: true },
      },
    };

    mockTutorialService.getTutorialState
      .mockReturnValueOnce(mockTutorialState)
      .mockReturnValueOnce(updatedState);

    renderWithProvider(<TestComponent />);
    
    act(() => {
      screen.getByTestId('mark-complete').click();
    });

    expect(mockTutorialService.markStepComplete).toHaveBeenCalledWith('welcome');
    await waitFor(() => {
      expect(mockTutorialService.getTutorialState).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle startTutorial', () => {
    renderWithProvider(<TestComponent />);
    
    act(() => {
      screen.getByTestId('start-tutorial').click();
    });

    expect(mockTutorialService.startTutorial).toHaveBeenCalled();
    expect(mockTutorialService.getTutorialState).toHaveBeenCalled();
  });

  it('should handle skipTutorial', () => {
    renderWithProvider(<TestComponent />);
    
    act(() => {
      screen.getByTestId('skip-tutorial').click();
    });

    expect(mockTutorialService.skipTutorial).toHaveBeenCalled();
    expect(mockTutorialService.getTutorialState).toHaveBeenCalled();
  });

  it('should handle resetTutorial', () => {
    renderWithProvider(<TestComponent />);
    
    act(() => {
      screen.getByTestId('reset-tutorial').click();
    });

    expect(mockTutorialService.resetTutorial).toHaveBeenCalled();
    expect(mockTutorialService.getTutorialState).toHaveBeenCalled();
  });

  it('should handle getCurrentStep', () => {
    renderWithProvider(<TestComponent />);
    
    act(() => {
      screen.getByTestId('get-current-step').click();
    });

    expect(mockTutorialService.getCurrentStep).toHaveBeenCalled();
  });

  it('should handle getTutorialProgress', () => {
    renderWithProvider(<TestComponent />);
    
    act(() => {
      screen.getByTestId('get-progress').click();
    });

    expect(mockTutorialService.getTutorialProgress).toHaveBeenCalled();
  });

  it('should handle isTutorialCompleted', () => {
    renderWithProvider(<TestComponent />);
    
    act(() => {
      screen.getByTestId('is-completed').click();
    });

    expect(mockTutorialService.isTutorialCompleted).toHaveBeenCalled();
  });

  it('should listen for tutorial completion events', async () => {
    const completedState = { ...mockTutorialState, completed: true };
    mockTutorialService.getTutorialState
      .mockReturnValueOnce(mockTutorialState)
      .mockReturnValueOnce(completedState);

    renderWithProvider(<TestComponent />);

    // Simulate tutorial completion event
    act(() => {
      const event = new CustomEvent('tutorialCompleted', { 
        detail: { message: 'Tutorial completed!' } 
      });
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(mockTutorialService.getTutorialState).toHaveBeenCalledTimes(2);
    });
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderWithProvider(<TestComponent />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'tutorialCompleted',
      expect.any(Function)
    );
    
    removeEventListenerSpy.mockRestore();
  });

  it('should not update state if markStepComplete fails', () => {
    mockTutorialService.markStepComplete.mockReturnValue(false);
    
    renderWithProvider(<TestComponent />);
    
    act(() => {
      screen.getByTestId('mark-complete').click();
    });

    expect(mockTutorialService.markStepComplete).toHaveBeenCalledWith('welcome');
    // getTutorialState should only be called once during initialization
    expect(mockTutorialService.getTutorialState).toHaveBeenCalledTimes(1);
  });
}); 