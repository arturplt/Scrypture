import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { useTasks } from '../hooks/useTasks';
import { categoryService } from '../services/categoryService';
import { ConfirmationModal } from './ConfirmationModal';
import { CategoryModal } from './CategoryModal';
import styles from './TaskForm.module.css';

interface TaskEditFormProps {
  task: Task;
  onCancel: () => void;
}

export const TaskEditForm: React.FC<TaskEditFormProps> = ({
  task,
  onCancel,
}) => {
  const { updateTask, deleteTask, tasks } = useTasks();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [category, setCategory] = useState<string>(task.category || 'home');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    task.priority
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
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
    setCategory(task.category || 'home');
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
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      statRewards,
      difficulty,
    });
    onCancel();
  };

  const handleCancel = () => {
    // Reset form to original values
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category || 'home');
    setPriority(task.priority);
    onCancel();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteTask(task.id);
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

  const allCategories = categoryService.getAllCategories();

  // For task editing, show all categories so users can change to any category
  const categoriesForTaskEditing = allCategories;

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

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
                className={`${styles.categoryButton} ${category === option.name ? styles.categoryButtonActive : ''}`}
                style={{
                  borderColor: option.color,
                  backgroundColor:
                    category === option.name ? option.color : 'transparent',
                  color:
                    category === option.name
                      ? 'var(--color-bg-primary)'
                      : 'var(--color-text-primary)',
                }}
                onClick={() => setCategory(option.name)}
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
                onClick={() =>
                  setPriority(option.value as 'low' | 'medium' | 'high')
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
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

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            Update Task
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDelete}
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
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />
    </>
  );
};

export default TaskEditForm;
