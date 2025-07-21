import React, { useState } from 'react';
import { userService } from '../services/userService';
import { categoryService } from '../services/categoryService';
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
        </div>
      )}
    </div>
  );
}; 