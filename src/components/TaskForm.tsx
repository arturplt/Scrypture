import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { taskService } from '../services/taskService';
import { categoryService } from '../services/categoryService';
import { storageService } from '../services/storageService';
import { CategoryModal } from './CategoryModal';
import styles from './TaskForm.module.css';

export const TaskForm: React.FC = () => {
  const { addTask, refreshTasks } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('body');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      completed: false,
      priority,
    });
    
    setTitle('');
    setDescription('');
    setCategory('body');
    setPriority('medium');
  };

  const handleInvalid = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleTitleClick = () => {
    setIsExpanded(true);
  };

  const handleTitleBlur = (e: React.FocusEvent) => {
    // Only minimize if clicking outside the entire form
    // Check if the related target is within the form
    const formElement = e.currentTarget.closest('form');
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    if (!title.trim() && (!relatedTarget || !formElement?.contains(relatedTarget))) {
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
    { value: 'high', label: 'HIGH PRIORITY', color: 'var(--color-urgent)' }
  ];

  const defaultCategoryOptions = [
    { value: 'body', label: '💪 BODY', icon: '💪', color: 'var(--color-body)' },
    { value: 'mind', label: '🧠 MIND', icon: '🧠', color: 'var(--color-mind)' },
    { value: 'soul', label: '✨ SOUL', icon: '✨', color: 'var(--color-soul)' }
  ];

  const customCategoryOptions = customCategories.map(cat => ({
    value: cat.name,
    label: `${cat.icon} ${cat.name.toUpperCase()}`,
    icon: cat.icon,
    color: cat.color
  }));

  console.log('Custom categories state:', customCategories);
  console.log('Custom category options:', customCategoryOptions);
  console.log('All category options:', [...defaultCategoryOptions, ...customCategoryOptions]);

  const categoryOptions = [...defaultCategoryOptions, ...customCategoryOptions];

  const getStatRewards = () => {
    const rewards = taskService.calculateStatRewards(category);
    // Filter out XP from the display since it's handled separately
    const { xp, ...statRewards } = rewards;
    return { statRewards, xp };
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
                <button
                  type="button"
                  className={styles.addCategoryButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    const categories = categoryService.getCustomCategories();
                    if (categories.length > 0) {
                      const lastCategory = categories[categories.length - 1];
                      const success = categoryService.removeCustomCategory(lastCategory.name);
                      console.log('Removed category:', lastCategory.name, 'Success:', success);
                      setCategoryRefreshTrigger(prev => prev + 1);
                    }
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  🗑️ Remove Last
                </button>
                <button
                  type="button"
                  className={styles.addCategoryButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('=== Category Storage Test ===');
                    console.log('Current categories:', categoryService.getCustomCategories());
                    console.log('localStorage raw:', localStorage.getItem('scrypture_custom_categories'));
                    console.log('Backup data:', storageService.createBackup());
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  🔍 Test Storage
                </button>
              </div>
            </div>
            <div className={styles.categoryButtons}>
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.categoryButton} ${category === option.value ? styles.categoryButtonActive : ''}`}
                  style={{ 
                    borderColor: option.color,
                    backgroundColor: category === option.value ? option.color : 'transparent',
                    color: category === option.value ? 'var(--color-bg-primary)' : 'var(--color-text-primary)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategory(option.value);
                  }}
                >
                  {option.label}
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
              {Object.entries(getStatRewards().statRewards).map(([stat, value]) => (
                value > 0 && (
                  <div key={stat} className={styles.statReward}>
                    <span className={styles.statIcon}>
                      {stat === 'body' ? '💪' : stat === 'mind' ? '🧠' : '✨'}
                    </span>
                    <span className={styles.statName}>{stat.toUpperCase()}</span>
                    <span className={styles.statValue}>+{value}</span>
                  </div>
                )
              ))}
              {(() => {
                const xp = getStatRewards().xp;
                return xp && xp > 0 ? (
                  <div className={styles.statReward}>
                    <span className={styles.statIcon}>⭐</span>
                    <span className={styles.statName}>XP</span>
                    <span className={styles.statValue}>+{xp}</span>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            onClick={(e) => e.stopPropagation()}
          >
            Add Task
          </button>
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