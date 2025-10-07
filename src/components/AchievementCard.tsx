import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Achievement, AchievementProgress } from '../types';
import { Card } from './ui';
import styles from './AchievementCard.module.css';

interface AchievementCardProps {
  achievement: Achievement;
  progress?: AchievementProgress | null;
  onClick?: () => void;
  showProgress?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress,
  onClick,
  showProgress = true,
}) => {
  const isUnlocked = achievement.unlocked;
  const progressPercent = progress?.progress ? Math.round(progress.progress * 100) : 0;

  // Responsive sizing similar to TaskCard so all content is visible
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 320, height: 200 });

  const updateDimensions = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    const width = containerRef.current.clientWidth;
    const contentHeight = contentRef.current.scrollHeight;
    // Ensure minimum reasonable frame height, and leave a little extra for frame internals
    const minHeight = 180;
    setDimensions({ width, height: Math.max(contentHeight + 16, minHeight) });
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(updateDimensions);
    if (containerRef.current) ro.observe(containerRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    updateDimensions();
    return () => ro.disconnect();
  }, [updateDimensions]);

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return styles.rarityCommon;
      case 'uncommon':
        return styles.rarityUncommon;
      case 'rare':
        return styles.rarityRare;
      case 'epic':
        return styles.rarityEpic;
      case 'legendary':
        return styles.rarityLegendary;
      default:
        return styles.rarityCommon;
    }
  };

  const getRarityTextClass = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return styles.rarityCommonText;
      case 'uncommon':
        return styles.rarityUncommonText;
      case 'rare':
        return styles.rarityRareText;
      case 'epic':
        return styles.rarityEpicText;
      case 'legendary':
        return styles.rarityLegendaryText;
      default:
        return styles.rarityCommonText;
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return '';
    }
  };

  const handleClick = () => {
    onClick?.();
  };

  const getCardStatus = () => {
    return isUnlocked ? 'completed' : 'default';
  };

  const getStatRewards = () => {
    const stats = [];
    if (achievement.rewards?.body) stats.push({ icon: '💪', value: achievement.rewards.body, label: 'Body' });
    if (achievement.rewards?.mind) stats.push({ icon: '🧠', value: achievement.rewards.mind, label: 'Mind' });
    if (achievement.rewards?.soul) stats.push({ icon: '✨', value: achievement.rewards.soul, label: 'Soul' });
    if (achievement.rewards?.xp) stats.push({ icon: '⭐', value: achievement.rewards.xp, label: 'XP' });
    return stats;
  };

  return (
    <div ref={containerRef} className={styles.achievementCard}>
      <Card
        status={getCardStatus()}
        onClick={handleClick}
        className={`${styles.achievementCard} ${achievement.unlocked ? styles.unlocked : styles.locked}`}
        hoverable={true}
        theme="thick-gold"
        customWidth={dimensions.width}
        customHeight={dimensions.height}
      >
        <div ref={contentRef} className={styles.cardContent}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.iconSection}>
              <div className={`${styles.achievementIcon} ${isUnlocked ? styles.iconUnlocked : styles.iconLocked}`}>
                {isUnlocked ? achievement.icon : '🔒'}
              </div>
              <div className={styles.rarityBadge}>
                <span className={`${styles.rarity} ${getRarityTextClass(achievement.rarity)}`}>
                  {achievement.rarity}
                </span>
              </div>
            </div>
            <div className={styles.titleSection}>
              <h3 className={`${styles.title} ${isUnlocked ? styles.titleUnlocked : styles.titleLocked}`}>
                {achievement.name}
              </h3>
              <span className={styles.category}>{achievement.category}</span>
            </div>
          </div>

          {/* Description */}
          <p className={styles.description}>{achievement.description}</p>

          {/* Progress Bar for locked achievements */}
          {!isUnlocked && showProgress && progress && (
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                {progress.currentValue} / {progress.targetValue}
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className={styles.progressText}>
                {progressPercent}% Complete
              </div>
            </div>
          )}

          {/* Rewards */}
          {getStatRewards().length > 0 && (
            <div className={styles.rewards}>
              {getStatRewards().map((stat, index) => (
                <div key={index} className={styles.statReward}>
                  <span className={styles.statIcon}>{stat.icon}</span>
                  <span className={styles.statValue}>+{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            {isUnlocked && achievement.unlockedAt ? (
              <span className={styles.unlockedDate}>
                Unlocked: {formatDate(achievement.unlockedAt)}
              </span>
            ) : (
              <span className={styles.lockedBadge}>Locked</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}; 