import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import styles from './TaskForm.module.css';

export const TaskForm: React.FC = () => {
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
    });
    
    setTitle('');
    setDescription('');
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