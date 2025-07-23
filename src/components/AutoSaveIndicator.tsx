import React, { useState, useEffect } from 'react';
import styles from './AutoSaveIndicator.module.css';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date | null;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving,
  lastSaved,
  className = '',
}) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved && !isSaving) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved, isSaving]);

  if (!isSaving && !showSaved) {
    return null;
  }

  return (
    <div className={`${styles.indicator} ${className}`}>
      {isSaving ? (
        <span className={styles.saving}>
          <span className={styles.dot}>●</span>
          Saving...
        </span>
      ) : (
        <span className={styles.saved}>
          <span className={styles.check}>✓</span>
          Saved
        </span>
      )}
    </div>
  );
};
