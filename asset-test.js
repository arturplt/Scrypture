// Atlas Mapping for asset-test.html
// This file mirrors the structure from src/data/atlasMapping.ts for direct use in HTML

// Theme configurations for 4 rows × 6-8 columns = 30 themes
const THEME_CONFIGS = [
  // Row 1 (y: 0-96) - 3 themes - Main 4x7 grid (28 elements per theme)
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

// Base sprite definitions for Row 1 - Main 4x7 Grid (8 elements per theme)
const BASE_MAIN_SPRITES = [
  // 1. Compound Frame (3x5 grid) - 15 sprites
  // Top Row - Corners and Top Edge
  { id: 'frame-corner-top-left', name: 'Top Left Corner', x: 0, y: 0, width: 16, height: 16, category: 'frame', theme: 'corner', description: 'Top left corner - does not scale, maintains corner appearance' },
  { id: 'frame-edge-top', name: 'Top Edge (Repeatable)', x: 16, y: 0, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Top edge - horizontally repeatable for scaling' },
  { id: 'frame-corner-top-right', name: 'Top Right Corner', x: 32, y: 0, width: 16, height: 16, category: 'frame', theme: 'corner', description: 'Top right corner - does not scale, maintains corner appearance' },
  
  // Middle Row - Left Edge, Background, Right Edge
  { id: 'frame-edge-left', name: 'Left Edge (Repeatable)', x: 0, y: 16, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Left edge - vertically repeatable for scaling' },
  { id: 'frame-background', name: 'Background (Repeatable)', x: 16, y: 16, width: 16, height: 16, category: 'frame', theme: 'background', description: 'Background - both horizontally and vertically repeatable' },
  { id: 'frame-edge-right', name: 'Right Edge (Repeatable)', x: 32, y: 16, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Right edge - vertically repeatable for scaling' },
  
  // Lower Frame Elements
  { id: 'frame-bottom-left-frame', name: 'Lower Left Edge', x: 0, y: 48, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Lower left edge element' },
  { id: 'frame-bottom-center', name: 'Lower BG (Repeatable)', x: 16, y: 48, width: 16, height: 16, category: 'frame', theme: 'background', description: 'Lower background - horizontally repeatable' },
  { id: 'frame-bottom-right-frame', name: 'Lower Right Edge', x: 32, y: 48, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Lower right edge element' },
  
  // Partition Elements
  { id: 'partition-left', name: 'Partition Left', x: 0, y: 32, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Left partition element' },
  { id: 'partition-middle', name: 'Partition Middle (Repeatable)', x: 16, y: 32, width: 16, height: 16, category: 'frame', theme: 'background', description: 'Middle partition element - horizontally repeatable' },
  { id: 'partition-right', name: 'Partition Right', x: 32, y: 32, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Right partition element' },
  
  // Bottom Row - Corners and Bottom Edge
  { id: 'frame-corner-bottom-left', name: 'Bottom Left Corner', x: 0, y: 64, width: 16, height: 16, category: 'frame', theme: 'corner', description: 'Bottom left corner - does not scale, maintains corner appearance' },
  { id: 'frame-edge-bottom', name: 'Bottom Edge (Repeatable)', x: 16, y: 64, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Bottom edge - horizontally repeatable for scaling' },
  { id: 'frame-corner-bottom-right', name: 'Bottom Right Corner', x: 32, y: 64, width: 16, height: 16, category: 'frame', theme: 'corner', description: 'Bottom right corner - does not scale, maintains corner appearance' },
  
  // 2. Vertical Bar (3 parts) - 3 sprites
  { id: 'bar-vertical-top', name: 'Vertical Bar Top', x: 48, y: 32, width: 16, height: 16, category: 'bar', theme: 'vertical', description: 'Top part of vertical bar - does not scale vertically' },
  { id: 'bar-vertical-center', name: 'Vertical Bar Center (Repeatable)', x: 48, y: 48, width: 16, height: 16, category: 'bar', theme: 'vertical', description: 'Center part of vertical bar - vertically repeatable for scaling' },
  { id: 'bar-vertical-bottom', name: 'Vertical Bar Bottom', x: 48, y: 64, width: 16, height: 16, category: 'bar', theme: 'vertical', description: 'Bottom part of vertical bar - does not scale vertically' },
  
  // 3. Vertical Page Break - 1 sprite
  { id: 'break-vertical', name: 'Vertical Page Break', x: 48, y: 16, width: 16, height: 16, category: 'break', theme: 'vertical', description: 'Vertical page break element' },
  
  // 4. Horizontal Bar (3 parts) - 3 sprites
  { id: 'bar-horizontal-left', name: 'Horizontal Bar Left', x: 0, y: 80, width: 16, height: 16, category: 'bar', theme: 'horizontal', description: 'Left part of horizontal bar - does not scale horizontally' },
  { id: 'bar-horizontal-center', name: 'Horizontal Bar Center (Repeatable)', x: 16, y: 80, width: 16, height: 16, category: 'bar', theme: 'horizontal', description: 'Center part of horizontal bar - horizontally repeatable for scaling' },
  { id: 'bar-horizontal-right', name: 'Horizontal Bar Right', x: 32, y: 80, width: 16, height: 16, category: 'bar', theme: 'horizontal', description: 'Right part of horizontal bar - does not scale horizontally' },
  
  // 5. Horizontal Progress Bar (3 parts) - 3 sprites
  { id: 'bar-progress-left', name: 'Progress Bar Left', x: 0, y: 96, width: 16, height: 16, category: 'bar', theme: 'progress', description: 'Left part of progress bar - does not scale horizontally' },
  { id: 'bar-progress-center', name: 'Progress Bar Center (Repeatable)', x: 16, y: 96, width: 16, height: 16, category: 'bar', theme: 'progress', description: 'Center part of progress bar - horizontally repeatable for scaling' },
  { id: 'bar-progress-right', name: 'Progress Bar Right', x: 32, y: 96, width: 16, height: 16, category: 'bar', theme: 'progress', description: 'Right part of progress bar - does not scale horizontally' },
  
  // 6. Horizontal Page Break - 1 sprite
  { id: 'break-horizontal', name: 'Horizontal Page Break', x: 48, y: 0, width: 16, height: 16, category: 'break', theme: 'horizontal', description: 'Horizontal page break element' },
  
  // 7. Single Button 16x16 - 1 sprite
  { id: 'button-default', name: 'Default Button', x: 48, y: 80, width: 16, height: 16, category: 'button', theme: 'default', state: 'normal', description: '16x16 default button' },
  
  // 8. Activated Button - 1 sprite
  { id: 'button-activated', name: 'Activated Button', x: 48, y: 96, width: 16, height: 16, category: 'button', theme: 'default', state: 'active', description: '16x16 activated button' }
];

// Base sprite definitions for Row 2 - 4x4 Frame System (16 sprites per theme)
const BASE_FRAME_SPRITES = [
  // 3x3 Main Frame (9 sprites)
  // Top Row
  { id: 'frame-corner-top-left', name: 'Frame Top Left Corner', x: 0, y: 0, width: 16, height: 16, category: 'frame', theme: 'corner', description: 'Top left corner of frame - does not scale, maintains corner appearance' },
  { id: 'frame-edge-top', name: 'Frame Top Edge (Repeatable)', x: 16, y: 0, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Top edge of frame - horizontally repeatable for scaling' },
  { id: 'frame-corner-top-right', name: 'Frame Top Right Corner', x: 32, y: 0, width: 16, height: 16, category: 'frame', theme: 'corner', description: 'Top right corner of frame - does not scale, maintains corner appearance' },
  
  // Middle Row
  { id: 'frame-edge-left', name: 'Frame Left Edge (Repeatable)', x: 0, y: 16, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Left edge of frame - vertically repeatable for scaling' },
  { id: 'frame-background', name: 'Frame Background (Repeatable)', x: 16, y: 16, width: 16, height: 16, category: 'frame', theme: 'background', description: 'Background of frame - both horizontally and vertically repeatable' },
  { id: 'frame-edge-right', name: 'Frame Right Edge (Repeatable)', x: 32, y: 16, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Right edge of frame - vertically repeatable for scaling' },
  
  // Bottom Row
  { id: 'frame-corner-bottom-left', name: 'Frame Bottom Left Corner', x: 0, y: 32, width: 16, height: 16, category: 'frame', theme: 'corner', description: 'Bottom left corner of frame - does not scale, maintains corner appearance' },
  { id: 'frame-edge-bottom', name: 'Frame Bottom Edge (Repeatable)', x: 16, y: 32, width: 16, height: 16, category: 'frame', theme: 'edge', description: 'Bottom edge of frame - horizontally repeatable for scaling' },
  { id: 'frame-corner-bottom-right', name: 'Frame Bottom Right Corner', x: 32, y: 32, width: 16, height: 16, category: 'frame', theme: 'corner', description: 'Bottom right corner of frame - does not scale, maintains corner appearance' },
  
  // 3x1 Horizontal Bar (3 sprites)
  { id: 'bar-horizontal-left', name: 'Horizontal Bar Left', x: 0, y: 48, width: 16, height: 16, category: 'bar', theme: 'horizontal', description: 'Left part of horizontal bar - does not scale horizontally' },
  { id: 'bar-horizontal-center', name: 'Horizontal Bar Center (Repeatable)', x: 16, y: 48, width: 16, height: 16, category: 'bar', theme: 'horizontal', description: 'Center part of horizontal bar - horizontally repeatable for scaling' },
  { id: 'bar-horizontal-right', name: 'Horizontal Bar Right', x: 32, y: 48, width: 16, height: 16, category: 'bar', theme: 'horizontal', description: 'Right part of horizontal bar - does not scale horizontally' },
  
  // 1x3 Vertical Bar (3 sprites)
  { id: 'bar-vertical-top', name: 'Vertical Bar Top', x: 48, y: 0, width: 16, height: 16, category: 'bar', theme: 'vertical', description: 'Top part of vertical bar - does not scale vertically' },
  { id: 'bar-vertical-center', name: 'Vertical Bar Center (Repeatable)', x: 48, y: 16, width: 16, height: 16, category: 'bar', theme: 'vertical', description: 'Center part of vertical bar - vertically repeatable for scaling' },
  { id: 'bar-vertical-bottom', name: 'Vertical Bar Bottom', x: 48, y: 32, width: 16, height: 16, category: 'bar', theme: 'vertical', description: 'Bottom part of vertical bar - does not scale vertically' },
  
  // 1x1 Button (1 sprite)
  { id: 'button-default', name: 'Default Button', x: 48, y: 48, width: 16, height: 16, category: 'button', theme: 'default', state: 'normal', description: '16x16 default button' }
];

// Base sprite definitions for Row 3 - Button Variations (1 sprite per theme)
const BASE_BUTTON_SPRITES = [
  { id: 'button-default', name: 'Default Button', x: 0, y: 0, width: 16, height: 16, category: 'button', theme: 'default', state: 'normal', description: '16x16 default button' }
];

// Generator function to create sprites for a theme
function generateThemeSprites(config) {
  const sprites = [];
  
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
      let state = baseSprite.state || 'normal';
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
const allSprites = [];
THEME_CONFIGS.forEach(config => {
  const themeSprites = generateThemeSprites(config);
  console.log(`Generated ${themeSprites.length} sprites for theme "${config.color}":`, themeSprites);
  allSprites.push(...themeSprites);
});

// Add additional text and button elements
const additionalSprites = [
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

const ATLAS_MAPPING = {
  sprites: allSprites,
       metadata: {
    atlasWidth: maxX,
    atlasHeight: maxY,
    spriteSize: 16,
    totalSprites: allSprites.length
  }
};

// Make ATLAS_MAPPING available globally for the HTML script
window.ATLAS_MAPPING = ATLAS_MAPPING;

// Make THEME_CONFIGS available globally for the HTML script
window.THEME_CONFIGS = THEME_CONFIGS;
