import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AchievementNotification } from '../AchievementNotification';
import { Achievement } from '../../types';

// Mock timers for testing auto-close functionality
jest.useFakeTimers();

describe('AchievementNotification', () => {
  const mockOnClose = jest.fn();

  const createMockAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
    id: 'test-achievement',
    name: 'Test Achievement',
    description: 'A test achievement',
    icon: '🏆',
    category: 'progression',
    rarity: 'common',
    conditions: [{ type: 'task_complete', value: 5 }],
    unlockedMessage: 'You completed 5 tasks!',
    unlocked: true,
    unlockedAt: new Date(),
    rewards: {
      xp: 100,
      body: 2,
      mind: 1,
    },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('Initial render', () => {
    it('should render achievement notification with basic content', () => {
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument();
      expect(screen.getByText('Test Achievement')).toBeInTheDocument();
      expect(screen.getByText('You completed 5 tasks!')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
      expect(screen.getByText('common')).toBeInTheDocument();
    });

    it('should render close button', () => {
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveTextContent('×');
    });

    it('should show progress bar by default', () => {
      const achievement = createMockAchievement();
      const { container } = render(
        <AchievementNotification
          achievement={achievement}
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
        const achievement = createMockAchievement({ rarity });
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
      const achievement = createMockAchievement({ rarity: 'unknown' as any });
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
      const achievement = createMockAchievement({
        rewards: {
          xp: 150,
          body: 3,
          mind: 2,
          soul: 1,
        },
      });

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
      const achievement = createMockAchievement({
        rewards: {
          xp: 50,
          mind: 1,
        },
      });

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
      const achievement = createMockAchievement({
        rewards: undefined,
      });

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
      const achievement = createMockAchievement({
        rewards: {},
      });

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
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
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
      const achievement = createMockAchievement();
      const { container } = render(
        <AchievementNotification
          achievement={achievement}
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
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      // Fast-forward time to just before auto-close
      act(() => {
        jest.advanceTimersByTime(7999);
      });
      expect(mockOnClose).not.toHaveBeenCalled();

      // Fast-forward to trigger auto-close
      act(() => {
        jest.advanceTimersByTime(1);
      });

      // Wait for closing animation
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should auto-close after custom duration', () => {
      const achievement = createMockAchievement();
      const customDuration = 5000;

      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
          duration={customDuration}
        />
      );

      act(() => {
        jest.advanceTimersByTime(customDuration);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not auto-close when duration is 0', () => {
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
          duration={0}
        />
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not auto-close when duration is undefined', () => {
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
          duration={undefined}
        />
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Progress bar', () => {
    it('should show progress bar by default', () => {
      const achievement = createMockAchievement();
      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      const progressBar = container.querySelector('.progressBar');
      const progressFill = container.querySelector('.progressFill');
      
      expect(progressBar).toBeInTheDocument();
      expect(progressFill).toBeInTheDocument();
    });

    it('should hide progress bar when showProgress is false', () => {
      const achievement = createMockAchievement();
      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
          showProgress={false}
        />
      );

      const progressBar = container.querySelector('.progressBar');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should hide progress bar when duration is 0', () => {
      const achievement = createMockAchievement();
      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
          duration={0}
        />
      );

      const progressBar = container.querySelector('.progressBar');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should set correct animation duration on progress fill', () => {
      const achievement = createMockAchievement();
      const duration = 5000;
      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
          duration={duration}
        />
      );

      const progressFill = container.querySelector('.progressFill') as HTMLElement;
      expect(progressFill).toHaveStyle(`animation-duration: ${duration}ms`);
    });

    it('should update progress over time', () => {
      const achievement = createMockAchievement();
      const { container } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
          duration={1000}
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
      const achievement = createMockAchievement();
      const { unmount } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
    });

    it('should not call onClose after unmount', () => {
      const achievement = createMockAchievement();
      const { unmount } = render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
          duration={1000}
        />
      );

      unmount();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
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
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
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

  describe('Edge cases', () => {
    it('should handle achievement without icon', () => {
      const achievement = createMockAchievement({ icon: '' });
      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test Achievement')).toBeInTheDocument();
    });

    it('should handle achievement without unlocked message', () => {
      const achievement = createMockAchievement({ unlockedMessage: '' });
      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test Achievement')).toBeInTheDocument();
      expect(screen.queryByText('You completed 5 tasks!')).not.toBeInTheDocument();
    });

    it('should handle very short duration', () => {
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
          duration={100}
        />
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rapid close attempts', () => {
      const achievement = createMockAchievement();
      render(
        <AchievementNotification
          achievement={achievement}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button');
      
      // Click multiple times rapidly
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should only call onClose once
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
}); 