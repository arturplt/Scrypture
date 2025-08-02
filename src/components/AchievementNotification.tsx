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
  duration, // Remove default here to properly detect undefined
  showProgress = true,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(100);

  // Use 8000 as default only if duration is undefined, but allow 0 to disable
  const effectiveDuration = duration === undefined ? 0 : duration;

  // Scroll to top when achievement notification appears
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    // Don't set up timers if duration is 0, null, or undefined
    if (!effectiveDuration || effectiveDuration <= 0) return;

    // Progress countdown
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (effectiveDuration / 100));
        return Math.max(0, newProgress);
      });
    }, 100);

    // Auto-close timer
    const closeTimer = setTimeout(() => {
      handleClose();
    }, effectiveDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(closeTimer);
    };
  }, [effectiveDuration]);

  const handleClose = () => {
    // Prevent multiple close calls
    if (isClosing) return;
    
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
    <div className={notificationClasses} data-testid="achievement-notification">
      <button className={styles.closeButton} onClick={handleClose}>
        ×
      </button>
      
      <div className={styles.header}>
        <div className={styles.icon}>
          {achievement.icon}
        </div>
        <div className={styles.content}>
          <div className={styles.title}>Achievement Unlocked!</div>
          <h3 className={styles.achievementName} data-testid="achievement-name">{achievement.name}</h3>
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
      {showProgress && effectiveDuration && (
        <div className={styles.progressBar} data-testid="progress-bar">
          <div 
            className={styles.progressFill}
            data-testid="progress-fill"
            style={{ 
              width: `${progress}%`,
              animationDuration: `${effectiveDuration}ms`
            }}
          />
        </div>
      )}
    </div>
  );
}; 