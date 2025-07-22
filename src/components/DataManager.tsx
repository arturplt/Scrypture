import React, { useState } from 'react';
import { userService } from '../services/userService';
import { categoryService } from '../services/categoryService';
import { taskService } from '../services/taskService';
import styles from './DataManager.module.css';

interface DataManagerProps {
  onDataChange?: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ onDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExport = () => {
    try {
      const data = userService.exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrypture-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage('Exported!', 'success');
    } catch (error) {
      showMessage('Export failed', 'error');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = userService.importUserData(data);
        if (success) {
          showMessage('Imported!', 'success');
          onDataChange?.();
        } else {
          showMessage('Import failed', 'error');
        }
      } catch (error) {
        showMessage('Invalid file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleBackup = () => {
    try {
      const backup = userService.createBackup();
      userService.saveBackup(backup);
      showMessage('Backup saved!', 'success');
    } catch (error) {
      showMessage('Backup failed', 'error');
    }
  };

  const handleRestore = () => {
    try {
      const backup = userService.getBackup();
      if (backup) {
        const success = userService.restoreFromBackup(backup);
        if (success) {
          showMessage('Restored!', 'success');
          onDataChange?.();
        } else {
          showMessage('Restore failed', 'error');
        }
      } else {
        showMessage('No backup', 'error');
      }
    } catch (error) {
      showMessage('Restore failed', 'error');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Clear all data? This cannot be undone.')) {
      const success = userService.clearAllData();
      categoryService.clearCustomCategories();
      if (success) {
        showMessage('Data cleared!', 'success');
        onDataChange?.();
      } else {
        showMessage('Clear failed', 'error');
      }
    }
  };

  const getStorageStats = () => {
    const stats = userService.getStorageStats();
    return {
      used: (stats.used / 1024).toFixed(1), // Convert to KB
      percentage: stats.percentage,
    };
  };

  const stats = getStorageStats();

  // DEBUG: Add tasks for each priority with explicit statRewards
  const handleAddDebugTasks = () => {
    const taskTemplates = [
      {
        title: 'Reflect on Profound Wisdom',
        description: 'Contemplate a meaningful quote or teaching. Write down your insights.',
        category: 'mind',
        statRewards: { mind: 2, xp: 5 }
      },
      {
        title: 'Practice Good Habit',
        description: 'Identify and practice a positive habit today. Note your progress.',
        category: 'body',
        statRewards: { body: 1, mind: 1, xp: 5 }
      },
      {
        title: 'Guided Breathing Exercise',
        description: 'Follow a 5-minute guided breathing session to relax and center yourself.',
        category: 'soul',
        statRewards: { soul: 2, xp: 5 }
      },
      {
        title: 'Mindful Meditation',
        description: 'Spend 10 minutes in mindful meditation. Focus on your breath and let thoughts pass.',
        category: 'soul',
        statRewards: { soul: 2, mind: 1, xp: 5 }
      },
      {
        title: 'Physical Exercise Routine',
        description: 'Complete a specific exercise routine (e.g., yoga, stretching, or a workout).',
        category: 'body',
        statRewards: { body: 2, xp: 5 }
      },
      {
        title: 'Gratitude Practice',
        description: 'Write down three things you are grateful for today.',
        category: 'mind',
        statRewards: { mind: 1, soul: 1, xp: 5 }
      },
    ];
    const priorities = [
      { value: 'low', label: 'Low', xp: 5 },
      { value: 'medium', label: 'Medium', xp: 10 },
      { value: 'high', label: 'High', xp: 15 },
    ];
    taskTemplates.forEach(template => {
      priorities.forEach(priority => {
        let title = template.title;
        let description = template.description;
        // Make titles/descriptions unique for each priority
        if (priority.value === 'medium') {
          title += ' (Focus)';
          description += ' Focus on quality and consistency.';
        } else if (priority.value === 'high') {
          title += ' (Urgent)';
          description += ' Make this your top priority today!';
        }
        taskService.createTask({
          title,
          description,
          category: template.category,
          completed: false,
          priority: priority.value as 'low' | 'medium' | 'high',
          statRewards: { ...template.statRewards, xp: priority.xp }
        });
      });
    });
    showMessage('Debug tasks added!', 'success');
    onDataChange?.();
  };

  // Add Difficulty sample tasks for general well-being and exercise
  const handleAddDifficultyTasks = () => {
    const difficultyTasks = [
      {
        title: 'Morning Stretch Routine',
        description: 'Start your day with a 10-minute full-body stretch.',
        category: 'body',
        statRewards: { body: 2 },
        difficulty: 2,
        baseXp: 10,
      },
      {
        title: 'Hydration Check',
        description: 'Drink at least 2 liters of water today.',
        category: 'body',
        statRewards: { body: 1 },
        difficulty: 1,
        baseXp: 5,
      },
      {
        title: 'Mindful Walk',
        description: 'Take a 20-minute walk outdoors, focusing on your breath and surroundings.',
        category: 'mind',
        statRewards: { mind: 2, body: 1 },
        difficulty: 3,
        baseXp: 20,
      },
      {
        title: 'Gratitude Journal',
        description: 'Write down three things you are grateful for.',
        category: 'mind',
        statRewards: { mind: 2, soul: 1 },
        difficulty: 2,
        baseXp: 15,
      },
      {
        title: 'Evening Relaxation',
        description: 'Spend 15 minutes doing a relaxing activity (reading, music, etc.).',
        category: 'soul',
        statRewards: { soul: 2, mind: 1 },
        difficulty: 2,
        baseXp: 8,
      },
      {
        title: 'Cardio Exercise',
        description: 'Complete 30 minutes of moderate cardio (jogging, cycling, etc.).',
        category: 'body',
        statRewards: { body: 3 },
        difficulty: 5,
        baseXp: 50,
      },
      {
        title: 'Digital Detox',
        description: 'Avoid screens for 1 hour before bed.',
        category: 'mind',
        statRewards: { mind: 2, soul: 1 },
        difficulty: 3,
        baseXp: 0,
      },
      {
        title: 'Healthy Meal Prep',
        description: 'Prepare a balanced, healthy meal for yourself.',
        category: 'body',
        statRewards: { body: 2, mind: 1 },
        difficulty: 3,
        baseXp: 100,
      },
    ];
    const priorities = [
      { value: 'low', label: 'Low', xpMultiplier: 1 },
      { value: 'medium', label: 'Medium', xpMultiplier: 2 },
      { value: 'high', label: 'High', xpMultiplier: 3 },
    ];
    difficultyTasks.forEach(template => {
      priorities.forEach(priority => {
        let title = template.title;
        let description = template.description;
        if (priority.value === 'medium') {
          title += ' (Focus)';
          description += ' Focus on quality and consistency.';
        } else if (priority.value === 'high') {
          title += ' (Urgent)';
          description += ' Make this your top priority today!';
        }
        // Calculate xp: baseXp * multiplier, clamp to 0-100
        let xp = Math.round((template.baseXp || 0) * priority.xpMultiplier);
        if (xp > 100) xp = 100;
        if (xp < 0) xp = 0;
        taskService.createTask({
          title,
          description,
          category: template.category,
          completed: false,
          priority: priority.value as 'low' | 'medium' | 'high',
          statRewards: { ...template.statRewards, xp },
          difficulty: template.difficulty,
        });
      });
    });
    showMessage('Difficulty sample tasks added!', 'success');
    onDataChange?.();
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Data Manager</span>
        <span>{isOpen ? '▼' : '▲'}</span>
      </button>

      {message && (
        <div className={`${styles.message} ${styles[messageType]}`}>
          {message}
        </div>
      )}

      {isOpen && (
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Storage</h3>
            <div className={styles.stats}>
              <span>{stats.used} KB</span>
              <span>{stats.percentage}% used</span>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Backup</h3>
            <div className={styles.buttonGroup}>
              <button onClick={handleBackup} className={styles.button}>
                Save
              </button>
              <button onClick={handleRestore} className={styles.button}>
                Load
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Export</h3>
            <div className={styles.buttonGroup}>
              <button onClick={handleExport} className={styles.button}>
                Export
              </button>
              <label className={styles.button}>
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Danger</h3>
            <button
              onClick={handleClearData}
              className={`${styles.button} ${styles.danger}`}
            >
              Clear All
            </button>
          </div>

          <div className={styles.section}>
            <h3>Debug</h3>
            <button onClick={handleAddDebugTasks} className={styles.button}>
              Add Example Tasks
            </button>
            <button onClick={handleAddDifficultyTasks} className={styles.button}>
              Add Difficulty Sample Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 