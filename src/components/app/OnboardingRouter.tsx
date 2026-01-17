import { useEffect } from 'react';
import { User } from '../../types';
import { UserCreation } from '../UserCreation';
import BobrIntroduction from '../BobrIntroduction';
import { FirstTaskWizard } from '../FirstTaskWizard';
import WelcomeScreen from '../WelcomeScreen';

type OnboardingRouterProps = {
  user: User | null;
  shouldShowStep: (stepId: string) => boolean;
  markStepComplete: (stepId: string) => void;
  startTutorial: () => void;
  skipTutorial: () => void;
  onTutorialSkipReset: () => void;
};

export function OnboardingRouter({
  user,
  shouldShowStep,
  markStepComplete,
  startTutorial,
  skipTutorial,
  onTutorialSkipReset,
}: OnboardingRouterProps) {
  useEffect(() => {
    if (shouldShowStep('taskCompletion')) {
      markStepComplete('taskCompletion');
      markStepComplete('hatchlingEvolution');
      markStepComplete('completion');
    }
  }, [markStepComplete, shouldShowStep]);

  useEffect(() => {
    if (shouldShowStep('hatchlingEvolution')) {
      markStepComplete('hatchlingEvolution');
      markStepComplete('completion');
    }
  }, [markStepComplete, shouldShowStep]);

  // Show user creation if no user exists
  if (!user) {
    return (
      <UserCreation
        onUserCreated={() => {
          startTutorial();
        }}
      />
    );
  }

  // Show welcome screen for new users
  if (shouldShowStep('welcome')) {
    return (
      <WelcomeScreen
        onContinue={() => {
          markStepComplete('welcome');
        }}
        onSkip={() => {
          skipTutorial();
          onTutorialSkipReset();
        }}
      />
    );
  }

  // Show onboarding flow for new users
  if (shouldShowStep('bobrIntroduction')) {
    return (
      <BobrIntroduction
        user={user}
        onContinue={() => {
          markStepComplete('bobrIntroduction');
          // Mark dam metaphor as complete since it's covered in the intro
          markStepComplete('damMetaphor');
        }}
        onSkip={() => {
          skipTutorial();
          onTutorialSkipReset();
        }}
      />
    );
  }

  // Show first task wizard
  if (shouldShowStep('firstTask')) {
    return (
      <FirstTaskWizard
        onComplete={() => {
          // The wizard handles marking the step complete internally
        }}
        onSkip={() => {
          skipTutorial();
          onTutorialSkipReset();
        }}
      />
    );
  }

  return null;
}
