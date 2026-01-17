import React, { useRef, useEffect, useState } from 'react';
import { getSpriteById } from '../../data/atlasMapping';
import styles from './Button.module.css';

export type ButtonSize = 'small' | 'medium' | 'large' | 'wide' | 'themed';
export type ButtonTheme = 'body' | 'mind' | 'soul';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: ButtonSize;
  theme?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  buttonId?: string;
}

const BUTTON_THEMES = {
  primary: 'green-frame',
  secondary: 'silver',
  danger: 'red-frame',
  success: 'green-button'
};

const BUTTON_SIZES = {
  small: { scale: 1, padding: 8 },
  medium: { scale: 2, padding: 12 },
  large: { scale: 3, padding: 16 }
};

const SIZE_CLASS_MAP: Record<ButtonSize, 'small' | 'medium' | 'large'> = {
  small: 'small',
  medium: 'medium',
  large: 'large',
  wide: 'large',
  themed: 'small'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  theme,
  type = 'button',
  className = '',
  loading = false,
  icon,
  buttonId,
  ...rest
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [atlasImage, setAtlasImage] = useState<HTMLImageElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Load atlas image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setAtlasImage(img);
    img.src = '/assets/Frames/Atlas.png';
  }, []);

  // Get button configuration
  const selectedTheme = theme || BUTTON_THEMES[variant];
  const sizeClass = SIZE_CLASS_MAP[size];
  const sizeConfig = BUTTON_SIZES[sizeClass];
  
  // Draw button frame
  useEffect(() => {
    if (!canvasRef.current || !atlasImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const buttonWidth = 96; // 3 sprites * 32px (scale 2)
    const buttonHeight = 32; // 1 sprite * 32px (scale 2)
    
    canvas.width = buttonWidth;
    canvas.height = buttonHeight;

    // Clear canvas
    ctx.clearRect(0, 0, buttonWidth, buttonHeight);
    
    // Disable image smoothing for pixel art
    ctx.imageSmoothingEnabled = false;

    // Get sprites for button frame
    const leftSprite = getSpriteById(`frame-edge-left-${selectedTheme}`);
    const centerSprite = getSpriteById(`frame-background-${selectedTheme}`);
    const rightSprite = getSpriteById(`frame-edge-right-${selectedTheme}`);

    if (leftSprite && centerSprite && rightSprite) {
      const spriteSize = 16 * sizeConfig.scale;
      
      // Draw left edge
      ctx.drawImage(
        atlasImage,
        leftSprite.x, leftSprite.y, leftSprite.width, leftSprite.height,
        0, 0, spriteSize, spriteSize
      );

      // Draw center (repeatable)
      ctx.drawImage(
        atlasImage,
        centerSprite.x, centerSprite.y, centerSprite.width, centerSprite.height,
        spriteSize, 0, spriteSize, spriteSize
      );

      // Draw right edge
      ctx.drawImage(
        atlasImage,
        rightSprite.x, rightSprite.y, rightSprite.width, rightSprite.height,
        spriteSize * 2, 0, spriteSize, spriteSize
      );
    }
  }, [atlasImage, selectedTheme, sizeConfig.scale, isHovered, isPressed]);

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    onMouseEnter?.(event);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    setIsPressed(false);
    onMouseLeave?.(event);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    onMouseDown?.(event);
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onMouseUp?.(event);
  };

  const buttonClasses = [
    styles.button,
    styles[`button-${variant}`],
    styles[`button-${sizeClass}`],
    disabled && styles.disabled,
    loading && styles.loading,
    isHovered && styles.hovered,
    isPressed && styles.pressed,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      data-button-id={buttonId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...rest}
    >
      <canvas 
        ref={canvasRef}
        className={styles.buttonCanvas}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <span className={styles.buttonContent}>
        {loading ? (
          <>
            <span className={styles.spinner}>⟳</span>
            Loading...
          </>
        ) : (
          <>
            {icon && <span>{icon}</span>}
            {children}
          </>
        )}
      </span>
    </button>
  );
};

export const SmallButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} size="small" />
);

export const WideButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} size="wide" />
);

export const ThemedButton: React.FC<ButtonProps & { theme: ButtonTheme }> = (props) => (
  <Button {...props} size="themed" />
);

export const BodyButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} size="themed" theme="body" />
);

export const MindButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} size="themed" theme="mind" />
);

export const SoulButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} size="themed" theme="soul" />
);

export default Button;