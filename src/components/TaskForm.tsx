import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { taskService } from '../services/taskService';
import { categoryService } from '../services/categoryService';
import { storageService } from '../services/storageService';
import { CategoryModal } from './CategoryModal';
import { Task } from '../types';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  taskToEdit?: Task;
  onCancel?: () => void;
  onSave?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ taskToEdit, onCancel, onSave }) => {
  const { addTask, updateTask, refreshTasks } = useTasks();
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [category, setCategory] = useState<string>(taskToEdit?.category || 'body');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(taskToEdit?.priority || 'medium');
  const [isExpanded, setIsExpanded] = useState(!!taskToEdit);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<Array<{ 
    name: string; 
    icon: string; 
    color: string;
    points: {
      body: number;
      mind: number;
      soul: number;
    };
  }>>([]);
  const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditMode = !!taskToEdit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    if (isEditMode && taskToEdit) {
      // Update existing task
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
      });
      onSave?.();
    } else {
      // Create new task
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        completed: false,
        priority,
      });
    }
    
    // Reset form only if not in edit mode
    if (!isEditMode) {
      setTitle('');
      setDescription('');
      setCategory('body');
      setPriority('medium');
    }
  };

  const handleInvalid = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleTitleClick = () => {
    setIsExpanded(true);
  };

  const handleTitleBlur = (e: React.FocusEvent) => {
    // Only minimize if clicking outside the entire form and not in edit mode
    const formElement = e.currentTarget.closest('form');
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    if (!isEditMode && !title.trim() && (!relatedTarget || !formElement?.contains(relatedTarget))) {
      setIsExpanded(false);
    }
  };

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 300; // Match CSS max-height
      
      if (scrollHeight <= maxHeight) {
        textareaRef.current.style.height = scrollHeight + 'px';
        textareaRef.current.style.overflowY = 'hidden';
      } else {
        textareaRef.current.style.height = maxHeight + 'px';
        textareaRef.current.style.overflowY = 'auto';
      }
    }
  };

  // Load custom categories on mount and refresh when needed
  useEffect(() => {
    const categories = categoryService.getCustomCategories();
    console.log('Loading custom categories:', categories);
    console.log('Setting custom categories state:', categories);
    setCustomCategories(categories);
  }, [categoryRefreshTrigger]); // Refresh when trigger changes

  // Auto-resize textarea when description changes
  useEffect(() => {
    autoResizeTextarea();
  }, [description]);

  const priorityOptions = [
    { value: 'low', label: 'LOW PRIORITY', color: 'var(--color-easy)' },
    { value: 'medium', label: 'MEDIUM PRIORITY', color: 'var(--color-focus)' },
    { value: 'high', label: 'HIGH PRIORITY', color: 'var(--color-urgent)' },
  ];

  const defaultCategories = [
    { name: 'body', icon: '💪', label: 'BODY', color: 'var(--color-body)' },
    { name: 'mind', icon: '🧠', label: 'MIND', color: 'var(--color-mind)' },
    { name: 'soul', icon: '✨', label: 'SOUL', color: 'var(--color-soul)' },
  ];

  const allCategories = [...defaultCategories, ...customCategories.map(cat => ({
    name: cat.name.toLowerCase(),
    icon: cat.icon,
    label: cat.name.toUpperCase(),
    color: cat.color
  }))];

  const getStatRewards = () => {
    const selectedCategory = allCategories.find(cat => cat.name === category);
    if (!selectedCategory) return { body: 1, xp: 20 };

    // Check if it's a custom category
    const customCategory = customCategories.find(cat => cat.name.toLowerCase() === category);
    if (customCategory) {
      return {
        body: customCategory.points.body,
        mind: customCategory.points.mind,
        soul: customCategory.points.soul,
        xp: 20
      };
    }

    // Default category rewards
    switch (category) {
      case 'body':
        return { body: 1, xp: 20 };
      case 'mind':
        return { mind: 1, xp: 20 };
      case 'soul':
        return { soul: 1, xp: 20 };
      default:
        return { body: 1, xp: 20 };
    }
  };

  const handleCategoryAdded = (newCategory: { 
    name: string; 
    icon: string; 
    color: string;
    points: {
      body: number;
      mind: number;
      soul: number;
    };
  }) => {
    console.log('Adding new category:', newCategory);
    const success = categoryService.addCustomCategory(newCategory);
    console.log('Category added successfully:', success);
    setCategoryRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const handleFormClick = (e: React.MouseEvent) => {
    // If the form is not expanded, expand it when clicked
    if (!isExpanded) {
      setIsExpanded(true);
    }
    // If the form is expanded, prevent clicks from minimizing it
    e.stopPropagation();
  };

  return (
    <form 
      className={`${styles.form} ${isExpanded ? styles.expanded : ''}`} 
      onSubmit={handleSubmit} 
      noValidate
      onClick={handleFormClick}
    >
      <div className={styles.inputGroup}>
        <div 
          className={isExpanded ? styles.titleContainerExpanded : styles.titleContainer}
          onClick={(e) => {
            if (isExpanded) {
              e.stopPropagation();
              handleTitleClick();
            } else {
              handleTitleClick();
            }
          }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Intention"
            className={styles.titleInput}
            required
            minLength={1}
            maxLength={100}
            onInvalid={handleInvalid}
            onBlur={handleTitleBlur}
            onClick={handleTitleClick}
          />
          <div className={styles.validationMessage}>
            Please fill in this field.
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className={styles.descriptionInput}
            rows={1}
            maxLength={500}
            onInvalid={handleInvalid}
          />
          <div className={styles.validationMessage}>
            Description is too long.
          </div>
        </div>
      )}
      
      {isExpanded && (
        <>
          <div className={styles.categorySelector}>
            <div className={styles.categoryHeader}>
              <div className={styles.categoryHeaderContent}>
                <label className={styles.categoryLabel}>Category:</label>
                <button
                  type="button"
                  className={styles.addCategoryButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCategoryModalOpen(true);
                  }}
                >
                  + Add Category
                </button>


              </div>
            </div>
            <div className={styles.categoryButtons}>
              {allCategories.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  className={`${styles.categoryButton} ${category === option.name ? styles.categoryButtonActive : ''}`}
                  style={{ 
                    borderColor: option.color,
                    backgroundColor: category === option.name ? option.color : 'transparent',
                    color: category === option.name ? 'var(--color-bg-primary)' : 'var(--color-text-primary)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategory(option.name);
                  }}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.prioritySelector}>
            <label className={styles.priorityLabel}>Priority:</label>
            <div className={styles.priorityButtons}>
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.priorityButton} ${priority === option.value ? styles.priorityButtonActive : ''}`}
                  style={{ 
                    borderColor: option.color,
                    backgroundColor: priority === option.value ? option.color : 'transparent',
                    color: priority === option.value ? 'var(--color-bg-primary)' : 'var(--color-text-primary)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPriority(option.value as 'low' | 'medium' | 'high');
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.statRewards}>
            <label className={styles.statRewardsLabel}>Rewards:</label>
            <div className={styles.statRewardsDisplay}>
              {Object.entries(getStatRewards()).map(([stat, value]) => (
                value > 0 && (
                  <div key={stat} className={styles.statReward}>
                    <span className={styles.statIcon}>
                      {stat === 'body' ? '💪' : stat === 'mind' ? '🧠' : stat === 'soul' ? '✨' : '⭐'}
                    </span>
                    <span className={styles.statName}>
                      {stat === 'xp' ? 'XP' : stat.toUpperCase()}
                    </span>
                    <span className={styles.statValue}>+{value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            onClick={(e) => e.stopPropagation()}
          >
            {isEditMode ? 'Update Task' : 'Add Task'}
          </button>
          {onCancel && (
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </>
      )}
      
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />
    </form>
  );
}; 