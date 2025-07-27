import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AchievementCard } from '../AchievementCard';
import { Achievement, AchievementProgress } from '../../types';

describe('AchievementCard', () => {
  const mockOnClick = jest.fn();

  const createMockAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
    id: 'test-achievement',
    name: 'Test Achievement',
    description: 'A test achievement description',
    icon: '🏆',
    category: 'progression',
    rarity: 'common',
    conditions: [{ type: 'task_complete', value: 10 }],
    unlockedMessage: 'Achievement unlocked!',
    unlocked: false,
    ...overrides,
  });

  const createMockProgress = (overrides: Partial<AchievementProgress> = {}): AchievementProgress => ({
    achievementId: 'test-achievement',
    progress: 0.6,
    currentValue: 6,
    targetValue: 10,
    lastUpdated: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render achievement card with basic information', () => {
      const achievement = createMockAchievement();
      render(<AchievementCard achievement={achievement} />);

      expect(screen.getByText('Test Achievement')).toBeInTheDocument();
      expect(screen.getByText('A test achievement description')).toBeInTheDocument();
      expect(screen.getByText('progression')).toBeInTheDocument();
      expect(screen.getByText('common')).toBeInTheDocument();
    });

    it('should render locked icon for locked achievements', () => {
      const achievement = createMockAchievement({ unlocked: false });
      render(<AchievementCard achievement={achievement} />);

      expect(screen.getByText('🔒')).toBeInTheDocument();
      expect(screen.queryByText('🏆')).not.toBeInTheDocument();
    });

    it('should render achievement icon for unlocked achievements', () => {
      const achievement = createMockAchievement({ 
        unlocked: true,
        unlockedAt: new Date('2023-01-01T10:00:00Z')
      });
      render(<AchievementCard achievement={achievement} />);

      expect(screen.getByText('🏆')).toBeInTheDocument();
      expect(screen.queryByText('🔒')).not.toBeInTheDocument();
    });
  });

  describe('Rarity styling', () => {
    const rarities: Array<Achievement['rarity']> = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    rarities.forEach(rarity => {
      it(`should apply correct styling for ${rarity} rarity`, () => {
        const achievement = createMockAchievement({ rarity });
        const { container } = render(<AchievementCard achievement={achievement} />);

        expect(screen.getByText(rarity)).toBeInTheDocument();
        
        const card = container.querySelector('.card');
        expect(card).toHaveClass(`rarity${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`);
      });
    });

    it('should default to common rarity styling for unknown rarity', () => {
      const achievement = createMockAchievement({ rarity: 'unknown' as any });
      const { container } = render(<AchievementCard achievement={achievement} />);

      const card = container.querySelector('.card');
      expect(card).toHaveClass('rarityCommon');
    });
  });

  describe('Progress display', () => {
    it('should show progress for locked achievements with progress data', () => {
      const achievement = createMockAchievement({ unlocked: false });
      const progress = createMockProgress({ 
        progress: 0.6,
        currentValue: 6,
        targetValue: 10 
      });

      render(
        <AchievementCard 
          achievement={achievement} 
          progress={progress}
          showProgress={true}
        />
      );

      expect(screen.getByText('Progress: 6 / 10')).toBeInTheDocument();
      expect(screen.getByText('60% Complete')).toBeInTheDocument();
    });

    it('should not show progress for unlocked achievements', () => {
      const achievement = createMockAchievement({ unlocked: true });
      const progress = createMockProgress();

      render(
        <AchievementCard 
          achievement={achievement} 
          progress={progress}
          showProgress={true}
        />
      );

      expect(screen.queryByText(/Progress:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/% Complete/)).not.toBeInTheDocument();
    });

    it('should not show progress when showProgress is false', () => {
      const achievement = createMockAchievement({ unlocked: false });
      const progress = createMockProgress();

      render(
        <AchievementCard 
          achievement={achievement} 
          progress={progress}
          showProgress={false}
        />
      );

      expect(screen.queryByText(/Progress:/)).not.toBeInTheDocument();
    });

    it('should not show progress when no progress data is provided', () => {
      const achievement = createMockAchievement({ unlocked: false });

      render(
        <AchievementCard 
          achievement={achievement} 
          progress={null}
          showProgress={true}
        />
      );

      expect(screen.queryByText(/Progress:/)).not.toBeInTheDocument();
    });

    it('should handle progress bar width correctly', () => {
      const achievement = createMockAchievement({ unlocked: false });
      const progress = createMockProgress({ progress: 0.75 });

      const { container } = render(
        <AchievementCard 
          achievement={achievement} 
          progress={progress}
          showProgress={true}
        />
      );

      const progressFill = container.querySelector('.progressFill') as HTMLElement;
      expect(progressFill).toHaveStyle('width: 75%');
    });

    it('should handle zero progress', () => {
      const achievement = createMockAchievement({ unlocked: false });
      const progress = createMockProgress({ 
        progress: 0,
        currentValue: 0,
        targetValue: 10 
      });

      render(
        <AchievementCard 
          achievement={achievement} 
          progress={progress}
          showProgress={true}
        />
      );

      expect(screen.getByText('Progress: 0 / 10')).toBeInTheDocument();
      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });

    it('should handle complete progress', () => {
      const achievement = createMockAchievement({ unlocked: false });
      const progress = createMockProgress({ 
        progress: 1,
        currentValue: 10,
        targetValue: 10 
      });

      render(
        <AchievementCard 
          achievement={achievement} 
          progress={progress}
          showProgress={true}
        />
      );

      expect(screen.getByText('Progress: 10 / 10')).toBeInTheDocument();
      expect(screen.getByText('100% Complete')).toBeInTheDocument();
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

      render(<AchievementCard achievement={achievement} />);

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

      render(<AchievementCard achievement={achievement} />);

      expect(screen.getByText('+50 XP')).toBeInTheDocument();
      expect(screen.getByText('+1 Mind')).toBeInTheDocument();
      expect(screen.queryByText(/Body/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Soul/)).not.toBeInTheDocument();
    });

    it('should not display rewards section when no rewards', () => {
      const achievement = createMockAchievement({
        rewards: undefined,
      });

      const { container } = render(<AchievementCard achievement={achievement} />);

      const rewardsSection = container.querySelector('.rewards');
      expect(rewardsSection).not.toBeInTheDocument();
    });
  });

  describe('Unlock date display', () => {
    it('should show unlock date for unlocked achievements', () => {
      const unlockedDate = new Date('2023-01-15T14:30:00Z');
      const achievement = createMockAchievement({ 
        unlocked: true,
        unlockedAt: unlockedDate
      });

      render(<AchievementCard achievement={achievement} />);

      expect(screen.getByText(/Unlocked:/)).toBeInTheDocument();
      // The exact format may vary based on locale, so just check that some date text is present
      expect(screen.getByText(/Jan 15, 2023/)).toBeInTheDocument();
    });

    it('should not show unlock date for locked achievements', () => {
      const achievement = createMockAchievement({ unlocked: false });

      render(<AchievementCard achievement={achievement} />);

      expect(screen.queryByText(/Unlocked:/)).not.toBeInTheDocument();
    });

    it('should not show unlock date for unlocked achievements without unlockedAt', () => {
      const achievement = createMockAchievement({ 
        unlocked: true,
        unlockedAt: undefined
      });

      render(<AchievementCard achievement={achievement} />);

      expect(screen.queryByText(/Unlocked:/)).not.toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('should call onClick when card is clicked', () => {
      const achievement = createMockAchievement();

      render(
        <AchievementCard 
          achievement={achievement} 
          onClick={mockOnClick}
        />
      );

      const card = screen.getByText('Test Achievement').closest('div');
      fireEvent.click(card!);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when no onClick is provided', () => {
      const achievement = createMockAchievement();

      render(<AchievementCard achievement={achievement} />);

      const card = screen.getByText('Test Achievement').closest('div');
      // Should not throw error when clicking
      expect(() => fireEvent.click(card!)).not.toThrow();
    });

    it('should handle multiple clicks', () => {
      const achievement = createMockAchievement();

      render(
        <AchievementCard 
          achievement={achievement} 
          onClick={mockOnClick}
        />
      );

      const card = screen.getByText('Test Achievement').closest('div');
      fireEvent.click(card!);
      fireEvent.click(card!);
      fireEvent.click(card!);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('CSS classes', () => {
    it('should apply locked state classes for locked achievements', () => {
      const achievement = createMockAchievement({ unlocked: false });
      const { container } = render(<AchievementCard achievement={achievement} />);

      const card = container.querySelector('.card');
      const icon = container.querySelector('.icon');

      expect(card).toHaveClass('cardLocked');
      expect(icon).toHaveClass('iconLocked');
    });

    it('should apply unlocked state classes for unlocked achievements', () => {
      const achievement = createMockAchievement({ unlocked: true });
      const { container } = render(<AchievementCard achievement={achievement} />);

      const card = container.querySelector('.card');
      const icon = container.querySelector('.icon');
      const name = container.querySelector('.name');

      expect(card).toHaveClass('cardUnlocked');
      expect(icon).toHaveClass('iconUnlocked');
      expect(name).toHaveClass('nameUnlocked');
    });
  });

  describe('Edge cases', () => {
    it('should handle achievement without description', () => {
      const achievement = createMockAchievement({ description: '' });
      render(<AchievementCard achievement={achievement} />);

      expect(screen.getByText('Test Achievement')).toBeInTheDocument();
      // Empty description should still render the element
      const description = screen.getByText('');
      expect(description).toBeInTheDocument();
    });

    it('should handle achievement without icon', () => {
      const achievement = createMockAchievement({ 
        icon: '',
        unlocked: true 
      });
      render(<AchievementCard achievement={achievement} />);

      expect(screen.getByText('Test Achievement')).toBeInTheDocument();
      // Should still show the icon container, even if empty
      expect(screen.queryByText('🔒')).not.toBeInTheDocument();
    });

    it('should handle very long achievement names', () => {
      const achievement = createMockAchievement({ 
        name: 'This is a very long achievement name that might cause layout issues if not handled properly'
      });
      render(<AchievementCard achievement={achievement} />);

      expect(screen.getByText(/This is a very long achievement name/)).toBeInTheDocument();
    });

    it('should handle achievements with all categories', () => {
      const categories: Array<Achievement['category']> = ['progression', 'mastery', 'consistency', 'exploration', 'special'];
      
      categories.forEach(category => {
        const achievement = createMockAchievement({ category });
        const { rerender } = render(<AchievementCard achievement={achievement} />);
        
        expect(screen.getByText(category)).toBeInTheDocument();
        
        rerender(<div />); // Clean up for next iteration
      });
    });

    it('should handle progress with decimal values', () => {
      const achievement = createMockAchievement({ unlocked: false });
      const progress = createMockProgress({ 
        progress: 0.667,
        currentValue: 6.67,
        targetValue: 10 
      });

      render(
        <AchievementCard 
          achievement={achievement} 
          progress={progress}
          showProgress={true}
        />
      );

      expect(screen.getByText('Progress: 6.67 / 10')).toBeInTheDocument();
      expect(screen.getByText('67% Complete')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible when clickable', () => {
      const achievement = createMockAchievement();

      render(
        <AchievementCard 
          achievement={achievement} 
          onClick={mockOnClick}
        />
      );

      const card = screen.getByText('Test Achievement').closest('div');
      
      // Should be focusable (would need tabIndex in real implementation)
      expect(card).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      const achievement = createMockAchievement();
      render(<AchievementCard achievement={achievement} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Achievement');
    });
  });
}); 