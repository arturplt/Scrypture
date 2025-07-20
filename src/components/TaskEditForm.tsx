import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { useTasks } from '../hooks/useTasks';
import styles from './TaskForm.module.css';

interface TaskEditFormProps {
  task: Task;
  onCancel: () => void;
}

export const TaskEditForm: React.FC<TaskEditFormProps> = ({ task, onCancel }) => {
  const { updateTask } = useTasks();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [category, setCategory] = useState<'body' | 'mind' | 'soul' | 'career' | 'home' | 'skills'>((task.category as 'body' | 'mind' | 'soul' | 'career' | 'home' | 'skills') || 'body');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task.priority);

  // Update form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory((task.category as 'body' | 'mind' | 'soul' | 'career' | 'home' | 'skills') || 'body');
    setPriority(task.priority);
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
    });
    
    onCancel();
  };

  const handleCancel = () => {
    // Reset form to original values
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory((task.category as 'body' | 'mind' | 'soul' | 'career' | 'home' | 'skills') || 'body');
    setPriority(task.priority);
    onCancel();
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

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.inputGroup}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className={styles.titleInput}
            required
            minLength={1}
            maxLength={100}
          />
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
        />
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
      </div>
    </form>
  );
}; 