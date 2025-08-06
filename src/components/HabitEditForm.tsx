import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Habit } from '../types';
import { useHabits } from '../hooks/useHabits';
import { useTasks } from '../hooks/useTasks';
import { categoryService } from '../services/categoryService';
import { ConfirmationModal } from './ConfirmationModal';
import { CategoryModal } from './CategoryModal';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './TaskForm.module.css';

interface HabitEditFormProps {
  habit: Habit;
  onCancel: () => void;
}

export const HabitEditForm: React.FC<HabitEditFormProps> = ({
  habit,
  onCancel,
}) => {
  const { updateHabit, deleteHabit, isSaving } = useHabits();
  const { addTask } = useTasks();
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const [targetFrequency, setTargetFrequency] = useState<'daily' | 'weekly' | 'monthly'>(
    habit.targetFrequency
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [convertToTask, setConvertToTask] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [difficulty, setDifficulty] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>(habit.categories || ['body']);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Stat rewards
  const [bodyReward, setBodyReward] = useState<number>(
    habit.statRewards?.body || 0
  );
  const [mindReward, setMindReward] = useState<number>(
    habit.statRewards?.mind || 0
  );
  const [soulReward, setSoulReward] = useState<number>(
    habit.statRewards?.soul || 0
  );

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  };

  // Update form when habit changes
  useEffect(() => {
    setName(habit.name);
    setDescription(habit.description || '');
    setTargetFrequency(habit.targetFrequency);
    setCategories(habit.categories || ['body']);
    setBodyReward(habit.statRewards?.body || 0);
    setMindReward(habit.statRewards?.mind || 0);
    setSoulReward(habit.statRewards?.soul || 0);
  }, [habit]);

  // Auto-resize textarea when description changes
  useEffect(() => {
    autoResizeTextarea();
  }, [description]);

  // Calculate XP based on priority
  const priorityXp = priority === 'high' ? 15 : priority === 'medium' ? 10 : 5;
  const fibonacciXp = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const statRewards = {
      body: bodyReward || undefined,
      mind: mindReward || undefined,
      soul: soulReward || undefined,
      xp: priorityXp + fibonacciXp[difficulty],
    };

    if (convertToTask) {
      // Convert habit to task
      addTask({
        title: name.trim(),
        description: description.trim() || undefined,
        categories: ['body'], // Default category
        completed: false,
        priority,
        statRewards,
        difficulty,
      });
      // Delete the original habit
      deleteHabit(habit.id);
    } else {
      // Update the existing habit
      updateHabit(habit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        targetFrequency,
        categories: categories,
        statRewards: {
          body: bodyReward || undefined,
          mind: mindReward || undefined,
          soul: soulReward || undefined,
          xp: Math.floor((priorityXp + fibonacciXp[difficulty]) / 2), // Half XP for habits
        },
      });
    }

    onCancel();
  };

  const handleCancel = () => {
    setIsCanceling(true);
    const cancelButton = document.querySelector(`.${styles.cancelButton}`) as HTMLElement;
    
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (cancelButton && !isMobile && !prefersReducedMotion) {
      cancelButton.style.animation = 'fadeOutScale 0.5s ease-in-out forwards';
      
      setTimeout(() => {
        setIsCanceling(false);
        onCancel();
      }, 500);
    } else {
      setIsCanceling(false);
      onCancel();
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    const deleteButton = document.querySelector(`.${styles.deleteButton}`) as HTMLElement;
    
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (deleteButton && !isMobile && !prefersReducedMotion) {
      deleteButton.style.animation = 'slideOutDown 0.5s ease-in-out forwards';
      
      setTimeout(() => {
        setIsDeleting(false);
        setShowDeleteConfirm(true);
      }, 500);
    } else {
      setIsDeleting(false);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    deleteHabit(habit.id);
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

  const frequencyOptions = [
    { value: 'daily', label: 'DAILY' },
    { value: 'weekly', label: 'WEEKLY' },
    { value: 'monthly', label: 'MONTHLY' },
  ];

  const allCategories = useMemo(() => categoryService.getAllCategories(), []);

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
        <div className={styles.formHeader}>
          <AutoSaveIndicator isSaving={isSaving} />
        </div>
        <div className={styles.inputGroup}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit Name"
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
            {allCategories.map((option) => (
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

        {/* Frequency Selector - Last (only visible when not converting to task) */}
        {!convertToTask && (
          <div className={styles.prioritySelector}>
            <label className={styles.priorityLabel}>Frequency:</label>
            <div className={styles.priorityButtons}>
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.priorityButton} ${targetFrequency === option.value ? styles.priorityButtonActive : ''}`}
                  onClick={() =>
                    setTargetFrequency(option.value as 'daily' | 'weekly' | 'monthly')
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Convert to Task section */}
        <div className={styles.habitSection}>
          <button
            type="button"
            className={`${styles.habitToggleButton} ${convertToTask ? styles.habitToggleButtonActive : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConvertToTask(!convertToTask);
            }}
          >
            🔄 Make it a Habit
          </button>
        </div>

        <div className={styles.buttonGroup}>
                            <button 
                    type="submit" 
                    className={`${styles.submitButton} ${convertToTask ? styles.submitButtonTask : styles.submitButtonHabit}`}
                  >
                    {convertToTask ? 'Convert to Task' : 'Update Habit'}
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
            Delete Habit
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? This action cannot be undone."
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

export default HabitEditForm; 