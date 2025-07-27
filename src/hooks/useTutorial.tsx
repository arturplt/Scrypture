import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tutorialService, TutorialState } from '../services/tutorialService';

interface TutorialContextType {
  tutorialState: TutorialState;
  isNewUser: boolean;
  shouldShowStep: (stepId: string) => boolean;
  markStepComplete: (stepId: string) => void;
  startTutorial: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void;
  getCurrentStep: () => string | null;
  getTutorialProgress: () => number;
  isTutorialCompleted: () => boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
  children: ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [tutorialState, setTutorialState] = useState<TutorialState>(
    tutorialService.getTutorialState()
  );
  const [isNewUser, setIsNewUser] = useState(false);

  // Load tutorial state and determine if user is new
  useEffect(() => {
    const state = tutorialService.getTutorialState();
    setTutorialState(state);
    
    // Check if this is a new user (no tutorial progress at all)
    const hasAnyProgress = Object.values(state.steps).some(step => step.completed);
    setIsNewUser(!hasAnyProgress && !state.completed);
  }, []);

  // Listen for tutorial completion events
  useEffect(() => {
    const handleTutorialCompleted = (event: CustomEvent) => {
      console.log('Tutorial completed!', event.detail);
      setTutorialState(tutorialService.getTutorialState());
    };

    window.addEventListener('tutorialCompleted', handleTutorialCompleted as EventListener);
    
    return () => {
      window.removeEventListener('tutorialCompleted', handleTutorialCompleted as EventListener);
    };
  }, []);

  const shouldShowStep = (stepId: string): boolean => {
    return tutorialService.shouldShowStep(stepId);
  };

  const markStepComplete = (stepId: string): void => {
    console.log(`Marking tutorial step complete: ${stepId}`);
    const success = tutorialService.markStepComplete(stepId);
    if (success) {
      setTutorialState(tutorialService.getTutorialState());
    }
  };

  const startTutorial = (): void => {
    console.log('Starting tutorial');
    tutorialService.startTutorial();
    setTutorialState(tutorialService.getTutorialState());
    setIsNewUser(false); // No longer a completely new user
  };

  const skipTutorial = (): void => {
    console.log('Skipping tutorial');
    tutorialService.skipTutorial();
    setTutorialState(tutorialService.getTutorialState());
    setIsNewUser(false);
  };

  const resetTutorial = (): void => {
    console.log('Resetting tutorial');
    tutorialService.resetTutorial();
    setTutorialState(tutorialService.getTutorialState());
    setIsNewUser(true);
  };

  const getCurrentStep = (): string | null => {
    return tutorialService.getCurrentStep();
  };

  const getTutorialProgress = (): number => {
    return tutorialService.getTutorialProgress();
  };

  const isTutorialCompleted = (): boolean => {
    return tutorialService.isTutorialCompleted();
  };

  const value: TutorialContextType = {
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
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}; 