import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '../types';
import { useTasks } from '../hooks/useTasks';
import { TaskEditForm } from './TaskEditForm';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { formatRelativeTime } from '../utils/dateUtils';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  isHighlighted?: boolean;
  triggerEdit?: boolean;
  onEditTask?: (task: Task) => void;
}

// Memoized priority color function
const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return '#ff6b6b';
    case 'medium':
      return '#feca57';
    case 'low':
      return '#48dbfb';
    default:
      return '#c8d6e5';
  }
};

// Memoized difficulty color function
const getDifficultyColor = (difficulty: number) => {
  const colors = ['#48dbfb', '#0abde3', '#54a0ff', '#5f27cd', '#ff6b6b'];
  return colors[Math.min(difficulty - 1, colors.length - 1)];
};

// Memoized card class name function
const getCardClassName = (isHighlighted: boolean, isCompleting: boolean, isTransitioningToEdit: boolean, isExitingEdit: boolean, isReentering: boolean) => {
  const baseClass = styles.taskCard;
  const classes = [baseClass];
  
  if (isHighlighted) classes.push(styles.highlighted);
  if (isCompleting) classes.push(styles.completing);
  if (isTransitioningToEdit) classes.push(styles.transitioningToEdit);
  if (isExitingEdit) classes.push(styles.exitingEdit);
  if (isReentering) classes.push(styles.reentering);
  
  return classes.join(' ');
};

// Memoized task stats component
const TaskStats = React.memo(({ task }: { task: Task }) => {
  const xpValue = task.statRewards?.xp || 10;
  const bodyValue = task.statRewards?.body || 0;
  const mindValue = task.statRewards?.mind || 0;
  const soulValue = task.statRewards?.soul || 0;

  return (
    <div className={styles.taskStats}>
      <div className={styles.statItem}>
        <span className={styles.statIcon}>⭐</span>
        <span className={styles.statValue}>{xpValue} XP</span>
      </div>
      {bodyValue > 0 && (
        <div className={styles.statItem}>
          <span className={styles.statIcon}>💪</span>
          <span className={styles.statValue}>+{bodyValue}</span>
        </div>
      )}
      {mindValue > 0 && (
        <div className={styles.statItem}>
          <span className={styles.statIcon}>🧠</span>
          <span className={styles.statValue}>+{mindValue}</span>
        </div>
      )}
      {soulValue > 0 && (
        <div className={styles.statItem}>
          <span className={styles.statIcon}>✨</span>
          <span className={styles.statValue}>+{soulValue}</span>
        </div>
      )}
    </div>
  );
});

// Memoized category badges component
const CategoryBadges = React.memo(({ categories }: { categories: string[] }) => (
  <div className={styles.categoryBadges}>
    {categories?.map((category) => (
      <span key={category} className={styles.categoryBadge}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    ))}
  </div>
));

export const TaskCardOptimized: React.FC<TaskCardProps> = React.memo(({ 
  task, 
  isHighlighted,
  triggerEdit 
}) => {
  const { toggleTask, bringTaskToTop, isSaving } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(task.completed);
  const [showDetails, setShowDetails] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Transition states for smooth animations
  const [isTransitioningToEdit, setIsTransitioningToEdit] = useState(false);
  const [isExitingEdit, setIsExitingEdit] = useState(false);
  const [isReentering, setIsReentering] = useState(false);

  // Memoized event handlers
  const handleToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (!task.completed && !isCompleting) {
      setIsCompleting(true);
      setTimeout(() => {
        toggleTask(task.id);
        setIsCompleting(false);
      }, 300);
    } else {
      toggleTask(task.id);
    }
  }, [task.completed, task.id, isCompleting, toggleTask]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isTransitioningToEdit || isEditing || isExitingEdit) {
      return;
    }
    
    setIsTransitioningToEdit(true);
    
    setTimeout(() => {
      setIsTransitioningToEdit(false);
      setIsEditing(true);
    }, 200);
  }, [isTransitioningToEdit, isEditing, isExitingEdit]);

  const handleCancelEdit = useCallback(() => {
    if (isExitingEdit || isReentering) {
      return;
    }
    
    setIsExitingEdit(true);
    
    setTimeout(() => {
      setIsExitingEdit(false);
      setIsEditing(false);
      setIsReentering(true);
      
      setTimeout(() => {
        setIsReentering(false);
      }, 200);
    }, 420);
  }, [isExitingEdit, isReentering]);

  const handleSaveEdit = useCallback(() => {
    setIsEditing(false);
    setIsReentering(true);
    
    setTimeout(() => {
      setIsReentering(false);
    }, 200);
  }, []);

  const handleTitleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  }, [showDetails]);

  const handleCardClick = useCallback(() => {
    if (!isEditing && !isTransitioningToEdit && !isExitingEdit) {
      bringTaskToTop(task.id);
    }
  }, [isEditing, isTransitioningToEdit, isExitingEdit, bringTaskToTop, task.id]);

  // Handle triggerEdit prop
  useEffect(() => {
    if (triggerEdit && !isEditing && !isTransitioningToEdit) {
      setIsTransitioningToEdit(true);
      
      setTimeout(() => {
        setIsTransitioningToEdit(false);
        setIsEditing(true);
      }, 200);
    }
  }, [triggerEdit, isEditing, isTransitioningToEdit]);

  // Memoized computed values
  const priorityColor = useMemo(() => getPriorityColor(task.priority), [task.priority]);
  const difficultyColor = useMemo(() => getDifficultyColor(task.difficulty || 1), [task.difficulty]);
  const cardClassName = useMemo(() => 
    getCardClassName(isHighlighted || false, isCompleting, isTransitioningToEdit, isExitingEdit, isReentering),
    [isHighlighted, isCompleting, isTransitioningToEdit, isExitingEdit, isReentering]
  );
  const formattedTime = useMemo(() => formatRelativeTime(task.createdAt), [task.createdAt]);

  // Memoized task stats
  const taskStats = useMemo(() => ({
    xpValue: task.statRewards?.xp || 10,
    bodyValue: task.statRewards?.body || 0,
    mindValue: task.statRewards?.mind || 0,
    soulValue: task.statRewards?.soul || 0,
  }), [task.statRewards]);

  if (isEditing) {
    return (
      <div className={styles.editContainer}>
        <TaskEditForm
          task={task}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div
      className={cardClassName}
      onClick={handleCardClick}
      style={{
        borderLeftColor: priorityColor,
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
      }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            className={styles.taskCheckbox}
            aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
          />
        </div>
        
        <div className={styles.taskInfo}>
          <div className={styles.taskHeader}>
            <h3 
              className={`${styles.taskTitle} ${task.completed ? styles.completed : ''}`}
              onClick={handleTitleClick}
            >
              {task.title}
            </h3>
            <div className={styles.taskMeta}>
              <span className={styles.taskTime}>{formattedTime}</span>
              <AutoSaveIndicator isSaving={isSaving} />
            </div>
          </div>
          
          {task.description && (
            <p className={`${styles.taskDescription} ${task.completed ? styles.completed : ''}`}>
              {task.description}
            </p>
          )}
          
          <div className={styles.taskDetails}>
            <div className={styles.taskAttributes}>
              <span 
                className={styles.priorityBadge}
                style={{ backgroundColor: priorityColor }}
              >
                {task.priority}
              </span>
              <span 
                className={styles.difficultyBadge}
                style={{ backgroundColor: difficultyColor }}
              >
                Level {task.difficulty}
              </span>
            </div>
            
            <TaskStats task={task} />
          </div>
          
          <CategoryBadges categories={task.categories} />
        </div>
        
        <div className={styles.cardActions}>
          <button
            onClick={handleEdit}
            className={styles.editButton}
            aria-label={`Edit ${task.title}`}
          >
            ✏️
          </button>
        </div>
      </div>
      
      {showDetails && (
        <div className={styles.taskDetailsExpanded}>
          <div className={styles.detailItem}>
            <strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}
          </div>
          <div className={styles.detailItem}>
            <strong>Last Updated:</strong> {new Date(task.updatedAt).toLocaleDateString()}
          </div>
          <div className={styles.detailItem}>
            <strong>Categories:</strong> {task.categories?.join(', ') || 'None'}
          </div>
        </div>
      )}
    </div>
  );
}); 