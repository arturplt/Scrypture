# Sanctuary Game Environment Documentation

## Overview

The Sanctuary component is a sophisticated isometric game environment builder that provides a comprehensive sandbox for creating, editing, and managing 3D isometric worlds. It features advanced systems for procedural terrain generation, height map creation, Z-level management, and performance optimization.

## Key Features

### 🏗️ **Core Systems**
- **Isometric Rendering Engine**: High-performance 2D canvas-based rendering with proper depth sorting
- **Spatial Indexing**: Efficient block storage and retrieval using grid-based spatial partitioning
- **Culling System**: View frustum culling for optimal rendering performance
- **Batch Rendering**: Texture batching to minimize draw calls
- **Object Pooling**: Memory-efficient object reuse for frequently created/destroyed blocks

### 🗺️ **Procedural Generation**
- **Height Map System**: Perlin noise-based terrain generation with configurable parameters
- **Multi-Z-Level Terrain**: Support for complex elevation systems with multiple height layers
- **Island Generation**: Specialized island terrain patterns with water, grass, and elevation layers
- **Terrain Types**: Support for various terrain types (grass, stone, water, sand) with palette variations

### 🎮 **Interactive Features**
- **Block Placement**: Click-to-place and drag-to-paint block placement system
- **Block Selection**: Click to select and manipulate existing blocks
- **Block Rotation**: 90-degree rotation increments for precise block orientation
- **Camera Controls**: Pan, zoom, and reset camera functionality
- **Grid System**: Visual grid overlay for precise positioning

### 📊 **Performance Monitoring**
- **Real-time Metrics**: FPS, render time, block count, and memory usage tracking
- **Performance Grading**: Automatic performance assessment (A-F grades)
- **Optimization Tools**: Built-in performance analysis and optimization suggestions

## Architecture

### Component Structure

```typescript
interface SanctuaryProps {
  className?: string;
  onExit?: () => void;
}
```

### Core Data Structures

#### Block Interface
```typescript
interface Block {
  id: string;
  type: IsometricTileData['type'];
  palette: IsometricTileData['palette'];
  position: { x: number; y: number; z: number };
  rotation: 0 | 90 | 180 | 270;
  properties: {
    walkable: boolean;
    climbable: boolean;
    interactable: boolean;
    destructible: boolean;
  };
  sprite: {
    sourceX: number;
    sourceY: number;
    width: number;
    height: number;
    sheetPath: string;
  };
}
```

#### Camera System
```typescript
interface Camera {
  position: { x: number; y: number; z: number };
  zoom: number;
  rotation: number;
}
```

#### Height Map System
```typescript
interface HeightMap {
  width: number;
  height: number;
  data: number[][]; // 2D array of height values (0-255)
  minHeight: number;
  maxHeight: number;
  seed: number;
}

interface HeightMapConfig {
  width: number;
  height: number;
  seed?: number;
  octaves: number; // Number of noise layers
  frequency: number; // Base frequency for noise
  amplitude: number; // Base amplitude for noise
  persistence: number; // How much each octave contributes
  lacunarity: number; // How frequency changes per octave
  minHeight: number;
  maxHeight: number;
  smoothing: number; // Gaussian blur strength
}
```

## Core Systems

### 1. Height Map Generator

The `HeightMapGenerator` class provides sophisticated terrain generation using Perlin-like noise:

```typescript
class HeightMapGenerator {
  private seed: number;
  private noise: (x: number, y: number) => number;

  generateHeightMap(config: HeightMapConfig): HeightMap
  getHeightAt(heightMap: HeightMap, x: number, y: number): number
  getInterpolatedHeight(heightMap: HeightMap, x: number, y: number): number
}
```

**Features:**
- Fractal noise generation with multiple octaves
- Configurable noise parameters (frequency, amplitude, persistence, lacunarity)
- Gaussian blur smoothing for natural terrain
- Height interpolation for sub-grid positions

### 2. Z-Level Management

The `ZLevelManager` class handles multi-level terrain and structure management:

```typescript
class ZLevelManager {
  addLevel(z: number, name: string, description: string): void
  removeLevel(z: number): boolean
  setCurrentLevel(z: number): void
  toggleLevelVisibility(z: number): void
  toggleLevelLock(z: number): void
  getVisibleLevels(): number[]
  getUnlockedLevels(): number[]
}
```

**Features:**
- Multi-level terrain support (ground, grass, structures, etc.)
- Level visibility toggling
- Level locking for collaborative editing
- Block count tracking per level

### 3. Spatial Indexing

The `SpatialIndex` class provides efficient spatial queries:

```typescript
class SpatialIndex {
  addBlock(block: Block): void
  removeBlock(block: Block): void
  getBlockAt(x: number, y: number, z: number): Block | null
  getBlocksInArea(x: number, y: number, z: number, radius: number): Block[]
  getAllBlocks(): Block[]
  clear(): void
}
```

**Features:**
- Grid-based spatial partitioning
- O(1) block lookup by position
- Area-based block queries
- Automatic cell management

### 4. Culling System

The `CullingSystem` class optimizes rendering performance:

```typescript
class CullingSystem {
  updateFrustum(camera: Camera, canvasWidth: number, canvasHeight: number): void
  getVisibleBlocks(camera: Camera, maxDistance: number): Block[]
  getVisibleAreaBounds(camera: Camera, canvasWidth: number, canvasHeight: number): Bounds
}
```

**Features:**
- View frustum culling
- Distance-based culling
- Isometric coordinate system support
- Dynamic frustum updates

### 5. Performance Monitor

The `PerformanceMonitor` class tracks real-time performance metrics:

```typescript
class PerformanceMonitor {
  collectMetrics(): PerformanceMetrics
  getAverageFPS(): number
  getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F'
  getRecentMetrics(): PerformanceMetrics[]
}
```

**Features:**
- Real-time FPS monitoring
- Render time tracking
- Memory usage monitoring
- Performance grading system

## Procedural Generation

### Enhanced Procedural Map Generator

The `EnhancedProceduralMapGenerator` class creates complex terrain:

```typescript
class EnhancedProceduralMapGenerator {
  generateMap(config: MapGeneratorConfig): Block[]
  getHeightMap(): HeightMap | null
}
```

**Generation Features:**
- **Island Generation**: Creates island patterns with water edges and elevation layers
- **Multi-Z-Level Terrain**: Supports complex elevation systems
- **Terrain Type Distribution**: Intelligent placement of different terrain types
- **Height Map Integration**: Uses height maps for realistic terrain generation

### Map Generation Configuration

```typescript
interface MapGeneratorConfig {
  width: number;
  height: number;
  seed?: number;
  terrainTypes: {
    grass: number;
    stone: number;
    water: number;
    sand: number;
  };
  features: {
    structures: boolean;
    trees: boolean;
    waterBodies: boolean;
    elevation: boolean;
  };
  heightMap?: HeightMapConfig;
  zLevels?: {
    enabled: boolean;
    maxLevels: number;
    structureHeight: number;
  };
}
```

## User Interface

### Control Groups

The Sanctuary interface is organized into collapsible control groups:

1. **Camera Controls**
   - Zoom levels (1x, 2x, 4x)
   - Camera reset functionality

2. **Level Management**
   - Level save/load system
   - Terrain reset functionality

3. **Building Tools**
   - Block selector with categorized tiles
   - Fill visible area functionality
   - Generate map with all blocks

4. **Utility Tools**
   - Help/instructions toggle
   - Grid overlay toggle
   - Performance statistics

5. **Height Map Tools**
   - Height map generation
   - Height map visualization
   - Height map export

6. **Z-Level Management**
   - Z-level switching (Z0, Z1, Z2)
   - Z-level manager interface

### Block Selector

The block selector provides categorized access to all available tiles:

- **Categories**: Cubes, Flats, Ramps, Corners, Stairs, Pillars, Water
- **Palettes**: Green, Gray, Orange
- **Preview**: Real-time tile previews with sprite rendering
- **Selection**: Click to select tiles for placement

## Rendering System

### Coordinate Systems

The Sanctuary uses multiple coordinate systems:

1. **Screen Coordinates**: Pixel positions on the canvas
2. **World Coordinates**: Isometric projection coordinates
3. **Grid Coordinates**: Integer grid positions for block placement

### Isometric Projection

```typescript
// Screen to Grid conversion
const screenToGrid = (screenX: number, screenY: number) => {
  const worldX = (canvasX - camera.position.x) / camera.zoom;
  const worldY = (canvasY - camera.position.y) / camera.zoom;
  
  const isoX = worldX / (tileWidth / 2);
  const isoY = worldY / (tileHeight / 2);
  
  const gridX = Math.round((isoX + isoY) / 2);
  const gridY = Math.round((isoY - isoX) / 2);
  
  return { x: gridX, y: gridY, z: 0 };
};

// Grid to Screen conversion
const gridToScreen = (gridX: number, gridY: number, gridZ: number) => {
  const isoX = (gridX - gridY) * (tileWidth / 2);
  const isoY = (gridX + gridY) * (tileHeight / 2) - gridZ * tileHeight;
  
  const screenX = isoX * camera.zoom + camera.position.x;
  const screenY = isoY * camera.zoom + camera.position.y;
  
  return { x: screenX, y: screenY };
};
```

### Rendering Pipeline

1. **Clear Canvas**: Clear the rendering surface
2. **Apply Camera Transform**: Translate and scale based on camera position/zoom
3. **Cull Visible Blocks**: Use culling system to determine visible blocks
4. **Sort by Depth**: Sort blocks for proper depth rendering
5. **Render Blocks**: Draw each visible block with proper isometric projection
6. **Render UI Elements**: Draw hover previews, selection highlights, and grid
7. **Update Metrics**: Collect performance metrics for monitoring

## Input Handling

### Mouse Controls

- **Left Click**: Place block (if tile selected) or select block (if no tile selected)
- **Right Click**: Remove block
- **Middle Drag**: Pan camera
- **Mouse Move**: Update hover preview and handle continuous painting/erasing

### Keyboard Shortcuts

- **Delete/Backspace**: Remove selected block
- **R**: Rotate selected block
- **Ctrl+R**: Open rename dialog
- **Escape**: Clear selection
- **Ctrl+S**: Save level
- **Ctrl+C**: Toggle all button groups

### Continuous Painting

The system supports continuous painting and erasing:
- **Left Mouse Down + Drag**: Continuous block placement
- **Right Mouse Down + Drag**: Continuous block removal

## Level Management

### Level System

```typescript
interface Level {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: Date;
  modifiedAt: Date;
  blocks: Block[];
  camera: Camera;
  settings: {
    gravity: boolean;
    timeLimit?: number;
  };
}
```

### Level Operations

- **Create New Level**: Initialize empty level with default settings
- **Save Level**: Persist level data to localStorage
- **Load Level**: Restore level from storage
- **Rename Level**: Update level name and metadata
- **Delete Level**: Remove level from storage

## Performance Optimization

### Optimization Strategies

1. **Spatial Indexing**: O(1) block lookup using grid-based partitioning
2. **View Frustum Culling**: Only render blocks within camera view
3. **Batch Rendering**: Group blocks by texture to minimize draw calls
4. **Object Pooling**: Reuse block objects to reduce garbage collection
5. **Frame Rate Limiting**: Cap rendering to ~60fps for consistent performance

### Performance Monitoring

The system provides real-time performance metrics:
- **FPS**: Current frame rate
- **Render Time**: Time spent rendering each frame
- **Block Count**: Total number of blocks in the world
- **Visible Blocks**: Number of blocks currently being rendered
- **Draw Calls**: Number of texture draw operations
- **Memory Usage**: JavaScript heap usage percentage

## Integration

### Dependencies

- **React**: Component framework
- **CSS Modules**: Styling system
- **Canvas API**: 2D rendering
- **localStorage**: Level persistence

### External Components

- **AtlasEditor**: Tile sheet editing interface
- **TilePreview**: Optimized tile preview component

### Data Sources

- **ISOMETRIC_TILES**: Tile definitions and sprite data
- **TILE_SHEET_CONFIG**: Tile sheet configuration and image paths

## Usage Examples

### Basic Usage

```typescript
import Sanctuary from './components/Sanctuary';

function App() {
  const handleExit = () => {
    // Handle exit from sanctuary
  };

  return (
    <Sanctuary 
      className="my-sanctuary"
      onExit={handleExit}
    />
  );
}
```

### Programmatic Control

The Sanctuary component exposes debug functions for testing:

```typescript
// Access debug functions
window.testSanctuary.screenToGrid(x, y);
window.testSanctuary.gridToScreen(x, y, z);
window.testSanctuary.addTestBlock();
window.testSanctuary.generateProceduralMap('medium');
window.testSanctuary.moveCameraToBlocks();
```

## Best Practices

### Performance

1. **Limit Block Count**: Keep total blocks under 10,000 for optimal performance
2. **Use Culling**: Enable view frustum culling for large worlds
3. **Monitor Metrics**: Use performance monitor to identify bottlenecks
4. **Optimize Tile Sheets**: Use efficient tile sheet layouts

### User Experience

1. **Provide Instructions**: Use the help system to guide users
2. **Responsive Controls**: Ensure controls work well on different screen sizes
3. **Visual Feedback**: Use hover previews and selection highlights
4. **Keyboard Shortcuts**: Provide keyboard alternatives for common actions

### Level Design

1. **Plan Z-Levels**: Use Z-levels for complex structures and terrain
2. **Use Height Maps**: Generate realistic terrain with height maps
3. **Save Frequently**: Encourage regular level saving
4. **Test Performance**: Verify performance with large levels

## Troubleshooting

### Common Issues

1. **Blocks Not Rendering**
   - Check tile sheet loading status
   - Verify block positions are within view frustum
   - Ensure Z-level visibility settings

2. **Performance Issues**
   - Monitor performance metrics
   - Reduce block count or enable culling
   - Check for memory leaks

3. **Coordinate System Issues**
   - Verify screen-to-grid conversion
   - Check camera position and zoom
   - Ensure proper isometric projection

### Debug Tools

The component includes comprehensive debug tools:
- Performance monitoring
- Coordinate system visualization
- Block information display
- Camera position debugging
- Tile sheet status checking

## Future Enhancements

### Planned Features

1. **Multiplayer Support**: Collaborative level editing
2. **Advanced Terrain**: More sophisticated terrain generation algorithms
3. **Physics System**: Gravity and collision detection
4. **Animation System**: Animated tiles and effects
5. **Export/Import**: Level sharing and distribution
6. **Undo/Redo**: History management for level editing

### Technical Improvements

1. **WebGL Rendering**: Hardware-accelerated rendering
2. **Level Streaming**: Large world support with streaming
3. **Advanced Culling**: Occlusion culling and LOD systems
4. **Compression**: Level data compression for storage efficiency
5. **Cloud Storage**: Remote level storage and sharing

## Conclusion

The Sanctuary component provides a comprehensive and sophisticated game environment builder with advanced features for procedural generation, performance optimization, and user interaction. Its modular architecture makes it extensible for future enhancements while maintaining high performance and usability standards. 