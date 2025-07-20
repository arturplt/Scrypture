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
    points: {
      body: number;
      mind: number;
      soul: number;
    };
  }) => void;
}

const iconOptions = [
  '💪', '🧠', '✨', '💼', '🏠', '🎯', '⚡', '🔥', '💎', '🌟', '🎨', '📚', 
  '🏃', '🧘', '🎵', '🍳', '🌱', '🚀', '🎮', '📱', '💻', '🎪', '🏆', '💡'
];

const colorOptions = [
  'var(--color-body)', 'var(--color-mind)', 'var(--color-soul)', 
  'var(--color-career)', 'var(--color-home)', 'var(--color-skills)',
  'var(--color-accent-gold)', 'var(--color-accent-beaver)', 'var(--color-focus)',
  'var(--color-easy)', 'var(--color-urgent)', 'var(--color-error)'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onCategoryAdded 
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💪');
  const [selectedColor, setSelectedColor] = useState('var(--color-body)');
  const [points, setPoints] = useState({ body: 1, mind: 0, soul: 0 });
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
    const existingCategories = ['body', 'mind', 'soul'];
    if (existingCategories.some(cat => cat.toLowerCase() === categoryName.trim().toLowerCase())) {
      setError('This category name already exists');
      return;
    }

    // Also check against custom categories
    const customCategories = categoryService.getCustomCategories();
    if (customCategories.some(cat => cat.name.toLowerCase() === categoryName.trim().toLowerCase())) {
      setError('This category name already exists');
      return;
    }

    onCategoryAdded({
      name: categoryName.trim().toLowerCase(),
      icon: selectedIcon,
      color: selectedColor,
      points
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

        <div className={styles.formGroup}>
          <label className={styles.label}>Point Distribution (3 points total)</label>
          <div className={styles.pointDistribution}>
            <div className={styles.pointStat}>
              <span className={styles.pointIcon}>💪</span>
              <span className={styles.pointLabel}>Body</span>
              <div className={styles.pointControls}>
                <button
                  type="button"
                  className={styles.pointButton}
                  onClick={() => {
                    const total = points.body + points.mind + points.soul;
                    if (total < 3 && points.body < 3) {
                      setPoints(prev => ({ ...prev, body: prev.body + 1 }));
                    }
                  }}
                  disabled={points.body + points.mind + points.soul >= 3 || points.body >= 3}
                >
                  +
                </button>
                <span className={styles.pointValue}>{points.body}</span>
                <button
                  type="button"
                  className={styles.pointButton}
                  onClick={() => {
                    if (points.body > 0) {
                      setPoints(prev => ({ ...prev, body: prev.body - 1 }));
                    }
                  }}
                  disabled={points.body <= 0}
                >
                  -
                </button>
              </div>
            </div>
            
            <div className={styles.pointStat}>
              <span className={styles.pointIcon}>🧠</span>
              <span className={styles.pointLabel}>Mind</span>
              <div className={styles.pointControls}>
                <button
                  type="button"
                  className={styles.pointButton}
                  onClick={() => {
                    const total = points.body + points.mind + points.soul;
                    if (total < 3 && points.mind < 3) {
                      setPoints(prev => ({ ...prev, mind: prev.mind + 1 }));
                    }
                  }}
                  disabled={points.body + points.mind + points.soul >= 3 || points.mind >= 3}
                >
                  +
                </button>
                <span className={styles.pointValue}>{points.mind}</span>
                <button
                  type="button"
                  className={styles.pointButton}
                  onClick={() => {
                    if (points.mind > 0) {
                      setPoints(prev => ({ ...prev, mind: prev.mind - 1 }));
                    }
                  }}
                  disabled={points.mind <= 0}
                >
                  -
                </button>
              </div>
            </div>
            
            <div className={styles.pointStat}>
              <span className={styles.pointIcon}>✨</span>
              <span className={styles.pointLabel}>Soul</span>
              <div className={styles.pointControls}>
                <button
                  type="button"
                  className={styles.pointButton}
                  onClick={() => {
                    const total = points.body + points.mind + points.soul;
                    if (total < 3 && points.soul < 3) {
                      setPoints(prev => ({ ...prev, soul: prev.soul + 1 }));
                    }
                  }}
                  disabled={points.body + points.mind + points.soul >= 3 || points.soul >= 3}
                >
                  +
                </button>
                <span className={styles.pointValue}>{points.soul}</span>
                <button
                  type="button"
                  className={styles.pointButton}
                  onClick={() => {
                    if (points.soul > 0) {
                      setPoints(prev => ({ ...prev, soul: prev.soul - 1 }));
                    }
                  }}
                  disabled={points.soul <= 0}
                >
                  -
                </button>
              </div>
            </div>
          </div>
          <div className={styles.pointTotal}>
            Total: {points.body + points.mind + points.soul}/3 points
          </div>
        </div>

        <div className={styles.preview}>
          <label className={styles.label}>Preview:</label>
          <div 
            className={styles.categoryPreview}
            style={{ 
              borderColor: selectedColor,
              backgroundColor: selectedColor,
              color: 'var(--color-bg-primary)'
            }}
          >
            {selectedIcon} {categoryName || 'CATEGORY NAME'}
          </div>
          <div className={styles.rewardsPreview}>
            <label className={styles.label}>Rewards:</label>
            <div className={styles.rewardsDisplay}>
              {points.body > 0 && (
                <div className={styles.rewardItem}>
                  <span className={styles.rewardIcon}>💪</span>
                  <span className={styles.rewardStat}>BODY</span>
                  <span className={styles.rewardValue}>+{points.body}</span>
                </div>
              )}
              {points.mind > 0 && (
                <div className={styles.rewardItem}>
                  <span className={styles.rewardIcon}>🧠</span>
                  <span className={styles.rewardStat}>MIND</span>
                  <span className={styles.rewardValue}>+{points.mind}</span>
                </div>
              )}
              {points.soul > 0 && (
                <div className={styles.rewardItem}>
                  <span className={styles.rewardIcon}>✨</span>
                  <span className={styles.rewardStat}>SOUL</span>
                  <span className={styles.rewardValue}>+{points.soul}</span>
                </div>
              )}
              <div className={styles.rewardItem}>
                <span className={styles.rewardIcon}>⭐</span>
                <span className={styles.rewardStat}>XP</span>
                {/* XP Formula: 30 - (max_single_stat * 10) 
                    - 3 points in one stat = 0 XP
                    - 2 points in one stat = 10 XP  
                    - 1 point in one stat = 20 XP
                    - 0 points = 30 XP */}
                <span className={styles.rewardValue}>+{30 - (Math.max(points.body, points.mind, points.soul) * 10)}</span>
              </div>
            </div>
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