import React from 'react';
import { useTasks } from '../hooks/useTasks';
import styles from './TaskCounter.module.css';

interface TaskCounterProps {
  className?: string;
}

export const TaskCounter: React.FC<TaskCounterProps> = ({ className }) => {
  const { tasks } = useTasks();
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  
  return (
    <div className={`${styles.counter} ${className || ''}`}>
      <span className={styles.label}>Tasks Completed</span>
      <span className={styles.count}>
        {completedTasks} / {totalTasks}
      </span>
    </div>
  );
}; 