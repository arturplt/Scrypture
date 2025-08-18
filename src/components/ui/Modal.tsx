/**
 * Enhanced Modal Component
 * Integrates with frame and theme systems for consistent UI
 */

import React, { useEffect, useRef } from 'react';
import { useThemeManager } from '../../hooks/useThemeManager';
import { useAssetManager } from '../../hooks/useAssetManager';
import { Frame } from './Frame';
import { Button } from './Button';
import styles from './Modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  customPadding?: string;
  position?: 'center' | 'bottom';
  size?: 'small' | 'medium' | 'large' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = React.memo(({
  isOpen,
  onClose,
  title,
  children,
  customPadding,
  position = 'center',
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}) => {
  const { getCurrentColors } = useThemeManager();
  const { state: assetState } = useAssetManager();
  const modalRef = useRef<HTMLDivElement>(null);
  const colors = getCurrentColors();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape, closeOnOverlayClick]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getModalSize = () => {
    switch (size) {
      case 'small': return styles.modalSmall;
      case 'large': return styles.modalLarge;
      case 'full': return styles.modalFull;
      default: return styles.modalMedium;
    }
  };

  const getContentPadding = () => {
    if (customPadding) return customPadding;
    switch (size) {
      case 'small': return '16px';
      case 'large': return '24px';
      case 'full': return '20px';
      default: return '20px';
    }
  };

  return (
    <div 
      className={`${styles.overlay} ${position === 'bottom' ? styles.overlayBottom : ''}`} 
      onClick={handleOverlayClick}
      style={{
        '--modal-bg': colors.frame.background || '#1a1a1a',
        '--modal-border': colors.frame.border || '#444',
        '--modal-text': colors.frame.text || '#e8e5d2',
      } as React.CSSProperties}
    >
      <div 
        ref={modalRef}
        className={`${styles.modal} ${getModalSize()} ${position === 'bottom' ? styles.modalBottom : ''} ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Frame 
          theme="current"
          scale={1}
          className={styles.modalFrame}
        >
          <div className={styles.modalContent}>
            <div className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              {showCloseButton && (
                <Button
                  size="small"
                  theme="body"
                  onClick={onClose}
                  className={styles.closeButton}
                  aria-label="Close modal"
                >
                  ×
                </Button>
              )}
            </div>
            
            <div 
              className={styles.content} 
              style={{ padding: getContentPadding() }}
            >
              {children}
            </div>
          </div>
        </Frame>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';
