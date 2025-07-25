import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { categoryService } from '../services/categoryService';
import { CategoryModal } from './CategoryModal';
import { Task } from '../types';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  taskToEdit?: Task;
  onCancel?: () => void;
  onSave?: () => void;
  onNavigateToTask?: (taskId: string) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  taskToEdit,
  onCancel,
  onSave,
  onNavigateToTask,
}) => {
  const { addTask, updateTask, tasks } = useTasks();
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [categories, setCategories] = useState<string[]>(
    taskToEdit?.categories || ['body']
  );
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    taskToEdit?.priority || 'medium'
  );
  const [isExpanded, setIsExpanded] = useState(!!taskToEdit);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [selectedAutoFillIndex, setSelectedAutoFillIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  // Remove getStatRewards and defaultCategoryRewards
  const [bodyReward, setBodyReward] = useState<number>(
    taskToEdit?.statRewards?.body || 0
  );
  const [mindReward, setMindReward] = useState<number>(
    taskToEdit?.statRewards?.mind || 0
  );
  const [soulReward, setSoulReward] = useState<number>(
    taskToEdit?.statRewards?.soul || 0
  );
  const [xpReward, setXpReward] = useState<number>(
    taskToEdit?.statRewards?.xp || 0
  );

  // Update core attribute rewards when editing a task that has Body, Mind, Soul categories
  useEffect(() => {
    if (taskToEdit) {
      const hasBody = taskToEdit.categories?.includes('body') || false;
      const hasMind = taskToEdit.categories?.includes('mind') || false;
      const hasSoul = taskToEdit.categories?.includes('soul') || false;
      
      setBodyReward(hasBody ? 1 : 0);
      setMindReward(hasMind ? 1 : 0);
      setSoulReward(hasSoul ? 1 : 0);
    }
  }, [taskToEdit]);

  const isEditMode = !!taskToEdit;

  const fibonacciXp = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const [difficulty, setDifficulty] = useState<number>(
    taskToEdit?.difficulty ?? 0
  );

  // Filter tasks for auto-fill suggestions
  const getAutoFillSuggestions = (searchTerm: string): Task[] => {
    if (!searchTerm.trim() || searchTerm.length < 2 || !tasks) return [];
    
    const term = searchTerm.toLowerCase().trim();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term) ||
      (task.categories && task.categories.some(cat => cat.toLowerCase().includes(term)))
    ).slice(0, 5); // Limit to 5 suggestions
  };

  const autoFillSuggestions = getAutoFillSuggestions(title);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Show auto-fill suggestions if there are matches and user is typing
    if (newTitle.trim().length >= 2 && autoFillSuggestions.length > 0) {
      setShowAutoFill(true);
      setSelectedAutoFillIndex(0);
    } else {
      setShowAutoFill(false);
    }
    
    // Clear validation message when user starts typing
    if (newTitle.trim()) {
      setShowValidation(false);
    }
  };

  const handleAutoFillSelect = (task: Task) => {
    // Don't fill the title field, just navigate to the task
    setShowAutoFill(false);
    
    // Navigate to the selected task
    if (onNavigateToTask) {
      onNavigateToTask(task.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutoFill || autoFillSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedAutoFillIndex(prev => 
          prev < autoFillSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedAutoFillIndex(prev => 
          prev > 0 ? prev - 1 : autoFillSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (autoFillSuggestions[selectedAutoFillIndex]) {
          handleAutoFillSelect(autoFillSuggestions[selectedAutoFillIndex]);
        }
        break;
      case 'Escape':
        setShowAutoFill(false);
        break;
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    // Only hide auto-fill if clicking outside the title input AND auto-fill suggestions
    const target = e.target as Node;
    const titleInput = titleInputRef.current;
    const autoFillContainer = document.querySelector(`.${styles.autoFillSuggestions}`);
    
    if (titleInput && !titleInput.contains(target) && 
        autoFillContainer && !autoFillContainer.contains(target)) {
      setShowAutoFill(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setShowValidation(true);
      return;
    }

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
        categories,
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
        categories,
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
      setCategories(['body']);
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
    
    // Add slide-to-top animation with a small delay to ensure expansion happens first
    setTimeout(() => {
      const formElement = document.querySelector(`.${styles.form}`);
      if (formElement) {
        // Add animation class
        formElement.classList.add(styles.slideToTop);
        
        // Scroll to the very top of the page first with smooth animation
        // Use fallback for browsers that don't support smooth scrolling
        try {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } catch (e) {
          // Fallback for browsers that don't support smooth scrolling
          window.scrollTo(0, 0);
        }
        
        // Also scroll the form into view to ensure it's visible
        setTimeout(() => {
          try {
            if (formElement.scrollIntoView) {
              formElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }
          } catch (e) {
            // Fallback for browsers that don't support smooth scrolling
            if (formElement.scrollIntoView) {
              formElement.scrollIntoView();
            }
          }
          
          // Focus on the title input for better UX
          if (titleInputRef.current) {
            titleInputRef.current.focus();
          }
        }, 200);
        
        // Remove animation class after animation completes
        setTimeout(() => {
          formElement.classList.remove(styles.slideToTop);
        }, 800);
      }
    }, 50);
  };

  const handleTitleBlur = (e: React.FocusEvent) => {
    // Only minimize if clicking outside the entire form and not in edit mode
    const formElement = e.currentTarget.closest('form');
    const relatedTarget = e.relatedTarget as HTMLElement;

    if (
      !isEditMode &&
      !title.trim() &&
      (!relatedTarget || !formElement?.contains(relatedTarget))
    ) {
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

  // For task creation, show all categories so users can create tasks in any category
  // But exclude Body, Mind, Soul since they're automatically added when core attributes are selected
  const categoriesForTaskCreation = allCategories.filter(category => 
    !['body', 'mind', 'soul'].includes(category.name)
  );

  // Automatically manage Body, Mind, Soul categories based on core attribute selection
  useEffect(() => {
    const newCategories = [...categories];
    
    // Add Body category if bodyReward > 0
    if (bodyReward > 0 && !newCategories.includes('body')) {
      newCategories.push('body');
    } else if (bodyReward === 0 && newCategories.includes('body')) {
      newCategories.splice(newCategories.indexOf('body'), 1);
    }
    
    // Add Mind category if mindReward > 0
    if (mindReward > 0 && !newCategories.includes('mind')) {
      newCategories.push('mind');
    } else if (mindReward === 0 && newCategories.includes('mind')) {
      newCategories.splice(newCategories.indexOf('mind'), 1);
    }
    
    // Add Soul category if soulReward > 0
    if (soulReward > 0 && !newCategories.includes('soul')) {
      newCategories.push('soul');
    } else if (soulReward === 0 && newCategories.includes('soul')) {
      newCategories.splice(newCategories.indexOf('soul'), 1);
    }
    
    setCategories(newCategories);
  }, [bodyReward, mindReward, soulReward]);

  // Filter out empty categories (categories with no tasks)
  const getCategoriesWithTasks = () => {
    const customCategories = categoryService.getCustomCategories();
    
    // Predetermined categories that should always be shown
    const predeterminedCategories = ['home', 'free time', 'garden'];
    
    if (!tasks || tasks.length === 0) {
      // If no tasks exist, show all default categories plus any custom categories
      return allCategories;
    }
    
    // Get unique categories that have tasks
    const categoriesWithTasks = new Set(
      tasks.flatMap(task => task.categories || ['uncategorized'])
    );
    
    // Filter categories to include:
    // 1. Categories that have tasks
    // 2. All custom categories (even if they don't have tasks yet)
    // 3. Predetermined categories (Home, Free Time, Garden) - always show
    return allCategories.filter(category => 
      categoriesWithTasks.has(category.name) || 
      customCategories.some(customCat => customCat.name === category.name) ||
      predeterminedCategories.includes(category.name)
    );
  };

  const categoriesWithTasks = getCategoriesWithTasks();

  // Remove getStatRewards and defaultCategoryRewards
  const handleCategoryAdded = (newCategory: {
    name: string;
    icon: string;
    color: string;
  }) => {
    console.log('Adding new category:', newCategory);
    const success = categoryService.addCustomCategory(newCategory);
    console.log('Category added successfully:', success);
    if (success) {
      window.dispatchEvent(new Event('customCategoryAdded'));
    }
  };

  const handleCategoryToggle = (categoryName: string) => {
    setCategories(prev => {
      if (prev.includes(categoryName)) {
        // Remove category if it's already selected
        return prev.filter(cat => cat !== categoryName);
      } else {
        // Add category if it's not selected
        return [...prev, categoryName];
      }
    });
  };

  const handleCategoryRemove = (categoryName: string) => {
    setCategories(prev => prev.filter(cat => cat !== categoryName));
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
          className={
            isExpanded ? styles.titleContainerExpanded : styles.titleContainer
          }
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
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            placeholder="Intention"
            className={styles.titleInput}
            maxLength={100}
            ref={titleInputRef}

            onInvalid={handleInvalid}
            onBlur={handleTitleBlur}
            onClick={handleTitleClick}
          />
          {showValidation && (
            <div className={styles.validationMessage}>
              Please fill this field
            </div>
          )}
          {showAutoFill && (
            <div className={styles.autoFillSuggestions}>
              {autoFillSuggestions.map((task, index) => (
                <div
                  key={task.id}
                  className={`${styles.autoFillSuggestion} ${index === selectedAutoFillIndex ? styles.autoFillSuggestionSelected : ''}`}
                  onClick={() => handleAutoFillSelect(task)}
                >
                  <span className={styles.autoFillIcon}>🔍</span>
                  {task.title}
                  <span className={styles.autoFillHint}>View task</span>
                </div>
              ))}
            </div>
          )}
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
            <label className={styles.coreAttributesLabel}>
              Core Attributes:
            </label>
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBodyReward(bodyReward > 0 ? 0 : 1);
                }}
              >
                BODY
              </button>
              <button
                type="button"
                className={`${styles.coreAttributeButton} ${mindReward > 0 ? styles.coreAttributeButtonActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMindReward(mindReward > 0 ? 0 : 1);
                }}
              >
                MIND
              </button>
              <button
                type="button"
                className={`${styles.coreAttributeButton} ${soulReward > 0 ? styles.coreAttributeButtonActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSoulReward(soulReward > 0 ? 0 : 1);
                }}
              >
                SOUL
              </button>
            </div>
            <div className={styles.coreAttributeXpLabelWrapper}>
              <span className={styles.coreAttributeXpLabel}>
                +{priorityXp + fibonacciXp[difficulty]} XP
              </span>
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
              {categoriesForTaskCreation.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  className={`${styles.categoryButton} ${categories.includes(option.name) ? styles.categoryButtonActive : ''}`}
                  style={{
                    borderColor: option.color,
                    backgroundColor:
                      categories.includes(option.name) ? option.color : 'transparent',
                    color:
                      categories.includes(option.name)
                        ? 'var(--color-bg-primary)'
                        : 'var(--color-text-primary)',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCategoryToggle(option.name);
                  }}
                >
                  {option.icon}{' '}
                  {option.name.charAt(0).toUpperCase() + option.name.slice(1)}
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
                    backgroundColor:
                      priority === option.value ? option.color : 'transparent',
                    color:
                      priority === option.value
                        ? 'var(--color-bg-primary)'
                        : 'var(--color-text-primary)',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
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
                  <span className={styles.statIcon}>⭐</span>{' '}
                  <span className={styles.coreAttributePlusOne}>+1</span>
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
                      background:
                        difficulty === idx
                          ? `var(--difficulty-${idx + 1})`
                          : undefined,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDifficulty(idx);
                    }}
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
