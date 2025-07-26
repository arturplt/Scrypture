import React, { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  customPadding?: string;
  position?: 'center' | 'bottom';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  customPadding,
  position = 'center',
}) => {
  console.log('Modal render - isOpen:', isOpen, 'title:', title);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      console.log('Modal isOpen - adding event listeners');
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    console.log('Modal not rendering - isOpen is false');
    return null;
  }

  console.log('Modal rendering with title:', title);
  return (
    <div className={`${styles.overlay} ${position === 'bottom' ? styles.overlayBottom : ''}`} onClick={onClose}>
      <div className={`${styles.modal} ${position === 'bottom' ? styles.modalBottom : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div 
          className={styles.content} 
          style={customPadding ? { padding: customPadding } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
