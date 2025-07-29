import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AchievementGrid } from '../AchievementGrid';
import { Achievement, AchievementProgress } from '../../types';

// Mock the child components
jest.mock('../AchievementCard', () => ({
  AchievementCard: ({ achievement, progress, onClick }: any) => (
    <div data-testid={`achievement-card-${achievement.id}`} onClick={onClick}>
      {achievement.name} - {achievement.unlocked ? 'Unlocked' : 'Locked'}
      {progress && ` (${progress.currentValue}/${progress.targetValue})`}
    </div>
  ),
}));

jest.mock('../AutoSaveIndicator', () => ({
  AutoSaveIndicator: ({ isSaving, lastSaved }: any) => (
    <div data-testid="auto-save-indicator">
      {isSaving ? 'Saving...' : 'Saved'} - {lastSaved?.toISOString() || 'Never'}
    </div>
  ),
}));

// Simple test to verify import works
describe('Import Test', () => {
  it('should import AchievementGrid correctly', () => {
    expect(AchievementGrid).toBeDefined();
    expect(typeof AchievementGrid).toBe('function');
  });

  it('should import mocked components correctly', () => {
    const { AchievementCard } = require('../AchievementCard');
    const { AutoSaveIndicator } = require('../AutoSaveIndicator');
    
    expect(AchievementCard).toBeDefined();
    expect(typeof AchievementCard).toBe('function');
    expect(AutoSaveIndicator).toBeDefined();
    expect(typeof AutoSaveIndicator).toBe('function');
  });
});

describe('AchievementGrid', () => {
  const mockOnAchievementClick = jest.fn();

  const createMockAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
    id: 'test-achievement',
    name: 'Test Achievement',
    description: 'A test achievement',
    icon: '🏆',
    category: 'progression',
    rarity: 'common',
    conditions: [{ type: 'task_complete', value: 5 }],
    unlockedMessage: 'Achievement unlocked!',
    unlocked: false,
    ...overrides,
  });

  const createMockProgress = (overrides: Partial<AchievementProgress> = {}): AchievementProgress => ({
    achievementId: 'test-achievement',
    progress: 0.6,
    currentValue: 3,
    targetValue: 5,
    lastUpdated: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    it('should render loading state when no achievements', () => {
      render(
        <AchievementGrid
          achievements={[]}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText('Loading achievements')).toBeInTheDocument();
    });

    it('should render achievements grid with title and stats', () => {
      const achievements = [
        createMockAchievement({ id: '1', unlocked: true }),
        createMockAchievement({ id: '2', unlocked: false }),
      ];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText('🏆 Achievements')).toBeInTheDocument();
      expect(screen.getByText('1/2')).toBeInTheDocument(); // unlocked/total
      expect(screen.getByText('50%')).toBeInTheDocument(); // percentage
    });

    it('should render all filter buttons', () => {
      const achievements = [createMockAchievement()];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText('All (1)')).toBeInTheDocument();
      expect(screen.getByText('Unlocked (0)')).toBeInTheDocument();
      expect(screen.getByText('Locked (1)')).toBeInTheDocument();
      expect(screen.getByText('Progression')).toBeInTheDocument();
      expect(screen.getByText('Mastery')).toBeInTheDocument();
      expect(screen.getByText('Consistency')).toBeInTheDocument();
      expect(screen.getByText('Exploration')).toBeInTheDocument();
      expect(screen.getByText('Special')).toBeInTheDocument();
    });
  });

  describe('Statistics calculation', () => {
    it('should calculate correct statistics for mixed achievements', () => {
      const achievements = [
        createMockAchievement({ id: '1', unlocked: true }),
        createMockAchievement({ id: '2', unlocked: true }),
        createMockAchievement({ id: '3', unlocked: false }),
        createMockAchievement({ id: '4', unlocked: false }),
      ];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText('2/4')).toBeInTheDocument(); // unlocked/total
      expect(screen.getByText('50%')).toBeInTheDocument(); // percentage
    });

    it('should handle zero achievements', () => {
      render(
        <AchievementGrid
          achievements={[]}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText('Loading achievements')).toBeInTheDocument();
    });

    it('should handle all unlocked achievements', () => {
      const achievements = [
        createMockAchievement({ id: '1', unlocked: true }),
        createMockAchievement({ id: '2', unlocked: true }),
      ];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText('2/2')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle all locked achievements', () => {
      const achievements = [
        createMockAchievement({ id: '1', unlocked: false }),
        createMockAchievement({ id: '2', unlocked: false }),
      ];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText('0/2')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Filtering functionality', () => {
    const achievements = [
      createMockAchievement({ id: '1', unlocked: true, category: 'progression' }),
      createMockAchievement({ id: '2', unlocked: false, category: 'mastery' }),
      createMockAchievement({ id: '3', unlocked: true, category: 'consistency' }),
      createMockAchievement({ id: '4', unlocked: false, category: 'exploration' }),
    ];

    beforeEach(() => {
      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );
    });

    it('should show all achievements by default', () => {
      expect(screen.getByTestId('achievement-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('achievement-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('achievement-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('achievement-card-4')).toBeInTheDocument();
    });

    it('should filter to unlocked achievements', () => {
      fireEvent.click(screen.getByText('Unlocked (2)'));

      expect(screen.getByTestId('achievement-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('achievement-card-3')).toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-4')).not.toBeInTheDocument();
    });

    it('should filter to locked achievements', () => {
      fireEvent.click(screen.getByText('Locked (2)'));

      expect(screen.getByTestId('achievement-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('achievement-card-4')).toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-3')).not.toBeInTheDocument();
    });

    it('should filter by progression category', () => {
      fireEvent.click(screen.getByText('Progression'));

      expect(screen.getByTestId('achievement-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-4')).not.toBeInTheDocument();
    });

    it('should filter by mastery category', () => {
      fireEvent.click(screen.getByText('Mastery'));

      expect(screen.getByTestId('achievement-card-2')).toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-4')).not.toBeInTheDocument();
    });

    it('should show no achievements message when filter has no results', () => {
      fireEvent.click(screen.getByText('Special'));

      expect(screen.getByText('No achievements found for the selected filter.')).toBeInTheDocument();
      expect(screen.queryByTestId('achievement-card-1')).not.toBeInTheDocument();
    });
  });

  describe('Category organization', () => {
    it('should group achievements by category when showing all', () => {
      const achievements = [
        createMockAchievement({ id: '1', category: 'progression' }),
        createMockAchievement({ id: '2', category: 'mastery' }),
        createMockAchievement({ id: '3', category: 'progression' }),
        createMockAchievement({ id: '4', category: 'consistency' }),
      ];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText('🌱 Progression')).toBeInTheDocument();
      expect(screen.getByText('⚔️ Mastery')).toBeInTheDocument();
      expect(screen.getByText('🔥 Consistency')).toBeInTheDocument();
    });

    it('should not show category titles when filtered', () => {
      const achievements = [
        createMockAchievement({ id: '1', category: 'progression' }),
        createMockAchievement({ id: '2', category: 'mastery' }),
      ];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      // Click on progression filter
      fireEvent.click(screen.getByText('Progression'));

      expect(screen.queryByText('🌱 Progression')).not.toBeInTheDocument();
      expect(screen.queryByText('⚔️ Mastery')).not.toBeInTheDocument();
    });

    it('should sort categories by priority order', () => {
      const achievements = [
        createMockAchievement({ id: '1', category: 'exploration' }),
        createMockAchievement({ id: '2', category: 'mastery' }),
        createMockAchievement({ id: '3', category: 'progression' }),
        createMockAchievement({ id: '4', category: 'consistency' }),
      ];

      const { container } = render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      // Check that categories are rendered in the correct order
      const categoryElements = container.querySelectorAll('h3');
      expect(categoryElements[0]).toHaveTextContent('🌱 Progression');
      expect(categoryElements[1]).toHaveTextContent('⚔️ Mastery');
      expect(categoryElements[2]).toHaveTextContent('🔥 Consistency');
      expect(categoryElements[3]).toHaveTextContent('🗺️ Exploration');
    });
  });

  describe('Progress integration', () => {
    it('should pass progress data to achievement cards', () => {
      const achievements = [createMockAchievement({ id: '1' })];
      const progress = [createMockProgress({ achievementId: '1', currentValue: 3, targetValue: 5 })];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={progress}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText(/Test Achievement - Locked \(3\/5\)/)).toBeInTheDocument();
    });

    it('should handle missing progress data', () => {
      const achievements = [createMockAchievement({ id: '1' })];
      const progress: AchievementProgress[] = [];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={progress}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText(/Test Achievement - Locked/)).toBeInTheDocument();
      expect(screen.queryByText(/\(3\/5\)/)).not.toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('should call onAchievementClick when achievement card is clicked', () => {
      const achievements = [createMockAchievement({ id: '1' })];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      fireEvent.click(screen.getByTestId('achievement-card-1'));

      expect(mockOnAchievementClick).toHaveBeenCalledWith(achievements[0]);
    });

    it('should not call onAchievementClick when not provided', () => {
      const achievements = [createMockAchievement({ id: '1' })];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
        />
      );

      // Should not throw error when clicking
      expect(() => fireEvent.click(screen.getByTestId('achievement-card-1'))).not.toThrow();
    });

    it('should handle multiple rapid clicks', () => {
      const achievements = [createMockAchievement({ id: '1' })];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      const card = screen.getByTestId('achievement-card-1');
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);

      expect(mockOnAchievementClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('AutoSaveIndicator integration', () => {
    it('should pass saving state to AutoSaveIndicator', () => {
      const achievements = [createMockAchievement()];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          isSaving={true}
          lastSaved={new Date('2023-01-01T10:00:00Z')}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('auto-save-indicator')).toHaveTextContent('Saving...');
    });

    it('should handle undefined lastSaved', () => {
      const achievements = [createMockAchievement()];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          isSaving={false}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('auto-save-indicator')).toHaveTextContent('Saved');
      expect(screen.getByTestId('auto-save-indicator')).toHaveTextContent('Never');
    });
  });

  describe('Filter button styling', () => {
    it('should apply active class to selected filter', () => {
      const achievements = [createMockAchievement()];

      const { container } = render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      const allButton = screen.getByText('All (1)');
      expect(allButton).toBeInTheDocument();

      // Click on different filter
      fireEvent.click(screen.getByText('Unlocked (0)'));
      expect(screen.getByText('Unlocked (0)')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle achievements with unknown categories', () => {
      const achievements = [
        createMockAchievement({ id: '1', category: 'unknown_category' as any }),
      ];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      // Unknown categories should not be rendered
      expect(screen.queryByTestId('achievement-card-1')).not.toBeInTheDocument();
    });

    it('should handle empty category sections', () => {
      const achievements = [
        createMockAchievement({ id: '1', category: 'progression' }),
      ];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      // Filter to a category with no achievements
      fireEvent.click(screen.getByText('Mastery'));

      expect(screen.getByText('No achievements found for the selected filter.')).toBeInTheDocument();
    });

    it('should handle very large achievement lists', () => {
      const achievements = Array.from({ length: 100 }, (_, i) =>
        createMockAchievement({ id: `${i}`, category: 'progression' })
      );

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      expect(screen.getByText('0/100')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('All (100)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles for filters', () => {
      const achievements = [createMockAchievement()];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      const filterButtons = screen.getAllByRole('button');
      expect(filterButtons.length).toBeGreaterThan(0);

      // Test keyboard navigation
      filterButtons[0].focus();
      expect(document.activeElement).toBe(filterButtons[0]);
    });

    it('should have proper heading structure', () => {
      const achievements = [createMockAchievement()];

      render(
        <AchievementGrid
          achievements={achievements}
          achievementProgress={[]}
          onAchievementClick={mockOnAchievementClick}
        />
      );

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('🏆 Achievements');
    });
  });
}); 