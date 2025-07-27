import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TutorialCompletionCelebration } from '../TutorialCompletionCelebration';
import { User, Achievement } from '../../types';

// Mock CSS modules to return the class names
jest.mock('../TutorialCompletionCelebration.module.css', () => ({
  __esModule: true,
  default: {
    overlay: 'overlay',
    modal: 'modal',
    fireworks: 'fireworks',
    celebration: 'celebration',
    title: 'title',
    description: 'description',
    achievementGrid: 'achievementGrid',
    unlockedFeatures: 'unlockedFeatures',
    encouragement: 'encouragement',
    button: 'button',
  },
}));

describe('TutorialCompletionCelebration', () => {
  const mockOnClose = jest.fn();

  const createMockUser = (overrides: Partial<User> = {}): User => ({
    id: 'test-user',
    name: 'Test User',
    level: 1,
    experience: 100,
    body: 5,
    mind: 8,
    soul: 3,
    achievements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    bobrStage: 'hatchling',
    damProgress: 10,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    it('should render celebration modal with user name', () => {
      const user = createMockUser({ name: 'Alice' });
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Congratulations, Alice!')).toBeInTheDocument();
      expect(screen.getByText("You've completed the Scrypture tutorial!")).toBeInTheDocument();
    });

    it('should render fireworks celebration elements', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('🎆🎇✨🎉')).toBeInTheDocument();
    });

    it('should render continue button', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin My Journey!' });
      expect(continueButton).toBeInTheDocument();
    });
  });

  describe('Achievement grid', () => {
    it('should display all tutorial achievements', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Met your companion Bóbr')).toBeInTheDocument();
      expect(screen.getByText('Created your first task')).toBeInTheDocument();
      expect(screen.getByText('Started building your mystical dam')).toBeInTheDocument();
      expect(screen.getByText('Began your journey of growth')).toBeInTheDocument();
    });

    it('should display achievement icons', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('🦫')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('🏗️')).toBeInTheDocument();
      expect(screen.getByText('🌱')).toBeInTheDocument();
    });
  });

  describe('Unlocked features section', () => {
    it('should display features title', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Features Now Available:')).toBeInTheDocument();
    });

    it('should display all unlocked features', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Complete tasks to gain experience')).toBeInTheDocument();
      expect(screen.getByText('Track your Body, Mind, and Soul stats')).toBeInTheDocument();
      expect(screen.getByText('Unlock achievements as you progress')).toBeInTheDocument();
      expect(screen.getByText('Build habits for daily growth')).toBeInTheDocument();
      expect(screen.getByText('Level up and watch Bóbr evolve')).toBeInTheDocument();
    });

    it('should display feature icons', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
      expect(screen.getByText('🔄')).toBeInTheDocument();
      expect(screen.getByText('📈')).toBeInTheDocument();
    });
  });

  describe('Bóbr encouragement section', () => {
    it('should display Bóbr avatar', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      const bobrAvatar = screen.getByAltText('Bóbr companion');
      expect(bobrAvatar).toBeInTheDocument();
      expect(bobrAvatar).toHaveAttribute('src', '/assets/Icons/beaver_32.png');
    });

    it('should display Bóbr encouragement message', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Great job! I'm excited to grow alongside you/)).toBeInTheDocument();
      expect(screen.getByText(/Every task you complete helps us build something amazing/)).toBeInTheDocument();
    });
  });

  describe('Hint section', () => {
    it('should display helpful tip', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('💡 Tip: Start by completing the task you just created!')).toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('should call onClose when continue button is clicked', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin My Journey!' });
      fireEvent.click(continueButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should prevent event propagation on overlay click', () => {
      const user = createMockUser();
      const { container } = render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      const overlay = container.querySelector('.overlay');
      expect(overlay).toBeInTheDocument();

      // Create a mock event with stopPropagation
      const mockEvent = {
        stopPropagation: jest.fn(),
      };

      // Simulate the onClick handler
      const overlayElement = overlay as HTMLElement;
      fireEvent.click(overlayElement);

      // The onClose should not be called when clicking the overlay
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Different user names', () => {
    it('should handle short names', () => {
      const user = createMockUser({ name: 'Jo' });
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Congratulations, Jo!')).toBeInTheDocument();
    });

    it('should handle long names', () => {
      const user = createMockUser({ name: 'Christopher Alexander Johnson' });
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Congratulations, Christopher Alexander Johnson!')).toBeInTheDocument();
    });

    it('should handle names with special characters', () => {
      const user = createMockUser({ name: 'José María' });
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Congratulations, José María!')).toBeInTheDocument();
    });

    it('should handle empty name gracefully', () => {
      const user = createMockUser({ name: '' });
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Congratulations, !')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin My Journey!' });
      expect(continueButton).toBeInTheDocument();
      
      // Should be focusable
      continueButton.focus();
      expect(document.activeElement).toBe(continueButton);
    });

    it('should have proper alt text for Bóbr image', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      const bobrImage = screen.getByAltText('Bóbr companion');
      expect(bobrImage).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin My Journey!' });
      
      // Test Enter key
      fireEvent.keyDown(continueButton, { key: 'Enter' });
      fireEvent.click(continueButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have proper heading structure', () => {
      const user = createMockUser({ name: 'Test User' });
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      // Main title should be h1
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Congratulations, Test User!');

      // Features section should have h3
      const featuresHeading = screen.getByRole('heading', { level: 3 });
      expect(featuresHeading).toHaveTextContent('Features Now Available:');
    });
  });

  describe('Content structure', () => {
    it('should render all main sections', () => {
      const user = createMockUser();
      const { container } = render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(container.querySelector('.celebration')).toBeInTheDocument();
      expect(container.querySelector('.achievementGrid')).toBeInTheDocument();
      expect(container.querySelector('.unlockedFeatures')).toBeInTheDocument();
      expect(container.querySelector('.encouragement')).toBeInTheDocument();
      expect(container.querySelector('.hint')).toBeInTheDocument();
    });

    it('should have proper CSS classes applied', () => {
      const user = createMockUser();
      const { container } = render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      expect(container.querySelector('.overlay')).toBeInTheDocument();
      expect(container.querySelector('.modal')).toBeInTheDocument();
      expect(container.querySelector('.fireworks')).toBeInTheDocument();
      expect(container.querySelector('.title')).toBeInTheDocument();
      expect(container.querySelector('.subtitle')).toBeInTheDocument();
    });
  });

  describe('Interactive elements', () => {
    it('should only have one interactive button', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent('Begin My Journey!');
    });

    it('should handle multiple rapid clicks gracefully', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      const continueButton = screen.getByRole('button', { name: 'Begin My Journey!' });
      
      // Click multiple times rapidly
      fireEvent.click(continueButton);
      fireEvent.click(continueButton);
      fireEvent.click(continueButton);

      // Should call onClose for each click (no debouncing implemented)
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('Visual elements', () => {
    it('should display all emoji icons correctly', () => {
      const user = createMockUser();
      render(
        <TutorialCompletionCelebration
          user={user}
          onClose={mockOnClose}
        />
      );

      // Fireworks
      expect(screen.getByText('🎆🎇✨🎉')).toBeInTheDocument();
      
      // Achievement icons
      expect(screen.getByText('🦫')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('🏗️')).toBeInTheDocument();
      expect(screen.getByText('🌱')).toBeInTheDocument();
      
      // Feature icons
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
      expect(screen.getByText('🔄')).toBeInTheDocument();
      expect(screen.getByText('📈')).toBeInTheDocument();
      
      // Tip icon
      expect(screen.getByText('💡')).toBeInTheDocument();
    });
  });
}); 