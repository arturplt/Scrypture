import React, { useState } from 'react';
import { Habit } from '../types';
import { useHabits } from '../hooks/useHabits';
import { useUser } from '../hooks/useUser';
import { HabitEditForm } from './HabitEditForm';
import styles from './HabitCard.module.css';

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { completeHabit, deleteHabit } = useHabits();
  const { addStatRewards, addExperience } = useUser();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const canCompleteToday = () => {
    if (!habit.lastCompleted) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastCompleted = new Date(habit.lastCompleted);
    lastCompleted.setHours(0, 0, 0, 0);
    
    return today.getTime() !== lastCompleted.getTime();
  };

  const handleComplete = async () => {
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

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the habit "${habit.name}"?`)) {
      deleteHabit(habit.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const isCompletedToday = !canCompleteToday();
  const isActive = !isCompletedToday;
  const streakDisplay = habit.streak > 0 ? `${habit.streak} day${habit.streak !== 1 ? 's' : ''}` : 'No streak';
  const bestStreakDisplay = habit.bestStreak && habit.bestStreak > 0 ? `Best: ${habit.bestStreak}` : null;

  if (isEditing) {
    return (
      <HabitEditForm
        habit={habit}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className={`${styles.habitCard} ${isCompletedToday ? styles.completed : ''} ${isActive ? styles.active : ''}`}>
      <div className={styles.header}>
        <div className={styles.content}>
          <h3 className={styles.title}>{habit.name}</h3>
          {habit.description && (
            <p className={styles.description}>{habit.description}</p>
          )}
          
          <div className={styles.meta}>
            <span className={styles.frequency}>
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
        </div>

        <div className={styles.actions}>
          <button
            onClick={handleComplete}
            disabled={isCompletedToday || isCompleting}
            className={`${styles.completeButton} ${isCompletedToday ? styles.completedButton : ''} ${isCompleting ? styles.completing : ''}`}
            title={isCompletedToday ? 'Completed today!' : 'Mark as complete'}
          >
            {isCompletedToday ? '✓' : isCompleting ? '⏳' : '○'}
          </button>

          <button
            onClick={handleEdit}
            className={styles.editButton}
            title="Edit habit"
          >
            ✏
          </button>

          <button
            onClick={handleDelete}
            className={styles.deleteButton}
            title="Delete habit"
          >
            🗑
          </button>
        </div>
      </div>

      {habit.statRewards && (
        <div className={styles.rewards}>
          <span className={styles.rewardsLabel}>Rewards:</span>
          {habit.statRewards.body && (
            <span className={styles.reward}>💪 +{habit.statRewards.body} Body</span>
          )}
          {habit.statRewards.mind && (
            <span className={styles.reward}>🧠 +{habit.statRewards.mind} Mind</span>
          )}
          {habit.statRewards.soul && (
            <span className={styles.reward}>✨ +{habit.statRewards.soul} Soul</span>
          )}
          {habit.statRewards.xp && (
            <span className={styles.reward}>⭐ +{habit.statRewards.xp} XP</span>
          )}
        </div>
      )}
    </div>
  );
}; 