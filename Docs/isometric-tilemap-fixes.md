# Isometric Tilemap Grid Alignment Fixes

## Problem Description

The Sanctuary component's isometric tilemap had several critical issues:

1. **Grid Misalignment**: The isometric grid was not properly aligned with the placed tiles
2. **1-Element Gaps**: Tiles were being placed with exactly 1 element spacing between them, creating visible gaps
3. **Screen Flickering**: The canvas was redrawing too frequently, causing brightness changes and flickering
4. **Inconsistent Coordinate Systems**: Grid, tiles, and hover highlights used different coordinate calculations

## Root Cause Analysis

The main issue was using the wrong spacing logic for isometric tiles:

- **Before**: Using full `tileWidth` (32px) for spacing between tiles
- **Problem**: This created gaps because isometric tiles should touch edge-to-edge
- **Solution**: Use half the tile width (`tileWidth / 2` = 16px) for proper edge-to-edge placement

## Fixes Implemented

### 1. Coordinate System Correction

**File**: `src/components/Sanctuary.tsx`

**Changes**:
- Updated tile positioning to use `(tileWidth / 2)` for spacing
- Updated grid positioning to match tile coordinates
- Updated hover highlight positioning for consistency
- Updated mouse coordinate conversion functions

**Before**:
```typescript
const isoX = (tile.x - tile.y) * tileWidth + canvasWidth / 2;
const isoY = (tile.x + tile.y) * tileHeight + 40;
```

**After**:
```typescript
const isoX = (tile.x - tile.y) * (tileWidth / 2) + canvasWidth / 2;
const isoY = (tile.x + tile.y) * (tileHeight / 2) + 40;
```

### 2. Grid Cell Spacing

**Changes**:
- Grid cells now use the same half-width spacing as tiles
- Diamonds are properly sized to touch edge-to-edge
- Reduced grid range from `-6 to 6` to `-4 to 4` to reduce rendering load

### 3. Canvas Rendering Optimization

**Changes**:
- Optimized canvas redraw logic to prevent unnecessary redraws
- Added proper device pixel ratio handling
- Fixed canvas clearing dimensions
- Added `isLoaded` dependency to prevent premature redraws

### 4. Mouse Interaction Fixes

**Changes**:
- Updated click detection to use consistent coordinate system
- Updated hover detection to match grid and tile positioning
- Fixed coordinate conversion formulas for both click and hover events

## Technical Details

### Isometric Coordinate System

For proper isometric tilemaps:
- **Tile Dimensions**: 32x32 pixels (source), 32x16 pixels (projected)
- **Grid Spacing**: 16px horizontal, 8px vertical (half of tile dimensions)
- **Base Footprint**: Each tile's base is 32x16 pixels in screen space

### Coordinate Conversion Formulas

**Screen to Grid**:
```typescript
const isoX = (x - centerX) / (tileWidth / 2);
const isoY = (y - centerY) / (tileHeight / 2);
const gridX = Math.round((isoX + isoY) / 2);
const gridY = Math.round((isoY - isoX) / 2);
```

**Grid to Screen**:
```typescript
const isoX = (tile.x - tile.y) * (tileWidth / 2) + centerX;
const isoY = (tile.x + tile.y) * (tileHeight / 2) + centerY;
```

## Results

After implementing these fixes:

1. ✅ **No More Gaps**: Tiles now touch edge-to-edge with no 1-element spacing
2. ✅ **Proper Grid Alignment**: Grid diamonds align perfectly with tile placement
3. ✅ **Stable Rendering**: Eliminated screen flickering and brightness changes
4. ✅ **Consistent Interaction**: Click and hover detection work correctly
5. ✅ **Pixel-Perfect Positioning**: All elements use the same coordinate system

## Files Modified

- `src/components/Sanctuary.tsx` - Main component with all coordinate system fixes

## Testing

The fixes were tested by:
1. Placing tiles manually to verify edge-to-edge contact
2. Checking grid alignment with placed tiles
3. Verifying hover and click detection accuracy
4. Confirming no screen flickering or performance issues

## Future Considerations

- Consider adding tile rotation support with proper coordinate handling
- Implement tile elevation system for 3D-like stacking
- Add tile selection and editing capabilities
- Consider implementing tile animation system 