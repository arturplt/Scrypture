# Sanctuary Component System

A comprehensive isometric sandbox environment built with React, TypeScript, and Canvas/WebGL rendering.

## Architecture Overview

### Core Hooks System
The Sanctuary uses a modular hook-based architecture for clean separation of concerns:

- **`useSanctuaryState`** - Core state management (blocks, camera, UI state)
- **`useCanvasRendering`** - Canvas rendering and game loop management
- **`useInputHandling`** - Mouse, touch, and keyboard input processing
- **`useLevelManagement`** - Level save/load operations and auto-save
- **`usePerformance`** - Performance monitoring and metrics
- **`useWebGLRendering`** - WebGL rendering system (optional)

### Main Components
- **`Sanctuary.tsx`** - Main component orchestrating all hooks
- **`SanctuaryModal.tsx`** - Modal wrapper for the Sanctuary
- **`SanctuaryHeader.tsx`** - Top UI bar with controls
- **`SanctuaryBottomBar.tsx`** - Bottom UI bar with additional tools
- **`BlockSelector.tsx`** - Tile/block selection interface

## Key Features

### Rendering Systems
- **Canvas 2D Rendering** - Primary rendering with pixel-perfect isometric projection
- **WebGL Rendering** - High-performance alternative with texture atlasing
- **Culling System** - Frustum culling for performance optimization
- **Depth Sorting** - Proper isometric depth ordering

### Level Management
- **Auto-save** - Automatic level saving with configurable intervals
- **Level Operations** - Create, save, load, duplicate, rename, delete
- **Storage Management** - LocalStorage with quota handling and pruning
- **Import/Export** - JSON-based level data exchange

### Input Handling
- **Mouse Controls** - Left-click building, right-click panning
- **Touch Support** - Mobile-friendly touch controls
- **Keyboard Shortcuts** - Quick access to common functions
- **Coordinate Conversion** - Screen-to-grid and grid-to-screen mapping

### Performance Features
- **Performance Monitoring** - Real-time FPS and render metrics
- **Spatial Indexing** - Efficient block lookup and culling
- **Batch Rendering** - Optimized draw call batching
- **Device Pixel Ratio** - High-DPI display support

### UI Components
- **Collapsible Groups** - Organized control panels
- **Z-Level Management** - Multi-layer editing support
- **Height Map System** - Procedural terrain generation
- **Atlas Editor** - Texture atlas management
- **Block Categories** - Organized tile selection

## Technical Specifications

### Coordinate Systems
- **Grid Coordinates** - Integer-based block positioning
- **Isometric Projection** - 2:1 ratio with Z-level depth
- **Screen Coordinates** - Device pixel ratio aware
- **World Coordinates** - Camera-transformed positions

### Data Structures
- **Block** - Core building unit with position, sprite, properties
- **Camera** - Viewport position, zoom, rotation
- **Level** - Complete level data with metadata
- **IsometricTileData** - Tile definition with sprite coordinates

### Rendering Pipeline
1. **Culling** - Frustum culling for visible blocks
2. **Depth Sorting** - Z-order calculation for proper layering
3. **Batch Rendering** - Optimized draw call grouping
4. **Post-processing** - UI overlays and effects

## Usage

```tsx
import { Sanctuary } from './components/Sanctuary';

// Basic usage
<Sanctuary onExit={() => console.log('Exited sanctuary')} />

// Modal usage
<SanctuaryModal isOpen={isOpen} onClose={handleClose} />
```

## File Structure

```
Sanctuary/
├── hooks/           # Core hook implementations
├── systems/         # Rendering and optimization systems
├── types/           # TypeScript type definitions
├── ui/              # UI components
├── utils/           # Utility classes and functions
├── Sanctuary.tsx    # Main component
└── README.md        # This documentation
```

## Performance Considerations

- **Culling** - Only renders visible blocks
- **Batching** - Groups similar draw calls
- **Texture Atlasing** - Reduces texture bindings
- **Spatial Indexing** - Efficient spatial queries
- **Frame Rate Limiting** - Configurable render loop timing

## Browser Support

- **Modern Browsers** - Chrome, Firefox, Safari, Edge
- **WebGL Support** - Optional hardware acceleration
- **Touch Devices** - Mobile and tablet support
- **High-DPI Displays** - Retina and 4K support 