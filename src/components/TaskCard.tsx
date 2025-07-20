import React, { useState } from 'react';
import { Task } from '../types';
import { useTasks } from '../hooks/useTasks';
import { TaskEditForm } from './TaskEditForm';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { toggleTask, deleteTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

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

  if (isEditing) {
    return (
      <div className={`${styles.card} ${styles.editing}`}>
        <TaskEditForm task={task} onCancel={handleCancelEdit} />
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${task.completed ? styles.completed : ''}`}>
      <div className={styles.header}>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            className={styles.checkbox}
          />
        </div>
        
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
            <span className={styles.date}>
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button
            onClick={handleEdit}
            className={styles.editButton}
            aria-label="Edit task"
          >
            ✎
          </button>
          <button
            onClick={handleDelete}
            className={styles.deleteButton}
            aria-label="Delete task"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}; 