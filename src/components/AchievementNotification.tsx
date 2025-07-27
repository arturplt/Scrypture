import React, { useState, useEffect } from 'react';
import { Achievement } from '../types';
import styles from './AchievementNotification.module.css';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  duration?: number; // Auto-close duration in milliseconds
  showProgress?: boolean;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
  duration = 8000, // 8 seconds default
  showProgress = true,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!duration) return;

    // Progress countdown
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return Math.max(0, newProgress);
      });
    }, 100);

    // Auto-close timer
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };

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

  const notificationClasses = [
    styles.notification,
    isClosing ? styles.closing : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={notificationClasses}>
      <button className={styles.closeButton} onClick={handleClose}>
        ×
      </button>
      
      <div className={styles.header}>
        <div className={styles.icon}>
          {achievement.icon}
        </div>
        <div className={styles.content}>
          <div className={styles.title}>Achievement Unlocked!</div>
          <h3 className={styles.achievementName}>{achievement.name}</h3>
          <p className={styles.achievementMessage}>{achievement.unlockedMessage}</p>
          
          <div className={`${styles.rarity} ${getRarityClass(achievement.rarity)}`}>
            {achievement.rarity}
          </div>

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
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {showProgress && duration && (
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ 
              width: `${progress}%`,
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      )}
    </div>
  );
}; 