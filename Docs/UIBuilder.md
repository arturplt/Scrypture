# UIBuilder Documentation

## Overview

The UIBuilder is a React component that provides a visual interface for creating and configuring UI elements using a sprite atlas system. It supports multiple element types including frames, buttons, icons, text, bars, and breaks, with dynamic theming and scaling capabilities.

## Table of Contents

1. [Architecture](#architecture)
2. [Atlas Mapping System](#atlas-mapping-system)
3. [UIBuilder Component](#uibuilder-component)
4. [Element Types](#element-types)
5. [Frame System](#frame-system)
6. [Theming System](#theming-system)
7. [API Reference](#api-reference)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)

## Architecture

### Core Components

- **`src/data/atlasMapping.ts`** - Central data store for all sprite definitions and theme configurations
- **`src/components/UIBuilder.tsx`** - Main React component for the UI builder interface
- **`src/components/UIBuilder.module.css`** - Styling for the UIBuilder component

### Data Flow

```
Atlas Mapping (atlasMapping.ts)
    ↓
UIBuilder Component (UIBuilder.tsx)
    ↓
Canvas Rendering
    ↓
Export/Copy Settings
```

## Atlas Mapping System

### Theme Configuration

The atlas uses a dynamic theme system with 30 themes across 4 rows:

#### Row 1 (y: 0-96) - Main 4x7 Grid
- **8 themes** with 28 sprites each
- **Row Type**: `'main'`
- **Layout**: 4x7 grid system
- **Themes**: green, dark-green, blue-stone, etc.

#### Row 2 (y: 112-176) - 4x4 Frame System  
- **8 themes** with 16 sprites each
- **Row Type**: `'frame'`
- **Layout**: 4x4 grid system
- **Themes**: green-frame, red-frame, forest-green, burnt-red, silver, gold, pale-blue, green-ornate

#### Row 3 (y: 176-240) - Button Variations
- **8 themes** with 1 sprite each
- **Row Type**: `'frame'` (treated as frames)
- **Layout**: Single button sprites
- **Themes**: green-button, red-button, green-button-activated, red-button-activated, grey-brown, purple-button, orange-button, blue-ornate

#### Row 4 (y: 240-304) - Special Variations
- **6 themes** with 16 sprites each
- **Row Type**: `'frame'`
- **Layout**: 4x4 grid system
- **Themes**: thick-gold, skinny-gold, turquoise, bronze, gunmetal, royal-blue

### Sprite Categories

```typescript
type SpriteCategory = 'frame' | 'bar' | 'button' | 'break' | 'icon' | 'text';
```

#### Frame Sprites
- **Corners**: Top-left, top-right, bottom-left, bottom-right
- **Edges**: Top, bottom, left, right (repeatable)
- **Background**: Center tile (repeatable)
- **Partitions**: Left, middle, right (for compound frames)
- **Lower Edges**: Bottom-left-frame, bottom-right-frame (for compound frames)

#### Bar Sprites
- **Horizontal**: Left, center (repeatable), right
- **Vertical**: Top, center (repeatable), bottom
- **Progress**: Left, center (repeatable), right

#### Button Sprites
- **Default**: 16x16 standard button
- **Activated**: 16x16 pressed state
- **Navigation**: Back, next, large previous/next
- **Special**: Wooden, small, directional, attribute buttons

#### Icon Sprites
- **Action**: Save, edit, target
- **Data**: Stats, book, crown, trophy
- **Security**: Lock
- **Nature**: Lotus
- **Attributes**: Fist, brain, soul (48x48)

#### Text Sprites
- **Titles**: Sanctuary (80x32)
- **Subtitles**: Bober (64x32), Dam (48x32)
- **Difficulty**: Numbers 0-9 (16x16)

#### Break Sprites
- **Horizontal**: Page break line
- **Vertical**: Page break line

## UIBuilder Component

### Props

```typescript
interface UIBuilderProps {
  // No props currently - self-contained component
}
```

### State

```typescript
interface ElementConfig {
  type: ElementType;
  theme: string;
  scale: number;
  selectedSprite?: string;
  frameConfig?: FrameConfig;
  showGrid: boolean;
}

interface FrameConfig {
  type: FrameType;
  width: number;
  height: number;
  upperHeight?: number;
  lowerHeight?: number;
  customWidth?: number;
  customHeight?: number;
}
```

### Element Types

```typescript
type ElementType = 'frame' | 'button' | 'icon' | 'text' | 'bar' | 'break';
type FrameType = 'standard' | 'compound';
```

## Element Types

### Frames

Frames are the most complex element type, supporting two configurations:

#### Standard Frames
- **Layout**: 3x3 grid system
- **Components**: 4 corners, 4 edges, 1 background
- **Scaling**: Grid-based (16px sprite units)
- **Custom Sizing**: Pixel-based with 8px steps (16px-400px)

#### Compound Frames
- **Layout**: Upper section + partition + lower section
- **Components**: 
  - Upper: corners, edges, background
  - Partition: left, middle (repeatable), right
  - Lower: corners, edges, background
- **Edge Sprites**: Different for upper vs lower sections
- **Scaling**: Configurable upper/lower heights

### Buttons

- **Single sprite elements**
- **States**: Normal, activated
- **Themes**: Various color schemes
- **Sizes**: 16x16, 32x32, 48x16

### Icons

- **Single sprite elements**
- **Categories**: Action, data, security, nature, attributes
- **Sizes**: 16x16, 48x48

### Text

- **Pre-rendered text sprites**
- **Categories**: Titles, subtitles, difficulty numbers
- **Sizes**: Various (16x16 to 80x32)

### Bars

- **Horizontal**: Left + center (repeatable) + right
- **Vertical**: Top + center (repeatable) + bottom
- **Progress**: Left + center (repeatable) + right

### Breaks

- **Horizontal**: Page break line
- **Vertical**: Page break line

## Frame System

### Standard Frame Layout

```
┌─────────┬─────────┬─────────┐
│ Top-L   │ Top     │ Top-R   │
├─────────┼─────────┼─────────┤
│ Left    │ Background │ Right │
├─────────┼─────────┼─────────┤
│ Bottom-L│ Bottom  │ Bottom-R│
└─────────┴─────────┴─────────┘
```

### Compound Frame Layout

```
┌─────────┬─────────┬─────────┐
│ Top-L   │ Top     │ Top-R   │ ← Upper Section
├─────────┼─────────┼─────────┤
│ Left    │ Background │ Right │
├─────────┼─────────┼─────────┤
│ Part-L  │ Part-M  │ Part-R  │ ← Partition
├─────────┼─────────┼─────────┤
│ Bot-L   │ Bottom  │ Bot-R   │ ← Lower Section
├─────────┼─────────┼─────────┤
│ Bot-L   │ Bottom  │ Bot-R   │
└─────────┴─────────┴─────────┘
```

### Custom Sizing

Frames support custom pixel-based sizing:

- **Range**: 16px to 400px
- **Step**: 8px increments
- **Overlap**: For sizes < 32px, edges and corners overlap
- **Tiling**: Background tiles correctly at all sizes

## Theming System

### Theme Structure

```typescript
interface ThemeConfig {
  name: string;        // Theme identifier
  color: string;       // Color name
  xOffset: number;     // X offset in atlas
  yOffset: number;     // Y offset in atlas
  rowType: 'main' | 'frame' | 'button';
}
```

### Available Themes

#### Frame Themes (25 total)
- **3 Compound Themes**: green, dark-green, blue-stone
- **22 9-Slice Themes**: green-frame, red-frame, forest-green, burnt-red, silver, gold, pale-blue, green-ornate, green-button, red-button, green-button-activated, red-button-activated, grey-brown, purple-button, orange-button, blue-ornate, thick-gold, skinny-gold, turquoise, bronze, gunmetal, royal-blue

### Sprite ID Generation

```typescript
// Format: {baseSprite.id}-{theme.name}
// Examples:
// frame-corner-top-left-green-frame
// button-normal-green-button
// partition-left-blue-stone
```

## API Reference

### Atlas Mapping Functions

```typescript
// Get sprite by ID
getSpriteById(id: string): AtlasSprite | undefined

// Get sprites by category
getSpritesByCategory(category: SpriteCategory): AtlasSprite[]

// Get sprites by theme
getSpritesByTheme(theme: string): AtlasSprite[]

// Get frame sprites
getFrameSprites(theme?: string): AtlasSprite[]

// Get button sprites
getButtonSprites(theme?: string, state?: string): AtlasSprite[]

// Get icon sprites
getIconSprites(theme?: string): AtlasSprite[]

// Get text sprites
getTextSprites(theme?: string): AtlasSprite[]

// Get available themes
getAvailableThemes(): string[]

// Get clean theme names for display
getCleanThemeName(themeId: string): string
```

### UIBuilder Functions

```typescript
// Draw functions
drawElement(): void
drawStandardFrame(ctx: CanvasRenderingContext2D, scaledSpriteSize: number): void
drawCompoundFrame(ctx: CanvasRenderingContext2D, scaledSpriteSize: number): void
drawSprite(ctx: CanvasRenderingContext2D, sprite: AtlasSprite, gridX: number, gridY: number, scaledSpriteSize: number): void

// Event handlers
handleElementTypeChange(type: ElementType): void
handleColorChange(colorId: string): void
handleSpriteChange(spriteId: string): void
handleFrameTypeChange(type: FrameType): void
handleScaleChange(scale: number): void
handleCustomSizeChange(dimension: 'customWidth' | 'customHeight', value: number): void
handleExportElement(): void
handleCopySettings(): void

// Utility functions
getCanvasDimensions(): { width: number; height: number }
getGridDimensions(): { width: number; height: number }
getAvailableSpritesForElementType(): AtlasSprite[]
```

## Usage Examples

### Basic Frame Creation

```typescript
// Create a standard 3x3 green frame
const frameConfig = {
  type: 'frame',
  theme: 'green-frame',
  scale: 2,
  frameConfig: {
    type: 'standard',
    width: 3,
    height: 3
  }
};
```

### Compound Frame Creation

```typescript
// Create a compound frame with upper/lower sections
const compoundConfig = {
  type: 'frame',
  theme: 'green',
  scale: 2,
  frameConfig: {
    type: 'compound',
    width: 4,
    upperHeight: 3,
    lowerHeight: 2
  }
};
```

### Custom Sized Frame

```typescript
// Create a 48x48 pixel frame (3x3 sprites at scale 1)
const customConfig = {
  type: 'frame',
  theme: 'green-frame',
  scale: 1,
  frameConfig: {
    type: 'standard',
    width: 3,
    height: 3,
    customWidth: 48,
    customHeight: 48
  }
};
```

### Button Element

```typescript
// Create a button element
const buttonConfig = {
  type: 'button',
  theme: 'green-frame',
  scale: 2,
  selectedSprite: 'button-normal-green-button'
};
```

### Copy Settings Output

```json
{
  "type": "frame",
  "theme": "green-frame",
  "scale": 2,
  "width": 96,
  "height": 96,
  "frameType": "standard",
  "customWidth": 48,
  "customHeight": 48
}
```

## Troubleshooting

### Common Issues

#### Frame Not Displaying
- **Check**: Theme exists in `THEME_CONFIGS`
- **Check**: Sprite IDs are correctly generated
- **Check**: Atlas image is loaded

#### Compound Frame Edge Issues
- **Issue**: Upper and lower edges look the same
- **Fix**: Ensure using correct edge sprites for upper vs lower sections
- **Upper**: `frame-edge-left`, `frame-edge-right`
- **Lower**: `frame-bottom-left-frame`, `frame-bottom-right-frame`

#### Custom Size Background Not Tiling
- **Issue**: Background stops repeating at larger sizes
- **Fix**: Ensure nested loop tiling in `drawStandardFrame`

#### Sprite Selection Not Working
- **Issue**: Dropdown shows no sprites for non-frame elements
- **Check**: Element type is not 'frame'
- **Check**: `getAvailableSpritesForElementType()` returns sprites

### Debug Information

The UIBuilder includes debug information in the info panel:
- Canvas dimensions
- Grid dimensions
- Selected sprite
- Available themes/sprites count

### Performance Considerations

- **Canvas Size**: Large custom frames may impact performance
- **Sprite Loading**: Atlas image is loaded once and cached
- **Rendering**: Uses `imageSmoothingEnabled = false` for pixel-perfect rendering

## File Structure

```
src/
├── data/
│   └── atlasMapping.ts          # Atlas data and utilities
├── components/
│   ├── UIBuilder.tsx           # Main component
│   └── UIBuilder.module.css    # Component styles
└── assets/
    └── Frames/
        └── Atlas.png           # Sprite atlas image
```

## Contributing

When adding new sprites or themes:

1. **Update `atlasMapping.ts`**:
   - Add to `BASE_*_SPRITES` arrays
   - Add theme to `THEME_CONFIGS`
   - Update sprite generation logic

2. **Update UIBuilder**:
   - Add new element types if needed
   - Update drawing functions
   - Add new controls if required

3. **Test**:
   - Verify sprite generation
   - Test all element types
   - Check export/copy functionality

## Version History

- **v1.0**: Initial implementation with basic frame system
- **v1.1**: Added compound frames and custom sizing
- **v1.2**: Added copy settings functionality
- **v1.3**: Fixed compound frame edge sprites
- **v1.4**: Added comprehensive documentation
