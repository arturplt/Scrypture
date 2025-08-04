# Isometric Sandbox Documentation

## Overview

The Isometric Sandbox is a React component that provides an interactive 2D isometric tile-based building environment. It allows users to place, remove, and manipulate blocks on an isometric grid using a tile sheet system.

## Component: `Sanctuary.tsx`

### Core Features

- **Isometric Grid System**: Diamond-shaped grid cells with proper isometric projection
- **Tile Sheet Rendering**: Efficient sprite-based rendering from a tile sheet
- **Interactive Painting**: Click and drag to place/remove blocks
- **Camera Controls**: Pan and zoom functionality
- **Performance Optimization**: Culling system and spatial indexing
- **Block Management**: Create, remove, and select blocks
- **Visual Feedback**: Hover previews and cell highlighting

### Architecture

#### Core Classes

##### 1. PerformanceMonitor
```typescript
class PerformanceMonitor {
  collectMetrics(): PerformanceMetrics
  getAverageFPS(): number
  getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F'
  getRecentMetrics(): PerformanceMetrics[]
}
```
- Tracks FPS, render time, block count, memory usage
- Provides performance grading and metrics collection

##### 2. SpatialIndex
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
- Efficient spatial partitioning for block lookup
- Grid-based storage system for fast queries

##### 3. CullingSystem
```typescript
class CullingSystem {
  updateFrustum(camera: Camera, canvasWidth: number, canvasHeight: number): void
  getVisibleBlocks(camera: Camera, maxDistance: number = 200): Block[]
  private isInFrustum(block: Block): boolean
  private getDistance(block: Block, camera: Camera): number
}
```
- Frustum culling for performance optimization
- Distance-based culling to limit rendered blocks

##### 4. BatchRenderer
```typescript
class BatchRenderer {
  addToBatch(block: Block): void
  getBatches(): RenderBatch[]
  clear(): void
  getDrawCallCount(): number
}
```
- Batches rendering operations for efficiency
- Reduces draw calls by grouping similar operations

##### 5. ObjectPool
```typescript
class ObjectPool<T> {
  get(): T
  release(obj: T): void
}
```
- Memory management for frequently created objects
- Reduces garbage collection overhead

##### 6. LevelManager
```typescript
class LevelManager {
  static saveLevel(level: Level): void
  static loadLevel(levelId: string): Level | null
  static getAllLevels(): Level[]
  static deleteLevel(levelId: string): boolean
  static createNewLevel(name: string = 'New Level'): Level
}
```
- Persistent storage for levels
- JSON-based serialization system

### Data Structures

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

#### Camera Interface
```typescript
interface Camera {
  position: { x: number; y: number; z: number };
  zoom: number;
  rotation: number;
}
```

#### Level Interface
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

### Coordinate System

#### Isometric Projection
The sandbox uses a 2D isometric projection where:
- **X-axis**: Points to the right
- **Y-axis**: Points down and right (isometric)
- **Z-axis**: Points up (height)

#### Coordinate Conversion
```typescript
// Screen to Grid
const screenToGrid = (screenX: number, screenY: number) => {
  const worldX = (screenX - camera.position.x) / camera.zoom;
  const worldY = (screenY - camera.position.y) / camera.zoom;
  const isoX = worldX / (tileWidth / 2);
  const isoY = worldY / (tileHeight / 2);
  return { x: Math.round(isoX), y: Math.round(isoY), z: 0 };
};

// Grid to Screen
const gridToScreen = (gridX: number, gridY: number, gridZ: number) => {
  const isoX = (gridX - gridY) * (tileWidth / 2);
  const isoY = (gridX + gridY) * (tileHeight / 2) - gridZ * tileHeight;
  return { x: isoX, y: isoY };
};
```

### Rendering Pipeline

#### 1. Scene Rendering
```typescript
const renderScene = useCallback((ctx: CanvasRenderingContext2D, tileSheet: HTMLImageElement) => {
  // Clear canvas
  // Apply camera transform
  // Get visible blocks from culling system
  // Sort blocks by depth (painter's algorithm)
  // Render blocks
  // Render grid
  // Render UI overlays
}, [dependencies]);
```

#### 2. Block Rendering
```typescript
const renderBlock = useCallback((ctx: CanvasRenderingContext2D, block: Block, tileSheet: HTMLImageElement) => {
  // Calculate isometric position
  // Apply sprite clipping
  // Draw sprite from tile sheet
  // Apply rotation if needed
}, []);
```

#### 3. Grid Rendering
```typescript
const renderGrid = useCallback((ctx: CanvasRenderingContext2D) => {
  // Draw diamond-shaped grid cells
  // Apply hover highlighting
  // Use half-height diamonds for authentic isometric look
}, [showGrid, hoverCell]);
```

### Input Handling

#### Mouse Controls
- **Left Click**: Place block (single click)
- **Left Click + Drag**: Continuous painting
- **Right Click**: Remove block (single click)
- **Right Click + Drag**: Continuous erasing
- **Middle Click + Drag**: Pan camera
- **Mouse Wheel**: Zoom in/out

#### Keyboard Controls
- **WASD**: Pan camera
- **Q/E**: Rotate camera
- **R**: Reset camera
- **G**: Toggle grid
- **Delete**: Remove selected block
- **Escape**: Clear selection

### Performance Features

#### 1. Culling System
- **Frustum Culling**: Only renders blocks within camera view
- **Distance Culling**: Limits rendering to blocks within 200 units
- **Spatial Indexing**: Fast block lookup using grid partitioning

#### 2. Rendering Optimization
- **Batch Rendering**: Groups similar draw operations
- **Object Pooling**: Reuses frequently created objects
- **Canvas Optimization**: Uses 2D context for efficient rendering

#### 3. Memory Management
- **Block Cleanup**: Automatic removal of out-of-bounds blocks
- **Texture Management**: Single tile sheet for all sprites
- **State Optimization**: Minimal re-renders using React hooks

### Tile System

#### Tile Sheet Configuration
```typescript
const TILE_SHEET_CONFIG = {
  imagePath: '/assets/Tilemaps/isometric-sandbox-sheet.png',
  sheetWidth: 192,  // 6 columns * 32px
  sheetHeight: 288, // 9 rows * 32px
  tileWidth: 32,
  tileHeight: 32
};
```

#### Tile Data Structure
```typescript
interface IsometricTileData {
  id: string;
  name: string;
  type: 'cube' | 'flat' | 'ramp' | 'corner' | 'staircase' | 'pillar';
  palette: 'green' | 'blue' | 'gray';
  sourceX: number;
  sourceY: number;
  width: number;
  height: number;
  isometric: boolean;
}
```

### UI Components

#### Header Controls
- **SAVE**: Save current level
- **🎯**: Reset camera
- **🌱**: Toggle instructions
- **[?]**: Show help
- **GRID ON/OFF**: Toggle grid visibility
- **🧱**: Toggle block selector
- **📊**: Toggle performance metrics
- **🏗️ FILL**: Fill grid with flat blocks

#### Block Selector
- **Categories**: Cubes, Flats, Ramps, Corners, Stairs, Pillars
- **Palettes**: Green, Blue, Gray
- **Preview**: Shows selected tile with sprite preview

### State Management

#### React Hooks Used
- `useState`: Component state management
- `useRef`: Mutable references for performance
- `useCallback`: Memoized functions for optimization
- `useEffect`: Side effects and lifecycle management
- `useMemo`: Computed values caching

#### Key State Variables
```typescript
const [blocks, setBlocks] = useState<Block[]>([]);
const [selectedTile, setSelectedTile] = useState<IsometricTileData | null>(null);
const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
const [camera, setCamera] = useState<Camera>({ position: { x: 0, y: 0, z: 0 }, zoom: 1, rotation: 0 });
const [showGrid, setShowGrid] = useState(false);
const [hoverCell, setHoverCell] = useState<{ x: number; y: number; z: number } | null>(null);
```

### Error Handling

#### Common Issues
1. **Tile Sheet Loading**: Fallback rendering if tile sheet fails to load
2. **Invalid Coordinates**: Bounds checking for grid positions
3. **Memory Leaks**: Proper cleanup of event listeners and timers
4. **Performance Degradation**: Automatic culling and optimization

#### Debug Features
- Performance metrics display
- Block count monitoring
- Render time tracking
- Memory usage monitoring

### Browser Compatibility

#### Supported Features
- **Canvas 2D Context**: Modern browsers
- **Mouse Events**: Standard mouse event handling
- **Keyboard Events**: Standard keyboard event handling
- **Local Storage**: For level persistence

#### Performance Considerations
- **Mobile Devices**: Touch event support for mobile
- **High DPI Displays**: Proper scaling for retina displays
- **Frame Rate**: Target 60 FPS with adaptive quality

### Usage Examples

#### Basic Setup
```typescript
import { Sanctuary } from './components/Sanctuary';

function App() {
  return (
    <div className="app">
      <Sanctuary className="sandbox-container" />
    </div>
  );
}
```

#### Custom Styling
```css
.sandbox-container {
  width: 100vw;
  height: 100vh;
  background: #1a1a1a;
  overflow: hidden;
}
```

### Future Enhancements

#### Planned Features
- **Multiplayer Support**: Real-time collaboration
- **Undo/Redo System**: Action history management
- **Export/Import**: Level sharing functionality
- **Advanced Tools**: Brush sizes, patterns, symmetry
- **Animation System**: Animated blocks and effects
- **Sound Integration**: Audio feedback for interactions

#### Technical Improvements
- **WebGL Rendering**: Hardware acceleration
- **Web Workers**: Background processing
- **Service Workers**: Offline functionality
- **PWA Support**: Installable web app

### Troubleshooting

#### Common Problems
1. **Blocks Not Appearing**: Check tile sheet loading and culling system
2. **Performance Issues**: Monitor FPS and reduce block count
3. **Coordinate Mismatch**: Verify isometric projection calculations
4. **Memory Leaks**: Check for proper cleanup in useEffect hooks

#### Debug Tools
- Browser developer tools for performance profiling
- Console logging for debugging (removed in production)
- Performance metrics display in UI
- Block inspector for detailed block information

---

This documentation provides a comprehensive overview of the isometric sandbox component, its architecture, features, and usage. For specific implementation details, refer to the source code in `src/components/Sanctuary.tsx`. 