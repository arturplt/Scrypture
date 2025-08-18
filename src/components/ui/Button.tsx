/**
 * Button Component - Sprite-based button with state management
 * Supports small (16x16), wide (16x32), and themed buttons with hover/pressed states
 */

import React, { useState, useMemo } from 'react';
import { useAssetManager } from '../../hooks/useAssetManager';
import styles from './Button.module.css';

export type ButtonSize = 'small' | 'wide' | 'themed';
export type ButtonTheme = 'body' | 'mind' | 'soul';
export type ButtonState = 'normal' | 'hover' | 'pressed' | 'disabled';

export interface ButtonProps {
  /** Button ID from asset manager */
  buttonId?: string;
  /** Button size category */
  size?: ButtonSize;
  /** Button theme (for themed buttons) */
  theme?: ButtonTheme;
  /** Button text content */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Accessibility label */
  'aria-label'?: string;
  /** Whether to show loading state */
  loading?: boolean;
  /** Icon element */
  icon?: React.ReactNode;
  /** Whether to show loading state while assets load */
  showLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  buttonId,
  size = 'small',
  theme,
  children,
  onClick,
  disabled = false,
  className = '',
  style = {},
  type = 'button',
  'aria-label': ariaLabel,
  loading = false,
  icon,
  showLoading = true
}) => {
  const { getButtonConfig, getButtonBackground, getButtonsBySize, isAssetLoaded } = useAssetManager();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Determine button ID if not provided
  const resolvedButtonId = useMemo(() => {
    if (buttonId) return buttonId;
    
    if (size === 'themed' && theme) {
      return `button-${theme}`;
    }
    
    const buttons = getButtonsBySize(size);
    return buttons[0]?.id || `button-${size}-1`;
  }, [buttonId, size, theme, getButtonsBySize]);

  const buttonConfig = getButtonConfig(resolvedButtonId);
  const isAssetReady = isAssetLoaded('frames-and-buttons');

  // Determine current button state
  const currentState: ButtonState = useMemo(() => {
    if (disabled || loading) return 'disabled';
    if (isPressed) return 'pressed';
    if (isHovered) return 'hover';
    return 'normal';
  }, [disabled, loading, isPressed, isHovered]);

  // Get background style for current state
  const backgroundStyle = useMemo(() => {
    if (!buttonConfig || !isAssetReady) return {};
    
    try {
      const background = getButtonBackground(resolvedButtonId, currentState);
      return { backgroundImage: background };
    } catch (error) {
      console.warn(`Failed to get button background for ${resolvedButtonId}:`, error);
      return {};
    }
  }, [buttonConfig, isAssetReady, resolvedButtonId, currentState, getButtonBackground]);

  // Calculate button dimensions
  const buttonStyles = useMemo(() => {
    const baseStyles = {
      width: buttonConfig?.width ? `${buttonConfig.width * 2}px` : 'auto',
      height: buttonConfig?.height ? `${buttonConfig.height * 2}px` : 'auto',
      minWidth: size === 'wide' ? '64px' : '32px',
      minHeight: '32px',
      ...backgroundStyle,
      ...style
    };

    return baseStyles;
  }, [buttonConfig, size, backgroundStyle, style]);

  // Event handlers
  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };

  // Loading state
  if (!isAssetReady && showLoading) {
    return (
      <button
        type={type}
        disabled
        className={`${styles.button} ${styles.loading} ${className}`}
        style={buttonStyles}
        aria-label={ariaLabel}
      >
        <div className={styles.loadingSpinner} />
        {children}
      </button>
    );
  }

  // Error state (no button config)
  if (!buttonConfig) {
    return (
      <button
        type={type}
        disabled
        className={`${styles.button} ${styles.error} ${className}`}
        style={buttonStyles}
        aria-label={ariaLabel}
      >
        {children || `Button not found: ${resolvedButtonId}`}
      </button>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${styles.button}
        ${styles[`button-${size}`]}
        ${theme ? styles[`button-${theme}`] : ''}
        ${styles[`state-${currentState}`]}
        ${loading ? styles.loading : ''}
        ${className}
      `}
      style={buttonStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      aria-label={ariaLabel}
      data-button-id={resolvedButtonId}
      data-button-size={size}
      data-button-theme={theme}
      data-button-state={currentState}
    >
      {loading && <div className={styles.loadingSpinner} />}
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span className={styles.text}>{children}</span>}
    </button>
  );
};

// Convenience components for different button types
export const SmallButton: React.FC<Omit<ButtonProps, 'size'>> = (props) => (
  <Button {...props} size="small" />
);

export const WideButton: React.FC<Omit<ButtonProps, 'size'>> = (props) => (
  <Button {...props} size="wide" />
);

export const ThemedButton: React.FC<Omit<ButtonProps, 'size'> & { theme: ButtonTheme }> = (props) => (
  <Button {...props} size="themed" />
);

// Specific themed buttons
export const BodyButton: React.FC<Omit<ButtonProps, 'size' | 'theme'>> = (props) => (
  <Button {...props} size="themed" theme="body" />
);

export const MindButton: React.FC<Omit<ButtonProps, 'size' | 'theme'>> = (props) => (
  <Button {...props} size="themed" theme="mind" />
);

export const SoulButton: React.FC<Omit<ButtonProps, 'size' | 'theme'>> = (props) => (
  <Button {...props} size="themed" theme="soul" />
);
