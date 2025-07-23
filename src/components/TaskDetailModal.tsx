import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { Modal } from './Modal';

import { TaskEditForm } from './TaskEditForm';
import { formatRelativeTime } from '../utils/dateUtils';
import styles from './TaskDetailModal.module.css';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}) => {
  // Navigation state for swipe/drag functionality
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance required to trigger navigation (in px)
  const minSwipeDistance = 50;

  // Unified drag handling for both touch and mouse events
  const handleDragStart = (clientX: number) => {
    setDragEnd(null);
    setDragStart(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (isDragging) {
      setDragEnd(clientX);
    }
  };

  const handleDragEnd = () => {
    if (!dragStart || !dragEnd || !isDragging) return;

    // Calculate swipe distance and direction
    const distance = dragStart - dragEnd;
    const isLeftSwipe = distance > minSwipeDistance; // Swipe left = next task
    const isRightSwipe = distance < -minSwipeDistance; // Swipe right = previous task

    // Navigate based on swipe direction and availability
    if (isLeftSwipe && hasNext && onNext) {
      onNext();
    } else if (isRightSwipe && hasPrevious && onPrevious) {
      onPrevious();
    }

    setIsDragging(false);
  };

  // Touch event handlers for mobile devices
  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers for desktop devices
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDragMove(e.clientX);
    }
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  // Global mouse event listeners for seamless drag tracking
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientX);
      };

      const handleGlobalMouseUp = () => {
        handleDragEnd();
      };

      // Add global listeners to track mouse even when cursor leaves the modal
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, dragEnd]);

  if (!task) return null;

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

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };



  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
        <div
          className={styles.container}
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          {/* Navigation bar with clickable buttons and swipe indicators */}
          <div className={styles.navigationBar}>
            {hasPrevious && (
              <button
                className={`${styles.navIndicator} ${styles.navPrevious}`}
                onClick={onPrevious}
                aria-label="Go to previous task"
              >
                ← Previous
              </button>
            )}
            {hasNext && (
              <button
                className={`${styles.navIndicator} ${styles.navNext}`}
                onClick={onNext}
                aria-label="Go to next task"
              >
                Next →
              </button>
            )}
          </div>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h3
                className={`${styles.title} ${task.completed ? styles.completed : ''}`}
              >
                {task.title}
              </h3>
              {task.category && (
                <span className={styles.category}>
                  {getCategoryIcon(task.category)}{' '}
                  {task.category.charAt(0).toUpperCase() +
                    task.category.slice(1)}
                </span>
              )}
            </div>

            <div className={styles.headerActions}>
              <div className={styles.status}>
                {task.completed ? (
                  <span className={styles.completedStatus}>✓ Completed</span>
                ) : (
                  <span className={styles.pendingStatus}>⏳ Pending</span>
                )}
              </div>

              <div className={styles.actionButtons}>
                <button
                  onClick={handleEdit}
                  className={styles.editButton}
                  aria-label="Edit task"
                >
                  🖍
                </button>
              </div>
            </div>
          </div>

          {task.description && (
            <div className={styles.descriptionSection}>
              <h4 className={styles.sectionTitle}>Description</h4>
              <div
                className={`${styles.description} ${task.completed ? styles.completed : ''}`}
              >
                {task.description}
              </div>
            </div>
          )}

          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Priority:</span>
              <span
                className={`${styles.detailValue} ${getPriorityColor(task.priority)}`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Created:</span>
              <span className={styles.detailValue}>
                {formatRelativeTime(new Date(task.createdAt))}
              </span>
            </div>

            {task.completed && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={styles.detailValue}>Completed</span>
              </div>
            )}

            {task.updatedAt && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Last Updated:</span>
                <span className={styles.detailValue}>
                  {formatRelativeTime(new Date(task.updatedAt))}
                </span>
              </div>
            )}
          </div>

          <div className={styles.rewardsSection}>
            <h4 className={styles.sectionTitle}>Rewards</h4>
            <div className={styles.rewards}>
              {task.statRewards?.xp > 0 && (
                <span
                  className={styles.reward}
                  style={{
                    color: 'var(--color-bg-primary)',
                    background: 'var(--color-accent-gold)',
                    borderColor: 'var(--color-accent-gold)',
                    fontWeight: 'bold',
                  }}
                >
                  XP: +{task.statRewards?.xp}
                </span>
              )}
              {task.statRewards?.body > 0 && (
                <span
                  className={styles.reward}
                  style={{
                    color: 'var(--color-bg-primary)',
                    background: 'var(--color-body)',
                    borderColor: 'var(--color-body)',
                  }}
                >
                  💪 Body: +{task.statRewards?.body}
                </span>
              )}
              {task.statRewards?.mind > 0 && (
                <span
                  className={styles.reward}
                  style={{
                    color: 'var(--color-bg-primary)',
                    background: 'var(--color-mind)',
                    borderColor: 'var(--color-mind)',
                  }}
                >
                  🧠 Mind: +{task.statRewards?.mind}
                </span>
              )}
              {task.statRewards?.soul > 0 && (
                <span
                  className={styles.reward}
                  style={{
                    color: 'var(--color-bg-primary)',
                    background: 'var(--color-soul)',
                    borderColor: 'var(--color-soul)',
                  }}
                >
                  ✨ Soul: +{task.statRewards?.soul}
                </span>
              )}
              {(!task.statRewards ||
                (!task.statRewards.xp &&
                  !task.statRewards.body &&
                  !task.statRewards.mind &&
                  !task.statRewards.soul)) && (
                <span
                  className={styles.reward}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  No rewards for this task.
                </span>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Custom Confirmation Modal for Delete */}

      {/* Separate Edit Modal */}
      {showEditForm && task && (
        <Modal
          isOpen={showEditForm}
          onClose={handleEditCancel}
          title="Edit Task"
        >
          <div className={styles.editModalContent}>
            <TaskEditForm task={task} onCancel={handleEditCancel} />
          </div>
        </Modal>
      )}
    </>
  );
};
