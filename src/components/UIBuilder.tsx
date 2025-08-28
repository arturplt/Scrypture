import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ATLAS_MAPPING, 
  THEME_CONFIGS, 
  getSpriteById, 
  getFrameSprites, 
  getButtonSprites,
  getIconSprites,
  getTextSprites,
  getAvailableThemes,
  getAvailableButtonThemes,
  getAvailableFrameThemes,
  getAvailableThemesForElementType,
  getCleanThemeName
} from '../data/atlasMapping';
import styles from './UIBuilder.module.css';

interface UIBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

type ElementType = 'frame' | 'button' | 'icon' | 'text' | 'bar' | 'break';
type FrameType = 'standard' | 'compound';
type ScaleLevel = 1 | 2 | 4;

interface FrameConfig {
  width: number;
  height: number;
  type: FrameType;
  upperHeight?: number; // For compound frames
  lowerHeight?: number; // For compound frames
  customWidth?: number; // Custom width in pixels (8px steps)
  customHeight?: number; // Custom height in pixels (8px steps)
}

interface ElementConfig {
  type: ElementType;
  frameConfig?: FrameConfig;
  selectedSprite?: string;
  showGrid: boolean;
  scale: ScaleLevel;
  theme: string;
}

// Standard 3x3 frame configuration
const STANDARD_FRAME_CONFIG: FrameConfig = {
  width: 3,
  height: 3,
  type: 'standard',
  customWidth: 48, // 3 * 16
  customHeight: 48 // 3 * 16
};

// Compound 3x5 frame configuration (with partition in middle)
const COMPOUND_FRAME_CONFIG: FrameConfig = {
  width: 3,
  height: 5,
  type: 'compound',
  upperHeight: 2,
  lowerHeight: 2,
  customWidth: 48, // 3 * 16
  customHeight: 80 // 5 * 16
};

// Default element configuration
const DEFAULT_ELEMENT_CONFIG: ElementConfig = {
  type: 'frame',
  frameConfig: STANDARD_FRAME_CONFIG,
  showGrid: false,
  scale: 2,
  theme: 'green'
};

export const UIBuilder: React.FC<UIBuilderProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elementConfig, setElementConfig] = useState<ElementConfig>(DEFAULT_ELEMENT_CONFIG);
  const [atlasImage, setAtlasImage] = useState<HTMLImageElement | null>(null);

  // Load the atlas image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setAtlasImage(img);
    };
    img.src = '/assets/Frames/Atlas.png';
  }, []);

  // Get all available colors (25 total: 3 compound + 22 9-slice)
  const getAllColors = () => {
    const allColors = [
      // Row 1 (y: 0-96) - 3 themes - Main 4x7 grid
      { id: 'green', displayName: 'Green' },
      { id: 'dark-green', displayName: 'Dark Green' },
      { id: 'blue-stone', displayName: 'Blue Stone' },
      
      // Row 2 (y: 112-176) - 8 themes - 4x4 frame system
      { id: 'green-frame', displayName: 'Green Frame' },
      { id: 'red-frame', displayName: 'Red Frame' },
      { id: 'forest-green', displayName: 'Forest Green' },
      { id: 'burnt-red', displayName: 'Burnt Red' },
      { id: 'silver', displayName: 'Silver' },
      { id: 'gold', displayName: 'Gold' },
      { id: 'pale-blue', displayName: 'Pale Blue' },
      { id: 'green-ornate', displayName: 'Green Ornate' },
      
      // Row 3 (y: 176-240) - 8 themes - Button variations
      { id: 'green-button', displayName: 'Green Button' },
      { id: 'red-button', displayName: 'Red Button' },
      { id: 'green-button-activated', displayName: 'Green Button Activated' },
      { id: 'red-button-activated', displayName: 'Red Button Activated' },
      { id: 'grey-brown', displayName: 'Grey Brown' },
      { id: 'purple-button', displayName: 'Purple Button' },
      { id: 'orange-button', displayName: 'Orange Button' },
      { id: 'blue-ornate', displayName: 'Blue Ornate' },
      
      // Row 4 (y: 240-304) - 6 themes - Special variations
      { id: 'thick-gold', displayName: 'Thick Gold' },
      { id: 'skinny-gold', displayName: 'Skinny Gold' },
      { id: 'turquoise', displayName: 'Turquoise' },
      { id: 'bronze', displayName: 'Bronze' },
      { id: 'gunmetal', displayName: 'Gunmetal' },
      { id: 'royal-blue', displayName: 'Royal Blue' }
    ];
    
    return allColors;
  };

  // Get available sprites for the current element type
  const getAvailableSpritesForElementType = () => {
    if (elementConfig.type === 'frame') return [];
    
    return ATLAS_MAPPING.sprites.filter(sprite => {
      // For non-frame elements, show sprites that match the element type
      if (sprite.category === elementConfig.type) {
        return true;
      }
      
      // Also include additional sprites (like icons, text, navigation buttons)
      if (elementConfig.type === 'button' && sprite.category === 'button') {
        return true;
      }
      
      if (elementConfig.type === 'icon' && sprite.category === 'icon') {
        return true;
      }
      
      if (elementConfig.type === 'text' && sprite.category === 'text') {
        return true;
      }
      
      return false;
    }).sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleColorChange = (colorId: string) => {
    setElementConfig(prev => ({ 
      ...prev, 
      theme: colorId,
      selectedSprite: undefined
    }));
  };

  const drawElement = useCallback(() => {
    if (!canvasRef.current || !atlasImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spriteSize = 16;
    const scaledSpriteSize = spriteSize * elementConfig.scale;
    
    // Calculate canvas size based on element type
    let canvasWidth: number;
    let canvasHeight: number;
    
    if (elementConfig.type === 'frame' && elementConfig.frameConfig) {
      // Use custom dimensions if available, otherwise calculate from sprite count
      if (elementConfig.frameConfig.customWidth && elementConfig.frameConfig.customHeight) {
        canvasWidth = elementConfig.frameConfig.customWidth * elementConfig.scale;
        canvasHeight = elementConfig.frameConfig.customHeight * elementConfig.scale;
      } else {
        canvasWidth = elementConfig.frameConfig.width * scaledSpriteSize;
        
        if (elementConfig.frameConfig.type === 'compound') {
          const upperHeight = elementConfig.frameConfig.upperHeight || 2;
          const lowerHeight = elementConfig.frameConfig.lowerHeight || 2;
          const totalHeight = upperHeight + 1 + lowerHeight;
          canvasHeight = totalHeight * scaledSpriteSize;
        } else {
          canvasHeight = elementConfig.frameConfig.height * scaledSpriteSize;
        }
      }
    } else {
      // For single sprites (buttons, icons, text, bars, breaks)
      canvasWidth = scaledSpriteSize;
      canvasHeight = scaledSpriteSize;
    }
    
    // Update canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    
    // Scale context for high DPI displays
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set up image smoothing for pixel art
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'low';

    if (elementConfig.type === 'frame' && elementConfig.frameConfig) {
      if (elementConfig.frameConfig.type === 'standard') {
        drawStandardFrame(ctx, scaledSpriteSize);
      } else {
        drawCompoundFrame(ctx, scaledSpriteSize);
      }
    } else if (elementConfig.selectedSprite) {
      // Draw single sprite
      const sprite = getSpriteById(elementConfig.selectedSprite);
      if (sprite) {
        drawSprite(ctx, sprite, 0, 0, scaledSpriteSize);
      }
    }
  }, [atlasImage, elementConfig]);

  const drawStandardFrame = (ctx: CanvasRenderingContext2D, scaledSpriteSize: number) => {
    if (!elementConfig.frameConfig) return;
    
    // Check if using custom dimensions
    const useCustomSize = elementConfig.frameConfig.customWidth && elementConfig.frameConfig.customHeight;
    
    if (useCustomSize) {
      // Custom size with overlapping support
      const customWidth = elementConfig.frameConfig.customWidth!;
      const customHeight = elementConfig.frameConfig.customHeight!;
      const canvasWidth = customWidth * elementConfig.scale;
      const canvasHeight = customHeight * elementConfig.scale;
      
      // Always draw all frame pieces, but position them to fit the custom size
      const frameSprites = [
        { type: 'corner', id: `frame-corner-top-left-${elementConfig.theme}`, x: 0, y: 0 },
        { type: 'corner', id: `frame-corner-top-right-${elementConfig.theme}`, x: canvasWidth - scaledSpriteSize, y: 0 },
        { type: 'corner', id: `frame-corner-bottom-left-${elementConfig.theme}`, x: 0, y: canvasHeight - scaledSpriteSize },
        { type: 'corner', id: `frame-corner-bottom-right-${elementConfig.theme}`, x: canvasWidth - scaledSpriteSize, y: canvasHeight - scaledSpriteSize },
        { type: 'edge', id: `frame-edge-top-${elementConfig.theme}`, x: scaledSpriteSize, y: 0, width: canvasWidth - 2 * scaledSpriteSize },
        { type: 'edge', id: `frame-edge-bottom-${elementConfig.theme}`, x: scaledSpriteSize, y: canvasHeight - scaledSpriteSize, width: canvasWidth - 2 * scaledSpriteSize },
        { type: 'edge', id: `frame-edge-left-${elementConfig.theme}`, x: 0, y: scaledSpriteSize, height: canvasHeight - 2 * scaledSpriteSize },
        { type: 'edge', id: `frame-edge-right-${elementConfig.theme}`, x: canvasWidth - scaledSpriteSize, y: scaledSpriteSize, height: canvasHeight - 2 * scaledSpriteSize },
      ];
      
      // Draw background if there's space
      if (canvasWidth > 2 * scaledSpriteSize && canvasHeight > 2 * scaledSpriteSize) {
        frameSprites.push({
          type: 'background',
          id: `frame-background-${elementConfig.theme}`,
          x: scaledSpriteSize,
          y: scaledSpriteSize,
          width: canvasWidth - 2 * scaledSpriteSize,
          height: canvasHeight - 2 * scaledSpriteSize
        } as any);
      }
      
      // Draw each sprite
      frameSprites.forEach((frameSprite: any) => {
        const { id, x, y, width, height } = frameSprite;
        const sprite = getSpriteById(id);
        if (sprite) {
          if (width !== undefined && height !== undefined) {
            // Background - tile both horizontally and vertically
            for (let tileY = y; tileY < y + height; tileY += scaledSpriteSize) {
              for (let tileX = x; tileX < x + width; tileX += scaledSpriteSize) {
                const tileWidth = Math.min(scaledSpriteSize, x + width - tileX);
                const tileHeight = Math.min(scaledSpriteSize, y + height - tileY);
                ctx.drawImage(
                  atlasImage!,
                  sprite.x, sprite.y, 
                  sprite.width * (tileWidth / scaledSpriteSize), 
                  sprite.height * (tileHeight / scaledSpriteSize),
                  tileX, tileY, tileWidth, tileHeight
                );
              }
            }
          } else if (width !== undefined) {
            // Horizontal edge - tile horizontally
            for (let tileX = x; tileX < x + width; tileX += scaledSpriteSize) {
              const tileWidth = Math.min(scaledSpriteSize, x + width - tileX);
              ctx.drawImage(
                atlasImage!,
                sprite.x, sprite.y, sprite.width * (tileWidth / scaledSpriteSize), sprite.height,
                tileX, y, tileWidth, scaledSpriteSize
              );
            }
          } else if (height !== undefined) {
            // Vertical edge - tile vertically
            for (let tileY = y; tileY < y + height; tileY += scaledSpriteSize) {
              const tileHeight = Math.min(scaledSpriteSize, y + height - tileY);
              ctx.drawImage(
                atlasImage!,
                sprite.x, sprite.y, sprite.width, sprite.height * (tileHeight / scaledSpriteSize),
                x, tileY, scaledSpriteSize, tileHeight
              );
            }
          } else {
            // Corner - single tile
            ctx.drawImage(
              atlasImage!,
              sprite.x, sprite.y, sprite.width, sprite.height,
              x, y, scaledSpriteSize, scaledSpriteSize
            );
          }
        }
      });
      
    } else {
      // Standard grid-based layout
      for (let y = 0; y < elementConfig.frameConfig.height; y++) {
        for (let x = 0; x < elementConfig.frameConfig.width; x++) {
          let spriteId = '';

          // Determine which sprite to use based on position
          if (y === 0) {
            // Top row
            if (x === 0) {
              spriteId = `frame-corner-top-left-${elementConfig.theme}`;
            } else if (x === elementConfig.frameConfig.width - 1) {
              spriteId = `frame-corner-top-right-${elementConfig.theme}`;
            } else {
              spriteId = `frame-edge-top-${elementConfig.theme}`;
            }
          } else if (y === elementConfig.frameConfig.height - 1) {
            // Bottom row
            if (x === 0) {
              spriteId = `frame-corner-bottom-left-${elementConfig.theme}`;
            } else if (x === elementConfig.frameConfig.width - 1) {
              spriteId = `frame-corner-bottom-right-${elementConfig.theme}`;
            } else {
              spriteId = `frame-edge-bottom-${elementConfig.theme}`;
            }
          } else {
            // Middle rows
            if (x === 0) {
              spriteId = `frame-edge-left-${elementConfig.theme}`;
            } else if (x === elementConfig.frameConfig.width - 1) {
              spriteId = `frame-edge-right-${elementConfig.theme}`;
            } else {
              spriteId = `frame-background-${elementConfig.theme}`;
            }
          }

          const sprite = getSpriteById(spriteId);
          if (sprite) {
            drawSprite(ctx, sprite, x, y, scaledSpriteSize);
          }
        }
      }
    }
  };

  const drawCompoundFrame = (ctx: CanvasRenderingContext2D, scaledSpriteSize: number) => {
    if (!elementConfig.frameConfig) return;
    
    // Compound frame layout with separate upper/lower heights
    const upperHeight = elementConfig.frameConfig.upperHeight || 2;
    const lowerHeight = elementConfig.frameConfig.lowerHeight || 2;
    const partitionRow = upperHeight; // Partition is after upper section
    
    // Calculate total height
    const totalHeight = upperHeight + 1 + lowerHeight; // upper + partition + lower
    
    for (let y = 0; y < totalHeight; y++) {
      for (let x = 0; x < elementConfig.frameConfig.width; x++) {
        let spriteId = '';

        if (y === partitionRow) {
          // Partition row (middle) - horizontally extendable
          if (x === 0) {
            spriteId = `partition-left-${elementConfig.theme}`;
          } else if (x === elementConfig.frameConfig.width - 1) {
            spriteId = `partition-right-${elementConfig.theme}`;
          } else {
            spriteId = `partition-middle-${elementConfig.theme}`;
          }
        } else if (y === 0) {
          // Top row
          if (x === 0) {
            spriteId = `frame-corner-top-left-${elementConfig.theme}`;
          } else if (x === elementConfig.frameConfig.width - 1) {
            spriteId = `frame-corner-top-right-${elementConfig.theme}`;
          } else {
            spriteId = `frame-edge-top-${elementConfig.theme}`;
          }
        } else if (y === totalHeight - 1) {
          // Bottom row
          if (x === 0) {
            spriteId = `frame-corner-bottom-left-${elementConfig.theme}`;
          } else if (x === elementConfig.frameConfig.width - 1) {
            spriteId = `frame-corner-bottom-right-${elementConfig.theme}`;
          } else {
            spriteId = `frame-edge-bottom-${elementConfig.theme}`;
          }
        } else {
          // Other middle rows - use different sprites for upper vs lower sections
          if (x === 0) {
            if (y < partitionRow) {
              // Upper section - use regular left edge
              spriteId = `frame-edge-left-${elementConfig.theme}`;
            } else {
              // Lower section - use bottom left edge
              spriteId = `frame-bottom-left-frame-${elementConfig.theme}`;
            }
          } else if (x === elementConfig.frameConfig.width - 1) {
            if (y < partitionRow) {
              // Upper section - use regular right edge
              spriteId = `frame-edge-right-${elementConfig.theme}`;
            } else {
              // Lower section - use bottom right edge
              spriteId = `frame-bottom-right-frame-${elementConfig.theme}`;
            }
          } else {
            spriteId = `frame-background-${elementConfig.theme}`;
          }
        }

        const sprite = getSpriteById(spriteId);
        if (sprite) {
          drawSprite(ctx, sprite, x, y, scaledSpriteSize);
        }
      }
    }
  };

  const drawSprite = (
    ctx: CanvasRenderingContext2D,
    sprite: { x: number; y: number; width: number; height: number },
    gridX: number,
    gridY: number,
    scaledSpriteSize: number
  ) => {
    // Ensure pixel-perfect positioning by rounding to integers
    const x = Math.round(gridX * scaledSpriteSize);
    const y = Math.round(gridY * scaledSpriteSize);
    const size = Math.round(scaledSpriteSize);
    
    ctx.drawImage(
      atlasImage!,
      sprite.x, sprite.y, sprite.width, sprite.height,
      x, y, size, size
    );
  };

  // Redraw when dependencies change
  useEffect(() => {
    drawElement();
  }, [drawElement]);

  const handleElementTypeChange = (type: ElementType) => {
    setElementConfig(prev => ({
      ...prev,
      type,
      frameConfig: type === 'frame' ? STANDARD_FRAME_CONFIG : undefined,
      selectedSprite: undefined
    }));
  };

  const handleFrameTypeChange = (type: FrameType) => {
    if (type === 'standard') {
      setElementConfig(prev => ({
        ...prev,
        frameConfig: STANDARD_FRAME_CONFIG
      }));
    } else {
      setElementConfig(prev => ({
        ...prev,
        frameConfig: COMPOUND_FRAME_CONFIG
      }));
    }
  };

  const handleFrameResize = (dimension: 'width' | 'height' | 'upperHeight' | 'lowerHeight', delta: number) => {
    setElementConfig(prev => ({
      ...prev,
      frameConfig: prev.frameConfig ? {
        ...prev.frameConfig,
        [dimension]: Math.max(1, Math.min(10, (prev.frameConfig[dimension as keyof FrameConfig] as number) + delta))
      } : undefined
    }));
  };

  const handleCustomSizeChange = (dimension: 'customWidth' | 'customHeight', value: number) => {
    setElementConfig(prev => ({
      ...prev,
      frameConfig: prev.frameConfig ? {
        ...prev.frameConfig,
        [dimension]: Math.max(16, Math.min(400, Math.round(value / 8) * 8)) // Round to nearest 8px, min 16px, max 400px
      } : undefined
    }));
  };

  const handleScaleChange = (newScale: ScaleLevel) => {
    setElementConfig(prev => ({ ...prev, scale: newScale }));
  };

  const handleThemeChange = (themeId: string) => {
    setElementConfig(prev => ({ ...prev, theme: themeId, selectedSprite: undefined }));
  };

  const handleSpriteChange = (spriteId: string) => {
    setElementConfig(prev => ({ ...prev, selectedSprite: spriteId || undefined }));
  };

  const handleCopySettings = async () => {
    const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();
    
    let settings: any = {
      type: elementConfig.type,
      theme: elementConfig.theme,
      scale: elementConfig.scale,
      width: canvasWidth,
      height: canvasHeight
    };
    
    if (elementConfig.type === 'frame' && elementConfig.frameConfig) {
      settings.frameType = elementConfig.frameConfig.type;
      if (elementConfig.frameConfig.customWidth && elementConfig.frameConfig.customHeight) {
        settings.customWidth = elementConfig.frameConfig.customWidth;
        settings.customHeight = elementConfig.frameConfig.customHeight;
      }
    } else if (elementConfig.selectedSprite) {
      settings.sprite = elementConfig.selectedSprite;
    }
    
    const output = JSON.stringify(settings, null, 2);
    
    try {
      await navigator.clipboard.writeText(output);
      console.log('Settings copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy settings:', err);
      // Fallback: create a text area and select the content
      const textArea = document.createElement('textarea');
      textArea.value = output;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleExportElement = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    
    let filename: string;
    if (elementConfig.type === 'frame' && elementConfig.frameConfig) {
      if (elementConfig.frameConfig.type === 'compound') {
        const upperHeight = elementConfig.frameConfig.upperHeight || 2;
        const lowerHeight = elementConfig.frameConfig.lowerHeight || 2;
        const totalHeight = upperHeight + 1 + lowerHeight;
        filename = `${elementConfig.type}-${elementConfig.theme}-${elementConfig.frameConfig.width}x${totalHeight}-compound-${elementConfig.scale}x.png`;
      } else {
        filename = `${elementConfig.type}-${elementConfig.theme}-${elementConfig.frameConfig.width}x${elementConfig.frameConfig.height}-${elementConfig.scale}x.png`;
      }
    } else {
      const spriteName = elementConfig.selectedSprite?.replace(/-/g, '_') || 'unknown';
      filename = `${elementConfig.type}-${spriteName}-${elementConfig.scale}x.png`;
    }
    
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getCanvasDimensions = () => {
    if (elementConfig.type === 'frame' && elementConfig.frameConfig) {
      let width: number;
      let height: number;
      
      if (elementConfig.frameConfig.customWidth && elementConfig.frameConfig.customHeight) {
        // Use custom dimensions
        width = elementConfig.frameConfig.customWidth * elementConfig.scale;
        height = elementConfig.frameConfig.customHeight * elementConfig.scale;
      } else {
        // Use sprite count dimensions
        width = elementConfig.frameConfig.width * 16 * elementConfig.scale;
        
        if (elementConfig.frameConfig.type === 'compound') {
          const upperHeight = elementConfig.frameConfig.upperHeight || 2;
          const lowerHeight = elementConfig.frameConfig.lowerHeight || 2;
          const totalHeight = upperHeight + 1 + lowerHeight;
          height = totalHeight * 16 * elementConfig.scale;
        } else {
          height = elementConfig.frameConfig.height * 16 * elementConfig.scale;
        }
      }
      
      return { width, height };
    } else {
      const size = 16 * elementConfig.scale;
      return { width: size, height: size };
    }
  };

  const getGridDimensions = () => {
    if (elementConfig.type === 'frame' && elementConfig.frameConfig) {
      const width = elementConfig.frameConfig.width;
      let height: number;
      
      if (elementConfig.frameConfig.type === 'compound') {
        const upperHeight = elementConfig.frameConfig.upperHeight || 2;
        const lowerHeight = elementConfig.frameConfig.lowerHeight || 2;
        height = upperHeight + 1 + lowerHeight;
      } else {
        height = elementConfig.frameConfig.height;
      }
      
      return { width, height };
    } else {
      return { width: 1, height: 1 };
    }
  };

  if (!isOpen) return null;

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();
  const { width: gridWidth, height: gridHeight } = getGridDimensions();

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>🎛️ UI Builder</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </header>

        <div className={styles.content}>
          {/* Controls Panel */}
          <div className={styles.controlsPanel}>
            
            {/* Element Type Selection */}
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Element Type:</label>
              <div className={styles.buttonGroup}>
                {(['frame', 'button', 'icon', 'text', 'bar', 'break'] as ElementType[]).map((type) => (
                  <button
                    key={type}
                    className={`${styles.controlButton} ${elementConfig.type === type ? styles.active : ''}`}
                    onClick={() => handleElementTypeChange(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Type Selection (only for frames) */}
            {elementConfig.type === 'frame' && (
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Frame Type:</label>
                <div className={styles.buttonGroup}>
                  <button
                    className={`${styles.controlButton} ${elementConfig.frameConfig?.type === 'standard' ? styles.active : ''}`}
                    onClick={() => handleFrameTypeChange('standard')}
                  >
                    Standard 3×3
                  </button>
                  <button
                    className={`${styles.controlButton} ${elementConfig.frameConfig?.type === 'compound' ? styles.active : ''}`}
                    onClick={() => handleFrameTypeChange('compound')}
                  >
                    Compound 3×5
                  </button>
                </div>
              </div>
            )}

            {/* Color Selection */}
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Color:</label>
              <select
                className={styles.themeSelect}
                value={elementConfig.theme}
                onChange={(e) => handleColorChange(e.target.value)}
              >
                {getAllColors().map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Sprite Selection (for non-frame elements) */}
            {elementConfig.type !== 'frame' && (
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Sprite:</label>
                <select
                  className={styles.themeSelect}
                  value={elementConfig.selectedSprite || ''}
                  onChange={(e) => handleSpriteChange(e.target.value)}
                >
                  <option value="">Select a sprite...</option>
                  {getAvailableSpritesForElementType().map((sprite) => (
                    <option key={sprite.id} value={sprite.id}>
                      {sprite.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Scale Controls */}
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Pixel Scale:</label>
              <div className={styles.buttonGroup}>
                {[1, 2, 4].map((scaleLevel) => (
                  <button
                    key={scaleLevel}
                    className={`${styles.controlButton} ${elementConfig.scale === scaleLevel ? styles.active : ''}`}
                    onClick={() => handleScaleChange(scaleLevel as ScaleLevel)}
                    title={`${scaleLevel}× pixel scale (${16 * scaleLevel}px sprites)`}
                  >
                    {scaleLevel}×
                  </button>
                ))}
              </div>
              <div className={styles.scaleInfo}>
                <small>Each sprite: {16 * elementConfig.scale}×{16 * elementConfig.scale}px</small>
              </div>
            </div>

            {/* Frame Size Controls (only for frames) */}
            {elementConfig.type === 'frame' && elementConfig.frameConfig && (
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Frame Size:</label>
                <div className={styles.sizeControls}>
                  <div className={styles.sizeControl}>
                    <label>Width: {elementConfig.frameConfig.width * 16 * elementConfig.scale}px</label>
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.controlButton}
                        onClick={() => handleFrameResize('width', -1)}
                        disabled={elementConfig.frameConfig.width <= 1}
                      >
                        −
                      </button>
                      <button
                        className={styles.controlButton}
                        onClick={() => handleFrameResize('width', 1)}
                        disabled={elementConfig.frameConfig.width >= 10}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {elementConfig.frameConfig.type === 'standard' ? (
                    <div className={styles.sizeControl}>
                      <label>Height: {elementConfig.frameConfig.height * 16 * elementConfig.scale}px</label>
                      <div className={styles.buttonGroup}>
                        <button
                          className={styles.controlButton}
                          onClick={() => handleFrameResize('height', -1)}
                          disabled={elementConfig.frameConfig.height <= 1}
                        >
                          −
                        </button>
                        <button
                          className={styles.controlButton}
                          onClick={() => handleFrameResize('height', 1)}
                          disabled={elementConfig.frameConfig.height >= 10}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.sizeControl}>
                        <label>Upper: {(elementConfig.frameConfig.upperHeight || 2) * 16 * elementConfig.scale}px</label>
                        <div className={styles.buttonGroup}>
                          <button
                            className={styles.controlButton}
                            onClick={() => handleFrameResize('upperHeight', -1)}
                            disabled={(elementConfig.frameConfig.upperHeight || 2) <= 1}
                          >
                            −
                          </button>
                          <button
                            className={styles.controlButton}
                            onClick={() => handleFrameResize('upperHeight', 1)}
                            disabled={(elementConfig.frameConfig.upperHeight || 2) >= 10}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className={styles.sizeControl}>
                        <label>Lower: {(elementConfig.frameConfig.lowerHeight || 2) * 16 * elementConfig.scale}px</label>
                        <div className={styles.buttonGroup}>
                          <button
                            className={styles.controlButton}
                            onClick={() => handleFrameResize('lowerHeight', -1)}
                            disabled={(elementConfig.frameConfig.lowerHeight || 2) <= 1}
                          >
                            −
                          </button>
                          <button
                            className={styles.controlButton}
                            onClick={() => handleFrameResize('lowerHeight', 1)}
                            disabled={(elementConfig.frameConfig.lowerHeight || 2) >= 10}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Custom Size Controls (only for frames) */}
            {elementConfig.type === 'frame' && elementConfig.frameConfig && (
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Custom Size (8px steps):</label>
                <div className={styles.sizeControls}>
                  <div className={styles.sizeControl}>
                    <label>Width: {elementConfig.frameConfig.customWidth || elementConfig.frameConfig.width * 16}px</label>
                    <input
                      type="range"
                      min="16"
                      max="400"
                      step="8"
                      value={elementConfig.frameConfig.customWidth || elementConfig.frameConfig.width * 16}
                      onChange={(e) => handleCustomSizeChange('customWidth', parseInt(e.target.value))}
                      className={styles.sizeSlider}
                    />
                  </div>
                  <div className={styles.sizeControl}>
                    <label>Height: {elementConfig.frameConfig.customHeight || (elementConfig.frameConfig.type === 'compound' 
                      ? ((elementConfig.frameConfig.upperHeight || 2) + 1 + (elementConfig.frameConfig.lowerHeight || 2)) * 16
                      : elementConfig.frameConfig.height * 16)}px</label>
                    <input
                      type="range"
                      min="16"
                      max="400"
                      step="8"
                      value={elementConfig.frameConfig.customHeight || (elementConfig.frameConfig.type === 'compound' 
                        ? ((elementConfig.frameConfig.upperHeight || 2) + 1 + (elementConfig.frameConfig.lowerHeight || 2)) * 16
                        : elementConfig.frameConfig.height * 16)}
                      onChange={(e) => handleCustomSizeChange('customHeight', parseInt(e.target.value))}
                      className={styles.sizeSlider}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Actions:</label>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.controlButton}
                  onClick={handleCopySettings}
                  title="Copy all settings to clipboard for use in code"
                >
                  📋 Copy Settings
                </button>
                <button
                  className={styles.controlButton}
                  onClick={handleExportElement}
                  title="Export element as PNG"
                >
                  💾 Export
                </button>
                <button
                  className={`${styles.controlButton} ${elementConfig.showGrid ? styles.active : ''}`}
                  onClick={() => setElementConfig(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                  title="Toggle pixel grid overlay"
                >
                  {elementConfig.showGrid ? '🔲' : '⬜'} Grid
                </button>
              </div>
            </div>

            {/* Info Display */}
            <div className={styles.infoPanel}>
              <div className={styles.infoItem}>
                <strong>Canvas:</strong> {canvasWidth} × {canvasHeight}px
              </div>
              <div className={styles.infoItem}>
                <strong>Grid:</strong> {gridWidth} × {gridHeight} sprites ({gridWidth * 16 * elementConfig.scale} × {gridHeight * 16 * elementConfig.scale}px)
              </div>
              {elementConfig.type === 'frame' && elementConfig.frameConfig?.type === 'compound' && (
                <div className={styles.infoItem}>
                  <strong>Layout:</strong> {elementConfig.frameConfig.upperHeight || 2} + 1 + {elementConfig.frameConfig.lowerHeight || 2} (upper + partition + lower)
                </div>
              )}
              <div className={styles.infoItem}>
                <strong>Sprite:</strong> {16 * elementConfig.scale} × {16 * elementConfig.scale}px
              </div>
              <div className={styles.infoItem}>
                <strong>Color:</strong> {getCleanThemeName(elementConfig.theme)}
              </div>
              {elementConfig.type !== 'frame' && (
                <div className={styles.infoItem}>
                  <strong>Selected Sprite:</strong> {elementConfig.selectedSprite ? getSpriteById(elementConfig.selectedSprite)?.name || 'Unknown' : 'None'}
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className={styles.previewPanel}>
            <div className={`${styles.previewContainer} ${elementConfig.showGrid ? styles.showGrid : ''}`}>
              <canvas
                ref={canvasRef}
                className={styles.previewCanvas}
                style={{
                  '--sprite-scale': elementConfig.scale,
                  '--grid-size': `${16 * elementConfig.scale}px`
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
