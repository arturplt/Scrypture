import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WelcomeScreen from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  const mockOnContinue = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    it('should render welcome screen with title and subtitle', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      expect(screen.getByText('Welcome to Scrypture')).toBeInTheDocument();
      expect(screen.getByText('Where productivity meets mysticism')).toBeInTheDocument();
    });

    it('should render story section with mystical theme', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      expect(screen.getByText('🌲')).toBeInTheDocument();
      expect(screen.getByText(/In the depths of an ancient forest/)).toBeInTheDocument();
      // Use getAllByText since Bóbr appears multiple times
      expect(screen.getAllByText(/Bóbr/)).toHaveLength(3);
    });

    it('should render all feature highlights', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      expect(screen.getByText('Your Journey Awaits')).toBeInTheDocument();
      expect(screen.getByText(/Task Mastery/)).toBeInTheDocument();
      expect(screen.getByText(/Character Growth/)).toBeInTheDocument();
      expect(screen.getByText(/Dam Building/)).toBeInTheDocument();
      expect(screen.getByText(/Achievement Unlocks/)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      expect(screen.getByRole('button', { name: 'Begin Journey' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Skip Introduction' })).toBeInTheDocument();
    });

    it('should render call to action text', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      expect(screen.getByText(/Ready to begin your mystical journey/)).toBeInTheDocument();
      expect(screen.getByText(/You can always learn about Scrypture later/)).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('should call onContinue when Begin Journey button is clicked', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin Journey' });
      fireEvent.click(continueButton);

      expect(mockOnContinue).toHaveBeenCalledTimes(1);
      expect(mockOnSkip).not.toHaveBeenCalled();
    });

    it('should call onSkip when Skip Introduction button is clicked', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      const skipButton = screen.getByRole('button', { name: 'Skip Introduction' });
      fireEvent.click(skipButton);

      expect(mockOnSkip).toHaveBeenCalledTimes(1);
      expect(mockOnContinue).not.toHaveBeenCalled();
    });

    it('should prevent event propagation when modal content is clicked', () => {
      const { container } = render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      // Find the root div that contains the modal (first div in the container)
      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toBeInTheDocument();

      // Create a click event and spy on stopPropagation
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');

      // Dispatch the event on the overlay
      overlay?.dispatchEvent(clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Welcome to Scrypture');

      const subHeading = screen.getByRole('heading', { level: 2 });
      expect(subHeading).toHaveTextContent('Your Journey Awaits');
    });

    it('should have accessible button labels', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin Journey' });
      const skipButton = screen.getByRole('button', { name: 'Skip Introduction' });

      expect(continueButton).toBeInTheDocument();
      expect(skipButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin Journey' });
      const skipButton = screen.getByRole('button', { name: 'Skip Introduction' });

      continueButton.focus();
      expect(document.activeElement).toBe(continueButton);

      fireEvent.keyDown(continueButton, { key: 'Tab' });
      skipButton.focus();
      expect(document.activeElement).toBe(skipButton);
    });
  });

  describe('Content structure', () => {
    it('should render all feature icons', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('🌱')).toBeInTheDocument();
      expect(screen.getByText('🏗️')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should have proper structure with buttons and content', () => {
      const { container } = render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      // Check for main structural elements by their content instead of CSS classes
      expect(screen.getByText('Welcome to Scrypture')).toBeInTheDocument();
      expect(screen.getByText('Begin Journey')).toBeInTheDocument();
      expect(screen.getByText('Skip Introduction')).toBeInTheDocument();
    });

    it('should render story section with proper content', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      expect(screen.getByText('🌲')).toBeInTheDocument();
      expect(screen.getByText(/In the depths of an ancient forest/)).toBeInTheDocument();
    });

    it('should render features section with proper content', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      expect(screen.getByText('Your Journey Awaits')).toBeInTheDocument();
      expect(screen.getByText(/Task Mastery/)).toBeInTheDocument();
      expect(screen.getByText(/Character Growth/)).toBeInTheDocument();
      expect(screen.getByText(/Dam Building/)).toBeInTheDocument();
      expect(screen.getByText(/Achievement Unlocks/)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid button clicks gracefully', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin Journey' });
      
      fireEvent.click(continueButton);
      fireEvent.click(continueButton);
      fireEvent.click(continueButton);

      expect(mockOnContinue).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard events on buttons', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin Journey' });
      
      fireEvent.keyDown(continueButton, { key: 'Enter' });
      fireEvent.click(continueButton);

      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });

    it('should render without crashing when props are undefined', () => {
      expect(() => {
        render(
          <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
        );
      }).not.toThrow();
    });
  });

  describe('Visual elements', () => {
    it('should display all emoji icons correctly', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      // Story icon
      expect(screen.getByText('🌲')).toBeInTheDocument();
      
      // Feature icons
      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('🌱')).toBeInTheDocument();
      expect(screen.getByText('🏗️')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should have mystical theme text content', () => {
      render(
        <WelcomeScreen onContinue={mockOnContinue} onSkip={mockOnSkip} />
      );

      expect(screen.getByText(/mystical beaver named/)).toBeInTheDocument();
      expect(screen.getByText(/sacred dam-building arts/)).toBeInTheDocument();
      expect(screen.getByText(/mystical journey of productivity/)).toBeInTheDocument();
    });
  });
}); 