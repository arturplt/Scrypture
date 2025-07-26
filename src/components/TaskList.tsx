import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Task } from '../types';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './TaskList.module.css';
import { categoryService } from '../services/categoryService';

export interface TaskListRef {
  navigateToTask: (taskId: string) => void;
  highlightTask: (taskId: string) => void;
}

interface TaskListProps {
  onEditTask?: (task: Task) => void;
}

export const TaskList = forwardRef<TaskListRef, TaskListProps>((props, ref) => {
  const { onEditTask } = props;
  const { tasks, deleteTask, refreshTasks, isSaving } = useTasks();
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'xp'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [triggerEditTaskId, setTriggerEditTaskId] = useState<string | null>(null); // New state for triggering edit
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Core attributes are now separate from categories - no filtering needed
  const [allCategories, setAllCategories] = useState<
    { name: string; icon: string }[]
  >([]);
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

  // Filter out empty categories for the dropdown only
  const getCategoriesWithTasks = () => {
    if (!tasks || tasks.length === 0) {
      // If no tasks exist, show no categories in filter dropdown
      return [];
    }
    
    // Get unique categories that have tasks
    const categoriesWithTasks = new Set(
      tasks.flatMap(task => task.categories || ['uncategorized'])
    );
    
    // Only show categories that actually have tasks in the filter dropdown
    return allCategories.filter(category => 
      categoriesWithTasks.has(category.name)
    );
  };

  const categoriesWithTasks = getCategoriesWithTasks();

  // Expose navigateToTask method via ref
  useImperativeHandle(ref, () => ({
    navigateToTask: (taskId: string) => {
      // Find the task in the sorted tasks array
      const taskIndex = sortedTasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        setIsEditMode(false);
        // Also highlight the task
        setHighlightedTaskId(taskId);
        // Trigger inline edit for the task
        setTriggerEditTaskId(taskId);
        const el = taskRefs.current[taskId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => {
          setHighlightedTaskId(null);
          setTriggerEditTaskId(null); // Clear trigger after a delay
        }, 3000);
      }
    },
    highlightTask: (taskId: string) => {
      setHighlightedTaskId(taskId);
      const el = taskRefs.current[taskId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => setHighlightedTaskId(null), 2000);
    },
  }));

  // Search function to check if task matches keyword
  const taskMatchesSearch = (task: Task, keyword: string): boolean => {
    if (!keyword.trim()) return true;
    
    const searchTerm = keyword.toLowerCase().trim();
    const titleMatch = task.title.toLowerCase().includes(searchTerm);
    const descriptionMatch = task.description?.toLowerCase().includes(searchTerm) || false;
    const categoryMatch = (task.categories && task.categories.some(cat => cat.toLowerCase().includes(searchTerm))) || false;
    
    return titleMatch || descriptionMatch || categoryMatch;
  };

  // Filter and sort active tasks
  const activeTasks = tasks
    .filter((task) => !task.completed)
    .filter((task) => {
      if (selectedCategory) {
        return task.categories && task.categories.includes(selectedCategory);
      }
      return true;
    })
    .sort((a, b) => {
      // First, prioritize search matches
      const aMatchesSearch = taskMatchesSearch(a, searchKeyword);
      const bMatchesSearch = taskMatchesSearch(b, searchKeyword);
      
      if (aMatchesSearch && !bMatchesSearch) return -1;
      if (!aMatchesSearch && bMatchesSearch) return 1;
      
      // Then apply normal sorting
      let comparison = 0;

      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'date') {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'xp') {
        const aXp = a.statRewards?.xp || 0;
        const bXp = b.statRewards?.xp || 0;
        comparison = aXp - bXp;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const completedTasks = tasks
    .filter((task) => task.completed)
    .sort((a, b) => {
      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
    });

  // Group active tasks by category
  const groupedActiveTasks = activeTasks.reduce((groups, task) => {
    // Use the first category for grouping, or 'Uncategorized' if none
    const category = (task.categories && task.categories.length > 0) ? task.categories[0] : 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  // Combined tasks for modal navigation
  const sortedTasks = [...activeTasks, ...completedTasks];

  const handleCloseModal = () => {
    setIsEditMode(false);
    setTaskToEdit(null);
  };

  const handleSaveEdit = () => {
    setIsEditMode(false);
    setTaskToEdit(null);
    // Refresh tasks from storage to ensure latest data
    refreshTasks();
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setTaskToEdit(null);
  };

  const toggleCategoryCollapse = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = allCategories.find(cat => cat.name === categoryName);
    return category?.icon || '📝';
  };

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
            <div className={styles.headerContent}>
              <h2 className={styles.title}>Active Tasks</h2>
              <AutoSaveIndicator isSaving={isSaving} />
            </div>
            <div className={styles.controls}>
              {/* Search Input */}
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className={styles.searchInput}
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className={styles.clearSearchButton}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className={styles.categoryFilter}>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className={styles.categorySelect}
                >
                  <option value="">All Categories</option>
                  {categoriesWithTasks.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon}{' '}
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Controls */}
              <div className={styles.sortControls}>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'priority' | 'date' | 'xp')
                  }
                  className={styles.sortSelect}
                >
                  {/* <option value="category">📂 Category</option> */}
                  <option value="priority">⚡ Priority</option>
                  <option value="date">📅 Date</option>
                  <option value="xp">⭐ XP</option>
                </select>

                <button
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                  className={styles.sortButton}
                  aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Grouped Tasks by Category */}
          <div className={styles.categoryGroups}>
            {Object.entries(groupedActiveTasks).map(([category, categoryTasks]) => {
              const isCollapsed = collapsedCategories.has(category);
              const categoryIcon = getCategoryIcon(category);
              
              return (
                <div key={category} className={styles.categoryGroup}>
                  <button
                    className={styles.categoryHeader}
                    onClick={() => toggleCategoryCollapse(category)}
                    aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${category} category`}
                  >
                    <div className={styles.categoryIcon}>
                      <span className={styles.icon32x32}>{categoryIcon}</span>
                    </div>
                    <div className={styles.categoryInfo}>
                      <h3 className={styles.categoryTitle}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h3>
                      <span className={styles.categoryCount}>
                        {categoryTasks.length} task{categoryTasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className={styles.collapseIcon}>
                      {isCollapsed ? '▼' : '▲'}
                    </div>
                  </button>
                  
                  {!isCollapsed && (
                    <div className={styles.categoryTasks}>
                      {categoryTasks.map((task, index) => {
                        // Find the task's index in the full sorted tasks array
                        const taskIndex = activeTasks.findIndex(t => t.id === task.id);
                        return (
                          <div
                            key={task.id}
                            ref={el => taskRefs.current[task.id] = el}
                          >
                            <TaskCard
                              task={task}
                              isHighlighted={highlightedTaskId === task.id}
                              onEditTask={onEditTask}
                              triggerEdit={triggerEditTaskId === task.id}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerContent}>
              <h2 className={styles.title}>Completed Tasks</h2>
              <AutoSaveIndicator isSaving={isSaving} />
            </div>
          </div>
          <div className={styles.taskGrid}>
            {completedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))}
          </div>
        </div>
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
});
