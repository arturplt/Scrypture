import React from 'react';
import { useUser } from '../hooks/useUser';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './StatsDisplay.module.css';

export const StatsDisplay: React.FC = () => {
  const { user, isSaving } = useUser();

  // Debug logging to track user state changes
  React.useEffect(() => {
    console.log('📊 StatsDisplay: User state changed:', {
      level: user?.level,
      experience: user?.experience,
      body: user?.body,
      mind: user?.mind,
      soul: user?.soul
    });
  }, [user?.level, user?.experience, user?.body, user?.mind, user?.soul]);

  if (!user) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Core Attributes</h3>
        <p className={styles.noUser}>Create a user to see your stats</p>
      </div>
    );
  }

  const calculateProgress = (value: number) => {
    // Calculate progress as percentage (0-100)
    // For now, we'll use a simple scale where 100 points = 100%
    return Math.min((value / 100) * 100, 100);
  };

  // Leveling logic
  const xpPerLevel = 100;
  const currentLevel = user.level;
  const currentXp = user.experience;
  const currentLevelBaseXp = (currentLevel - 1) * xpPerLevel;
  const nextLevelBaseXp = currentLevel * xpPerLevel;
  const xpProgress = Math.max(
    0,
    Math.min(1, (currentXp - currentLevelBaseXp) / xpPerLevel)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Core Attributes</h3>
        <AutoSaveIndicator isSaving={isSaving} />
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>💪</span>
            <span className={styles.statName}>Body</span>
            <span className={styles.statValue}>{user.body}</span>
          </div>
          <div className={styles.progressContainer}>
            <div
              className={`${styles.progressBar} ${styles.bodyColor}`}
              style={{ width: `${calculateProgress(user.body)}%` }}
            />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>🧠</span>
            <span className={styles.statName}>Mind</span>
            <span className={styles.statValue}>{user.mind}</span>
          </div>
          <div className={styles.progressContainer}>
            <div
              className={`${styles.progressBar} ${styles.mindColor}`}
              style={{ width: `${calculateProgress(user.mind)}%` }}
            />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>✨</span>
            <span className={styles.statName}>Soul</span>
            <span className={styles.statValue}>{user.soul}</span>
          </div>
          <div className={styles.progressContainer}>
            <div
              className={`${styles.progressBar} ${styles.soulColor}`}
              style={{ width: `${calculateProgress(user.soul)}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.levelInfo}>
        <div className={styles.levelDisplay}>
          <span className={styles.levelLabel}>Level</span>
          <span className={styles.levelValue}>{user.level}</span>
        </div>
        <div className={styles.experienceDisplay}>
          <span className={styles.experienceValue}>
            {currentXp} / {nextLevelBaseXp}{' '}
          </span>
          <div className={styles.progressContainer} style={{ marginTop: 4 }}>
            <div
              className={styles.progressBar}
              style={{
                width: `${xpProgress * 100}%`,
                background: 'var(--color-accent-gold)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
