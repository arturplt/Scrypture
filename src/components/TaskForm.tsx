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
  }>>([]);
  const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Remove getStatRewards and defaultCategoryRewards
  const [bodyReward, setBodyReward] = useState<number>(0);
  const [mindReward, setMindReward] = useState<number>(0);
  const [soulReward, setSoulReward] = useState<number>(0);
  const [xpReward, setXpReward] = useState<number>(0);

  const isEditMode = !!taskToEdit;

  const fibonacciXp = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const [difficulty, setDifficulty] = useState<number>(taskToEdit?.difficulty ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const statRewards = {
      body: bodyReward || undefined,
      mind: mindReward || undefined,
      soul: soulReward || undefined,
      xp: priorityXp + fibonacciXp[difficulty],
    };
    if (isEditMode && taskToEdit) {
      // Update existing task
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        statRewards,
        difficulty,
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
        statRewards,
        difficulty,
      });
    }
    
    // Reset form only if not in edit mode
    if (!isEditMode) {
      setTitle('');
      setDescription('');
      setCategory('home');
      setPriority('medium');
      setBodyReward(0);
      setMindReward(0);
      setSoulReward(0);
      setXpReward(0);
      setDifficulty(0);
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

  // Remove mainCategories, only use customCategories for allCategories
  const allCategories = categoryService.getAllCategories();

  // Remove getStatRewards and defaultCategoryRewards
  const handleCategoryAdded = (newCategory: { 
    name: string; 
    icon: string; 
    color: string;
  }) => {
    console.log('Adding new category:', newCategory);
    const success = categoryService.addCustomCategory(newCategory);
    console.log('Category added successfully:', success);
    setCategoryRefreshTrigger(prev => prev + 1); // Trigger refresh
    if (success) {
      window.dispatchEvent(new Event('customCategoryAdded'));
    }
  };

  const handleFormClick = (e: React.MouseEvent) => {
    // If the form is not expanded, expand it when clicked
    if (!isExpanded) {
      setIsExpanded(true);
    }
    // If the form is expanded, prevent clicks from minimizing it
    e.stopPropagation();
  };

  // Calculate XP based on priority
  const priorityXp = priority === 'high' ? 15 : priority === 'medium' ? 10 : 5;

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
            maxLength={100}
            onInvalid={handleInvalid}
            onBlur={handleTitleBlur}
            onClick={handleTitleClick}
          />
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
        </div>
      )}
      {isExpanded && (
        <>
          {/* Core Attributes as big selection buttons */}
          <div className={styles.coreAttributesSection}>
            <label className={styles.coreAttributesLabel}>Core Attributes:</label>
            <div className={styles.coreAttributesInputs}>
              {/* Show only a golden +1 badge next to the label for each active attribute */}
              {bodyReward > 0 && (
                <span className={styles.coreAttributeActiveLabel}>
                  BODY <span className={styles.coreAttributePlusOne}>+1</span>
                </span>
              )}
              {mindReward > 0 && (
                <span className={styles.coreAttributeActiveLabel}>
                  MIND <span className={styles.coreAttributePlusOne}>+1</span>
                </span>
              )}
              {soulReward > 0 && (
                <span className={styles.coreAttributeActiveLabel}>
                  SOUL <span className={styles.coreAttributePlusOne}>+1</span>
                </span>
              )}
            </div>
            <div className={styles.coreAttributesButtons}>
              <button
                type="button"
                className={`${styles.coreAttributeButton} ${bodyReward > 0 ? styles.coreAttributeButtonActive : ''}`}
                onClick={() => setBodyReward(bodyReward > 0 ? 0 : 1)}
              >
                BODY
              </button>
              <button
                type="button"
                className={`${styles.coreAttributeButton} ${mindReward > 0 ? styles.coreAttributeButtonActive : ''}`}
                onClick={() => setMindReward(mindReward > 0 ? 0 : 1)}
              >
                MIND
              </button>
              <button
                type="button"
                className={`${styles.coreAttributeButton} ${soulReward > 0 ? styles.coreAttributeButtonActive : ''}`}
                onClick={() => setSoulReward(soulReward > 0 ? 0 : 1)}
              >
                SOUL
              </button>
            </div>
            <div className={styles.coreAttributeXpLabelWrapper}>
              <span className={styles.coreAttributeXpLabel}>+{priorityXp + fibonacciXp[difficulty]} XP</span>
            </div>
          </div>
          {/* Category selection */}
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
                  {option.icon} {option.name.charAt(0).toUpperCase() + option.name.slice(1)}
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
          {/* XP Reward input, only show if > 0 */}
          {xpReward > 0 && (
            <div className={styles.statRewards}>
              <label className={styles.statRewardsLabel}>XP Reward:</label>
              <div className={styles.statRewardsDisplay}>
                <span className={styles.coreAttributeActiveLabel}>
                  <span className={styles.statIcon}>⭐</span> <span className={styles.coreAttributePlusOne}>+1</span>
                </span>
              </div>
            </div>
          )}
          {isExpanded && (
            <div className={styles.difficultySelector}>
              <label className={styles.difficultyLabel}>Difficulty:</label>
              <div className={styles.difficultyButtons}>
                {fibonacciXp.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.difficultyButton} ${difficulty === idx ? styles.difficultyButtonActive : ''}`}
                    style={{
                      background: difficulty === idx ? `var(--difficulty-${idx + 1})` : undefined
                    }}
                    onClick={() => setDifficulty(idx)}
                  >
                    {idx}
                  </button>
                ))}
              </div>
            </div>
          )}
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