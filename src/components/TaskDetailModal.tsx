import React from 'react';
import { Task } from '../types';
import { Modal } from './Modal';
import styles from './TaskDetailModal.module.css';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3 className={`${styles.title} ${task.completed ? styles.completed : ''}`}>
              {task.title}
            </h3>
            {task.category && (
              <span className={styles.category}>
                {getCategoryIcon(task.category)} {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </span>
            )}
          </div>
          
          <div className={styles.status}>
            {task.completed ? (
              <span className={styles.completedStatus}>✓ Completed</span>
            ) : (
              <span className={styles.pendingStatus}>⏳ Pending</span>
            )}
          </div>
        </div>

        {task.description && (
          <div className={styles.descriptionSection}>
            <h4 className={styles.sectionTitle}>Description</h4>
            <div className={`${styles.description} ${task.completed ? styles.completed : ''}`}>
              {task.description}
            </div>
          </div>
        )}

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Priority:</span>
            <span className={`${styles.detailValue} ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Created:</span>
            <span className={styles.detailValue}>
              {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {task.completed && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <span className={styles.detailValue}>
                Completed
              </span>
            </div>
          )}

          {task.updatedAt && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Last Updated:</span>
              <span className={styles.detailValue}>
                {new Date(task.updatedAt).toLocaleDateString()} at {new Date(task.updatedAt).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {task.statRewards && Object.keys(task.statRewards).length > 0 && (
          <div className={styles.rewardsSection}>
            <h4 className={styles.sectionTitle}>Rewards</h4>
            <div className={styles.rewards}>
              {Object.entries(task.statRewards).map(([stat, value]) => (
                <span key={stat} className={styles.reward}>
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}: +{value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}; 