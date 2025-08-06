# Sanctuary API Documentation

## Table of Contents

1. [Hook APIs](#hook-apis)
2. [UI Component APIs](#ui-component-apis)
3. [System APIs](#system-apis)
4. [Type Definitions](#type-definitions)
5. [Examples](#examples)

## Hook APIs

### useSanctuaryState

**Purpose**: Core state management for all Sanctuary data.

**Signature**:
```typescript
const useSanctuaryState = (): [SanctuaryState, SanctuaryStateActions]
```

**State Interface**:
```typescript
interface SanctuaryState {
  // Core data
  blocks: Block[];
  camera: Camera;
  currentLevel: Level;
  
  // Selection state
  selectedTile: IsometricTileData | null;
  selectedBlock: Block | null;
  hoverCell: { x: number; y: number; z: number } | null;
  
  // UI state
  isBlockMenuOpen: boolean;
  showInstructions: boolean;
  showGrid: boolean;
  showPerformance: boolean;
  showLevelMenu: boolean;
  showZLevelManager: boolean;
  showHeightMap: boolean;
  showAtlasEditor: boolean;
  showResetConfirmation: boolean;
  showRenameDialog: boolean;
  
  // Z-level management
  currentZLevel: number;
  zLevelFilter: number[];
  
  // Building mode
  fillMode: boolean;
  
  // Level management
  levelNameInput: string;
  
  // UI collapse states
  collapsedGroups: {
    camera: boolean;
    levels: boolean;
    building: boolean;
    tools: boolean;
    heightmap: boolean;
    zlevels: boolean;
  };
  
  // Category expansion
  expandedCategory: string | null;
}
```

**Actions Interface**:
```typescript
interface SanctuaryStateActions {
  // Block management
  addBlock: (block: Block) => void;
  removeBlock: (blockId: string) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  setBlocks: (blocks: Block[]) => void;
  
  // Camera management
  updateCamera: (updates: Partial<Camera>) => void;
  setCamera: (camera: Camera) => void;
  
  // Selection management
  setSelectedTile: (tile: IsometricTileData | null) => void;
  setSelectedBlock: (block: Block | null) => void;
  setHoverCell: (cell: { x: number; y: number; z: number } | null) => void;
  
  // UI state management
  toggleBlockMenu: () => void;
  toggleInstructions: () => void;
  toggleGrid: () => void;
  togglePerformance: () => void;
  toggleLevelMenu: () => void;
  toggleZLevelManager: () => void;
  toggleHeightMap: () => void;
  toggleAtlasEditor: () => void;
  setShowResetConfirmation: (show: boolean) => void;
  setShowRenameDialog: (show: boolean) => void;
  
  // Z-level management
  setCurrentZLevel: (level: number) => void;
  setZLevelFilter: (filter: number[]) => void;
  
  // Building mode
  setFillMode: (enabled: boolean) => void;
  
  // Level management
  setCurrentLevel: (level: Level) => void;
  updateCurrentLevel: (updates: Partial<Level>) => void;
  setLevelNameInput: (name: string) => void;
  
  // UI collapse management
  toggleGroupCollapse: (group: string) => void;
  setExpandedCategory: (category: string | null) => void;
}
```

### useCanvasRendering

**Purpose**: Canvas rendering logic and game loop management.

**Signature**:
```typescript
const useCanvasRendering = (
  sanctuaryState: SanctuaryState,
  spatialIndex: SpatialIndexSystem,
  cullingSystem: CullingSystem,
  performanceMonitor: PerformanceMonitor
): [CanvasRenderingState, CanvasRenderingActions]
```

**State Interface**:
```typescript
interface CanvasRenderingState {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hoverCanvasRef: React.RefObject<HTMLCanvasElement>;
  animationFrameRef: React.MutableRefObject<number | null>;
  lastRenderTimeRef: React.MutableRefObject<number>;
  isLoaded: boolean;
  tileSheetLoaded: boolean;
  tileSheet: HTMLImageElement | null;
  performanceMetrics: any;
}
```

**Actions Interface**:
```typescript
interface CanvasRenderingActions {
  // Canvas management
  setCanvasLoaded: (loaded: boolean) => void;
  setTileSheetLoaded: (loaded: boolean) => void;
  setTileSheet: (image: HTMLImageElement) => void;
  
  // Rendering control
  startRendering: () => void;
  stopRendering: () => void;
  
  // Coordinate conversion
  screenToGrid: (screenX: number, screenY: number) => { x: number; y: number; z: number };
  gridToScreen: (gridX: number, gridY: number, gridZ: number) => { x: number; y: number };
  
  // Performance
  updatePerformanceMetrics: (metrics: any) => void;
}
```

### useInputHandling

**Purpose**: Input event management for mouse, keyboard, and touch.

**Signature**:
```typescript
const useInputHandling = (
  sanctuaryState: SanctuaryState,
  sanctuaryActions: SanctuaryStateActions,
  canvasActions: CanvasRenderingActions
): [InputHandlingState, InputHandlingActions]
```

**State Interface**:
```typescript
interface InputHandlingState {
  isDragging: boolean;
  isPanning: boolean;
  lastMousePosition: { x: number; y: number } | null;
  keyStates: { [key: string]: boolean };
  touchStartPosition: { x: number; y: number } | null;
}
```

**Actions Interface**:
```typescript
interface InputHandlingActions {
  // Mouse events
  handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseLeave: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void;
  
  // Touch events
  handleTouchStart: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  handleTouchMove: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  handleTouchEnd: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  
  // Keyboard events
  handleKeyDown: (event: KeyboardEvent) => void;
  handleKeyUp: (event: KeyboardEvent) => void;
  
  // Utility functions
  isKeyPressed: (key: string) => boolean;
  getMousePosition: (event: React.MouseEvent<HTMLCanvasElement>) => { x: number; y: number };
  getTouchPosition: (event: React.TouchEvent<HTMLCanvasElement>) => { x: number; y: number };
}
```

### usePerformance

**Purpose**: Performance monitoring and optimization.

**Signature**:
```typescript
const usePerformance = (): [PerformanceState, PerformanceActions]
```

**State Interface**:
```typescript
interface PerformanceState {
  fps: number;
  frameTime: number;
  renderTime: number;
  blockCount: number;
  visibleBlocks: number;
  drawCalls: number;
  memoryUsage: number;
  isOptimized: boolean;
  targetFPS: number;
  enableVSync: boolean;
  enableCulling: boolean;
  enableBatching: boolean;
  enableLOD: boolean;
}
```

**Actions Interface**:
```typescript
interface PerformanceActions {
  // Performance monitoring
  updateMetrics: (metrics: any) => void;
  resetMetrics: () => void;
  
  // Performance settings
  setTargetFPS: (fps: number) => void;
  setEnableVSync: (enabled: boolean) => void;
  setEnableCulling: (enabled: boolean) => void;
  setEnableBatching: (enabled: boolean) => void;
  setEnableLOD: (enabled: boolean) => void;
  
  // Optimization utilities
  optimizeForPerformance: () => void;
  optimizeForQuality: () => void;
  autoOptimize: () => void;
  
  // Performance analysis
  getPerformanceReport: () => string;
  isPerformanceAcceptable: () => boolean;
}
```

### useLevelManagement

**Purpose**: Level save/load operations and metadata management.

**Signature**:
```typescript
const useLevelManagement = (
  sanctuaryState: SanctuaryState,
  sanctuaryActions: SanctuaryStateActions
): [LevelManagementState, LevelManagementActions]
```

**State Interface**:
```typescript
interface LevelManagementState {
  savedLevels: Level[];
  currentLevelId: string | null;
  isSaving: boolean;
  isLoading: boolean;
  saveError: string | null;
  loadError: string | null;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  lastAutoSave: Date | null;
}
```

**Actions Interface**:
```typescript
interface LevelManagementActions {
  // Level operations
  saveLevel: (level?: Level) => Promise<boolean>;
  loadLevel: (levelId: string) => Promise<boolean>;
  createNewLevel: (name?: string, description?: string) => Promise<boolean>;
  deleteLevel: (levelId: string) => Promise<boolean>;
  duplicateLevel: (levelId: string, newName?: string) => Promise<boolean>;
  renameLevel: (levelId: string, newName: string) => Promise<boolean>;
  
  // Level management
  refreshLevelList: () => Promise<void>;
  exportLevel: (levelId: string) => Promise<string>;
  importLevel: (levelData: string) => Promise<boolean>;
  
  // Auto-save management
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  triggerAutoSave: () => Promise<void>;
  
  // Error handling
  clearSaveError: () => void;
  clearLoadError: () => void;
  
  // Utility functions
  getLevelById: (levelId: string) => Level | undefined;
  getLevelByName: (name: string) => Level | undefined;
  isLevelModified: (levelId: string) => boolean;
}
```

### useSanctuary (Main Hook)

**Purpose**: Combines all hooks into a unified interface.

**Signature**:
```typescript
const useSanctuary = (): [SanctuaryHookState, SanctuaryHookActions]
```

**State Interface**:
```typescript
interface SanctuaryHookState {
  // Core state
  sanctuary: SanctuaryState;
  canvas: CanvasRenderingState;
  input: InputHandlingState;
  performance: PerformanceState;
  levelManagement: LevelManagementState;
  
  // System instances
  cullingSystem: CullingSystem;
  spatialIndex: SpatialIndexSystem;
  performanceMonitor: PerformanceMonitor;
}
```

**Actions Interface**:
```typescript
interface SanctuaryHookActions {
  // Core actions
  sanctuary: SanctuaryStateActions;
  canvas: CanvasRenderingActions;
  input: InputHandlingActions;
  performance: PerformanceActions;
  levelManagement: LevelManagementActions;
  
  // Convenience methods
  resetSanctuary: () => void;
  exportSanctuaryState: () => string;
  importSanctuaryState: (stateData: string) => boolean;
}
```

## UI Component APIs

### SanctuaryHeader

**Props**:
```typescript
interface SanctuaryHeaderProps {
  // Core state
  currentLevelName: string;
  selectedTile: IsometricTileData | null;
  camera: { zoom: number };
  currentZLevel: number;
  
  // UI state
  collapsedGroups: {
    camera: boolean;
    levels: boolean;
    building: boolean;
    tools: boolean;
    heightmap: boolean;
    zlevels: boolean;
  };
  
  // Actions
  onExit?: () => void;
  onToggleGroupCollapse: (group: string) => void;
  onZoomClick: (zoom: number) => void;
  onResetCamera: () => void;
  onToggleLevelMenu: () => void;
  onResetTerrain: () => void;
  onToggleBlockMenu: () => void;
  onFillVisibleArea: () => void;
  onGenerateWithAllBlocks: () => void;
  onToggleInstructions: () => void;
  onToggleGrid: () => void;
  onTogglePerformance: () => void;
  onGenerateProceduralMap: (size: string) => void;
  onToggleHeightMap: () => void;
  onExportHeightMap: () => void;
  onToggleZLevelManager: () => void;
  onSwitchToZLevel: (level: number) => void;
  onToggleAtlasEditor: () => void;
  
  // Block menu state
  isBlockMenuOpen: boolean;
  showHeightMap: boolean;
}
```

### BlockSelector

**Props**:
```typescript
interface BlockSelectorProps {
  isOpen: boolean;
  selectedTile: IsometricTileData | null;
  expandedCategory: string | null;
  onClose: () => void;
  onSelectTile: (tile: IsometricTileData) => void;
  onToggleCategory: (category: string) => void;
}
```

### PerformanceDisplay

**Props**:
```typescript
interface PerformanceDisplayProps {
  isVisible: boolean;
  fps: number;
  renderTime: number;
  blockCount: number;
  visibleBlocks: number;
  drawCalls: number;
  isOptimized: boolean;
}
```

### Instructions

**Props**:
```typescript
interface InstructionsProps {
  isVisible: boolean;
}
```

### LoadingOverlay

**Props**:
```typescript
interface LoadingOverlayProps {
  isLoaded: boolean;
  tileSheetLoaded: boolean;
}
```

### TilePreview

**Props**:
```typescript
interface TilePreviewProps {
  tile: IsometricTileData;
  size?: number;
  className?: string;
}
```

## Type Definitions

### Core Types

```typescript
interface Block {
  id: string;
  position: { x: number; y: number; z: number };
  sprite: {
    sourceX: number;
    sourceY: number;
    width: number;
    height: number;
  };
  rotation: 0 | 90 | 180 | 270;
  palette: string;
}

interface Camera {
  position: { x: number; y: number; z: number };
  zoom: number;
  rotation: number;
}

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

## Examples

### Basic Usage

```typescript
import { useSanctuary } from './Sanctuary/hooks';

const MyComponent = () => {
  const [state, actions] = useSanctuary();
  
  // Access state
  console.log('Current blocks:', state.sanctuary.blocks);
  console.log('FPS:', state.performance.fps);
  
  // Use actions
  const handleAddBlock = () => {
    actions.sanctuary.addBlock({
      id: 'new-block',
      position: { x: 0, y: 0, z: 0 },
      sprite: { sourceX: 0, sourceY: 0, width: 32, height: 32 },
      rotation: 0,
      palette: 'green'
    });
  };
  
  return (
    <div>
      <button onClick={handleAddBlock}>Add Block</button>
      <div>FPS: {state.performance.fps}</div>
    </div>
  );
};
```

### Custom Hook Usage

```typescript
import { useSanctuaryState } from './Sanctuary/hooks';

const MyCustomHook = () => {
  const [state, actions] = useSanctuaryState();
  
  // Custom logic using Sanctuary state
  const totalBlocks = state.blocks.length;
  const selectedBlockCount = state.blocks.filter(b => b.palette === 'green').length;
  
  return {
    totalBlocks,
    selectedBlockCount,
    addGreenBlock: () => {
      actions.addBlock({
        id: `green-block-${Date.now()}`,
        position: { x: 0, y: 0, z: 0 },
        sprite: { sourceX: 0, sourceY: 0, width: 32, height: 32 },
        rotation: 0,
        palette: 'green'
      });
    }
  };
};
```

### UI Component Usage

```typescript
import { SanctuaryHeader, BlockSelector } from './Sanctuary/ui';

const MySanctuaryUI = () => {
  const [state, actions] = useSanctuary();
  
  return (
    <div>
      <SanctuaryHeader
        currentLevelName={state.sanctuary.currentLevel.name}
        selectedTile={state.sanctuary.selectedTile}
        camera={state.sanctuary.camera}
        currentZLevel={state.sanctuary.currentZLevel}
        collapsedGroups={state.sanctuary.collapsedGroups}
        isBlockMenuOpen={state.sanctuary.isBlockMenuOpen}
        showHeightMap={state.sanctuary.showHeightMap}
        onExit={() => console.log('Exit')}
        onToggleGroupCollapse={actions.sanctuary.toggleGroupCollapse}
        onZoomClick={(zoom) => actions.sanctuary.updateCamera({ zoom })}
        onResetCamera={() => actions.sanctuary.setCamera({ position: { x: 0, y: 0, z: 0 }, zoom: 1, rotation: 0 })}
        // ... other handlers
      />
      
      <BlockSelector
        isOpen={state.sanctuary.isBlockMenuOpen}
        selectedTile={state.sanctuary.selectedTile}
        expandedCategory={state.sanctuary.expandedCategory}
        onClose={() => actions.sanctuary.toggleBlockMenu()}
        onSelectTile={actions.sanctuary.setSelectedTile}
        onToggleCategory={actions.sanctuary.setExpandedCategory}
      />
    </div>
  );
};
``` 