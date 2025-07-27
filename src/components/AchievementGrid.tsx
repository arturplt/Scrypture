import React, { useState, useMemo } from 'react';
import { Achievement, AchievementProgress } from '../types';
import { AchievementCard } from './AchievementCard';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './AchievementGrid.module.css';

interface AchievementGridProps {
  achievements: Achievement[];
  achievementProgress: AchievementProgress[];
  isSaving?: boolean;
  lastSaved?: Date;
  onAchievementClick?: (achievement: Achievement) => void;
  onRefresh?: () => void;
}

type FilterType = 'all' | 'unlocked' | 'locked' | 'progression' | 'mastery' | 'consistency' | 'exploration' | 'special';

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  achievementProgress,
  isSaving = false,
  lastSaved,
  onAchievementClick,
  onRefresh,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Calculate achievement statistics
  const stats = useMemo(() => {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;
    const locked = total - unlocked;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    return { total, unlocked, locked, percentage };
  }, [achievements]);

  // Filter achievements based on active filter
  const filteredAchievements = useMemo(() => {
    switch (activeFilter) {
      case 'unlocked':
        return achievements.filter(a => a.unlocked);
      case 'locked':
        return achievements.filter(a => !a.unlocked);
      case 'progression':
      case 'mastery':
      case 'consistency':
      case 'exploration':
      case 'special':
        return achievements.filter(a => a.category === activeFilter);
      default:
        return achievements;
    }
  }, [achievements, activeFilter]);

  // Group achievements by category for better organization
  const achievementsByCategory = useMemo(() => {
    if (activeFilter !== 'all') {
      return { [activeFilter]: filteredAchievements };
    }

    const categories: Record<string, Achievement[]> = {};
    filteredAchievements.forEach(achievement => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = [];
      }
      categories[achievement.category].push(achievement);
    });

    // Sort categories by priority
    const categoryOrder = ['progression', 'mastery', 'consistency', 'exploration', 'special'];
    const sortedCategories: Record<string, Achievement[]> = {};
    categoryOrder.forEach(category => {
      if (categories[category]) {
        sortedCategories[category] = categories[category];
      }
    });

    return sortedCategories;
  }, [filteredAchievements, activeFilter]);

  const getFilterButtonClass = (filter: FilterType) => {
    return activeFilter === filter 
      ? `${styles.filterButton} ${styles.filterButtonActive}`
      : styles.filterButton;
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'progression':
        return '🌱 Progression';
      case 'mastery':
        return '⚔️ Mastery';
      case 'consistency':
        return '🔥 Consistency';
      case 'exploration':
        return '🗺️ Exploration';
      case 'special':
        return '✨ Special';
      default:
        return category;
    }
  };

  const getProgressForAchievement = (achievementId: string): AchievementProgress | null => {
    return achievementProgress.find(p => p.achievementId === achievementId) || null;
  };

  const handleAchievementClick = (achievement: Achievement) => {
    if (onAchievementClick) {
      onAchievementClick(achievement);
    }
  };

  if (achievements.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <span className={styles.loadingText}>Loading achievements</span>
          <div className={styles.loadingDots}>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🏆 Achievements</h2>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🏆</span>
            <span>{stats.unlocked}/{stats.total}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📊</span>
            <span>{stats.percentage}%</span>
          </div>
          {onRefresh && (
            <button
              className={styles.refreshButton}
              onClick={onRefresh}
              title="Refresh achievements"
            >
              🔄
            </button>
          )}
          <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={getFilterButtonClass('all')}
          onClick={() => setActiveFilter('all')}
        >
          All ({achievements.length})
        </button>
        <button
          className={getFilterButtonClass('unlocked')}
          onClick={() => setActiveFilter('unlocked')}
        >
          Unlocked ({stats.unlocked})
        </button>
        <button
          className={getFilterButtonClass('locked')}
          onClick={() => setActiveFilter('locked')}
        >
          Locked ({stats.locked})
        </button>
        <button
          className={getFilterButtonClass('progression')}
          onClick={() => setActiveFilter('progression')}
        >
          Progression
        </button>
        <button
          className={getFilterButtonClass('mastery')}
          onClick={() => setActiveFilter('mastery')}
        >
          Mastery
        </button>
        <button
          className={getFilterButtonClass('consistency')}
          onClick={() => setActiveFilter('consistency')}
        >
          Consistency
        </button>
        <button
          className={getFilterButtonClass('exploration')}
          onClick={() => setActiveFilter('exploration')}
        >
          Exploration
        </button>
        <button
          className={getFilterButtonClass('special')}
          onClick={() => setActiveFilter('special')}
        >
          Special
        </button>
      </div>

      {filteredAchievements.length === 0 ? (
        <div className={styles.noAchievements}>
          No achievements found for the selected filter.
        </div>
      ) : (
        <div>
          {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
            <div key={category} className={styles.categorySection}>
              {activeFilter === 'all' && (
                <h3 className={styles.categoryTitle}>
                  {getCategoryDisplayName(category)}
                </h3>
              )}
              <div className={styles.categoryGrid}>
                {categoryAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    progress={getProgressForAchievement(achievement.id)}
                    onClick={() => handleAchievementClick(achievement)}
                    showProgress={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 