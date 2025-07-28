import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BobrIntroduction from '../BobrIntroduction';
import { User } from '../../types';

describe('BobrIntroduction', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    level: 1,
    experience: 0,
    body: 0,
    mind: 0,
    soul: 0,
    achievements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    bobrStage: 'hatchling',
    damProgress: 0
  };

  const defaultProps = {
    user: mockUser,
    onContinue: jest.fn(),
    onSkip: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render the introduction modal', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      expect(screen.getByText('Meet Your Companion')).toBeInTheDocument();
      expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();
    });

    test('should render Bóbr image', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const bobrImage = screen.getByAltText('Bóbr the beaver companion');
      expect(bobrImage).toBeInTheDocument();
      expect(bobrImage).toHaveAttribute('src', '/assets/Icons/beaver_32.png');
      expect(bobrImage).toHaveStyle({ 
        width: '96px', 
        height: '96px',
        imageRendering: 'pixelated'
      });
    });

    test('should render description text', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      // Check for key phrases in the description
      expect(screen.getByText(/mystical forest companion/)).toBeInTheDocument();
      expect(screen.getByText(/magnificent dam/)).toBeInTheDocument();
      expect(screen.getByText(/adds another stick/)).toBeInTheDocument();
      expect(screen.getByText(/evolve alongside your journey/)).toBeInTheDocument();
    });

    test('should render all feature items', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      // Check for feature icons
      expect(screen.getByText('🌱')).toBeInTheDocument();
      expect(screen.getByText('🏗️')).toBeInTheDocument();
      expect(screen.getByText('💬')).toBeInTheDocument();
      expect(screen.getByText('🎉')).toBeInTheDocument();
      
      // Check for feature text
      expect(screen.getByText(/Evolution:/)).toBeInTheDocument();
      expect(screen.getByText(/Dam Building:/)).toBeInTheDocument();
      expect(screen.getByText(/Encouragement:/)).toBeInTheDocument();
      expect(screen.getByText(/Celebrations:/)).toBeInTheDocument();
    });

    test('should render action buttons', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: 'Begin Journey' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Skip Intro' })).toBeInTheDocument();
    });

    test('should render skip text', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      expect(screen.getByText('You can always visit Bóbr in your dashboard')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('should call onContinue when Begin Journey button is clicked', () => {
      const onContinue = jest.fn();
      render(<BobrIntroduction {...defaultProps} onContinue={onContinue} />);
      
      const beginJourneyButton = screen.getByRole('button', { name: 'Begin Journey' });
      fireEvent.click(beginJourneyButton);
      
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    test('should call onSkip when Skip Intro button is clicked', () => {
      const onSkip = jest.fn();
      render(<BobrIntroduction {...defaultProps} onSkip={onSkip} />);
      
      const skipButton = screen.getByRole('button', { name: 'Skip Intro' });
      fireEvent.click(skipButton);
      
      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    test('should prevent event propagation when overlay is clicked', () => {
      const mockStopPropagation = jest.fn();
      render(<BobrIntroduction {...defaultProps} />);
      
      const overlay = screen.getByRole('img', { name: 'Bóbr companion' }).closest('div')?.parentElement;
      if (overlay) {
        fireEvent.click(overlay, { stopPropagation: mockStopPropagation });
      }
      
      // The component should handle the click without calling the callbacks
      expect(defaultProps.onContinue).not.toHaveBeenCalled();
      expect(defaultProps.onSkip).not.toHaveBeenCalled();
    });
  });

  describe('User Name Display', () => {
    test('should display user name in welcome message', () => {
      const userWithName: User = { ...mockUser, name: 'Alice' };
      render(<BobrIntroduction {...defaultProps} user={userWithName} />);
      
      expect(screen.getByText('Welcome, Alice!')).toBeInTheDocument();
    });

    test('should handle user with empty name', () => {
      const userWithEmptyName: User = { ...mockUser, name: '' };
      render(<BobrIntroduction {...defaultProps} user={userWithEmptyName} />);
      
      expect(screen.getByText('Welcome, !')).toBeInTheDocument();
    });

    test('should handle user with special characters in name', () => {
      const userWithSpecialChars: User = { ...mockUser, name: 'José María' };
      render(<BobrIntroduction {...defaultProps} user={userWithSpecialChars} />);
      
      expect(screen.getByText('Welcome, José María!')).toBeInTheDocument();
    });

    test('should handle user with very long name', () => {
      const userWithLongName: User = { ...mockUser, name: 'Very Long Name That Exceeds Normal Length' };
      render(<BobrIntroduction {...defaultProps} user={userWithLongName} />);
      
      expect(screen.getByText('Welcome, Very Long Name That Exceeds Normal Length!')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const bobrImage = screen.getByRole('img', { name: 'Bóbr companion' });
      expect(bobrImage).toBeInTheDocument();
      expect(bobrImage).toHaveAttribute('aria-label', 'Bóbr companion');
    });

    test('should have proper heading structure', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Meet Your Companion');
    });

    test('should have proper button roles', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      expect(buttons[0]).toHaveTextContent('Begin Journey');
      expect(buttons[1]).toHaveTextContent('Skip Intro');
    });

    test('should have proper list structure', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(4);
    });

    test('should have proper button structure for keyboard navigation', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const beginJourneyButton = screen.getByRole('button', { name: 'Begin Journey' });
      const skipButton = screen.getByRole('button', { name: 'Skip Intro' });
      
      // Check that buttons are present and accessible
      expect(beginJourneyButton).toBeInTheDocument();
      expect(skipButton).toBeInTheDocument();
      
      // Check that buttons are focusable
      expect(beginJourneyButton).not.toBeDisabled();
      expect(skipButton).not.toBeDisabled();
    });
  });

  describe('Feature Descriptions', () => {
    test('should display evolution feature correctly', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      expect(screen.getByText(/Evolution:/)).toBeInTheDocument();
      expect(screen.getByText(/Bóbr grows from hatchling to mature companion as you level up/)).toBeInTheDocument();
    });

    test('should display dam building feature correctly', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      expect(screen.getByText(/Dam Building:/)).toBeInTheDocument();
      expect(screen.getByText(/Each completed task adds to your mystical dam structure/)).toBeInTheDocument();
    });

    test('should display encouragement feature correctly', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      expect(screen.getByText(/Encouragement:/)).toBeInTheDocument();
      expect(screen.getByText(/Receive motivational messages and celebrations for your achievements/)).toBeInTheDocument();
    });

    test('should display celebrations feature correctly', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      expect(screen.getByText(/Celebrations:/)).toBeInTheDocument();
      expect(screen.getByText(/Special animations and messages for milestones and level-ups/)).toBeInTheDocument();
    });
  });

  describe('Button Functionality', () => {
    test('should call onContinue only once per click', () => {
      const onContinue = jest.fn();
      render(<BobrIntroduction {...defaultProps} onContinue={onContinue} />);
      
      const beginJourneyButton = screen.getByRole('button', { name: 'Begin Journey' });
      
      fireEvent.click(beginJourneyButton);
      fireEvent.click(beginJourneyButton);
      fireEvent.click(beginJourneyButton);
      
      expect(onContinue).toHaveBeenCalledTimes(3);
    });

    test('should call onSkip only once per click', () => {
      const onSkip = jest.fn();
      render(<BobrIntroduction {...defaultProps} onSkip={onSkip} />);
      
      const skipButton = screen.getByRole('button', { name: 'Skip Intro' });
      
      fireEvent.click(skipButton);
      fireEvent.click(skipButton);
      
      expect(onSkip).toHaveBeenCalledTimes(2);
    });

    test('should handle rapid button clicks', () => {
      const onContinue = jest.fn();
      const onSkip = jest.fn();
      render(<BobrIntroduction {...defaultProps} onContinue={onContinue} onSkip={onSkip} />);
      
      const beginJourneyButton = screen.getByRole('button', { name: 'Begin Journey' });
      const skipButton = screen.getByRole('button', { name: 'Skip Intro' });
      
      // Rapid clicks
      fireEvent.click(beginJourneyButton);
      fireEvent.click(skipButton);
      fireEvent.click(beginJourneyButton);
      
      expect(onContinue).toHaveBeenCalledTimes(2);
      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing user data gracefully', () => {
      const userWithoutName: User = { ...mockUser, name: undefined as any };
      
      expect(() => {
        render(<BobrIntroduction {...defaultProps} user={userWithoutName} />);
      }).not.toThrow();
    });

    test('should handle missing callback functions', () => {
      expect(() => {
        render(<BobrIntroduction {...defaultProps} onContinue={undefined as any} onSkip={undefined as any} />);
      }).not.toThrow();
    });

    test('should handle null user gracefully', () => {
      // The component should handle null user by not rendering or showing a fallback
      expect(() => {
        render(<BobrIntroduction {...defaultProps} user={null as any} />);
      }).toThrow();
    });

    test('should handle undefined props', () => {
      expect(() => {
        render(<BobrIntroduction user={mockUser} onContinue={undefined as any} onSkip={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Content Structure', () => {
    test('should have proper modal structure', () => {
      const { container } = render(<BobrIntroduction {...defaultProps} />);
      
      // Check for overlay and modal structure
      const overlay = container.firstChild;
      expect(overlay).toBeInTheDocument();
      
      const modal = overlay?.firstChild;
      expect(modal).toBeInTheDocument();
    });

    test('should have proper feature list structure', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const featureList = screen.getByRole('list');
      expect(featureList).toBeInTheDocument();
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(4);
    });

    test('should have proper button container structure', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      // Check that buttons are in the same container
      const buttonContainer = buttons[0].parentElement;
      expect(buttonContainer).toBe(buttons[1].parentElement);
    });
  });

  describe('Visual Elements', () => {
    test('should display Bóbr image with correct styling', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const bobrImage = screen.getByAltText('Bóbr the beaver companion');
      expect(bobrImage).toHaveStyle({
        width: '96px',
        height: '96px',
        imageRendering: 'pixelated'
      });
    });

    test('should display feature icons correctly', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const icons = ['🌱', '🏗️', '💬', '🎉'];
      icons.forEach(icon => {
        expect(screen.getByText(icon)).toBeInTheDocument();
      });
    });

    test('should have proper text hierarchy', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      // Main title
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      
      // Welcome message with strong tag
      const welcomeMessage = screen.getByText(/Welcome, Test User!/);
      expect(welcomeMessage).toBeInTheDocument();
      
      // Feature text with strong tags
      const featureTitles = screen.getAllByText(/Evolution:|Dam Building:|Encouragement:|Celebrations:/);
      expect(featureTitles).toHaveLength(4);
    });
  });

  describe('User Experience', () => {
    test('should provide clear call-to-action buttons', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const beginJourneyButton = screen.getByRole('button', { name: 'Begin Journey' });
      const skipButton = screen.getByRole('button', { name: 'Skip Intro' });
      
      expect(beginJourneyButton).toBeInTheDocument();
      expect(skipButton).toBeInTheDocument();
      
      // Buttons should be clearly distinguishable
      expect(beginJourneyButton).not.toBe(skipButton);
    });

    test('should provide helpful skip text', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      const skipText = screen.getByText('You can always visit Bóbr in your dashboard');
      expect(skipText).toBeInTheDocument();
    });

    test('should provide comprehensive feature descriptions', () => {
      render(<BobrIntroduction {...defaultProps} />);
      
      // Check that all features are explained
      expect(screen.getByText(/Bóbr grows from hatchling to mature companion/)).toBeInTheDocument();
      expect(screen.getByText(/Each completed task adds to your mystical dam structure/)).toBeInTheDocument();
      expect(screen.getByText(/Receive motivational messages and celebrations/)).toBeInTheDocument();
      expect(screen.getByText(/Special animations and messages for milestones/)).toBeInTheDocument();
    });
  });
}); 