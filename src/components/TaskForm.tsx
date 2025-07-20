import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { taskService } from '../services/taskService';
import styles from './TaskForm.module.css';

export const TaskForm: React.FC = () => {
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'body' | 'mind' | 'soul' | 'career' | 'home' | 'skills'>('body');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

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

  const priorityOptions = [
    { value: 'low', label: 'LOW PRIORITY', color: 'var(--color-easy)' },
    { value: 'medium', label: 'MEDIUM PRIORITY', color: 'var(--color-focus)' },
    { value: 'high', label: 'HIGH PRIORITY', color: 'var(--color-urgent)' }
  ];

  const categoryOptions = [
    { value: 'body', label: '💪 BODY', icon: '💪', color: 'var(--color-body)' },
    { value: 'mind', label: '🧠 MIND', icon: '🧠', color: 'var(--color-mind)' },
    { value: 'soul', label: '✨ SOUL', icon: '✨', color: 'var(--color-soul)' },
    { value: 'career', label: '💼 CAREER', icon: '💼', color: 'var(--color-career)' },
    { value: 'home', label: '🏠 HOME', icon: '🏠', color: 'var(--color-home)' },
    { value: 'skills', label: '🎯 SKILLS', icon: '🎯', color: 'var(--color-skills)' }
  ];

  const getStatRewards = () => {
    const rewards = taskService.calculateStatRewards(category);
    // Filter out XP from the display since it's handled separately
    const { xp, ...statRewards } = rewards;
    return { statRewards, xp };
  };

  return (
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
            onInvalid={handleInvalid}
          />
          <div className={styles.validationMessage}>
            Please fill in this field.
          </div>
        </div>
      </div>
      
      <div style={{ position: 'relative' }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className={styles.descriptionInput}
          rows={3}
          maxLength={500}
          onInvalid={handleInvalid}
        />
        <div className={styles.validationMessage}>
          Description is too long.
        </div>
      </div>
      
      <div className={styles.categorySelector}>
        <label className={styles.categoryLabel}>Category:</label>
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
              onClick={() => setCategory(option.value as 'body' | 'mind' | 'soul' | 'career' | 'home' | 'skills')}
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
            <div key={stat} className={styles.statReward}>
              <span className={styles.statIcon}>
                {stat === 'body' ? '💪' : stat === 'mind' ? '🧠' : '✨'}
              </span>
              <span className={styles.statName}>{stat.toUpperCase()}</span>
              <span className={styles.statValue}>+{value}</span>
            </div>
          ))}
          {getStatRewards().xp && (
            <div className={styles.statReward}>
              <span className={styles.statIcon}>⭐</span>
              <span className={styles.statName}>XP</span>
              <span className={styles.statValue}>+{getStatRewards().xp}</span>
            </div>
          )}
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
              onClick={() => setPriority(option.value as 'low' | 'medium' | 'high')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <button type="submit" className={styles.submitButton}>
        Add Task
      </button>
    </form>
  );
}; 