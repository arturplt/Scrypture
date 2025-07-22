import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { useTasks } from '../hooks/useTasks';
import { TaskEditForm } from './TaskEditForm';
import { formatRelativeTime } from '../utils/dateUtils';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onOpenModal?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onOpenModal }) => {
  const { toggleTask, deleteTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(task.completed);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    if (!task.completed && !isCompleting) {
      setIsCompleting(true);
      // Add a small delay for the animation
      setTimeout(() => {
        toggleTask(task.id);
        setIsCompleting(false);
      }, 300);
    } else {
      toggleTask(task.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleCardClick = () => {
    onOpenModal?.();
  };

  // Track completion state changes for animation
  useEffect(() => {
    if (task.completed && !wasCompleted) {
      setWasCompleted(true);
    } else if (!task.completed && wasCompleted) {
      setWasCompleted(false);
    }
  }, [task.completed, wasCompleted]);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return styles.priorityHigh;
      case 'medium':
        return styles.priorityMedium;
      case 'low':
        return styles.priorityLow;
      default:
        return styles.priorityMedium;
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'body':
        return '💪';
      case 'mind':
        return '🧠';
      case 'soul':
        return '✨';
      case 'career':
        return '💼';
      case 'home':
        return '🏠';
      case 'skills':
        return '🎯';
      default:
        return '📝';
    }
  };

  if (isEditing) {
    return (
      <div className={`${styles.card} ${styles.editing}`}>
        <TaskEditForm task={task} onCancel={handleCancelEdit} />
      </div>
    );
  }

  return (
    <div 
      className={`${styles.card} ${task.completed ? styles.completed : ''} ${isCompleting ? styles.completing : ''}`} 
      onClick={handleCardClick}
      style={{
        // Set XP strip variables dynamically
        ...(task.statRewards?.xp ? {
          '--xp-strip-color1': task.statRewards.xp >= 50 ? '#ffe066' : '#90EE90',
          '--xp-strip-color2': task.statRewards.xp >= 50 ? '#ffd700' : '#32CD32',
          '--xp-strip-color3': task.statRewards.xp >= 50 ? '#fffbe6' : '#98FB98',
        } : {})
      } as React.CSSProperties}
    >
      {/* XP Strip */}
      {task.statRewards?.xp > 0 && (
        <div className={styles.xpStrip} />
      )}
      <div className={styles.header}>
        <div className={styles.content}>
          <h3 className={`${styles.title} ${task.completed ? styles.titleCompleted : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`${styles.description} ${task.completed ? styles.descriptionCompleted : ''}`}>
              {task.description}
            </p>
          )}
          
          <div className={styles.meta}>
            <span className={`${styles.priority} ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
            {/* Removed old attribute label (category with icon and name) */}
            <span className={styles.date}>
              {formatRelativeTime(new Date(task.createdAt))}
            </span>
          </div>

          {/* Rewards section: show all active stat rewards */}
          {(task.statRewards && (task.statRewards?.xp > 0 || task.statRewards?.body > 0 || task.statRewards?.mind > 0 || task.statRewards?.soul > 0)) && (
            <div className={styles.rewards}>
              {task.statRewards?.xp > 0 && (
                <span className={`${styles.reward} ${styles.rewardXP}`}>
                  XP: +{task.statRewards?.xp}
                </span>
              )}
              {task.statRewards?.body > 0 && (
                <span className={`${styles.reward} ${styles.rewardBody}`}>
                  💪 Body: +{task.statRewards?.body}
                </span>
              )}
              {task.statRewards?.mind > 0 && (
                <span className={`${styles.reward} ${styles.rewardMind}`}>
                  🧠 Mind: +{task.statRewards?.mind}
                </span>
              )}
              {task.statRewards?.soul > 0 && (
                <span className={`${styles.reward} ${styles.rewardSoul}`}>
                  ✨ Soul: +{task.statRewards?.soul}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.rightSection} onClick={(e) => e.stopPropagation()}>
          <div className={styles.checkboxContainer} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggle}
              className={styles.checkbox}
            />
          </div>
          
          <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleDelete}
              className={styles.deleteButton}
              aria-label="Delete task"
            >
              ×
            </button>
            <button
              onClick={handleEdit}
              className={styles.editButton}
              aria-label="Edit task"
            >
              ✎
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 