import React from 'react';
import { Achievement, AchievementProgress } from '../types';
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

  const cardClasses = [
    styles.card,
    getRarityClass(achievement.rarity),
    isUnlocked ? styles.cardUnlocked : styles.cardLocked,
  ].filter(Boolean).join(' ');

  const iconClasses = [
    styles.icon,
    isUnlocked ? styles.iconUnlocked : styles.iconLocked,
  ].filter(Boolean).join(' ');

  const nameClasses = [
    styles.name,
    isUnlocked ? styles.nameUnlocked : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick} data-testid={`achievement-card-${achievement.id}`}>
      <div className={styles.header}>
        <div className={iconClasses}>
          {isUnlocked ? achievement.icon : '🔒'}
        </div>
        <div className={styles.content}>
          <h3 className={nameClasses}>{achievement.name}</h3>
          <p className={styles.description}>{achievement.description}</p>
          
          <div className={styles.meta}>
            <span className={styles.category}>{achievement.category}</span>
            <span className={`${styles.rarity} ${getRarityTextClass(achievement.rarity)}`}>
              {achievement.rarity}
            </span>
          </div>

          {/* Progress bar for locked achievements */}
          {!isUnlocked && showProgress && progress && (
            <div className={styles.progressContainer} data-testid="achievement-progress">
              <div className={styles.progressLabel}>
                Progress: {progress.currentValue} / {progress.targetValue}
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
          {achievement.rewards && (
            <div className={styles.rewards}>
              {achievement.rewards.xp && (
                <span className={`${styles.reward} ${styles.rewardXP}`}>
                  +{achievement.rewards.xp} XP
                </span>
              )}
              {achievement.rewards.body && (
                <span className={`${styles.reward} ${styles.rewardBody}`}>
                  +{achievement.rewards.body} Body
                </span>
              )}
              {achievement.rewards.mind && (
                <span className={`${styles.reward} ${styles.rewardMind}`}>
                  +{achievement.rewards.mind} Mind
                </span>
              )}
              {achievement.rewards.soul && (
                <span className={`${styles.reward} ${styles.rewardSoul}`}>
                  +{achievement.rewards.soul} Soul
                </span>
              )}
            </div>
          )}

          {/* Unlock date for unlocked achievements */}
          {isUnlocked && achievement.unlockedAt && (
            <div className={styles.unlockedAt} data-testid="achievement-unlocked">
              Unlocked: {formatDate(achievement.unlockedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 