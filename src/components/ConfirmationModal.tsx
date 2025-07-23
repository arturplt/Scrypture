import React from 'react';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'danger' | 'primary';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonStyle = 'primary',
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.confirmButton} ${confirmButtonStyle === 'danger' ? styles.dangerButton : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
