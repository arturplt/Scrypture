import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '../types';
import { useTasks } from '../hooks/useTasks';
import { TaskEditForm } from './TaskEditForm';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { formatRelativeTime } from '../utils/dateUtils';
import { Card } from './ui';
import { getSpriteById } from '../data/atlasMapping';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  isHighlighted?: boolean;
  triggerEdit?: boolean;
  onEditTask?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
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
  
  // New transition states for smooth animations
  const [isTransitioningToEdit, setIsTransitioningToEdit] = useState(false);
  const [isExitingEdit, setIsExitingEdit] = useState(false);
  const [isReentering, setIsReentering] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState<{width: number, height: number}>({width: 400, height: 250});
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ResizeObserver to track container dimensions changes
  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const contentHeight = contentRef.current.scrollHeight;
      
      // Calculate base minimum height based on state
      let minHeight = 215; // Reduced default collapsed height
      if (isEditing) {
        minHeight = 650; // Edit form height
      } else if (showDetails) {
        // For details, use actual content height with minimal padding
        minHeight = Math.max(contentHeight + 16, 300); // Reduced minimum for details
      }
      
      setContainerDimensions({
        width: containerWidth,
        height: Math.max(contentHeight + 16, minHeight) // Reduced padding for more dynamic sizing
      });
    }
  }, [isEditing, showDetails]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateContainerDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    // Initial measurement
    updateContainerDimensions();
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [updateContainerDimensions]);

  // Update dimensions when content changes
  useEffect(() => {
    const timer = setTimeout(updateContainerDimensions, 100);
    return () => clearTimeout(timer);
  }, [showDetails, isEditing, task.description, task.title, updateContainerDimensions]);

  // Additional dimension update specifically for details expansion
  useEffect(() => {
    if (showDetails) {
      // Wait for the animation to start, then update dimensions
      const timer1 = setTimeout(updateContainerDimensions, 50);
      const timer2 = setTimeout(updateContainerDimensions, 200);
      const timer3 = setTimeout(updateContainerDimensions, 450); // After slideDown animation completes (400ms) + buffer
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      // When details are hidden, wait for slideUp animation to complete
      const timer = setTimeout(updateContainerDimensions, 350); // Wait for slideUp animation (300ms) + buffer
      return () => clearTimeout(timer);
    }
  }, [showDetails, updateContainerDimensions]);

  // Also respond to window resizes explicitly
  useEffect(() => {
    const onResize = () => updateContainerDimensions();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateContainerDimensions]);

  // Handle triggerEdit prop - automatically start edit transition
  useEffect(() => {
    if (triggerEdit && !isEditing && !isTransitioningToEdit) {
      // Start transition animation
      setIsTransitioningToEdit(true);
      
      // After transition animation completes, show edit form
      setTimeout(() => {
        setIsTransitioningToEdit(false);
        setIsEditing(true);
      }, 200);
    }
  }, [triggerEdit, isEditing, isTransitioningToEdit]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Always use the inline edit functionality
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
    }, 200); // Match faster animation duration
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
      }, 200); // Match faster animation duration
    }, 420); // Match new exit animation duration
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    bringTaskToTop(task.id);
  };

  const handleCardClick = () => {
    if (showDetails) {
      // Start closing animation
      setIsClosing(true);
      setTimeout(() => {
        setShowDetails(false);
        setIsClosing(false);
        // Wait for internal animation to complete before shrinking frame
        setTimeout(updateContainerDimensions, 350); // Wait for slideUp animation (300ms) + buffer
      }, 300); // Match slideUp animation duration
    } else {
      setShowDetails(true);
      // Force dimension update after showing details
      setTimeout(updateContainerDimensions, 50);
    }
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

  const getDifficultyColor = (difficulty: number) => {
    // Use exact difficulty level colors (1-10)
    if (difficulty <= 3) return styles.difficultyEasy;
    if (difficulty <= 5) return styles.difficultyMedium;
    if (difficulty <= 7) return styles.difficultyHard;
    if (difficulty <= 10) return styles.difficultyExtreme;
    return styles.difficultyExtreme; // Fallback for any higher values
  };

  // Sprite renderer component for edit icon
  const EditIconSprite = () => {
    const [atlasImage, setAtlasImage] = useState<HTMLImageElement | null>(null);
    const editSprite = getSpriteById('icon-edit');

    useEffect(() => {
      const img = new Image();
      img.onload = () => setAtlasImage(img);
      img.src = '/assets/Frames/Atlas.png';
    }, []);

    if (!editSprite || !atlasImage) {
      return <span>🖍</span>; // Fallback to emoji
    }

    return (
      <canvas
        width={32}
        height={32}
        style={{
          width: '32px',
          height: '32px',
          imageRendering: 'pixelated',
        } as React.CSSProperties}
        ref={(canvas) => {
          if (canvas && atlasImage) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Disable image smoothing for crisp pixels
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(
                atlasImage,
                editSprite.x,
                editSprite.y,
                editSprite.width,
                editSprite.height,
                0,
                0,
                32,
                32
              );
            }
          }
        }}
      />
    );
  };



  // Determine the appropriate CSS class for the card
  const getCardClassName = () => {
    const baseClasses = [styles.card];
    
    if (task.completed) baseClasses.push(styles.completed);
    if (isCompleting) baseClasses.push(styles.completing);
    if (isTransitioningToEdit) baseClasses.push(styles.transitioningToEdit);
    if (isEditing) baseClasses.push(styles.editing);
    if (isExitingEdit) baseClasses.push(styles.exitingEdit);
    if (isReentering) baseClasses.push(styles.reentering);
    if (isHighlighted) baseClasses.push(styles.highlighted);
    
    return baseClasses.join(' ');
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
    <div ref={containerRef} className={styles.cardWrapper} style={{ width: '100%' }}>
      <Card
        theme="gunmetal"
        variant="standard"
        customWidth={containerDimensions.width}
        customHeight={containerDimensions.height}
        className={getCardClassName()}
        onClick={undefined}
        hoverable={false}
      style={
        {
          // Force full width expansion
          width: '100% !important',
          height: 'auto',
          minWidth: '100%',
          minHeight: 'auto',
          maxWidth: 'none !important',
          maxHeight: 'none',
          // Always disable hover effects on the container
          transform: 'none !important',
          filter: 'none !important',
          cursor: 'default',
          // Ensure frame renders properly
          isolation: 'isolate',
          // Set XP strip variables dynamically
          ...(task.statRewards?.xp
            ? {
                '--xp-strip-color1':
                  task.statRewards.xp >= 50 ? '#ffe066' : '#90EE90',
                '--xp-strip-color2':
                  task.statRewards.xp >= 50 ? '#ffd700' : '#32CD32',
                '--xp-strip-color3':
                  task.statRewards.xp >= 50 ? '#fffbe6' : '#98FB98',
              }
            : {}),
          // Set category strip variables
          ...(task.statRewards?.body
            ? { '--body-strip-color': 'var(--color-body)' }
            : {}),
          ...(task.statRewards?.mind
            ? { '--mind-strip-color': 'var(--color-mind)' }
            : {}),
          ...(task.statRewards?.soul
            ? { '--soul-strip-color': 'var(--color-soul)' }
            : {}),
        } as React.CSSProperties
      }
    >
      {/* XP Strip with Category Colors */}
      {((task.statRewards?.xp && task.statRewards.xp > 0) ||
        (task.statRewards?.body && task.statRewards.body > 0) ||
        (task.statRewards?.mind && task.statRewards.mind > 0) ||
        (task.statRewards?.soul && task.statRewards.soul > 0)) && (
        <div className={styles.xpStrip}>
          {/* Category color strips with staggered animations */}
          {task.statRewards?.body && task.statRewards.body > 0 && (
            <div
              className={styles.categoryStrip}
              style={{
                background: 'var(--body-strip-color)',
                animationDelay: '0s',
              }}
            />
          )}
          {task.statRewards?.mind && task.statRewards.mind > 0 && (
            <div
              className={styles.categoryStrip}
              style={{
                background: 'var(--mind-strip-color)',
                animationDelay: '1.33s',
              }}
            />
          )}
          {task.statRewards?.soul && task.statRewards.soul > 0 && (
            <div
              className={styles.categoryStrip}
              style={{
                background: 'var(--soul-strip-color)',
                animationDelay: '2.66s',
              }}
            />
          )}
        </div>
      )}

      {isEditing ? (
        // Show TaskEditForm inside the card
        <div 
          ref={contentRef}
          className={styles.editFormContainer} 
          style={{ 
            width: '100%', 
            height: 'auto',
            minHeight: '580px',
            padding: '16px',
            paddingBottom: '32px',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <TaskEditForm task={task} onCancel={handleCancelEdit} />
        </div>
      ) : (
        // Show normal card content with clickable content area
        <div ref={contentRef} className={styles.cardContent} onClick={handleCardClick}>
          <div className={styles.header}>
            <div className={styles.content}>
              <div className={styles.titleSection}>
                <h3
                  className={`${styles.title} ${task.completed ? styles.titleCompleted : ''}`}
                  onClick={handleTitleClick}
                >
                  {task.title}
                </h3>
                <div className={styles.autoSaveContainer}>
                  <AutoSaveIndicator isSaving={isSaving} />
                </div>
              </div>

              {task.description && (
                <p
                  className={`${styles.description} ${task.completed ? styles.descriptionCompleted : ''}`}
                >
                  {task.description}
                </p>
              )}

              <div className={styles.meta}>
                <span
                  className={`${styles.priority} ${getPriorityColor(task.priority)}`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{' '}
                  Priority
                </span>
                {task.difficulty !== undefined && task.difficulty > 0 && (
                  <span
                    className={`${styles.difficulty} ${getDifficultyColor(task.difficulty)}`}
                  >
                    {task.difficulty}
                  </span>
                )}
                <span className={styles.date}>
                  {formatRelativeTime(new Date(task.createdAt))}
                </span>
              </div>

              {/* Rewards details - hidden until hover */}
              {task.statRewards &&
                ((task.statRewards.xp ?? 0) > 0 ||
                  (task.statRewards.body ?? 0) > 0 ||
                  (task.statRewards.mind ?? 0) > 0 ||
                  (task.statRewards.soul ?? 0) > 0) && (
                  <div className={styles.rewards}>
                    {(task.statRewards.xp ?? 0) > 0 && (
                      <span className={`${styles.reward} ${styles.rewardXP}`}>
                        XP: +{task.statRewards.xp}
                      </span>
                    )}
                    {(task.statRewards.body ?? 0) > 0 && (
                      <span className={`${styles.reward} ${styles.rewardBody}`}>
                        💪 Body: +{task.statRewards.body}
                      </span>
                    )}
                    {(task.statRewards.mind ?? 0) > 0 && (
                      <span className={`${styles.reward} ${styles.rewardMind}`}>
                        🧠 Mind: +{task.statRewards.mind}
                      </span>
                    )}
                    {(task.statRewards.soul ?? 0) > 0 && (
                      <span className={`${styles.reward} ${styles.rewardSoul}`}>
                        ✨ Soul: +{task.statRewards.soul}
                      </span>
                    )}
                  </div>
                )}
            </div>

            <div
              className={styles.rightSection}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={handleToggle}
                  disabled={isCompleting}
                  className={styles.taskCheckbox}
                  aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                />
              </div>
            </div>
          </div>

          {/* Integrated Task Details */}
          {showDetails && (
            <div className={`${styles.taskDetails} ${styles.taskDetailsOpen} ${isClosing ? styles.closing : ''}`}>
              {/* Categories */}
              {task.categories && task.categories.length > 0 && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Categories:</span>
                  <div className={styles.categoriesList}>
                    {task.categories.map((category, index) => (
                      <span key={index} className={styles.categoryTag}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={styles.detailValue}>
                  {task.completed ? '✓ Completed' : '⏳ Pending'}
                </span>
              </div>

              {/* Created Date */}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Created:</span>
                <span className={styles.detailValue}>
                  {formatRelativeTime(new Date(task.createdAt))}
                </span>
              </div>

              {/* Updated Date */}
              {task.updatedAt && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Last Updated:</span>
                  <span className={styles.detailValue}>
                    {formatRelativeTime(new Date(task.updatedAt))}
                  </span>
                </div>
              )}
            </div>
          )}
          {/* Edit button fixed to bottom-left */}
          <div className={styles.editCorner} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleEdit}
              className={styles.editButton}
              aria-label="Edit task"
            >
              <EditIconSprite />
            </button>
          </div>
        </div>
      )}
      </Card>
      

    </div>
  );
};
