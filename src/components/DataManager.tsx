import React, { useState } from 'react';
import { userService } from '../services/userService';
import { categoryService } from '../services/categoryService';
import { useTasks } from '../hooks/useTasks';
import styles from './DataManager.module.css';

interface DataManagerProps {
  onDataChange?: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ onDataChange }) => {
  const { addTask, refreshTasks } = useTasks();
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
      // Clear Start Here progress
      localStorage.removeItem('startHereGivenTasks');
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

  // Difficulty sample tasks
  const difficultySamples = [
    // Difficulty 0 - Easiest
    {
      title: 'Drink 3 glasses of water',
      description: 'Stay hydrated with exactly 3 full glasses of water',
      priority: 'low' as const,
      category: 'body',
      statRewards: { body: 1, xp: 15 },
      difficulty: 0,
    },
    {
      title: 'Light 3 candles',
      description: 'Create a peaceful atmosphere with 3 candles',
      priority: 'low' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 15 },
      difficulty: 0,
    },
    // Difficulty 1 - Very Easy
    {
      title: 'Take 10 deep breaths',
      description: 'Pause and take exactly 10 slow, deep breaths',
      priority: 'low' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 15 },
      difficulty: 1,
    },
    {
      title: 'Stretch for 5 minutes',
      description: 'Do a focused stretching routine for exactly 5 minutes',
      priority: 'low' as const,
      category: 'body',
      statRewards: { body: 1, xp: 15 },
      difficulty: 1,
    },
    {
      title: 'Read 5 pages',
      description: 'Read exactly 5 pages of any book or article',
      priority: 'low' as const,
      category: 'mind',
      statRewards: { mind: 1, xp: 15 },
      difficulty: 1,
    },
    // Difficulty 2 - Easy
    {
      title: 'Do 10 push-ups',
      description: 'Complete exactly 10 push-ups (modify form as needed)',
      priority: 'low' as const,
      category: 'body',
      statRewards: { body: 1, xp: 20 },
      difficulty: 2,
    },
    {
      title: 'Write 3 ideas',
      description: 'Write down exactly 3 new ideas or thoughts',
      priority: 'low' as const,
      category: 'mind',
      statRewards: { mind: 1, xp: 20 },
      difficulty: 2,
    },
    {
      title: 'Express 5 gratitudes',
      description: 'Write down or say exactly 5 things you\'re grateful for',
      priority: 'low' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 20 },
      difficulty: 2,
    },
    // Difficulty 3 - Moderate
    {
      title: 'Take a 30-min walk',
      description: 'Go for a brisk walk for exactly 30 minutes',
      priority: 'medium' as const,
      category: 'body',
      statRewards: { body: 1, xp: 40 },
      difficulty: 3,
    },
    {
      title: 'Learn 10 new words',
      description: 'Look up and learn the meaning of 10 new words',
      priority: 'medium' as const,
      category: 'mind',
      statRewards: { mind: 1, xp: 40 },
      difficulty: 3,
    },
    {
      title: 'Listen to 3 songs mindfully',
      description: 'Listen to 3 songs with full attention and presence',
      priority: 'medium' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 40 },
      difficulty: 3,
    },
    // Difficulty 4 - Medium
    {
      title: 'Do 30 push-ups',
      description: 'Complete exactly 30 push-ups in sets of 10',
      priority: 'medium' as const,
      category: 'body',
      statRewards: { body: 1, xp: 45 },
      difficulty: 4,
    },
    {
      title: 'Reflect for 15 minutes',
      description: 'Spend exactly 15 minutes in quiet reflection',
      priority: 'medium' as const,
      category: 'mind',
      statRewards: { mind: 1, xp: 40 },
      difficulty: 4,
    },
    {
      title: 'Journal for 20 minutes',
      description: 'Write in your journal for exactly 20 minutes',
      priority: 'medium' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 45 },
      difficulty: 4,
    },
    // Difficulty 5 - Challenging
    {
      title: 'Do 50 sit-ups',
      description: 'Complete exactly 50 sit-ups or crunches',
      priority: 'medium' as const,
      category: 'body',
      statRewards: { body: 1, xp: 45 },
      difficulty: 5,
    },
    {
      title: 'Study for 30 minutes',
      description: 'Dedicated study session for exactly 30 minutes',
      priority: 'medium' as const,
      category: 'mind',
      statRewards: { mind: 1, xp: 50 },
      difficulty: 5,
    },
    {
      title: 'Meditate for 15 minutes',
      description: 'Sit in meditation for exactly 15 minutes',
      priority: 'medium' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 50 },
      difficulty: 5,
    },
    // Difficulty 6 - Hard
    {
      title: 'Do 100 jumping jacks',
      description: 'Complete exactly 100 jumping jacks in sets of 25',
      priority: 'medium' as const,
      category: 'body',
      statRewards: { body: 1, xp: 50 },
      difficulty: 6,
    },
    {
      title: 'Write 500 words',
      description: 'Write exactly 500 words on any topic',
      priority: 'medium' as const,
      category: 'mind',
      statRewards: { mind: 1, xp: 55 },
      difficulty: 6,
    },
    {
      title: 'Connect with 3 friends',
      description: 'Reach out to 3 people you care about',
      priority: 'medium' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 50 },
      difficulty: 6,
    },
    // Difficulty 7 - Very Hard
    {
      title: 'Do 20 burpees',
      description: 'Complete exactly 20 burpees (modify as needed)',
      priority: 'medium' as const,
      category: 'body',
      statRewards: { body: 1, xp: 55 },
      difficulty: 7,
    },
    {
      title: 'Solve 10 puzzles',
      description: 'Complete 10 crossword clues, sudoku cells, or brain teasers',
      priority: 'medium' as const,
      category: 'mind',
      statRewards: { mind: 1, xp: 60 },
      difficulty: 7,
    },
    {
      title: 'Practice forgiveness for 20 minutes',
      description: 'Spend 20 minutes practicing forgiveness meditation',
      priority: 'medium' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 55 },
      difficulty: 7,
    },
    // Difficulty 8 - Expert
    {
      title: 'Do 100 push-ups',
      description: 'Complete exactly 100 push-ups in sets of 20',
      priority: 'high' as const,
      category: 'body',
      statRewards: { body: 1, xp: 90 },
      difficulty: 8,
    },
    {
      title: 'Complete 60-min deep work',
      description: 'Focus on a complex task for exactly 60 minutes without interruption',
      priority: 'high' as const,
      category: 'mind',
      statRewards: { mind: 1, xp: 90 },
      difficulty: 8,
    },
    {
      title: 'Meditate for 45 minutes',
      description: 'Sit in meditation for exactly 45 minutes',
      priority: 'high' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 90 },
      difficulty: 8,
    },
    // Difficulty 9 - Master
    {
      title: 'Run 5 kilometers',
      description: 'Run exactly 5 kilometers at your own pace',
      priority: 'high' as const,
      category: 'body',
      statRewards: { body: 1, xp: 110 },
      difficulty: 9,
    },
    {
      title: 'Solve 10 complex problems',
      description: 'Tackle 10 challenging intellectual problems or projects',
      priority: 'high' as const,
      category: 'mind',
      statRewards: { mind: 1, xp: 120 },
      difficulty: 9,
    },
    {
      title: 'Face 3 inner truths',
      description: 'Confront 3 difficult truths about yourself',
      priority: 'high' as const,
      category: 'soul',
      statRewards: { soul: 1, xp: 120 },
      difficulty: 9,
    },
  ];

  const handleAddDifficultySamples = async () => {
    for (let i = 0; i < difficultySamples.length; i++) {
      const sample = difficultySamples[i];
      addTask({
        title: sample.title,
        description: sample.description,
        completed: false,
        priority: sample.priority,
        category: sample.category,
        statRewards: { ...sample.statRewards },
        difficulty: sample.difficulty,
      });
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    setTimeout(() => {
      refreshTasks();
    }, 100);
    showMessage('Difficulty samples added!', 'success');
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
            <h3>Samples</h3>
            <button
              onClick={handleAddDifficultySamples}
              className={styles.button}
            >
              Add Difficulty Samples
            </button>
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


        </div>
      )}
    </div>
  );
};

