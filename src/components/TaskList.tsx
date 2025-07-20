import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { Task } from '../types';
import styles from './TaskList.module.css';

export const TaskList: React.FC = () => {
  const { tasks, deleteTask } = useTasks();
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'category' | 'priority' | 'date'>('category');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Filter and sort active tasks
  const activeTasks = tasks.filter(task => !task.completed).filter(task => {
    if (selectedCategory) {
      return task.category === selectedCategory;
    }
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'category') {
      const categoryOrder: Record<string, number> = { body: 1, mind: 2, soul: 3, career: 4, home: 5, skills: 6 };
      const categoryA = a.category || 'body';
      const categoryB = b.category || 'body';
      comparison = categoryOrder[categoryA] - categoryOrder[categoryB];
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'date') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
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

  const handleEditTask = () => {
    // For now, just close the modal - edit functionality can be added later
    handleCloseModal();
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      handleCloseModal();
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
          <div className={styles.sectionHeader}>
            <h2 className={styles.title}>Active Tasks</h2>
            <div className={styles.controls}>
              {/* Category Filter */}
              <div className={styles.categoryFilter}>
                <select 
                  value={selectedCategory || ''} 
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className={styles.categorySelect}
                >
                  <option value="">All Categories</option>
                  <option value="body">💪 Body</option>
                  <option value="mind">🧠 Mind</option>
                  <option value="soul">✨ Soul</option>
                  <option value="career">💼 Career</option>
                  <option value="home">🏠 Home</option>
                  <option value="skills">🎯 Skills</option>
                </select>
              </div>
              
              {/* Sort Controls */}
              <div className={styles.sortControls}>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'category' | 'priority' | 'date')}
                  className={styles.sortSelect}
                >
                  <option value="category">📂 Category</option>
                  <option value="priority">⚡ Priority</option>
                  <option value="date">📅 Date</option>
                </select>
                
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={styles.sortButton}
                  aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
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
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onNext={handleNextTask}
        onPrevious={handlePreviousTask}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </div>
  );
}; 