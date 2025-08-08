# Sanctuary API Reference

## Core Hooks

### useSanctuary
Main hook that orchestrates all Sanctuary functionality.

```tsx
const [state, actions] = useSanctuary();

// State includes: sanctuary, canvas, input, performance, levelManagement
// Actions include: sanctuary, canvas, input, performance, levelManagement
```

### useSanctuaryState
Core state management for blocks, camera, and UI state.

```tsx
const [state, actions] = useSanctuaryState();

// Key state properties:
state.blocks: Block[]
state.camera: Camera
state.selectedTile: IsometricTileData | null
state.currentZLevel: number
state.showGrid: boolean
state.showPerformance: boolean

// Key actions:
actions.addBlock(block: Block)
actions.removeBlock(blockId: string)
actions.updateCamera(updates: Partial<Camera>)
actions.setSelectedTile(tile: IsometricTileData | null)
```

### useCanvasRendering
Canvas rendering and game loop management.

```tsx
const [state, actions] = useCanvasRendering(sanctuaryState, cullingSystem, performanceMonitor);

// Key state properties:
state.canvasRef: React.RefObject<HTMLCanvasElement>
state.isLoaded: boolean
state.tileSheet: HTMLImageElement | null
state.performanceMetrics: any

// Key actions:
actions.renderScene(ctx, tileSheet)
actions.startGameLoop()
actions.stopGameLoop()
actions.screenToGrid(screenX, screenY)
actions.gridToScreen(gridX, gridY, gridZ)
```

### useLevelManagement
Level save/load operations and auto-save functionality.

```tsx
const [state, actions] = useLevelManagement(sanctuaryState, sanctuaryActions);

// Key state properties:
state.savedLevels: Level[]
state.currentLevelId: string | null
state.isSaving: boolean
state.autoSaveEnabled: boolean

// Key actions:
actions.saveLevel(level?: Level)
actions.loadLevel(levelId: string)
actions.createNewLevel(name?, description?)
actions.deleteLevel(levelId: string)
actions.exportLevel(levelId: string)
actions.importLevel(levelData: string)
```

### useInputHandling
Mouse, touch, and keyboard input processing.

```tsx
const [state, actions] = useInputHandling(sanctuaryState, sanctuaryActions, canvasActions);

// Key actions:
actions.handleMouseDown(event)
actions.handleMouseMove(event)
actions.handleMouseUp(event)
actions.handleTouchStart(event)
actions.handleKeyDown(event)
actions.isKeyPressed(key: string)
```

## Data Types

### Block
```tsx
interface Block {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  sprite: {
    sourceX: number;
    sourceY: number;
    width: number;
    height: number;
    sheetPath: string;
  };
  rotation: 0 | 90 | 180 | 270;
  palette: string;
  properties: {
    walkable: boolean;
    climbable: boolean;
    interactable: boolean;
    destructible: boolean;
  };
}
```

### Camera
```tsx
interface Camera {
  position: { x: number; y: number; z: number };
  zoom: number;
  rotation: number;
}
```

### Level
```tsx
interface Level {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: Date;
  modifiedAt: Date;
  blocks: Block[];
  camera: Camera;
  settings: { gravity: boolean };
}
```

### IsometricTileData
```tsx
interface IsometricTileData {
  type: string;
  sourceX: number;
  sourceY: number;
  width: number;
  height: number;
  palette: string;
  category: string;
}
```

## Utility Classes

### LevelManager
Static class for level persistence operations.

```tsx
// Save/load operations
LevelManager.saveLevel(level: Level)
LevelManager.loadLevel(levelId: string): Level | null
LevelManager.getAllLevels(): Level[]
LevelManager.deleteLevel(levelId: string): boolean
LevelManager.createNewLevel(name: string): Level
```

### CoordinateUtils
Coordinate conversion utilities.

```tsx
// Screen to grid conversion
screenToGrid(screenX: number, screenY: number, canvas: HTMLCanvasElement, camera: Camera, currentZLevel: number): GridPosition

// Grid to screen conversion
gridToScreen(gridX: number, gridY: number, gridZ: number, canvas: HTMLCanvasElement, camera: Camera): ScreenPosition

// Canvas coordinate conversion
screenToCanvas(screenX: number, screenY: number, canvas: HTMLCanvasElement): ScreenPosition
```

### DepthSorter
Block depth sorting for proper isometric rendering.

```tsx
// Sort blocks by depth
DepthSorter.sortBlocksByDepth(blocks: Block[]): SortedBlock[]

// Get blocks in Z range
DepthSorter.getBlocksInZRange(blocks: Block[], minZ: number, maxZ: number): Block[]

// Get optimized render order
DepthSorter.getOptimizedRenderOrder(blocks: Block[]): { opaque: SortedBlock[]; transparent: SortedBlock[] }
```

### TextureManager
WebGL texture atlas management.

```tsx
// Load texture atlas
textureManager.loadTextureAtlas(): Promise<TextureAtlasInfo>

// Get tile region
textureManager.getTileRegion(tileId: number): TextureRegion | null

// Create tile vertices
textureManager.createTileVertices(x: number, y: number, z: number, tileId: number, size?: number): Float32Array
```

## Component Props

### Sanctuary
```tsx
interface SanctuaryProps {
  className?: string;
  onExit?: () => void;
}
```

### SanctuaryModal
```tsx
interface SanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}
```

### BlockSelector
```tsx
interface BlockSelectorProps {
  isOpen: boolean;
  selectedTile: IsometricTileData | null;
  expandedCategory: string | null;
  onClose: () => void;
  onSelectTile: (tile: IsometricTileData) => void;
  onToggleCategory: (category: string | null) => void;
}
```

## Keyboard Shortcuts

- **Escape** - Clear selection
- **Delete/Backspace** - Delete selected block
- **Ctrl+G** - Toggle grid
- **Ctrl+P** - Toggle performance display
- **Ctrl+D** - Toggle debug mode
- **F** - Toggle fill mode
- **Ctrl+T** - Test coordinate conversion

## Performance Monitoring

The system provides real-time performance metrics:

```tsx
// Access performance metrics
const metrics = state.performance.performanceMetrics;

// Available metrics:
metrics.fps: number
metrics.renderTime: number
metrics.blockCount: number
metrics.visibleBlocks: number
metrics.drawCalls: number
metrics.frameTime: number
``` 