import React from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

export const TaskList: React.FC = () => {
  const { tasks } = useTasks();
  
  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion status first, then by priority, then by creation date
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>✨</div>
        <h3 className={styles.emptyTitle}>No tasks yet</h3>
        <p className={styles.emptyDescription}>
          Create your first task to begin your mystical journey
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Tasks</h2>
      <div className={styles.taskGrid}>
        {sortedTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}; 