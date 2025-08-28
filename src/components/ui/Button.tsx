import React, { useRef, useEffect, useState } from 'react';
import { getSpriteById } from '../../data/atlasMapping';
import styles from './Button.module.css';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  theme?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  loading?: boolean;
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

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  theme,
  type = 'button',
  className = '',
  loading = false
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
  const sizeConfig = BUTTON_SIZES[size];
  
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

  const buttonClasses = [
    styles.button,
    styles[`button-${variant}`],
    styles[`button-${size}`],
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
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
          children
        )}
      </span>
    </button>
  );
};

export default Button;