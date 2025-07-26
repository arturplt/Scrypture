import React from 'react';
import { useTasks } from '../hooks/useTasks';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './TaskCounter.module.css';

interface TaskCounterProps {
  className?: string;
}

export const TaskCounter: React.FC<TaskCounterProps> = ({ className }) => {
  const { tasks, isSaving } = useTasks();

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className={`${styles.counter} ${className || ''}`}>
      <div className={styles.counterContent}>
        <span className={styles.label}>Tasks Completed</span>
        <span className={styles.count}>
          {completedTasks} / {totalTasks}
        </span>
      </div>
      <AutoSaveIndicator isSaving={isSaving} />
    </div>
  );
};
