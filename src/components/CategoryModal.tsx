import React, { useState } from 'react';
import { Modal } from './Modal';
import { categoryService } from '../services/categoryService';
import styles from './TaskForm.module.css';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (category: {
    name: string;
    icon: string;
    color: string;
  }) => void;
}

const iconOptions = [
  '💪',
  '🧠',
  '✨',
  '💼',
  '🏠',
  '🎯',
  '⚡',
  '🔥',
  '💎',
  '🌟',
  '🎨',
  '📚',
  '🏃',
  '🧘',
  '🎵',
  '🍳',
  '🌱',
  '🚀',
  '🎮',
  '📱',
  '💻',
  '🎪',
  '🏆',
  '💡',
];

const colorOptions = [
  'var(--color-body)',
  'var(--color-mind)',
  'var(--color-soul)',
  'var(--color-career)',
  'var(--color-home)',
  'var(--color-skills)',
  'var(--color-accent-gold)',
  'var(--color-accent-beaver)',
  'var(--color-focus)',
  'var(--color-easy)',
  'var(--color-urgent)',
  'var(--color-error)',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryAdded,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💪');
  const [selectedColor, setSelectedColor] = useState('var(--color-body)');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!categoryName.trim()) {
      setError('Please enter a category name');
      return;
    }

    if (categoryName.trim().length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }

    if (categoryName.trim().length > 20) {
      setError('Category name must be 20 characters or less');
      return;
    }

    // Check if category name already exists (case insensitive)
    const existingCategories = ['home', 'free time', 'garden'];
    if (
      existingCategories.some(
        (cat) => cat.toLowerCase() === categoryName.trim().toLowerCase()
      )
    ) {
      setError('This category name already exists');
      return;
    }

    // Also check against custom categories
    const customCategories = categoryService.getCustomCategories();
    if (
      customCategories.some(
        (cat) => cat.name.toLowerCase() === categoryName.trim().toLowerCase()
      )
    ) {
      setError('This category name already exists');
      return;
    }

    onCategoryAdded({
      name: categoryName.trim().toLowerCase(),
      icon: selectedIcon,
      color: selectedColor,
    });

    // Reset form
    setCategoryName('');
    setSelectedIcon('💪');
    setSelectedColor('var(--color-body)');
    setError('');
    onClose();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
    if (error) setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Custom Category">
      <div className={styles.categoryModalForm}>
        <div className={styles.formGroup}>
          <label htmlFor="categoryName" className={styles.label}>
            Category Name *
          </label>
          <input
            id="categoryName"
            type="text"
            value={categoryName}
            onChange={handleNameChange}
            placeholder="Enter category name..."
            className={styles.input}
            maxLength={20}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Icon</label>
          <div className={styles.iconGrid}>
            {iconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`${styles.iconButton} ${selectedIcon === icon ? styles.iconButtonActive : ''}`}
                onClick={() => setSelectedIcon(icon)}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Color</label>
          <div className={styles.colorGrid}>
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                className={`${styles.colorButton} ${selectedColor === color ? styles.colorButtonActive : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        {/* Remove point distribution UI and rewards preview */}

        <div className={styles.preview}>
          <label className={styles.label}>Preview:</label>
          <div
            className={styles.categoryPreview}
            style={{
              borderColor: selectedColor,
              backgroundColor: selectedColor,
              color: 'var(--color-bg-primary)',
            }}
          >
            {selectedIcon} {categoryName || 'CATEGORY NAME'}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.submitButton}
            disabled={!categoryName.trim()}
            onClick={handleSubmit}
          >
            Add Category
          </button>
        </div>
      </div>
    </Modal>
  );
};
