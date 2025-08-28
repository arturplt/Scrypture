# UIBuilder Quick Reference

## Quick Start

### Basic Usage
```typescript
import { UIBuilder } from './components/UIBuilder';

// Use in your React component
<UIBuilder />
```

### Copy Settings Format
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

## Element Types

| Type | Description | Sprite Selection |
|------|-------------|------------------|
| `frame` | 9-slice or compound frames | No (uses theme) |
| `button` | Single button sprites | Yes |
| `icon` | Icon sprites | Yes |
| `text` | Text sprites | Yes |
| `bar` | Bar sprites | Yes |
| `break` | Break sprites | Yes |

## Frame Types

### Standard Frame
- **Layout**: 3x3 grid
- **Components**: 4 corners + 4 edges + 1 background
- **Scaling**: Grid-based (16px units)

### Compound Frame  
- **Layout**: Upper + Partition + Lower
- **Components**: Separate sprites for upper/lower edges
- **Scaling**: Configurable heights

## Available Themes (25 total)

### Compound Themes (3)
- `green`, `dark-green`, `blue-stone`

### 9-Slice Themes (22)
- **Row 2**: `green-frame`, `red-frame`, `forest-green`, `burnt-red`, `silver`, `gold`, `pale-blue`, `green-ornate`
- **Row 3**: `green-button`, `red-button`, `green-button-activated`, `red-button-activated`, `grey-brown`, `purple-button`, `orange-button`, `blue-ornate`
- **Row 4**: `thick-gold`, `skinny-gold`, `turquoise`, `bronze`, `gunmetal`, `royal-blue`

## Atlas Coordinates

### Row Layout
- **Row 1**: y: 0-96 (Main 4x7 grid)
- **Row 2**: y: 112-176 (4x4 frame system)
- **Row 3**: y: 176-240 (Button variations)
- **Row 4**: y: 240-304 (Special variations)

### Sprite Positions
- **Frame corners**: x: 0,16,32, y: 0,16,32
- **Frame edges**: x: 16, y: 0,16,32 (top,bottom) | x: 0,32, y: 16 (left,right)
- **Background**: x: 16, y: 16
- **Partitions**: x: 0,16,32, y: 32
- **Lower edges**: x: 0,32, y: 48

## Key Functions

### Atlas Mapping
```typescript
getSpriteById(id: string): AtlasSprite | undefined
getFrameSprites(theme?: string): AtlasSprite[]
getButtonSprites(theme?: string, state?: string): AtlasSprite[]
getAvailableThemes(): string[]
```

### UIBuilder
```typescript
handleElementTypeChange(type: ElementType): void
handleColorChange(colorId: string): void
handleSpriteChange(spriteId: string): void
handleCopySettings(): void
```

## Sprite ID Format

```
{baseSprite.id}-{theme.name}
```

### Examples
- `frame-corner-top-left-green-frame`
- `button-normal-green-button`
- `partition-left-blue-stone`
- `frame-bottom-left-frame-green`

## Custom Sizing

### Frame Sizing
- **Range**: 16px - 400px
- **Step**: 8px increments
- **Overlap**: Edges/corners overlap for sizes < 32px
- **Tiling**: Background tiles correctly

### Scale Options
- **1x**: 16px sprites
- **2x**: 32px sprites  
- **3x**: 48px sprites
- **4x**: 64px sprites

## Common Issues

### Frame Not Displaying
1. Check theme exists in `THEME_CONFIGS`
2. Verify sprite ID generation
3. Ensure atlas image loaded

### Compound Frame Edges
- **Upper**: `frame-edge-left`, `frame-edge-right`
- **Lower**: `frame-bottom-left-frame`, `frame-bottom-right-frame`

### Background Not Tiling
- Check nested loop tiling in `drawStandardFrame`
- Verify custom size logic

## File Structure
```
src/
├── data/atlasMapping.ts          # Atlas data & utilities
├── components/UIBuilder.tsx      # Main component
├── components/UIBuilder.module.css # Styles
└── assets/Frames/Atlas.png       # Sprite atlas
```

## Adding New Content

### New Theme
1. Add to `THEME_CONFIGS` array
2. Set correct `xOffset`, `yOffset`, `rowType`
3. Test sprite generation

### New Sprite
1. Add to appropriate `BASE_*_SPRITES` array
2. Set `id`, `name`, `x`, `y`, `width`, `height`, `category`
3. Update sprite generation if needed

### New Element Type
1. Add to `ElementType` union
2. Update `getAvailableSpritesForElementType()`
3. Add drawing logic if needed
4. Update UI controls
