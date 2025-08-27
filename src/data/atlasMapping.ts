// Atlas Mapping Generator - Dynamic Theme System
// This approach generates atlas mappings for multiple themes without code duplication

interface ThemeConfig {
  name: string;
  color: string;
  xOffset: number;
  yOffset: number;
  rowType: 'main' | 'frame' | 'button';
}

interface AtlasSprite {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: 'frame' | 'bar' | 'button' | 'break';
  theme: string;
  color: string;
  state?: 'normal' | 'active';
  description: string;
}

interface AtlasMapping {
  sprites: AtlasSprite[];
  metadata: {
    atlasWidth: number;
    atlasHeight: number;
    spriteSize: number;
    totalSprites: number;
  };
}

// Theme configurations for 3 rows × 8-10 columns = 30 themes
const THEME_CONFIGS: ThemeConfig[] = [
  // Row 1 (y: 0-96) - 8 themes - Main 4x7 grid
  { name: 'green', color: 'green', xOffset: 0, yOffset: 0, rowType: 'main' },
  { name: 'dark-green', color: 'dark-green', xOffset: 64, yOffset: 0, rowType: 'main' },
  { name: 'blue-stone', color: 'blue-stone', xOffset: 128, yOffset: 0, rowType: 'main' },
  { name: 'red', color: 'red', xOffset: 192, yOffset: 0, rowType: 'main' },
  { name: 'purple', color: 'purple', xOffset: 256, yOffset: 0, rowType: 'main' },
  { name: 'orange', color: 'orange', xOffset: 320, yOffset: 0, rowType: 'main' },
  { name: 'yellow', color: 'yellow', xOffset: 384, yOffset: 0, rowType: 'main' },
  { name: 'cyan', color: 'cyan', xOffset: 448, yOffset: 0, rowType: 'main' },
  
  // Row 2 (y: 112-176) - 8 themes - 4x4 frame system
  { name: 'green-frame', color: 'green', xOffset: 0, yOffset: 112, rowType: 'frame' },
  { name: 'red-frame', color: 'red', xOffset: 64, yOffset: 112, rowType: 'frame' },
  { name: 'forest-green', color: 'forest-green', xOffset: 128, yOffset: 112, rowType: 'frame' },
  { name: 'burnt-red', color: 'burnt-red', xOffset: 192, yOffset: 112, rowType: 'frame' },
  { name: 'silver', color: 'silver', xOffset: 256, yOffset: 112, rowType: 'frame' },
  { name: 'gold', color: 'gold', xOffset: 320, yOffset: 112, rowType: 'frame' },
  { name: 'pale-blue', color: 'pale-blue', xOffset: 384, yOffset: 112, rowType: 'frame' },
  { name: 'green-ornate', color: 'green-ornate', xOffset: 448, yOffset: 112, rowType: 'frame' },
  
  // Row 3 (y: 192-256) - 8 themes - Button variations
  { name: 'green-button', color: 'green', xOffset: 0, yOffset: 192, rowType: 'button' },
  { name: 'red-button', color: 'red', xOffset: 64, yOffset: 192, rowType: 'button' },
  { name: 'green-button-activated', color: 'green', xOffset: 128, yOffset: 192, rowType: 'button' },
  { name: 'red-button-activated', color: 'red', xOffset: 192, yOffset: 192, rowType: 'button' },
  { name: 'grey-brown', color: 'grey-brown', xOffset: 256, yOffset: 192, rowType: 'button' },
  { name: 'purple-button', color: 'purple', xOffset: 320, yOffset: 192, rowType: 'button' },
  { name: 'orange-button', color: 'orange', xOffset: 384, yOffset: 192, rowType: 'button' },
  { name: 'blue-ornate', color: 'blue-ornate', xOffset: 448, yOffset: 192, rowType: 'button' },
  
  // Row 4 (y: 272-336) - 6 themes - Special variations
  { name: 'thick-gold', color: 'thick-gold', xOffset: 0, yOffset: 272, rowType: 'main' },
  { name: 'skinny-gold', color: 'skinny-gold', xOffset: 64, yOffset: 272, rowType: 'main' },
  { name: 'turquoise', color: 'turquoise', xOffset: 128, yOffset: 272, rowType: 'main' },
  { name: 'bronze', color: 'bronze', xOffset: 192, yOffset: 272, rowType: 'main' },
  { name: 'gunmetal', color: 'gunmetal', xOffset: 256, yOffset: 272, rowType: 'main' },
  { name: 'royal-blue', color: 'royal-blue', xOffset: 320, yOffset: 272, rowType: 'main' }
];

// Base sprite definitions for Row 1 - Main 4x7 Grid (28 sprites per theme)
const BASE_MAIN_SPRITES = [
  // Top Row - Corners and Top Edge
  { id: 'frame-corner-top-left', name: 'Top Left Corner', x: 0, y: 0, width: 16, height: 16, category: 'frame' as const, theme: 'corner', description: 'Top left corner - does not scale, maintains corner appearance' },
  { id: 'frame-edge-top', name: 'Top Edge (Repeatable)', x: 16, y: 0, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Top edge - horizontally repeatable for scaling' },
  { id: 'frame-corner-top-right', name: 'Top Right Corner', x: 32, y: 0, width: 16, height: 16, category: 'frame' as const, theme: 'corner', description: 'Top right corner - does not scale, maintains corner appearance' },
  
  // Middle Row - Left Edge, Background, Right Edge
  { id: 'frame-edge-left', name: 'Left Edge (Repeatable)', x: 0, y: 16, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Left edge - vertically repeatable for scaling' },
  { id: 'frame-background', name: 'Background (Repeatable)', x: 16, y: 16, width: 16, height: 16, category: 'frame' as const, theme: 'background', description: 'Background - both horizontally and vertically repeatable' },
  { id: 'frame-edge-right', name: 'Right Edge (Repeatable)', x: 32, y: 16, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Right edge - vertically repeatable for scaling' },
  
  // Lower Frame Elements
  { id: 'frame-bottom-left-frame', name: 'Lower Left Edge', x: 0, y: 48, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Lower left edge element' },
  { id: 'frame-bottom-center', name: 'Lower BG (Repeatable)', x: 16, y: 48, width: 16, height: 16, category: 'frame' as const, theme: 'background', description: 'Lower background - horizontally repeatable' },
  { id: 'frame-bottom-right-frame', name: 'Lower Right Edge', x: 32, y: 48, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Lower right edge element' },
  
  // Partition Elements
  { id: 'partition-left', name: 'Partition Left', x: 0, y: 32, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Left partition element' },
  { id: 'partition-middle', name: 'Partition Middle (Repeatable)', x: 16, y: 32, width: 16, height: 16, category: 'frame' as const, theme: 'background', description: 'Middle partition element - horizontally repeatable' },
  { id: 'partition-right', name: 'Partition Right', x: 32, y: 32, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Right partition element' },
  
  // Bottom Row - Corners and Bottom Edge
  { id: 'frame-corner-bottom-left', name: 'Bottom Left Corner', x: 0, y: 64, width: 16, height: 16, category: 'frame' as const, theme: 'corner', description: 'Bottom left corner - does not scale, maintains corner appearance' },
  { id: 'frame-edge-bottom', name: 'Bottom Edge (Repeatable)', x: 16, y: 64, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Bottom edge - horizontally repeatable for scaling' },
  { id: 'frame-corner-bottom-right', name: 'Bottom Right Corner', x: 32, y: 64, width: 16, height: 16, category: 'frame' as const, theme: 'corner', description: 'Bottom right corner - does not scale, maintains corner appearance' },
  
  // Horizontal Bar Breakdown
  { id: 'bar-horizontal-left', name: 'Horizontal Bar Left', x: 0, y: 80, width: 16, height: 16, category: 'bar' as const, theme: 'horizontal', description: 'Left part of horizontal bar - does not scale horizontally' },
  { id: 'bar-horizontal-center', name: 'Horizontal Bar Center (Repeatable)', x: 16, y: 80, width: 16, height: 16, category: 'bar' as const, theme: 'horizontal', description: 'Center part of horizontal bar - horizontally repeatable for scaling' },
  { id: 'bar-horizontal-right', name: 'Horizontal Bar Right', x: 32, y: 80, width: 16, height: 16, category: 'bar' as const, theme: 'horizontal', description: 'Right part of horizontal bar - does not scale horizontally' },
  
  // Progress Bar Breakdown
  { id: 'bar-progress-left', name: 'Progress Bar Left', x: 0, y: 96, width: 16, height: 16, category: 'bar' as const, theme: 'progress', description: 'Left part of progress bar - does not scale horizontally' },
  { id: 'bar-progress-center', name: 'Progress Bar Center (Repeatable)', x: 16, y: 96, width: 16, height: 16, category: 'bar' as const, theme: 'progress', description: 'Center part of progress bar - horizontally repeatable for scaling' },
  { id: 'bar-progress-right', name: 'Progress Bar Right', x: 32, y: 96, width: 16, height: 16, category: 'bar' as const, theme: 'progress', description: 'Right part of progress bar - does not scale horizontally' },
  
  // Break Elements
  { id: 'break-horizontal', name: 'Horizontal Page Break', x: 48, y: 0, width: 16, height: 16, category: 'break' as const, theme: 'horizontal', description: 'Horizontal page break element' },
  { id: 'break-vertical', name: 'Vertical Page Break', x: 48, y: 16, width: 16, height: 16, category: 'break' as const, theme: 'vertical', description: 'Vertical page break element' },
  
  // Vertical Bar Elements
  { id: 'bar-vertical-top', name: 'Vertical Bar Top', x: 48, y: 32, width: 16, height: 16, category: 'bar' as const, theme: 'vertical', description: 'Top part of vertical bar - does not scale vertically' },
  { id: 'bar-vertical-center', name: 'Vertical Bar Center (Repeatable)', x: 48, y: 48, width: 16, height: 16, category: 'bar' as const, theme: 'vertical', description: 'Center part of vertical bar - vertically repeatable for scaling' },
  { id: 'bar-vertical-bottom', name: 'Vertical Bar Bottom', x: 48, y: 64, width: 16, height: 16, category: 'bar' as const, theme: 'vertical', description: 'Bottom part of vertical bar - does not scale vertically' },
  
  // Buttons
  { id: 'button-default', name: 'Default Button', x: 48, y: 80, width: 16, height: 16, category: 'button' as const, theme: 'default', state: 'normal' as const, description: '16x16 default button' },
  { id: 'button-activated', name: 'Activated Button', x: 48, y: 96, width: 16, height: 16, category: 'button' as const, theme: 'default', state: 'active' as const, description: '16x16 activated button' }
];

// Base sprite definitions for Row 2 - 4x4 Frame System (16 sprites per theme)
const BASE_FRAME_SPRITES = [
  // 3x3 Main Frame (9 sprites)
  // Top Row
  { id: 'frame-corner-top-left', name: 'Frame Top Left Corner', x: 0, y: 0, width: 16, height: 16, category: 'frame' as const, theme: 'corner', description: 'Top left corner of frame - does not scale, maintains corner appearance' },
  { id: 'frame-edge-top', name: 'Frame Top Edge (Repeatable)', x: 16, y: 0, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Top edge of frame - horizontally repeatable for scaling' },
  { id: 'frame-corner-top-right', name: 'Frame Top Right Corner', x: 32, y: 0, width: 16, height: 16, category: 'frame' as const, theme: 'corner', description: 'Top right corner of frame - does not scale, maintains corner appearance' },
  
  // Middle Row
  { id: 'frame-edge-left', name: 'Frame Left Edge (Repeatable)', x: 0, y: 16, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Left edge of frame - vertically repeatable for scaling' },
  { id: 'frame-background', name: 'Frame Background (Repeatable)', x: 16, y: 16, width: 16, height: 16, category: 'frame' as const, theme: 'background', description: 'Background of frame - both horizontally and vertically repeatable' },
  { id: 'frame-edge-right', name: 'Frame Right Edge (Repeatable)', x: 32, y: 16, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Right edge of frame - vertically repeatable for scaling' },
  
  // Bottom Row
  { id: 'frame-corner-bottom-left', name: 'Frame Bottom Left Corner', x: 0, y: 32, width: 16, height: 16, category: 'frame' as const, theme: 'corner', description: 'Bottom left corner of frame - does not scale, maintains corner appearance' },
  { id: 'frame-edge-bottom', name: 'Frame Bottom Edge (Repeatable)', x: 16, y: 32, width: 16, height: 16, category: 'frame' as const, theme: 'edge', description: 'Bottom edge of frame - horizontally repeatable for scaling' },
  { id: 'frame-corner-bottom-right', name: 'Frame Bottom Right Corner', x: 32, y: 32, width: 16, height: 16, category: 'frame' as const, theme: 'corner', description: 'Bottom right corner of frame - does not scale, maintains corner appearance' },
  
  // 3x1 Horizontal Bar (3 sprites)
  { id: 'bar-horizontal-left', name: 'Horizontal Bar Left', x: 0, y: 48, width: 16, height: 16, category: 'bar' as const, theme: 'horizontal', description: 'Left part of horizontal bar - does not scale horizontally' },
  { id: 'bar-horizontal-center', name: 'Horizontal Bar Center (Repeatable)', x: 16, y: 48, width: 16, height: 16, category: 'bar' as const, theme: 'horizontal', description: 'Center part of horizontal bar - horizontally repeatable for scaling' },
  { id: 'bar-horizontal-right', name: 'Horizontal Bar Right', x: 32, y: 48, width: 16, height: 16, category: 'bar' as const, theme: 'horizontal', description: 'Right part of horizontal bar - does not scale horizontally' },
  
  // 1x3 Vertical Bar (3 sprites)
  { id: 'bar-vertical-top', name: 'Vertical Bar Top', x: 48, y: 0, width: 16, height: 16, category: 'bar' as const, theme: 'vertical', description: 'Top part of vertical bar - does not scale vertically' },
  { id: 'bar-vertical-center', name: 'Vertical Bar Center (Repeatable)', x: 48, y: 16, width: 16, height: 16, category: 'bar' as const, theme: 'vertical', description: 'Center part of vertical bar - vertically repeatable for scaling' },
  { id: 'bar-vertical-bottom', name: 'Vertical Bar Bottom', x: 48, y: 32, width: 16, height: 16, category: 'bar' as const, theme: 'vertical', description: 'Bottom part of vertical bar - does not scale vertically' },
  
  // 1x1 Button (1 sprite)
  { id: 'button-default', name: 'Default Button', x: 48, y: 48, width: 16, height: 16, category: 'button' as const, theme: 'default', state: 'normal' as const, description: '16x16 default button' }
];

// Base sprite definitions for Row 3 - Button Variations (1 sprite per theme)
const BASE_BUTTON_SPRITES = [
  { id: 'button-default', name: 'Default Button', x: 0, y: 0, width: 16, height: 16, category: 'button' as const, theme: 'default', state: 'normal' as const, description: '16x16 default button' }
];

// Generator function to create sprites for a theme
function generateThemeSprites(config: ThemeConfig): AtlasSprite[] {
  const sprites: AtlasSprite[] = [];
  
  if (config.rowType === 'main') {
    // Generate main 4x7 grid sprites (28 sprites)
    BASE_MAIN_SPRITES.forEach(baseSprite => {
      sprites.push({
        ...baseSprite,
        id: `${baseSprite.id}-${config.color}`,
        name: `${baseSprite.name} (${config.color})`,
        x: baseSprite.x + config.xOffset,
        y: baseSprite.y + config.yOffset,
        color: config.color
      });
    });
  } else if (config.rowType === 'frame') {
    // Generate 4x4 frame system sprites (16 sprites)
    BASE_FRAME_SPRITES.forEach(baseSprite => {
      sprites.push({
        ...baseSprite,
        id: `${baseSprite.id}-${config.color}`,
        name: `${baseSprite.name} (${config.color})`,
        x: baseSprite.x + config.xOffset,
        y: baseSprite.y + config.yOffset,
        color: config.color
      });
    });
  } else if (config.rowType === 'button') {
    // Generate single button sprite (1 sprite)
    BASE_BUTTON_SPRITES.forEach(baseSprite => {
             // Handle special cases for activated buttons
       let state: 'normal' | 'active' = baseSprite.state || 'normal';
       let name = baseSprite.name;
       
       if (config.name.includes('activated')) {
         state = 'active';
         name = 'Activated Button';
       }
      
      sprites.push({
        ...baseSprite,
        id: `${baseSprite.id}-${config.color}`,
        name: `${name} (${config.color})`,
        x: baseSprite.x + config.xOffset,
        y: baseSprite.y + config.yOffset,
        color: config.color,
        state: state
      });
    });
  }
  
  return sprites;
}

// Generate all sprites for all themes
const allSprites: AtlasSprite[] = [];
THEME_CONFIGS.forEach(config => {
  allSprites.push(...generateThemeSprites(config));
});

// Calculate metadata
const maxX = Math.max(...allSprites.map(s => s.x + s.width));
const maxY = Math.max(...allSprites.map(s => s.y + s.height));

export const ATLAS_MAPPING: AtlasMapping = {
  sprites: allSprites,
  metadata: {
    atlasWidth: maxX,
    atlasHeight: maxY,
    spriteSize: 16,
    totalSprites: allSprites.length
  }
};

// Export theme configurations for external use
export { THEME_CONFIGS, BASE_MAIN_SPRITES, BASE_FRAME_SPRITES, BASE_BUTTON_SPRITES };

/**
 * Utility functions for working with the atlas mapping
 */
export const getSpriteById = (id: string): AtlasSprite | undefined => {
  return ATLAS_MAPPING.sprites.find(sprite => sprite.id === id);
};

export const getSpritesByCategory = (category: 'button' | 'frame' | 'bar' | 'break' | 'icon' | 'text'): AtlasSprite[] => {
  return ATLAS_MAPPING.sprites.filter(sprite => sprite.category === category);
};

export const getSpritesByTheme = (theme: string): AtlasSprite[] => {
  return ATLAS_MAPPING.sprites.filter(sprite => sprite.theme === theme);
};

export const getButtonSprites = (theme?: string, state?: string): AtlasSprite[] => {
  return ATLAS_MAPPING.sprites.filter(sprite => {
    if (sprite.category !== 'button') return false;
    if (theme && sprite.theme !== theme) return false;
    if (state && sprite.state !== state) return false;
    return true;
  });
};

export const getFrameSprites = (theme?: string): AtlasSprite[] => {
  return ATLAS_MAPPING.sprites.filter(sprite => {
    if (sprite.category !== 'frame') return false;
    if (theme && sprite.theme !== theme) return false;
    return true;
  });
};

export const getAvailableThemes = (): string[] => {
  const themes = new Set<string>();
  ATLAS_MAPPING.sprites.forEach(sprite => {
    if (sprite.theme) themes.add(sprite.theme);
  });
  return Array.from(themes).sort();
};

export const getAvailableButtonThemes = (): string[] => {
  const themes = new Set<string>();
  ATLAS_MAPPING.sprites.forEach(sprite => {
    if (sprite.category === 'button' && sprite.theme) {
      themes.add(sprite.theme);
    }
  });
  return Array.from(themes).sort();
};

export const getAvailableFrameThemes = (): string[] => {
  const themes = new Set<string>();
  ATLAS_MAPPING.sprites.forEach(sprite => {
    if (sprite.category === 'frame' && sprite.theme) {
      themes.add(sprite.theme);
    }
  });
  return Array.from(themes).sort();
};


