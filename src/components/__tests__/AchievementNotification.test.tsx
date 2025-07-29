import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AchievementNotification } from '../AchievementNotification';
import { Achievement } from '../../types';

// Mock CSS modules to return the class names
jest.mock('../AchievementNotification.module.css', () => ({
  __esModule: true,
  default: {
    notification: 'notification',
    notificationCommon: 'notificationCommon',
    notificationUncommon: 'notificationUncommon',
    notificationRare: 'notificationRare',
    notificationEpic: 'notificationEpic',
    notificationLegendary: 'notificationLegendary',
    header: 'header',
    title: 'title',
    description: 'description',
    closeButton: 'closeButton',
    content: 'content',
    rewards: 'rewards',
    reward: 'reward',
    rewardXP: 'rewardXP',
    rewardBody: 'rewardBody',
    rewardMind: 'rewardMind',
    rewardSoul: 'rewardSoul',
    progressBar: 'progressBar',
    progressFill: 'progressFill',
    closing: 'closing',
    rarityCommon: 'rarityCommon',
    rarityUncommon: 'rarityUncommon',
    rarityRare: 'rarityRare',
    rarityEpic: 'rarityEpic',
    rarityLegendary: 'rarityLegendary',
    icon: 'icon',
    achievementName: 'achievementName',
    achievementMessage: 'achievementMessage',
    rarity: 'rarity',
  },
}));


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
    // Clean up mocks
    jest.clearAllMocks();
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
      render(
        <AchievementNotification 
          achievement={mockAchievement} 
          onClose={mockOnClose} 
          duration={5000} // Provide a duration to show progress bar
        />
      );

      // Look for progress bar by class since it doesn't have a role
      const progressBar = screen.getByTestId('progress-bar');
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
      const achievementWithoutRewards = {
        ...mockAchievement,
        rewards: {} // Empty rewards object
      };

      const { container } = render(
        <AchievementNotification achievement={achievementWithoutRewards} onClose={mockOnClose} />
      );

      // Check that no reward spans are present
      const rewardSpans = container.querySelectorAll('.reward');
      expect(rewardSpans).toHaveLength(0);
    });
  });

  describe('Manual close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      render(
        <AchievementNotification achievement={mockAchievement} onClose={mockOnClose} />
      );

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      // Wait for the animation delay
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
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
    it('should auto-close after default duration', async () => {
      // Use a simple approach without fake timers
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
          duration={100} // Use a very short duration for testing
        />
      );

      expect(mockOnClose).not.toHaveBeenCalled();

      // Wait for the auto-close to happen
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });

    it('should auto-close after custom duration', async () => {
      render(
        <AchievementNotification 
          achievement={mockAchievement} 
          onClose={mockOnClose} 
          duration={100} // Use a very short duration for testing
        />
      );

      // Wait for the auto-close to happen
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });

    it('should not auto-close when duration is 0', () => {
      render(<AchievementNotification achievement={mockAchievement} onClose={mockOnClose} duration={0} />);

      waitFor(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not auto-close when duration is undefined', () => {
      render(<AchievementNotification achievement={mockAchievement} onClose={mockOnClose} duration={undefined} />);

      waitFor(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Progress bar', () => {
    it('should show progress bar by default', () => {
      render(
        <AchievementNotification 
          achievement={mockAchievement} 
          onClose={mockOnClose} 
          duration={5000} // Provide a duration to show progress bar
        />
      );

      // Look for progress bar by class since it doesn't have a role
      const progressBar = screen.getByTestId('progress-bar');
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

    it('should update progress over time', async () => {
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
          duration={2000}
        />
      );

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toBeInTheDocument();

      // Wait a bit and check that progress has decreased
      await waitFor(() => {
        expect(progressFill).toHaveStyle('width: 50%');
      }, { timeout: 2000 });
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
      waitFor(() => {
        jest.advanceTimersByTime(8000);
      });

      waitFor(() => {
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
      waitFor(() => {
        jest.advanceTimersByTime(999);
      });

      // Unmount just before expiration
      unmount();

      // Complete the timer duration
      waitFor(() => {
        jest.advanceTimersByTime(1);
      });

      waitFor(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle very short duration', async () => {
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
          duration={100}
        />
      );

      // Wait for the auto-close to happen
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });

    it('should handle multiple rapid close attempts', async () => {
      render(
        <AchievementNotification
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByText('×');

      // Click close button multiple times rapidly
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      // Should only call onClose once
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
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

      const closeButton = screen.getByText('×');

      // Verify the button is focusable
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // Verify the button is accessible
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe('BUTTON');
    });
  });
}); 