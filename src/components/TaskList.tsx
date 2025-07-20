import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { Task } from '../types';
import styles from './TaskList.module.css';

export const TaskList: React.FC = () => {
  const { tasks } = useTasks();
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Separate active and completed tasks
  const activeTasks = tasks.filter(task => !task.completed).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const completedTasks = tasks.filter(task => task.completed).sort((a, b) => {
    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
  });

  // Combined tasks for modal navigation
  const sortedTasks = [...activeTasks, ...completedTasks];

  const handleOpenModal = (taskIndex: number) => {
    setSelectedTaskIndex(taskIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskIndex(null);
  };

  const handleNextTask = () => {
    if (selectedTaskIndex !== null && selectedTaskIndex < sortedTasks.length - 1) {
      setSelectedTaskIndex(selectedTaskIndex + 1);
    }
  };

  const handlePreviousTask = () => {
    if (selectedTaskIndex !== null && selectedTaskIndex > 0) {
      setSelectedTaskIndex(selectedTaskIndex - 1);
    }
  };

  const selectedTask = selectedTaskIndex !== null ? sortedTasks[selectedTaskIndex] : null;
  const hasNext = selectedTaskIndex !== null && selectedTaskIndex < sortedTasks.length - 1;
  const hasPrevious = selectedTaskIndex !== null && selectedTaskIndex > 0;

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>✨</div>
        <h3 className={styles.emptyTitle}>No tasks yet</h3>
        <p className={styles.emptyDescription}>
          Create your first task to begin your journey
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Active Tasks Section */}
      {activeTasks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.title}>Active Tasks</h2>
          <div className={styles.taskGrid}>
            {activeTasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onOpenModal={() => handleOpenModal(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.title}>Completed Tasks</h2>
          <div className={styles.taskGrid}>
            {completedTasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onOpenModal={() => handleOpenModal(activeTasks.length + index)}
              />
            ))}
          </div>
        </div>
      )}
      
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNext={handleNextTask}
        onPrevious={handlePreviousTask}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </div>
  );
}; 