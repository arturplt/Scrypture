import React, { useState } from 'react';
import { userService } from '../services/userService';
import { tutorialService } from '../services/tutorialService';

import { AutoSaveIndicator } from './AutoSaveIndicator';

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
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const showMessage = (
    msg: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExport = () => {
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = userService.importUserData(data);
        if (success) {
          showMessage('Imported! Refreshing...', 'success');
          onDataChange?.();
          // Refresh the page after import to ensure all data is loaded
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showMessage('Import failed', 'error');
        }
      } catch (error) {
        showMessage('Invalid file', 'error');
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsText(file);
  };

  const handleBackup = () => {
    setIsSaving(true);
    try {
      const backup = userService.createBackup();
      userService.saveBackup(backup);
      showMessage('Backup saved!', 'success');
    } catch (error) {
      showMessage('Backup failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = () => {
    setIsSaving(true);
    try {
      const backup = userService.getBackup();
      if (backup) {
        const success = userService.restoreFromBackup(backup);
        if (success) {
          showMessage('Restored! Refreshing...', 'success');
          onDataChange?.();
          // Refresh the page after restore to ensure all data is loaded
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showMessage('Restore failed', 'error');
        }
      } else {
        showMessage('No backup', 'error');
      }
    } catch (error) {
      showMessage('Restore failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClearData = () => {
    setIsSaving(true);
    try {
      userService.clearAllData();
      tutorialService.resetTutorial();
      showMessage('Data cleared! Refreshing...', 'success');
      onDataChange?.();
      // Refresh the page after clearing data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      showMessage('Clear failed', 'error');
    } finally {
      setIsSaving(false);
      setShowClearConfirm(false);
    }
  };

  const handleCancelClearData = () => {
    setShowClearConfirm(false);
  };

  const getStorageStats = () => {
    const used = Math.round((JSON.stringify(localStorage).length / 1024) * 100) / 100;
    const max = 5120; // 5MB limit
    const percentage = Math.round((used / max) * 100);
    return { used, percentage };
  };

  const stats = getStorageStats();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>Data Manager</span>
          <span>{isOpen ? '▼' : '▲'}</span>
        </button>
        <AutoSaveIndicator isSaving={isSaving} />
      </div>

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
            {!showClearConfirm ? (
              <button
                onClick={handleClearData}
                className={`${styles.button} ${styles.danger}`}
              >
                Clear All
              </button>
            ) : (
              <div className={styles.confirmationContainer}>
                <p className={styles.confirmationMessage}>
                  Are you sure you want to clear all data? This action cannot be undone and will permanently delete all your tasks, habits, user data, and custom categories.
                </p>
                <div className={styles.confirmationActions}>
                  <button
                    onClick={handleCancelClearData}
                    className={styles.button}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmClearData}
                    className={`${styles.button} ${styles.danger}`}
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      )}


    </div>
  );
};

