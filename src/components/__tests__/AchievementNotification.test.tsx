import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AchievementNotification } from '../AchievementNotification';
import { Achievement } from '../../types';

// Mock CSS modules to return the class names
jest.mock('../AchievementNotification.module.css', () => ({
  __esModule: true,
  default: {
    notification: 'notification',
    closing: 'closing',
    progressBar: 'progressBar',
    progressFill: 'progressFill',
    rarityCommon: 'rarityCommon',
    rarityUncommon: 'rarityUncommon',
    rarityRare: 'rarityRare',
    rarityEpic: 'rarityEpic',
    rarityLegendary: 'rarityLegendary',
  },
}));

// Mock timers for testing auto-close functionality
jest.useFakeTimers({ legacyFakeTimers: true });

describe('AchievementNotification', () => {
  const mockOnClose = jest.fn();

  const mockAchievement: Achievement = {
    id: '1',
    name: 'First Task',
    description: 'Complete your first task',
    icon: '🎯',
    category: 'progression',
    unlocked: true,
    unlockedAt: new Date(),
    rarity: 'common',
    rewards: { xp: 50 },
    unlockedMessage: 'You completed your first task! Great job!',
    conditions: [{ type: 'task_complete', value: 1 }],

  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear all timers before each test
    jest.clearAllTimers();
  });

  afterEach(() => {
    // Clean up any pending timers
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
  });

  describe('Initial render', () => {
    it('should render achievement notification with basic content', () => {
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument();
      expect(screen.getByText('First Task')).toBeInTheDocument();
      expect(screen.getByText('You completed your first task! Great job!')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('common')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveTextContent('×');
    });

    it('should show progress bar by default', () => {
      const { container } = render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      const progressBar = container.querySelector('.progressBar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Rarity styling', () => {
    const rarities: Array<Achievement['rarity']> = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    rarities.forEach(rarity => {
      it(`should apply correct styling for ${rarity} rarity`, () => {
        const achievement = { ...mockAchievement, rarity };
        const { container } = render(
          <AchievementNotification
            achievement={achievement}
            onClose={mockOnClose}
          />
        );

        expect(screen.getByText(rarity)).toBeInTheDocument();
        const rarityElement = container.querySelector(`.rarity${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`);
        expect(rarityElement).toBeInTheDocument();
      });
    });

    it('should default to common rarity styling for unknown rarity', () => {
      const achievement = { ...mockAchievement, rarity: 'unknown' as any };
      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      const rarityElement = container.querySelector('.rarityCommon');
      expect(rarityElement).toBeInTheDocument();
    });
  });

  describe('Rewards display', () => {
    it('should display all reward types when present', () => {
      const achievement = { ...mockAchievement, rewards: { xp: 150, body: 3, mind: 2, soul: 1 } };

      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('+150 XP')).toBeInTheDocument();
      expect(screen.getByText('+3 Body')).toBeInTheDocument();
      expect(screen.getByText('+2 Mind')).toBeInTheDocument();
      expect(screen.getByText('+1 Soul')).toBeInTheDocument();
    });

    it('should display only present rewards', () => {
      const achievement = { ...mockAchievement, rewards: { xp: 50, mind: 1 } };

      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('+50 XP')).toBeInTheDocument();
      expect(screen.getByText('+1 Mind')).toBeInTheDocument();
      expect(screen.queryByText(/Body/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Soul/)).not.toBeInTheDocument();
    });

    it('should not display rewards section when no rewards', () => {
      const achievement = { ...mockAchievement, rewards: undefined };

      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      const rewardsSection = container.querySelector('.rewards');
      expect(rewardsSection).not.toBeInTheDocument();
    });

    it('should not display rewards section when rewards are empty', () => {
      const achievement = { ...mockAchievement, rewards: {} };

      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      const rewardsSection = container.querySelector('.rewards');
      expect(rewardsSection).not.toBeInTheDocument();
    });
  });

  describe('Manual close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      // Wait for the closing animation delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should add closing class when close button is clicked', () => {
      const { container } = render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      const notification = container.querySelector('.notification');
      expect(notification).toHaveClass('closing');
    });
  });

  describe('Auto-close functionality', () => {
    it('should auto-close after default duration', () => {
      render(<AchievementNotification achievement={mockAchievement} onClose={mockOnClose} />);

      act(() => {
        jest.advanceTimersByTime(8000); // Default duration
      });

      // Account for 300ms animation delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should auto-close after custom duration', () => {
      render(<AchievementNotification achievement={mockAchievement} onClose={mockOnClose} duration={5000} />);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Account for 300ms animation delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not auto-close when duration is 0', () => {
      render(<AchievementNotification achievement={mockAchievement} onClose={mockOnClose} duration={0} />);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not auto-close when duration is undefined', () => {
      render(<AchievementNotification achievement={mockAchievement} onClose={mockOnClose} duration={undefined} />);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Progress bar', () => {
    it('should show progress bar by default', () => {
      const { container } = render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      const progressBar = container.querySelector('.progressBar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should hide progress bar when showProgress is false', () => {
      const { container } = render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
          showProgress={false}
        />
      );

      const progressBar = container.querySelector('.progressBar');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should hide progress bar when duration is 0', () => {
      const { container } = render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
          duration={0}
        />
      );

      const progressBar = container.querySelector('.progressBar');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should set correct animation duration on progress fill', () => {
      const { container } = render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
          duration={5000}
        />
      );

      const progressFill = container.querySelector('.progressFill') as HTMLElement;
      expect(progressFill).toHaveStyle(`animation-duration: 5000ms`);
    });

    it('should update progress over time', () => {
      const achievement = { ...mockAchievement, duration: 1000 };
      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      const progressFill = container.querySelector('.progressFill') as HTMLElement;
      
      // Initial progress should be 100%
      expect(progressFill).toHaveStyle('width: 100%');

      // After half the duration, progress should be around 50%
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Progress should have decreased (exact value may vary due to timing)
      const currentWidth = progressFill.style.width;
      expect(parseFloat(currentWidth)).toBeLessThan(100);
      expect(parseFloat(currentWidth)).toBeGreaterThan(40);
    });
  });

  describe('Cleanup', () => {
    it('should clear timers on unmount', () => {
      const { unmount } = render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      // Unmount before timer expires
      unmount();

      // Advance timers and ensure onClose is not called
      act(() => {
        jest.advanceTimersByTime(8000);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not call onClose after unmount', () => {
      const { unmount } = render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
          duration={1000}
        />
      );

      // Let timer almost expire
      act(() => {
        jest.advanceTimersByTime(999);
      });

      // Unmount just before expiration
      unmount();

      // Complete the timer duration
      act(() => {
        jest.advanceTimersByTime(1);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle very short duration', () => {
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
          duration={100}
        />
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Account for 300ms animation delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rapid close attempts', () => {
      const { container } = render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      const closeButton = container.querySelector('button');
      
      // Click close button multiple times rapidly
      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);

      // Wait for animation to complete
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should only call onClose once
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      
      // Should be focusable
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });

    it('should support keyboard interaction for close button', () => {
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button');
      
      // Test Enter key
      fireEvent.keyDown(closeButton, { key: 'Enter' });
      fireEvent.click(closeButton);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
}); 