import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Task } from '../types';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';
import { categoryService } from '../services/categoryService';
import { ConfirmationModal } from './ConfirmationModal';
import { CategoryModal } from './CategoryModal';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './TaskForm.module.css';

interface TaskEditFormProps {
  task: Task;
  onCancel: () => void;
}

export const TaskEditForm: React.FC<TaskEditFormProps> = ({
  task,
  onCancel,
}) => {
  const { updateTask, deleteTask, isSaving } = useTasks();
  const { addHabit } = useHabits();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [categories, setCategories] = useState<string[]>(task.categories || ['body']);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    task.priority
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [makeItHabit, setMakeItHabit] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  };

  // Update form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setCategories(task.categories || ['body']);
    setPriority(task.priority);
  }, [task]);

  // Auto-resize textarea when description changes
  useEffect(() => {
    autoResizeTextarea();
  }, [description]);

  // Remove statRewards calculation from handleSubmit
  const [bodyReward, setBodyReward] = useState<number>(
    task.statRewards?.body || 0
  );
  const [mindReward, setMindReward] = useState<number>(
    task.statRewards?.mind || 0
  );
  const [soulReward, setSoulReward] = useState<number>(
    task.statRewards?.soul || 0
  );

  // Calculate XP based on priority
  const priorityXp = priority === 'high' ? 15 : priority === 'medium' ? 10 : 5;

  const fibonacciXp = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const [difficulty, setDifficulty] = useState<number>(task.difficulty ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const statRewards = {
      body: bodyReward || undefined,
      mind: mindReward || undefined,
      soul: soulReward || undefined,
      xp: priorityXp + fibonacciXp[difficulty],
    };
    // Update the existing task
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      categories,
      priority,
      statRewards,
      difficulty,
    });

    // Create habit if "Make it a Habit" is selected and frequency is chosen
    // (This creates a separate habit based on the task, but keeps the original task)
    if (makeItHabit && selectedFrequency) {
      addHabit({
        name: title.trim(),
        description: description.trim() || undefined,
        targetFrequency: selectedFrequency,
        categories: categories,
        statRewards: {
          body: bodyReward || undefined,
          mind: mindReward || undefined,
          soul: soulReward || undefined,
          xp: Math.floor((priorityXp + fibonacciXp[difficulty]) / 2), // Half XP for habits
        },
      });
    }

    // Use the same smooth transition when submitting
    onCancel();
  };

  const handleCancel = () => {
    // Add enhanced animation for cancel
    setIsCanceling(true);
    const cancelButton = document.querySelector(`.${styles.cancelButton}`) as HTMLElement;
    
    // Check if animations are disabled (mobile or reduced motion)
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (cancelButton && !isMobile && !prefersReducedMotion) {
      cancelButton.style.animation = 'fadeOutScale 0.5s ease-in-out forwards';
      
      // Delay the actual cancel to allow animation to complete
      setTimeout(() => {
        setIsCanceling(false);
        onCancel();
      }, 500);
    } else {
      // Immediate cancel for mobile or reduced motion
      setIsCanceling(false);
      onCancel();
    }
  };

  const handleDelete = () => {
    // Add enhanced animation for delete button
    setIsDeleting(true);
    const deleteButton = document.querySelector(`.${styles.deleteButton}`) as HTMLElement;
    
    // Check if animations are disabled (mobile or reduced motion)
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (deleteButton && !isMobile && !prefersReducedMotion) {
      deleteButton.style.animation = 'slideOutDown 0.5s ease-in-out forwards';
      
      // Show confirmation modal after animation
      setTimeout(() => {
        setIsDeleting(false);
        setShowDeleteConfirm(true);
      }, 500);
    } else {
      // Immediate modal for mobile or reduced motion
      setIsDeleting(false);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    deleteTask(task.id);
    // Use the same smooth transition when deleting
    onCancel();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const priorityOptions = [
    { value: 'low', label: 'LOW PRIORITY', color: 'var(--color-easy)' },
    { value: 'medium', label: 'MEDIUM PRIORITY', color: 'var(--color-focus)' },
    { value: 'high', label: 'HIGH PRIORITY', color: 'var(--color-urgent)' },
  ];

  const allCategories = useMemo(() => categoryService.getAllCategories(), []);

  // For task editing, show all categories except Body, Mind, Soul since they're automatically managed
  const categoriesForTaskEditing = allCategories.filter(category => 
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

  const handleCategoryAdded = useCallback((newCategory: {
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
  }, []);

  const handleCloseCategoryModal = useCallback(() => {
    setIsCategoryModalOpen(false);
  }, []);

  return (
    <>
      <form className={`${styles.form} ${styles.transitioning}`} onSubmit={handleSubmit} noValidate>
        <div className={styles.autoSaveContainer}>
          <AutoSaveIndicator isSaving={isSaving} />
        </div>
        <div className={styles.inputGroup}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Intention"
              className={styles.titleInput}
              required
              minLength={1}
              maxLength={100}
            />
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className={styles.descriptionInput}
            data-auto-expand="true"
            maxLength={500}
          />
        </div>

        {/* Core Attributes - First */}
        <div className={styles.coreAttributesSection}>
          <label className={styles.coreAttributesLabel}>Core Attributes:</label>
          <div className={styles.coreAttributesInputs}>
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
            <span className={styles.coreAttributeXpLabel}>
              +{priorityXp + fibonacciXp[difficulty]} XP
            </span>
          </div>
        </div>

        {/* Category Selector - Second */}
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
            {categoriesForTaskEditing.map((option) => (
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
                onClick={() => {
                  const newCategories = [...categories];
                  if (newCategories.includes(option.name)) {
                    newCategories.splice(newCategories.indexOf(option.name), 1);
                  } else {
                    newCategories.push(option.name);
                  }
                  setCategories(newCategories);
                }}
              >
                {option.icon}{' '}
                {option.name.charAt(0).toUpperCase() + option.name.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Selector - Third */}
        <div className={styles.prioritySelector}>
          <label className={styles.priorityLabel}>Priority:</label>
          <div className={styles.priorityButtons}>
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.priorityButton} ${priority === option.value ? styles.priorityButtonActive : ''}`}
                onClick={() =>
                  setPriority(option.value as 'low' | 'medium' | 'high')
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selector - Fourth */}
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
                onClick={() => setDifficulty(idx)}
              >
                {idx}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Selection - Only visible when Make it a Habit is selected */}
        {makeItHabit && (
          <div className={styles.frequencySelection}>
            <label className={styles.frequencyLabel}>Choose frequency:</label>
            <div className={styles.frequencyButtons}>
              {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  className={`${styles.frequencyButton} ${selectedFrequency === freq ? styles.frequencyButtonActive : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedFrequency(freq);
                  }}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Make it a Habit section */}
        <div className={styles.habitSection}>
          <button
            type="button"
            className={`${styles.habitToggleButton} ${makeItHabit ? styles.habitToggleButtonActive : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMakeItHabit(!makeItHabit);
              if (!makeItHabit) {
                setSelectedFrequency(null);
              }
            }}
          >
            🔄 Make it a Habit
          </button>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={`${styles.submitButton} ${makeItHabit && selectedFrequency ? styles.submitButtonHabit : ''}`}
            disabled={makeItHabit && !selectedFrequency}
          >
            {makeItHabit && selectedFrequency ? 'Update Task & Create Habit' : 'Update Task'}
          </button>
          <button
            type="button"
            className={`${styles.cancelButton} ${isCanceling ? styles.animating : ''}`}
            onClick={handleCancel}
            disabled={isCanceling || isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.deleteButton} ${isDeleting ? styles.animating : ''}`}
            onClick={handleDelete}
            disabled={isCanceling || isDeleting}
          >
            Delete Task
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        onCategoryAdded={handleCategoryAdded}
      />
    </>
  );
};

export default TaskEditForm;
