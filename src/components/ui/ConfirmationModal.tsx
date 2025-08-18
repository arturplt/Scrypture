/**
 * Enhanced Confirmation Modal Component
 * Uses new Modal and Button systems for consistent theming
 */

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import styles from './ConfirmationModal.module.css';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'danger' | 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  icon?: string;
  className?: string;
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
  size = 'medium',
  showIcon = false,
  icon = '⚠️',
  className,
}) => {
  const getConfirmButtonTheme = () => {
    switch (confirmButtonStyle) {
      case 'danger': return 'body';
      case 'secondary': return 'soul';
      default: return 'mind';
    }
  };

  const getCancelButtonTheme = () => {
    return 'soul';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size={size}
      closeOnOverlayClick={false}
      className={className}
    >
      <div className={styles.content}>
        {showIcon && (
          <div className={styles.iconContainer}>
            <span className={styles.icon}>{icon}</span>
          </div>
        )}
        
        <div className={styles.messageContainer}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          <Button
            theme={getCancelButtonTheme()}
            size="medium"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            {cancelText}
          </Button>
          
          <Button
            theme={getConfirmButtonTheme()}
            size="medium"
            onClick={onConfirm}
            className={styles.confirmButton}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
