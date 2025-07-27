import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import { useHabits } from '../hooks/useHabits';
import { useUser } from '../hooks/useUser';
import { HabitEditForm } from './HabitEditForm';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { habitService } from '../services/habitService';
import styles from './HabitCard.module.css';

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { completeHabit, updateHabit, isSaving } = useHabits();
  const { addStatRewards, addExperience } = useUser();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cooldownTime, setCooldownTime] = useState<string>('');

  const canCompleteToday = () => {
    return !habitService.isCompletedToday(habit);
  };

  const calculateCooldownTime = () => {
    if (!habit.lastCompleted) return '';
    
    const now = new Date();
    let nextReset: Date;
    
    switch (habit.targetFrequency) {
      case 'daily': {
        // Next reset at midnight
        nextReset = new Date(now);
        nextReset.setHours(24, 0, 0, 0);
        break;
      }
      case 'weekly': {
        // Next reset at midnight on Sunday
        nextReset = new Date(now);
        const daysUntilSunday = (7 - nextReset.getDay()) % 7;
        nextReset.setDate(nextReset.getDate() + daysUntilSunday);
        nextReset.setHours(0, 0, 0, 0);
        break;
      }
      case 'monthly': {
        // Next reset at midnight on the last day of the month
        nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        nextReset.setHours(0, 0, 0, 0);
        break;
      }
      default:
        return '';
    }
    
    const timeDiff = nextReset.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const checkAndResetHabit = () => {
    if (!habit.lastCompleted) return;
    
    const now = new Date();
    const lastCompleted = new Date(habit.lastCompleted);
    
    switch (habit.targetFrequency) {
      case 'daily': {
        // Check if last completion was before today's start
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        if (lastCompleted < todayStart) {
          console.log(`🔄 Resetting daily habit "${habit.name}" - completed before today`);
          updateHabit(habit.id, { lastCompleted: undefined });
        }
        break;
      }
      case 'weekly': {
        // Check if last completion was before this week's start (Sunday)
        const thisWeekStart = new Date(now);
        const daysSinceSunday = thisWeekStart.getDay();
        thisWeekStart.setDate(thisWeekStart.getDate() - daysSinceSunday);
        thisWeekStart.setHours(0, 0, 0, 0);
        if (lastCompleted < thisWeekStart) {
          console.log(`🔄 Resetting weekly habit "${habit.name}" - completed before this week`);
          updateHabit(habit.id, { lastCompleted: undefined });
        }
        break;
      }
      case 'monthly': {
        // Check if last completion was before this month's start
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        if (lastCompleted < thisMonthStart) {
          console.log(`🔄 Resetting monthly habit "${habit.name}" - completed before this month`);
          updateHabit(habit.id, { lastCompleted: undefined });
        }
        break;
      }
      default:
        return;
    }
  };

  const handleComplete = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    if (!canCompleteToday() || isCompleting) return;
    
    setIsCompleting(true);
    setTimeout(() => {
      const success = completeHabit(habit.id);
      if (success && habit.statRewards) {
        // Award stat rewards
        const { body, mind, soul, xp } = habit.statRewards;
        if (body || mind || soul) {
          addStatRewards({ body, mind, soul });
        }
        if (xp) {
          addExperience(xp);
        }
      }
      setIsCompleting(false);
    }, 300);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const isCompletedToday = !canCompleteToday();
  const isActive = !isCompletedToday;
  const streakDisplay = habit.streak > 0 ? `${habit.streak} day${habit.streak !== 1 ? 's' : ''}` : 'No streak';
  const bestStreakDisplay = habit.bestStreak && habit.bestStreak > 0 ? `Best: ${habit.bestStreak}` : null;

  useEffect(() => {
    // Check if habit should be reset when cooldown expires
    checkAndResetHabit();
    
    if (isCompletedToday) {
      const updateCooldown = () => {
        setCooldownTime(calculateCooldownTime());
        // Also check for reset on each update
        checkAndResetHabit();
      };
      
      updateCooldown();
      const interval = setInterval(updateCooldown, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [habit.lastCompleted, habit.targetFrequency, isCompletedToday]);

  if (isEditing) {
    return (
      <HabitEditForm
        habit={habit}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div 
      className={`${styles.habitCard} ${isCompletedToday ? styles.completed : ''} ${isActive ? styles.active : ''} ${isCompleting ? styles.completing : ''}`}
      data-testid="habit-card"
    >
      <div className={styles.header}>
        <div className={styles.content}>
          <div className={styles.titleSection}>
            <h3 className={`${styles.title} ${isCompletedToday ? styles.titleCompleted : ''}`}>
              {habit.name}
            </h3>
            <div className={styles.autoSaveContainer}>
              <AutoSaveIndicator isSaving={isSaving} />
            </div>
          </div>
          
          {habit.description && (
            <p className={`${styles.description} ${isCompletedToday ? styles.descriptionCompleted : ''}`}>
              {habit.description}
            </p>
          )}
          
          <div className={styles.meta}>
            <span className={`${styles.frequency} ${styles[habit.targetFrequency]}`}>
              {habit.targetFrequency.charAt(0).toUpperCase() + habit.targetFrequency.slice(1)}
            </span>
            <span className={styles.streak}>
              🔥 {streakDisplay}
            </span>
            {bestStreakDisplay && (
              <span className={styles.bestStreak}>
                🏆 {bestStreakDisplay}
              </span>
            )}
          </div>

          {/* Rewards details - hidden until hover */}
          {habit.statRewards &&
            ((habit.statRewards.xp ?? 0) > 0 ||
              (habit.statRewards.body ?? 0) > 0 ||
              (habit.statRewards.mind ?? 0) > 0 ||
              (habit.statRewards.soul ?? 0) > 0) && (
              <div className={styles.rewards}>
                {(habit.statRewards.xp ?? 0) > 0 && (
                  <span className={`${styles.reward} ${styles.rewardXP}`}>
                    XP: +{habit.statRewards.xp}
                  </span>
                )}
                {(habit.statRewards.body ?? 0) > 0 && (
                  <span className={`${styles.reward} ${styles.rewardBody}`}>
                    💪 Body: +{habit.statRewards.body}
                  </span>
                )}
                {(habit.statRewards.mind ?? 0) > 0 && (
                  <span className={`${styles.reward} ${styles.rewardMind}`}>
                    🧠 Mind: +{habit.statRewards.mind}
                  </span>
                )}
                {(habit.statRewards.soul ?? 0) > 0 && (
                  <span className={`${styles.reward} ${styles.rewardSoul}`}>
                    ✨ Soul: +{habit.statRewards.soul}
                  </span>
                )}
              </div>
            )}
        </div>

        <div className={styles.rightSection} onClick={(e) => e.stopPropagation()}>
          <div className={styles.checkboxContainer} onClick={(e) => e.stopPropagation()}>
            {isCompletedToday ? (
              <div className={styles.cooldownTimer}>
                <span className={styles.cooldownText}>{cooldownTime}</span>
              </div>
            ) : (
              <input
                type="checkbox"
                checked={isCompletedToday}
                onChange={handleComplete}
                disabled={isCompleting}
                className={styles.checkbox}
              />
            )}
          </div>

          <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleEdit}
              className={styles.editButton}
              aria-label="Edit habit"
            >
              🖍
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 