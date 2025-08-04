# Sanctuary Isometric Sandbox - User Guide

## Overview
The Sanctuary is an interactive isometric sandbox for building with pixel art tiles. It features a diamond-shaped grid system, tile sheet rendering, and intuitive painting tools.

## Controls

### Mouse Controls
- **Left Click**: Place single block
- **Left Click + Drag**: Paint multiple blocks continuously
- **Right Click**: Remove single block
- **Right Click + Drag**: Erase multiple blocks continuously
- **Middle Mouse + Drag**: Pan camera
- **Mouse Wheel**: Zoom in/out

### Keyboard Controls
- **WASD**: Pan camera
- **Q/E**: Rotate camera
- **R**: Reset camera
- **G**: Toggle grid visibility
- **Delete**: Remove selected block
- **Escape**: Clear selection

## UI Elements

### Header Buttons
- **SAVE**: Save current level
- **🎯**: Reset camera position
- **🌱**: Toggle instructions panel
- **[?]**: Show help information
- **GRID ON/OFF**: Toggle isometric grid
- **🧱**: Toggle block selector panel
- **📊**: Toggle performance metrics
- **🏗️ FILL**: Fill grid with flat blocks

### Block Selector
- **Categories**: Cubes, Flats, Ramps, Corners, Stairs, Pillars
- **Color Palettes**: Green, Blue, Gray
- **Preview**: Shows selected tile sprite

## Features

### Visual Feedback
- **Hover Preview**: Semi-transparent preview of selected tile
- **Cell Highlighting**: Yellow diamond shows target grid cell
- **Grid System**: Half-height diamond cells for authentic isometric look

### Performance
- **Efficient Rendering**: Culling system for large scenes
- **Spatial Indexing**: Fast block lookup and management
- **Optimized Canvas**: 2D context rendering for smooth performance

### Block Management
- **Placement**: Click or drag to place blocks
- **Removal**: Right-click or drag to remove blocks
- **Selection**: Click to select existing blocks
- **Properties**: Each block has walkable, climbable, interactable, destructible properties

## Technical Details

### Coordinate System
- **Isometric Projection**: 2D representation of 3D space
- **Grid Coordinates**: X, Y (horizontal), Z (height)
- **Screen Coordinates**: Converted from grid using isometric math

### Tile System
- **Tile Sheet**: 192x288 pixel sheet with 6x9 grid of 32x32 tiles
- **Sprite Clipping**: Automatic extraction from tile sheet
- **Palette System**: Multiple color variants per tile type

### Architecture
- **React Hooks**: useState, useRef, useCallback, useEffect, useMemo
- **Performance Classes**: PerformanceMonitor, SpatialIndex, CullingSystem
- **Rendering Pipeline**: Scene → Blocks → Grid → UI overlays

## Tips & Tricks

### Efficient Building
1. Use the FILL button for large flat areas
2. Drag painting for continuous block placement
3. Toggle grid for precise alignment
4. Use camera controls to work from different angles

### Performance
1. Monitor FPS with the 📊 button
2. Large scenes may benefit from culling optimization
3. Use appropriate block types for your design

### Design Patterns
1. Start with flat blocks for foundations
2. Use cubes for walls and structures
3. Add ramps and stairs for elevation changes
4. Use corners for detailed architectural features

## Troubleshooting

### Common Issues
- **Blocks not appearing**: Check if tile sheet is loaded
- **Performance issues**: Reduce block count or zoom out
- **Coordinate problems**: Verify grid alignment

### Debug Features
- Performance metrics display
- Block count monitoring
- Render time tracking

## File Structure
```
src/components/Sanctuary.tsx          # Main component
src/data/isometric-tiles.ts           # Tile definitions
Reference/isometric-sandbox-sheet.png # Tile sheet image
```

## Future Features
- Multiplayer collaboration
- Undo/Redo system
- Export/Import levels
- Advanced brush tools
- Animation system
- Sound effects 