import React, { useRef, useEffect, useState } from 'react';
import { getSpriteById } from '../../data/atlasMapping';
import { themeManager } from '../../utils/themeManager';
import styles from './Frame.module.css';

export const FRAME_THEMES = {
  diy: 'frame-diy',
  galactic: 'frame-galactic',
  goo: 'frame-goo',
  ice: 'frame-ice',
  leafy: 'frame-leafy',
  scroll: 'frame-scroll',
  skull: 'frame-skull',
  wood: 'frame-wood'
} as const;

export interface FrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  frameId?: string;
  theme?: string;
  variant?: 'standard' | 'compound';
  width?: number | string;
  height?: number | string;
  customWidth?: number;
  customHeight?: number;
  upperHeight?: number;
  lowerHeight?: number;
  scale?: number;
  padding?: number;
}

const DEFAULT_THEMES = {
  primary: 'green-frame',
  secondary: 'silver',
  tertiary: 'pale-blue'
};

export const Frame: React.FC<FrameProps> = ({
  children,
  frameId,
  theme = 'green-frame',
  variant = 'standard',
  width = 3,
  height = 3,
  customWidth,
  customHeight,
  upperHeight = 2,
  lowerHeight = 2,
  scale = 2,
  className = '',
  padding = 16,
  style,
  ...rest
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [atlasImage, setAtlasImage] = useState<HTMLImageElement | null>(null);

  // Load atlas image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setAtlasImage(img);
    img.src = '/assets/Frames/Atlas.png';
  }, []);

  const resolvedTheme = theme === 'current' ? themeManager.getState().currentFrameTheme : theme;
  const themeFromId = frameId?.startsWith('frame-') ? frameId.replace('frame-', '') : frameId;
  const activeTheme = themeFromId || resolvedTheme;

  // Calculate frame dimensions
  const getFrameDimensions = () => {
    if (customWidth && customHeight) {
      return { width: customWidth, height: customHeight };
    }

    const spriteSize = 16 * scale;
    const numericWidth = typeof width === 'number' ? width : undefined;
    const numericHeight = typeof height === 'number' ? height : undefined;
    const pixelWidth = numericWidth && numericWidth > 20 ? numericWidth : undefined;
    const pixelHeight = numericHeight && numericHeight > 20 ? numericHeight : undefined;
    const gridWidth = numericWidth && numericWidth <= 20 ? numericWidth : 3;
    const gridHeight = numericHeight && numericHeight <= 20 ? numericHeight : 3;

    if (pixelWidth || pixelHeight) {
      return {
        width: pixelWidth ?? gridWidth * spriteSize,
        height: pixelHeight ?? gridHeight * spriteSize
      };
    }

    if (variant === 'compound') {
      const totalHeight = upperHeight + 1 + lowerHeight; // upper + partition + lower
      return {
        width: gridWidth * spriteSize,
        height: totalHeight * spriteSize
      };
    }

    return {
      width: gridWidth * spriteSize,
      height: gridHeight * spriteSize
    };
  };

  // Draw standard frame
  const drawStandardFrame = (ctx: CanvasRenderingContext2D, frameWidth: number, frameHeight: number) => {
    const spriteSize = 16 * scale;
    const useCustomSize = customWidth && customHeight;

    // Get frame sprites
    const sprites = {
      topLeft: getSpriteById(`frame-corner-top-left-${activeTheme}`),
      topRight: getSpriteById(`frame-corner-top-right-${activeTheme}`),
      bottomLeft: getSpriteById(`frame-corner-bottom-left-${activeTheme}`),
      bottomRight: getSpriteById(`frame-corner-bottom-right-${activeTheme}`),
      topEdge: getSpriteById(`frame-edge-top-${activeTheme}`),
      bottomEdge: getSpriteById(`frame-edge-bottom-${activeTheme}`),
      leftEdge: getSpriteById(`frame-edge-left-${activeTheme}`),
      rightEdge: getSpriteById(`frame-edge-right-${activeTheme}`),
      background: getSpriteById(`frame-background-${activeTheme}`)
    };

    if (!Object.values(sprites).every(sprite => sprite)) return;

    if (useCustomSize) {
      // Custom size drawing with overlapping for small frames
      const edgeSize = spriteSize;
      
      // Draw corners
      ctx.drawImage(atlasImage!, sprites.topLeft!.x, sprites.topLeft!.y, 16, 16, 0, 0, edgeSize, edgeSize);
      ctx.drawImage(atlasImage!, sprites.topRight!.x, sprites.topRight!.y, 16, 16, frameWidth - edgeSize, 0, edgeSize, edgeSize);
      ctx.drawImage(atlasImage!, sprites.bottomLeft!.x, sprites.bottomLeft!.y, 16, 16, 0, frameHeight - edgeSize, edgeSize, edgeSize);
      ctx.drawImage(atlasImage!, sprites.bottomRight!.x, sprites.bottomRight!.y, 16, 16, frameWidth - edgeSize, frameHeight - edgeSize, edgeSize, edgeSize);

      // Draw edges (tiled)
      for (let x = edgeSize; x < frameWidth - edgeSize; x += spriteSize) {
        const tileWidth = Math.min(spriteSize, frameWidth - edgeSize - x);
        // Top edge
        ctx.drawImage(atlasImage!, sprites.topEdge!.x, sprites.topEdge!.y, 16 * (tileWidth / spriteSize), 16, x, 0, tileWidth, edgeSize);
        // Bottom edge
        ctx.drawImage(atlasImage!, sprites.bottomEdge!.x, sprites.bottomEdge!.y, 16 * (tileWidth / spriteSize), 16, x, frameHeight - edgeSize, tileWidth, edgeSize);
      }

      for (let y = edgeSize; y < frameHeight - edgeSize; y += spriteSize) {
        const tileHeight = Math.min(spriteSize, frameHeight - edgeSize - y);
        // Left edge
        ctx.drawImage(atlasImage!, sprites.leftEdge!.x, sprites.leftEdge!.y, 16, 16 * (tileHeight / spriteSize), 0, y, edgeSize, tileHeight);
        // Right edge
        ctx.drawImage(atlasImage!, sprites.rightEdge!.x, sprites.rightEdge!.y, 16, 16 * (tileHeight / spriteSize), frameWidth - edgeSize, y, edgeSize, tileHeight);
      }

      // Draw background (tiled)
      for (let y = edgeSize; y < frameHeight - edgeSize; y += spriteSize) {
        for (let x = edgeSize; x < frameWidth - edgeSize; x += spriteSize) {
          const tileWidth = Math.min(spriteSize, frameWidth - edgeSize - x);
          const tileHeight = Math.min(spriteSize, frameHeight - edgeSize - y);
          ctx.drawImage(
            atlasImage!,
            sprites.background!.x, sprites.background!.y,
            16 * (tileWidth / spriteSize), 16 * (tileHeight / spriteSize),
            x, y, tileWidth, tileHeight
          );
        }
      }
    } else {
      // Grid-based drawing
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sprite = sprites.background;
          
          if (y === 0 && x === 0) sprite = sprites.topLeft;
          else if (y === 0 && x === width - 1) sprite = sprites.topRight;
          else if (y === height - 1 && x === 0) sprite = sprites.bottomLeft;
          else if (y === height - 1 && x === width - 1) sprite = sprites.bottomRight;
          else if (y === 0) sprite = sprites.topEdge;
          else if (y === height - 1) sprite = sprites.bottomEdge;
          else if (x === 0) sprite = sprites.leftEdge;
          else if (x === width - 1) sprite = sprites.rightEdge;

          if (sprite) {
            ctx.drawImage(
              atlasImage!,
              sprite.x, sprite.y, sprite.width, sprite.height,
              x * spriteSize, y * spriteSize, spriteSize, spriteSize
            );
          }
        }
      }
    }
  };

  // Draw compound frame
  const drawCompoundFrame = (ctx: CanvasRenderingContext2D) => {
    const spriteSize = 16 * scale;
    const totalHeight = upperHeight + 1 + lowerHeight;
    const partitionRow = upperHeight;

    // Get all sprites including partition and lower edges
    const sprites = {
      topLeft: getSpriteById(`frame-corner-top-left-${activeTheme}`),
      topRight: getSpriteById(`frame-corner-top-right-${activeTheme}`),
      bottomLeft: getSpriteById(`frame-corner-bottom-left-${activeTheme}`),
      bottomRight: getSpriteById(`frame-corner-bottom-right-${activeTheme}`),
      topEdge: getSpriteById(`frame-edge-top-${activeTheme}`),
      bottomEdge: getSpriteById(`frame-edge-bottom-${activeTheme}`),
      leftEdge: getSpriteById(`frame-edge-left-${activeTheme}`),
      rightEdge: getSpriteById(`frame-edge-right-${activeTheme}`),
      background: getSpriteById(`frame-background-${activeTheme}`),
      partitionLeft: getSpriteById(`partition-left-${activeTheme}`),
      partitionMiddle: getSpriteById(`partition-middle-${activeTheme}`),
      partitionRight: getSpriteById(`partition-right-${activeTheme}`),
      bottomLeftFrame: getSpriteById(`frame-bottom-left-frame-${activeTheme}`),
      bottomRightFrame: getSpriteById(`frame-bottom-right-frame-${activeTheme}`)
    };

    if (!Object.values(sprites).every(sprite => sprite)) return;

    for (let y = 0; y < totalHeight; y++) {
      for (let x = 0; x < width; x++) {
        let sprite = sprites.background;

        if (y === partitionRow) {
          // Partition row
          if (x === 0) sprite = sprites.partitionLeft;
          else if (x === width - 1) sprite = sprites.partitionRight;
          else sprite = sprites.partitionMiddle;
        } else if (y === 0) {
          // Top row
          if (x === 0) sprite = sprites.topLeft;
          else if (x === width - 1) sprite = sprites.topRight;
          else sprite = sprites.topEdge;
        } else if (y === totalHeight - 1) {
          // Bottom row
          if (x === 0) sprite = sprites.bottomLeft;
          else if (x === width - 1) sprite = sprites.bottomRight;
          else sprite = sprites.bottomEdge;
        } else {
          // Middle rows - different sprites for upper vs lower sections
          if (x === 0) {
            sprite = y < partitionRow ? sprites.leftEdge : sprites.bottomLeftFrame;
          } else if (x === width - 1) {
            sprite = y < partitionRow ? sprites.rightEdge : sprites.bottomRightFrame;
          } else {
            sprite = sprites.background;
          }
        }

        if (sprite) {
          ctx.drawImage(
            atlasImage!,
            sprite.x, sprite.y, sprite.width, sprite.height,
            x * spriteSize, y * spriteSize, spriteSize, spriteSize
          );
        }
      }
    }
  };

  // Draw frame
  useEffect(() => {
    if (!canvasRef.current || !atlasImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: frameWidth, height: frameHeight } = getFrameDimensions();
    
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    
    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.imageSmoothingEnabled = false;

    if (variant === 'compound') {
      drawCompoundFrame(ctx);
    } else {
      drawStandardFrame(ctx, frameWidth, frameHeight);
    }
  }, [atlasImage, activeTheme, variant, width, height, customWidth, customHeight, upperHeight, lowerHeight, scale]);

  const { width: frameWidth, height: frameHeight } = getFrameDimensions();

  return (
    <div
      className={`${styles.frame} ${className}`}
      style={{
        width: typeof width === 'string' ? width : frameWidth,
        height: typeof height === 'string' ? height : frameHeight,
        padding: padding,
        ...style
      }}
      {...rest}
    >
      <canvas 
        ref={canvasRef}
        className={styles.frameCanvas}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: frameWidth,
          height: frameHeight,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div className={styles.frameContent}>
        {children}
      </div>
    </div>
  );
};

export default Frame;