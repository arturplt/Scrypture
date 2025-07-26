import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { Habit } from '../types';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './HabitForm.module.css';

interface HabitFormProps {
  onClose: () => void;
  habit?: Habit;
}

export const HabitForm: React.FC<HabitFormProps> = ({ onClose, habit }) => {
  const { addHabit, updateHabit, isSaving } = useHabits();
  const isEditing = !!habit;

  const [formData, setFormData] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    targetFrequency: habit?.targetFrequency || 'daily' as const,
    statRewards: {
      body: habit?.statRewards?.body || 0,
      mind: habit?.statRewards?.mind || 0,
      soul: habit?.statRewards?.soul || 0,
      xp: habit?.statRewards?.xp || 0,
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    }
    
    if (formData.name.length > 100) {
      newErrors.name = 'Habit name must be 100 characters or less';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const habitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      targetFrequency: formData.targetFrequency,
      categories: habit?.categories || ['body'], // Default to body category
      statRewards: {
        body: formData.statRewards.body || undefined,
        mind: formData.statRewards.mind || undefined,
        soul: formData.statRewards.soul || undefined,
        xp: formData.statRewards.xp || undefined,
      }
    };

    if (isEditing && habit) {
      updateHabit(habit.id, habitData);
    } else {
      addHabit(habitData);
    }
    
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('statRewards.')) {
      const statField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        statRewards: {
          ...prev.statRewards,
          [statField]: Number(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            {isEditing ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <AutoSaveIndicator isSaving={isSaving} />
        </div>
        <button
          onClick={onClose}
          className={styles.closeButton}
          type="button"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Habit Name */}
        <div className={styles.fieldGroup}>
          <label htmlFor="habit-name" className={styles.label}>
            Habit Name *
          </label>
          <input
            id="habit-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="e.g., Daily Exercise, Read for 30 minutes"
            maxLength={100}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>

        {/* Description */}
        <div className={styles.fieldGroup}>
          <label htmlFor="habit-description" className={styles.label}>
            Description (Optional)
          </label>
          <textarea
            id="habit-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
            placeholder="Add more details about your habit..."
            rows={3}
            maxLength={500}
          />
          {errors.description && <span className={styles.error}>{errors.description}</span>}
        </div>

        {/* Frequency */}
        <div className={styles.fieldGroup}>
          <label htmlFor="habit-frequency" className={styles.label}>
            Frequency
          </label>
          <select
            id="habit-frequency"
            value={formData.targetFrequency}
            onChange={(e) => handleInputChange('targetFrequency', e.target.value)}
            className={styles.select}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Stat Rewards */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Stat Rewards (Optional)</label>
          <div className={styles.statRewards}>
            <div className={styles.statReward}>
              <span className={styles.statIcon}>💪</span>
              <label htmlFor="body-reward" className={styles.statLabel}>Body</label>
              <input
                id="body-reward"
                type="number"
                min="0"
                max="10"
                value={formData.statRewards.body}
                onChange={(e) => handleInputChange('statRewards.body', e.target.value)}
                className={styles.statInput}
              />
            </div>
            
            <div className={styles.statReward}>
              <span className={styles.statIcon}>🧠</span>
              <label htmlFor="mind-reward" className={styles.statLabel}>Mind</label>
              <input
                id="mind-reward"
                type="number"
                min="0"
                max="10"
                value={formData.statRewards.mind}
                onChange={(e) => handleInputChange('statRewards.mind', e.target.value)}
                className={styles.statInput}
              />
            </div>
            
            <div className={styles.statReward}>
              <span className={styles.statIcon}>✨</span>
              <label htmlFor="soul-reward" className={styles.statLabel}>Soul</label>
              <input
                id="soul-reward"
                type="number"
                min="0"
                max="10"
                value={formData.statRewards.soul}
                onChange={(e) => handleInputChange('statRewards.soul', e.target.value)}
                className={styles.statInput}
              />
            </div>
            
            <div className={styles.statReward}>
              <span className={styles.statIcon}>⭐</span>
              <label htmlFor="xp-reward" className={styles.statLabel}>XP</label>
              <input
                id="xp-reward"
                type="number"
                min="0"
                max="50"
                value={formData.statRewards.xp}
                onChange={(e) => handleInputChange('statRewards.xp', e.target.value)}
                className={styles.statInput}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
          >
            {isEditing ? 'Update Habit' : 'Create Habit'}
          </button>
        </div>
      </form>
    </div>
  );
}; 