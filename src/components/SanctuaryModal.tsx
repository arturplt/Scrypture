import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Sanctuary from './Sanctuary';
import styles from './SanctuaryModal.module.css';

interface SanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const SanctuaryModal: React.FC<SanctuaryModalProps> = ({ isOpen, onClose, className }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousBodyOverflow = useRef<string>('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      previousBodyOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousBodyOverflow.current;
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow.current;
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle click outside to close modal
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Prevent scroll on canvas area
  const handleCanvasWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleCanvasTouchMove = (event: React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (!isOpen) return null;



  return createPortal(
    <div 
      className={styles.modalOverlay} 
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`${styles.modalContent} ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close Sanctuary"
          title="Close Sanctuary (Esc)"
        >
          ✕
        </button>

        {/* Sanctuary component with scroll prevention */}
        <div 
          className={styles.sanctuaryContainer}
          onWheel={handleCanvasWheel}
          onTouchMove={handleCanvasTouchMove}
        >
          <Sanctuary onExit={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SanctuaryModal; 