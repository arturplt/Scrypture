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
        
        <div style={{ position: 'relative' }}>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className={styles.prioritySelect}
            required
            onInvalid={handleInvalid}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className={styles.validationMessage}>
            Please select a priority.
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
      
      <button type="submit" className={styles.submitButton}>
        Add Task
      </button>
    </form>
  );
}; 