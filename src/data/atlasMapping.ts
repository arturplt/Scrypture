// Atlas Mapping Generator - Dynamic Theme System
// This approach generates atlas mappings for multiple themes without code duplication

export interface ThemeConfig {
  name: string;
  color: string;
  xOffset: number;
  yOffset: number;
  rowType: 'main' | 'frame';
}

export interface AtlasSprite {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: 'frame' | 'bar' | 'button' | 'break' | 'icon' | 'text';
  theme: string;
  color: string;
  state?: 'normal' | 'active';
  description: string;
}

export interface AtlasMapping {
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
  
  
  // Row 2 (y: 112-176) - 8 themes - 4x4 frame system
  { name: 'green-frame', color: 'green', xOffset: 0, yOffset: 112, rowType: 'frame' },
  { name: 'red-frame', color: 'red', xOffset: 64, yOffset: 112, rowType: 'frame' },
  { name: 'forest-green', color: 'forest-green', xOffset: 128, yOffset: 112, rowType: 'frame' },
  { name: 'burnt-red', color: 'burnt-red', xOffset: 192, yOffset: 112, rowType: 'frame' },
  { name: 'silver', color: 'silver', xOffset: 256, yOffset: 112, rowType: 'frame' },
  { name: 'gold', color: 'gold', xOffset: 320, yOffset: 112, rowType: 'frame' },
  { name: 'pale-blue', color: 'pale-blue', xOffset: 384, yOffset: 112, rowType: 'frame' },
  { name: 'green-ornate', color: 'green-ornate', xOffset: 448, yOffset: 112, rowType: 'frame' },
  
  // Row 3 (y: 176-240) - 8 themes - Frame system (same as Row 2)
  { name: 'green-button', color: 'green', xOffset: 0, yOffset: 176, rowType: 'frame' },
  { name: 'red-button', color: 'red', xOffset: 64, yOffset: 176, rowType: 'frame' },
  { name: 'green-button-activated', color: 'green', xOffset: 128, yOffset: 176, rowType: 'frame' },
  { name: 'red-button-activated', color: 'red', xOffset: 192, yOffset: 176, rowType: 'frame' },
  { name: 'grey-brown', color: 'grey-brown', xOffset: 256, yOffset: 176, rowType: 'frame' },
  { name: 'purple-button', color: 'purple', xOffset: 320, yOffset: 176, rowType: 'frame' },
  { name: 'orange-button', color: 'orange', xOffset: 384, yOffset: 176, rowType: 'frame' },
  { name: 'blue-ornate', color: 'blue-ornate', xOffset: 448, yOffset: 176, rowType: 'frame' },
  
  // Row 4 (y: 240-304) - 6 themes - Frame system (same as Row 2)
  { name: 'thick-gold', color: 'thick-gold', xOffset: 0, yOffset: 240, rowType: 'frame' },
  { name: 'skinny-gold', color: 'skinny-gold', xOffset: 64, yOffset: 240, rowType: 'frame' },
  { name: 'turquoise', color: 'turquoise', xOffset: 128, yOffset: 240, rowType: 'frame' },
  { name: 'bronze', color: 'bronze', xOffset: 192, yOffset: 240, rowType: 'frame' },
  { name: 'gunmetal', color: 'gunmetal', xOffset: 256, yOffset: 240, rowType: 'frame' },
  { name: 'royal-blue', color: 'royal-blue', xOffset: 320, yOffset: 240, rowType: 'frame' }
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
  
  // 1x3 Vertical Bar (3 sprites)
  { id: 'bar-vertical-top', name: 'Vertical Bar Top', x: 48, y: 0, width: 16, height: 16, category: 'bar' as const, theme: 'vertical', description: 'Top part of vertical bar - does not scale vertically' },
  { id: 'bar-vertical-center', name: 'Vertical Bar Center (Repeatable)', x: 48, y: 16, width: 16, height: 16, category: 'bar' as const, theme: 'vertical', description: 'Center part of vertical bar - vertically repeatable for scaling' },
  { id: 'bar-vertical-bottom', name: 'Vertical Bar Bottom', x: 48, y: 32, width: 16, height: 16, category: 'bar' as const, theme: 'vertical', description: 'Bottom part of vertical bar - does not scale vertically' },
  
  // 1x1 Button (1 sprite)
  { id: 'button-default', name: 'Default Button', x: 48, y: 48, width: 16, height: 16, category: 'button' as const, theme: 'default', state: 'normal' as const, description: '16x16 default button' }
];

// Generator function to create sprites for a theme
function generateThemeSprites(config: ThemeConfig): AtlasSprite[] {
  const sprites: AtlasSprite[] = [];
  
  if (config.rowType === 'main') {
    // Generate main 4x7 grid sprites (28 sprites)
    BASE_MAIN_SPRITES.forEach(baseSprite => {
      sprites.push({
        ...baseSprite,
        id: `${baseSprite.id}-${config.name}`,
        name: `${baseSprite.name} (${config.name})`,
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
        id: `${baseSprite.id}-${config.name}`,
        name: `${baseSprite.name} (${config.name})`,
        x: baseSprite.x + config.xOffset,
        y: baseSprite.y + config.yOffset,
        color: config.color
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

// Add additional sprites that aren't part of the theme system
const additionalSprites: AtlasSprite[] = [
  // Text elements
  { id: 'text-sanctuary', name: 'Text: Sanctuary', x: 0, y: 304, width: 80, height: 32, category: 'text', theme: 'title', color: 'default', description: 'Large title text for Sanctuary' },
  { id: 'text-bober', name: 'Text: Bober', x: 0, y: 336, width: 64, height: 32, category: 'text', theme: 'subtitle', color: 'default', description: 'Medium text for Bober' },
  { id: 'text-dam', name: 'Text: Dam', x: 0, y: 368, width: 48, height: 32, category: 'text', theme: 'subtitle', color: 'default', description: 'Medium text for Dam' },
  
  // Large navigation buttons
  { id: 'button-large-previous', name: 'Large Previous Button', x: 0, y: 400, width: 32, height: 32, category: 'button', theme: 'navigation', color: 'default', state: 'normal', description: '32x32 large previous navigation button' },
  { id: 'button-large-next', name: 'Large Next Button', x: 32, y: 400, width: 32, height: 32, category: 'button', theme: 'navigation', color: 'default', state: 'normal', description: '32x32 large next navigation button' },
  
  // Standard navigation buttons
  { id: 'button-back', name: 'Back Button', x: 0, y: 432, width: 48, height: 16, category: 'button', theme: 'navigation', color: 'default', state: 'normal', description: '48x16 back navigation button' },
  { id: 'button-next', name: 'Next Button', x: 48, y: 432, width: 48, height: 16, category: 'button', theme: 'navigation', color: 'default', state: 'normal', description: '48x16 next navigation button' },
  { id: 'button-wooden-wide', name: 'Wooden Button Wide', x: 96, y: 432, width: 48, height: 16, category: 'button', theme: 'wooden', color: 'default', state: 'normal', description: '48x16 wide wooden button' },
  { id: 'button-small', name: 'Small Button', x: 144, y: 432, width: 16, height: 16, category: 'button', theme: 'default', color: 'default', state: 'normal', description: '16x16 small button' },
  
  // Icons row at y: 448
  { id: 'icon-save', name: 'Save Icon', x: 0, y: 448, width: 16, height: 16, category: 'icon', theme: 'action', color: 'default', description: '16x16 save icon' },
  { id: 'icon-stats', name: 'Stats Icon', x: 16, y: 448, width: 16, height: 16, category: 'icon', theme: 'data', color: 'default', description: '16x16 stats icon' },
  { id: 'icon-lock', name: 'Lock Icon', x: 32, y: 448, width: 16, height: 16, category: 'icon', theme: 'security', color: 'default', description: '16x16 lock icon' },
  { id: 'icon-book', name: 'Book Icon', x: 48, y: 448, width: 16, height: 16, category: 'icon', theme: 'knowledge', color: 'default', description: '16x16 book icon' },
  { id: 'icon-crown', name: 'Crown Icon', x: 64, y: 448, width: 16, height: 16, category: 'icon', theme: 'royalty', color: 'default', description: '16x16 crown icon' },
  { id: 'icon-trophy', name: 'Trophy Icon', x: 80, y: 448, width: 16, height: 16, category: 'icon', theme: 'achievement', color: 'default', description: '16x16 trophy icon' },
  { id: 'icon-edit', name: 'Edit Icon', x: 96, y: 448, width: 16, height: 16, category: 'icon', theme: 'action', color: 'default', description: '16x16 edit icon' },
  { id: 'icon-target', name: 'Target Icon', x: 112, y: 448, width: 16, height: 16, category: 'icon', theme: 'goal', color: 'default', description: '16x16 target icon' },
  { id: 'icon-lotus', name: 'Lotus Icon', x: 128, y: 448, width: 16, height: 16, category: 'icon', theme: 'nature', color: 'default', description: '16x16 lotus icon' },
  
  // Difficulty numbers row at y: 464
  { id: 'difficulty-0', name: 'Difficulty 0', x: 0, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 0' },
  { id: 'difficulty-1', name: 'Difficulty 1', x: 16, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 1' },
  { id: 'difficulty-2', name: 'Difficulty 2', x: 32, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 2' },
  { id: 'difficulty-3', name: 'Difficulty 3', x: 48, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 3' },
  { id: 'difficulty-4', name: 'Difficulty 4', x: 64, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 4' },
  { id: 'difficulty-5', name: 'Difficulty 5', x: 80, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 5' },
  { id: 'difficulty-6', name: 'Difficulty 6', x: 96, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 6' },
  { id: 'difficulty-7', name: 'Difficulty 7', x: 112, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 7' },
  { id: 'difficulty-8', name: 'Difficulty 8', x: 128, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 8' },
  { id: 'difficulty-9', name: 'Difficulty 9', x: 144, y: 464, width: 16, height: 16, category: 'text', theme: 'difficulty', color: 'default', description: '16x16 difficulty level 9' },
  
  // Difficulty level buttons row at y: 480
  { id: 'button-low', name: 'Low Button', x: 0, y: 480, width: 32, height: 16, category: 'button', theme: 'difficulty', color: 'default', state: 'normal', description: '32x16 low difficulty button' },
  { id: 'button-medium', name: 'Medium Button', x: 32, y: 480, width: 48, height: 16, category: 'button', theme: 'difficulty', color: 'default', state: 'normal', description: '48x16 medium difficulty button' },
  { id: 'button-high', name: 'High Button', x: 80, y: 480, width: 32, height: 16, category: 'button', theme: 'difficulty', color: 'default', state: 'normal', description: '32x16 high difficulty button' },
  
  // Body, Mind, Soul buttons row at y: 496
  { id: 'button-body', name: 'Body Button', x: 0, y: 496, width: 32, height: 16, category: 'button', theme: 'attribute', color: 'default', state: 'normal', description: '32x16 body attribute button' },
  { id: 'button-mind', name: 'Mind Button', x: 32, y: 496, width: 32, height: 16, category: 'button', theme: 'attribute', color: 'default', state: 'normal', description: '32x16 mind attribute button' },
  { id: 'button-soul', name: 'Soul Button', x: 64, y: 496, width: 32, height: 16, category: 'button', theme: 'attribute', color: 'default', state: 'normal', description: '32x16 soul attribute button' },
  
  // Plus and minus buttons at y: 496
  { id: 'button-plus-large', name: 'Large Plus', x: 96, y: 496, width: 16, height: 16, category: 'button', theme: 'action', color: 'default', state: 'normal', description: '16x16 large plus button' },
  { id: 'button-plus-small', name: 'Small Plus', x: 112, y: 496, width: 16, height: 16, category: 'button', theme: 'action', color: 'default', state: 'normal', description: '16x16 small plus button' },
  { id: 'button-minus-large', name: 'Large Minus', x: 128, y: 496, width: 16, height: 16, category: 'button', theme: 'action', color: 'default', state: 'normal', description: '16x16 large minus button' },
  { id: 'button-minus-small', name: 'Small Minus', x: 144, y: 496, width: 16, height: 16, category: 'button', theme: 'action', color: 'default', state: 'normal', description: '16x16 small minus button' },
  
  // Directional buttons
  { id: 'button-left', name: 'Left Button', x: 160, y: 480, width: 16, height: 16, category: 'button', theme: 'direction', color: 'default', state: 'normal', description: '16x16 left direction button' },
  { id: 'button-up', name: 'Up Button', x: 176, y: 480, width: 16, height: 16, category: 'button', theme: 'direction', color: 'default', state: 'normal', description: '16x16 up direction button' },
  { id: 'button-right', name: 'Right Button', x: 192, y: 480, width: 16, height: 16, category: 'button', theme: 'direction', color: 'default', state: 'normal', description: '16x16 right direction button' },
  { id: 'button-down', name: 'Down Button', x: 176, y: 496, width: 16, height: 16, category: 'button', theme: 'direction', color: 'default', state: 'normal', description: '16x16 down direction button' },
  
  // Large attribute icons at y: 464
  { id: 'icon-fist', name: 'Fist Icon', x: 208, y: 464, width: 48, height: 48, category: 'icon', theme: 'attribute', color: 'default', description: '48x48 fist attribute icon' },
  { id: 'icon-brain', name: 'Brain Icon', x: 256, y: 464, width: 48, height: 48, category: 'icon', theme: 'attribute', color: 'default', description: '48x48 brain attribute icon' },
  { id: 'icon-soul', name: 'Soul Icon', x: 304, y: 464, width: 48, height: 48, category: 'icon', theme: 'attribute', color: 'default', description: '48x48 soul attribute icon' }
];

// Add additional sprites to the main array
allSprites.push(...additionalSprites);

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
export { THEME_CONFIGS, BASE_MAIN_SPRITES, BASE_FRAME_SPRITES };

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

export const getIconSprites = (theme?: string): AtlasSprite[] => {
  return ATLAS_MAPPING.sprites.filter(sprite => {
    if (sprite.category !== 'icon') return false;
    if (theme && sprite.theme !== theme) return false;
    return true;
  });
};

export const getTextSprites = (theme?: string): AtlasSprite[] => {
  return ATLAS_MAPPING.sprites.filter(sprite => {
    if (sprite.category !== 'text') return false;
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

/**
 * Utility functions for getting clean theme names for UI display
 */
export const getCleanThemeName = (themeId: string): string => {
  // Remove common suffixes and format nicely
  return themeId
    .replace(/-frame$/, '')  // Remove "-frame" suffix
    .replace(/-button$/, '') // Remove "-button" suffix
    .replace(/-activated$/, '') // Remove "-activated" suffix
    .replace(/-ornate$/, '') // Remove "-ornate" suffix
    .replace(/-/g, ' ')      // Replace remaining hyphens with spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
};

export const getAvailableThemesForElementType = (elementType: 'frame' | 'button' | 'icon' | 'text' | 'bar' | 'break'): Array<{id: string, displayName: string}> => {
  const themes = new Set<string>();
  
  ATLAS_MAPPING.sprites.forEach(sprite => {
    if (sprite.category === elementType && sprite.theme) {
      themes.add(sprite.theme);
    }
  });
  
  return Array.from(themes)
    .sort()
    .map(themeId => ({
      id: themeId,
      displayName: getCleanThemeName(themeId)
    }));
};

export const getAvailableFrameThemesForDisplay = (): Array<{id: string, displayName: string}> => {
  return getAvailableThemesForElementType('frame');
};

export const getAvailableButtonThemesForDisplay = (): Array<{id: string, displayName: string}> => {
  return getAvailableThemesForElementType('button');
};

export const getAvailableIconThemesForDisplay = (): Array<{id: string, displayName: string}> => {
  return getAvailableThemesForElementType('icon');
};

export const getAvailableTextThemesForDisplay = (): Array<{id: string, displayName: string}> => {
  return getAvailableThemesForElementType('text');
};

export const getAvailableBarThemesForDisplay = (): Array<{id: string, displayName: string}> => {
  return getAvailableThemesForElementType('bar');
};

export const getAvailableBreakThemesForDisplay = (): Array<{id: string, displayName: string}> => {
  return getAvailableThemesForElementType('break');
};


