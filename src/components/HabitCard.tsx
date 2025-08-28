import React, { useState, useEffect, useCallback } from 'react';
import { Habit } from '../types';
import { useHabits } from '../hooks/useHabits';
import { useUser } from '../hooks/useUser';
import { HabitEditForm } from './HabitEditForm';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { habitService } from '../services/habitService';
import { formatRelativeTime } from '../utils/dateUtils';
import { Card } from './ui';
import styles from './HabitCard.module.css';

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { completeHabit, isSaving } = useHabits();
  const { addStatRewards, addExperience } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [streakData, setStreakData] = useState({
    current: habit.streak,
    best: habit.bestStreak || 0,
    isCompletedToday: habitService.isCompletedToday(habit)
  });

  // New transition states for smooth animations
  const [isTransitioningToEdit, setIsTransitioningToEdit] = useState(false);
  const [isExitingEdit, setIsExitingEdit] = useState(false);
  const [isReentering, setIsReentering] = useState(false);

  const updateStreakData = useCallback(() => {
    setStreakData({
      current: habit.streak,
      best: habit.bestStreak || 0,
      isCompletedToday: habitService.isCompletedToday(habit)
    });
  }, [habit.id, habit.streak, habit.lastCompleted]);

  useEffect(() => {
    updateStreakData();
  }, [updateStreakData]);

  const handleComplete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (streakData.isCompletedToday || isCompleting) return;
    
    setIsCompleting(true);
    try {
      const success = completeHabit(habit.id);
      if (success && habit.statRewards) {
        const { body, mind, soul, xp } = habit.statRewards;
        if (body || mind || soul) {
          addStatRewards({ body, mind, soul });
        }
        if (xp) {
          addExperience(xp);
        }
      }
      updateStreakData();
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setTimeout(() => setIsCompleting(false), 300);
    }
  }, [habit.id, streakData.isCompletedToday, isCompleting, completeHabit, habit.statRewards, addStatRewards, addExperience, updateStreakData]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prevent multiple rapid clicks during transition
    if (isTransitioningToEdit || isEditing || isExitingEdit) {
      return;
    }
    
    // Start transition animation
    setIsTransitioningToEdit(true);
    
    // After transition animation completes, show edit form
    setTimeout(() => {
      setIsTransitioningToEdit(false);
      setIsEditing(true);
    }, 200);
  };

  const handleCancelEdit = () => {
    // Prevent multiple rapid cancel clicks during transition
    if (isExitingEdit || isReentering) {
      return;
    }
    
    // Start exit animation
    setIsExitingEdit(true);
    
    // After exit animation, hide edit form and show card
    setTimeout(() => {
      setIsExitingEdit(false);
      setIsEditing(false);
      setIsReentering(true);
      
      // After re-entrance animation, reset state
      setTimeout(() => {
        setIsReentering(false);
      }, 200);
    }, 420);
  };

  const handleCardClick = () => {
    if (showDetails) {
      // Start closing animation
      setIsClosing(true);
      setTimeout(() => {
        setShowDetails(false);
        setIsClosing(false);
      }, 300);
    } else {
      setShowDetails(true);
    }
  };

  const getCardStatus = () => {
    if (streakData.isCompletedToday) return 'completed';
    if (isCompleting) return 'active';
    return 'default';
  };

  // Determine the appropriate CSS class for the card
  const getCardClassName = () => {
    const baseClasses = [styles.card];
    
    if (streakData.isCompletedToday) baseClasses.push(styles.completed);
    if (isCompleting) baseClasses.push(styles.completing);
    if (isTransitioningToEdit) baseClasses.push(styles.transitioningToEdit);
    if (isEditing) baseClasses.push(styles.editing);
    if (isExitingEdit) baseClasses.push(styles.exitingEdit);
    if (isReentering) baseClasses.push(styles.reentering);
    
    return baseClasses.join(' ');
  };

  const getStatRewards = () => {
    const stats = [];
    if (habit.statRewards?.body) stats.push({ icon: '💪', value: habit.statRewards.body, label: 'Body' });
    if (habit.statRewards?.mind) stats.push({ icon: '🧠', value: habit.statRewards.mind, label: 'Mind' });
    if (habit.statRewards?.soul) stats.push({ icon: '✨', value: habit.statRewards.soul, label: 'Soul' });
    if (habit.statRewards?.xp) stats.push({ icon: '⭐', value: habit.statRewards.xp, label: 'XP' });
    return stats;
  };

  // Don't render anything during transition to edit
  if (isTransitioningToEdit) {
    return (
      <div className={getCardClassName()} style={{ width: '100%', height: '100%' }}>
        {/* Empty div to maintain layout during transition */}
      </div>
    );
  }

  return (
    <Card
      theme="royal-blue"
      variant="standard"
      customWidth={isEditing ? 600 : 400}
      customHeight={isEditing ? 650 : 250}
      className={getCardClassName()}
      onClick={isEditing ? undefined : handleCardClick}
      hoverable={!isEditing && !streakData.isCompletedToday}
      style={
        {
          // Stretch to fill container but with minimum dimensions
          width: '100%',
          height: 'auto',
          minWidth: isEditing ? '600px' : '400px',
          minHeight: isEditing ? '650px' : '250px',
          maxHeight: 'none',
          // Disable hover effects when editing
          ...(isEditing ? {
            transform: 'none !important',
            filter: 'none !important',
            cursor: 'default',
          } : {}),
          // Ensure frame renders properly
          isolation: 'isolate',
          // Set habit-specific color variables
          '--habit-color': '#4A90E2',
          '--streak-color': '#FF6B35',
        } as React.CSSProperties
      }
    >
      {isEditing ? (
        // Show HabitEditForm inside the card
        <div className={styles.editFormContainer} style={{ 
          width: '100%', 
          height: 'auto',
          minHeight: '580px',
          padding: '16px',
          paddingBottom: '32px',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <HabitEditForm habit={habit} onCancel={handleCancelEdit} />
        </div>
      ) : (
        // Show normal card content
        <>
          <div className={styles.header}>
            <div className={styles.content}>
              <div className={styles.titleSection}>
                <h3 className={`${styles.title} ${streakData.isCompletedToday ? styles.titleCompleted : ''}`}>
                  {habit.name}
                </h3>
                <div className={styles.autoSaveContainer}>
                  <AutoSaveIndicator isSaving={isSaving} />
                </div>
              </div>

              {habit.description && (
                <p className={`${styles.description} ${streakData.isCompletedToday ? styles.descriptionCompleted : ''}`}>
                  {habit.description}
                </p>
              )}

              <div className={styles.meta}>
                <span className={`${styles.frequency} ${styles[habit.targetFrequency]}`}>
                  {habit.targetFrequency.charAt(0).toUpperCase() + habit.targetFrequency.slice(1)} Habit
                </span>
                <span className={styles.date}>
                  {formatRelativeTime(new Date(habit.createdAt))}
                </span>
              </div>

              {/* Streak Information */}
              <div className={styles.streakInfo}>
                <div className={styles.currentStreak}>
                  <span className={styles.streakIcon}>🔥</span>
                  <span className={styles.streakValue}>{streakData.current}</span>
                  <span className={styles.streakLabel}>day streak</span>
                </div>
                {streakData.best > 0 && (
                  <div className={styles.bestStreak}>
                    <span className={styles.bestIcon}>🏆</span>
                    <span className={styles.bestValue}>{streakData.best}</span>
                    <span className={styles.bestLabel}>best</span>
                  </div>
                )}
              </div>

              {/* Rewards details */}
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
              <div className={styles.completeButtonContainer} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleComplete}
                  disabled={streakData.isCompletedToday || isCompleting}
                  className={`${styles.completeButton} ${streakData.isCompletedToday ? styles.completed : ''}`}
                  aria-label={streakData.isCompletedToday ? "Completed today" : "Complete habit"}
                >
                  {streakData.isCompletedToday ? '✓' : '○'}
                </button>
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

          {/* Integrated Habit Details */}
          {showDetails && (
            <div className={`${styles.habitDetails} ${styles.habitDetailsOpen} ${isClosing ? styles.closing : ''}`}>
              {/* Frequency */}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Frequency:</span>
                <span className={styles.detailValue}>
                  {habit.targetFrequency.charAt(0).toUpperCase() + habit.targetFrequency.slice(1)}
                </span>
              </div>

              {/* Status */}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={styles.detailValue}>
                  {streakData.isCompletedToday ? '✓ Completed Today' : '⏳ Ready to Complete'}
                </span>
              </div>

              {/* Streak Stats */}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Streak Stats:</span>
                <span className={styles.detailValue}>
                  Current: {streakData.current} | Best: {streakData.best}
                </span>
              </div>

              {/* Created Date */}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Created:</span>
                <span className={styles.detailValue}>
                  {formatRelativeTime(new Date(habit.createdAt))}
                </span>
              </div>

              {/* Last Completed */}
              {habit.lastCompleted && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Last Completed:</span>
                  <span className={styles.detailValue}>
                    {formatRelativeTime(new Date(habit.lastCompleted))}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}; 