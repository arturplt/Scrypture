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
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>(
    'info'
  );

  const showMessage = (
    msg: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
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


  // Add Difficulty sample tasks demonstrating full difficulty range
  const handleAddDifficultyTasks = () => {
    const difficultyTasks = [
      // Difficulty 0-1: Very Easy
      {
        title: 'Take 5 deep breaths',
        description: 'Pause and take exactly 5 slow, deep breaths.',
        category: 'soul',
        statRewards: { soul: 1 },
        difficulty: 0,
        baseXp: 5,
      },
      {
        title: 'Drink 1 glass of water',
        description: 'Drink exactly 1 full glass of water.',
        category: 'body',
        statRewards: { body: 1 },
        difficulty: 0,
        baseXp: 5,
      },
      {
        title: 'Learn 1 new word',
        description: 'Look up and learn the meaning of 1 new word.',
        category: 'mind',
        statRewards: { mind: 1 },
        difficulty: 1,
        baseXp: 10,
      },

      // Difficulty 2-3: Easy
      {
        title: 'Do 5 push-ups',
        description: 'Complete exactly 5 push-ups (modify form as needed).',
        category: 'body',
        statRewards: { body: 1 },
        difficulty: 2,
        baseXp: 15,
      },
      {
        title: 'Write 1 gratitude',
        description: 'Write down exactly 1 thing you are grateful for.',
        category: 'soul',
        statRewards: { soul: 1 },
        difficulty: 2,
        baseXp: 15,
      },
      {
        title: 'Read 2 pages',
        description: 'Read exactly 2 pages of any book or article.',
        category: 'mind',
        statRewards: { mind: 1 },
        difficulty: 3,
        baseXp: 20,
      },

      // Difficulty 4-5: Medium
      {
        title: 'Do 20 push-ups',
        description: 'Complete exactly 20 push-ups in sets of 5.',
        category: 'body',
        statRewards: { body: 2 },
        difficulty: 4,
        baseXp: 30,
      },
      {
        title: 'Meditate for 10 minutes',
        description: 'Sit in meditation for exactly 10 minutes.',
        category: 'soul',
        statRewards: { soul: 2 },
        difficulty: 4,
        baseXp: 35,
      },
      {
        title: 'Write 200 words',
        description: 'Write exactly 200 words on any topic.',
        category: 'mind',
        statRewards: { mind: 2 },
        difficulty: 5,
        baseXp: 40,
      },

      // Difficulty 6-7: Hard
      {
        title: 'Do 50 push-ups',
        description: 'Complete exactly 50 push-ups in sets of 10.',
        category: 'body',
        statRewards: { body: 3 },
        difficulty: 6,
        baseXp: 60,
      },
      {
        title: 'Study for 45 minutes',
        description: 'Dedicated study session for exactly 45 minutes.',
        category: 'mind',
        statRewards: { mind: 3 },
        difficulty: 6,
        baseXp: 65,
      },
      {
        title: 'Meditate for 30 minutes',
        description: 'Sit in meditation for exactly 30 minutes.',
        category: 'soul',
        statRewards: { soul: 3 },
        difficulty: 7,
        baseXp: 70,
      },

      // Difficulty 8-9: Very Hard
      {
        title: 'Do 100 push-ups',
        description: 'Complete exactly 100 push-ups in sets of 20.',
        category: 'body',
        statRewards: { body: 4 },
        difficulty: 8,
        baseXp: 90,
      },
      {
        title: 'Write 1000 words',
        description: 'Write exactly 1000 words on any topic.',
        category: 'mind',
        statRewards: { mind: 4 },
        difficulty: 8,
        baseXp: 95,
      },
      {
        title: 'Face 3 inner truths',
        description: 'Confront 3 difficult truths about yourself.',
        category: 'soul',
        statRewards: { soul: 4 },
        difficulty: 9,
        baseXp: 100,
      },

      // Difficulty 10: Extreme
      {
        title: 'Complete triathlon training',
        description: 'Train for swimming, cycling, and running for 90 minutes.',
        category: 'body',
        statRewards: { body: 5, mind: 2 },
        difficulty: 10,
        baseXp: 150,
      },
      {
        title: 'Master 5 new skills',
        description: 'Learn and practice 5 new skills for 2 hours total.',
        category: 'mind',
        statRewards: { mind: 5, body: 2 },
        difficulty: 10,
        baseXp: 150,
      },
      {
        title: 'Transform yourself in 3 areas',
        description: 'Make significant positive changes in mind, body, and soul.',
        category: 'soul',
        statRewards: { body: 2, mind: 2, soul: 5 },
        difficulty: 10,
        baseXp: 150,
      },

      // Mixed attribute examples
      {
        title: 'Exercise while learning',
        description: 'Do 30 push-ups while listening to an educational podcast.',
        category: 'body',
        statRewards: { body: 2, mind: 1 },
        difficulty: 5,
        baseXp: 45,
      },
      {
        title: 'Mindful workout',
        description: 'Complete a 20-minute workout with full mindfulness.',
        category: 'body',
        statRewards: { body: 2, soul: 1 },
        difficulty: 5,
        baseXp: 45,
      },
      {
        title: 'Creative expression',
        description: 'Express yourself through art, music, or writing for 30 minutes.',
        category: 'soul',
        statRewards: { mind: 1, soul: 2 },
        difficulty: 6,
        baseXp: 55,
      },
    ];
    const priorities = [
      { value: 'low', label: 'Low', xpMultiplier: 1 },
      { value: 'medium', label: 'Medium', xpMultiplier: 2 },
      { value: 'high', label: 'High', xpMultiplier: 3 },
    ];
    difficultyTasks.forEach((template) => {
      priorities.forEach((priority) => {
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
            <button
              onClick={handleAddDifficultyTasks}
              className={styles.button}
            >
              Add Difficulty Sample Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

