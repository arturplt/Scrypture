import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskForm } from './TaskForm';
import { Task } from '../types';
import styles from './TaskList.module.css';
import { categoryService } from '../services/categoryService';

export const TaskList: React.FC = () => {
  const { tasks, deleteTask, refreshTasks } = useTasks();
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'date'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Core attributes are now separate from categories - no filtering needed
  const [allCategories, setAllCategories] = useState<{ name: string; icon: string }[]>([]);
  useEffect(() => {
    setAllCategories(categoryService.getAllCategories());
    // Listen for custom event to refresh categories
    const handler = () => {
      setAllCategories(categoryService.getAllCategories());
      refreshTasks(); // Auto-save/refresh tasks after new category
    };
    window.addEventListener('customCategoryAdded', handler);
    return () => {
      window.removeEventListener('customCategoryAdded', handler);
    };
  }, []);

  // Filter and sort active tasks
  const activeTasks = tasks.filter(task => !task.completed).filter(task => {
    if (selectedCategory) {
      return task.category === selectedCategory;
    }
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    // Remove category sort logic
    if (sortBy === 'priority') {
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
    setIsEditMode(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskIndex(null);
    setIsEditMode(false);
    setTaskToEdit(null);
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
    if (selectedTask) {
      setTaskToEdit(selectedTask);
      setIsEditMode(true);
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      handleCloseModal();
    }
  };

  const handleSaveEdit = () => {
    setIsEditMode(false);
    setTaskToEdit(null);
    // Refresh tasks from storage to ensure latest data
    refreshTasks();
    // Always find the updated task by ID in the current sortedTasks
    if (selectedTaskIndex !== null) {
      const prevTaskId = sortedTasks[selectedTaskIndex]?.id;
      // Find the updated task's new index by ID
      const newIndex = sortedTasks.findIndex(t => t.id === prevTaskId);
      setSelectedTaskIndex(newIndex !== -1 ? newIndex : null);
    }
    // Modal remains open to show the updated task
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setTaskToEdit(null);
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
                  {allCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort Controls */}
              <div className={styles.sortControls}>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'priority' | 'date')}
                  className={styles.sortSelect}
                >
                  {/* <option value="category">📂 Category</option> */}
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
      
      {/* Task Detail Modal */}
      {!isEditMode && (
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
      )}

      {/* Edit Form Modal */}
      {isEditMode && taskToEdit && (
        <div className={styles.editModal}>
          <div className={styles.editModalContent}>
            <div className={styles.editModalHeader}>
              <h2>Edit Task</h2>
              <button 
                onClick={handleCloseModal}
                className={styles.closeButton}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <TaskForm 
              taskToEdit={taskToEdit}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 