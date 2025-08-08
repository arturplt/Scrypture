/**
 * Robust coordinate conversion utilities for the Sanctuary isometric grid
 * Handles device pixel ratio, window resizing, and camera transformations
 */

export interface GridPosition {
  x: number;
  y: number;
  z: number;
}

export interface ScreenPosition {
  x: number;
  y: number;
}

export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

// Tile dimensions from the tile sheet
export const TILE_DIMENSIONS = {
  width: 32,
  height: 16, // Half height for isometric projection
  zSpacing: 32 // Z-level spacing
};

/**
 * Convert screen coordinates to canvas coordinates
 * Accounts for device pixel ratio and canvas scaling
 */
export const screenToCanvas = (
  screenX: number, 
  screenY: number, 
  canvas: HTMLCanvasElement
): ScreenPosition => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  // Get canvas dimensions accounting for device pixel ratio
  const canvasWidth = canvas.width / dpr;
  const canvasHeight = canvas.height / dpr;
  
  // Convert screen coordinates to canvas coordinates
  // Use the actual canvas rect, not the container dimensions
  const canvasX = screenX - rect.left;
  const canvasY = screenY - rect.top;
  
  // Ensure coordinates are within canvas bounds
  const clampedX = Math.max(0, Math.min(canvasX, canvasWidth));
  const clampedY = Math.max(0, Math.min(canvasY, canvasHeight));
  
  return { x: clampedX, y: clampedY };
};

/**
 * Convert canvas coordinates to world coordinates
 * Accounts for camera position and zoom
 */
export const canvasToWorld = (
  canvasX: number,
  canvasY: number,
  camera: { position: WorldPosition; zoom: number }
): WorldPosition => {
  // Convert canvas coordinates to world coordinates
  // This accounts for camera position and zoom level
  // The camera position represents the center of the view
  const worldX = (canvasX - camera.position.x) / camera.zoom;
  const worldY = (canvasY - camera.position.y) / camera.zoom;
  const worldZ = camera.position.z;
  
  return { x: worldX, y: worldY, z: worldZ };
};

/**
 * Convert world coordinates to isometric grid coordinates
 */
export const worldToGrid = (worldX: number, worldY: number, worldZ: number): GridPosition => {
  // Isometric to grid conversion
  // For isometric projection: x = (gridX - gridY) * tileWidth/2, y = (gridX + gridY) * tileHeight/2
  // Solving for gridX and gridY:
  // gridX = (x / (tileWidth/2) + y / (tileHeight/2)) / 2
  // gridY = (y / (tileHeight/2) - x / (tileWidth/2)) / 2
  
  // Add offset to center the grid at (0,0) when world coordinates are at camera center
  const gridX = Math.round((worldX / (TILE_DIMENSIONS.width / 2) + worldY / (TILE_DIMENSIONS.height / 2)) / 2);
  const gridY = Math.round((worldY / (TILE_DIMENSIONS.height / 2) - worldX / (TILE_DIMENSIONS.width / 2)) / 2);
  const gridZ = Math.round(worldZ / TILE_DIMENSIONS.zSpacing);
  
  return { x: gridX, y: gridY, z: gridZ };
};

/**
 * Convert isometric grid coordinates to world coordinates
 */
export const gridToWorld = (gridX: number, gridY: number, gridZ: number): WorldPosition => {
  // Isometric projection
  const worldX = (gridX - gridY) * (TILE_DIMENSIONS.width / 2);
  const worldY = (gridX + gridY) * (TILE_DIMENSIONS.height / 2) - gridZ * TILE_DIMENSIONS.zSpacing;
  const worldZ = gridZ * TILE_DIMENSIONS.zSpacing;
  
  return { x: worldX, y: worldY, z: worldZ };
};

/**
 * Convert world coordinates to canvas coordinates
 * Accounts for camera position and zoom
 */
export const worldToCanvas = (
  worldX: number,
  worldY: number,
  _worldZ: number,
  camera: { position: WorldPosition; zoom: number }
): ScreenPosition => {
  // Convert world coordinates to canvas coordinates
  // This accounts for camera position and zoom level
  const canvasX = worldX * camera.zoom + camera.position.x;
  const canvasY = worldY * camera.zoom + camera.position.y;
  
  return { x: canvasX, y: canvasY };
};

/**
 * Main function: Convert screen coordinates to grid coordinates
 * This is the primary function used for mouse/touch input
 * Now includes better handling for different screen sizes
 */
export const screenToGrid = (
  screenX: number,
  screenY: number,
  canvas: HTMLCanvasElement,
  camera: { position: WorldPosition; zoom: number },
  currentZLevel: number = 0
): GridPosition => {
  // Step 1: Screen to canvas (using actual canvas rect)
  const canvasPos = screenToCanvas(screenX, screenY, canvas);
  
  // Step 2: Canvas to world (accounting for camera)
  const worldPos = canvasToWorld(canvasPos.x, canvasPos.y, camera);
  
  // Step 3: World to grid (isometric conversion)
  const gridPos = worldToGrid(worldPos.x, worldPos.y, worldPos.z);
  
  // Override Z level with current level
  gridPos.z = currentZLevel;
  
  return gridPos;
};

/**
 * Main function: Convert grid coordinates to screen coordinates
 * This is used for rendering and UI positioning
 * Now includes better handling for different screen sizes
 */
export const gridToScreen = (
  gridX: number,
  gridY: number,
  gridZ: number,
  canvas: HTMLCanvasElement,
  camera: { position: WorldPosition; zoom: number }
): ScreenPosition => {
  // Step 1: Grid to world (isometric conversion)
  const worldPos = gridToWorld(gridX, gridY, gridZ);
  
  // Step 2: World to canvas (accounting for camera)
  const canvasPos = worldToCanvas(worldPos.x, worldPos.y, worldPos.z, camera);
  
  // Step 3: Canvas to screen (add canvas offset)
  const rect = canvas.getBoundingClientRect();
  const screenX = canvasPos.x + rect.left;
  const screenY = canvasPos.y + rect.top;
  
  return { x: screenX, y: screenY };
};

/**
 * Get canvas dimensions accounting for device pixel ratio
 */
export const getCanvasDimensions = (canvas: HTMLCanvasElement): { width: number; height: number } => {
  const dpr = window.devicePixelRatio || 1;
  return {
    width: canvas.width / dpr,
    height: canvas.height / dpr
  };
};

/**
 * Check if a position is within canvas bounds
 */
export const isWithinCanvas = (
  screenX: number,
  screenY: number,
  canvas: HTMLCanvasElement
): boolean => {
  const rect = canvas.getBoundingClientRect();
  const { width, height } = getCanvasDimensions(canvas);
  
  const canvasX = screenX - rect.left;
  const canvasY = screenY - rect.top;
  
  return canvasX >= 0 && canvasX <= width && canvasY >= 0 && canvasY <= height;
};

/**
 * Debug utility to log coordinate conversion steps
 * Helps identify discrepancies across different screen sizes
 */
export const debugCoordinateConversion = (
  screenX: number,
  screenY: number,
  canvas: HTMLCanvasElement,
  camera: { position: WorldPosition; zoom: number },
  currentZLevel: number = 0
): void => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const canvasWidth = canvas.width / dpr;
  const canvasHeight = canvas.height / dpr;
  
  // Step 1: Screen to canvas
  const canvasPos = screenToCanvas(screenX, screenY, canvas);
  
  // Step 2: Canvas to world
  const worldPos = canvasToWorld(canvasPos.x, canvasPos.y, camera);
  
  // Step 3: World to grid
  const gridPos = worldToGrid(worldPos.x, worldPos.y, worldPos.z);
  gridPos.z = currentZLevel;
  
  // Calculate expected grid position for center of canvas
  const centerCanvasX = canvasWidth / 2;
  const centerCanvasY = canvasHeight / 2;
  const centerWorldPos = canvasToWorld(centerCanvasX, centerCanvasY, camera);
  const centerGridPos = worldToGrid(centerWorldPos.x, centerWorldPos.y, centerWorldPos.z);
  
  // Calculate offset from center
  const offsetFromCenter = {
    canvas: { x: canvasPos.x - centerCanvasX, y: canvasPos.y - centerCanvasY },
    world: { x: worldPos.x - centerWorldPos.x, y: worldPos.y - centerWorldPos.y },
    grid: { x: gridPos.x - centerGridPos.x, y: gridPos.y - centerGridPos.y }
  };
  
  console.log('Coordinate Conversion Debug:', {
    screen: { x: screenX, y: screenY },
    canvas: { x: canvasPos.x, y: canvasPos.y },
    world: { x: worldPos.x, y: worldPos.y, z: worldPos.z },
    grid: { x: gridPos.x, y: gridPos.y, z: gridPos.z },
    center: {
      canvas: { x: centerCanvasX, y: centerCanvasY },
      world: { x: centerWorldPos.x, y: centerWorldPos.y, z: centerWorldPos.z },
      grid: { x: centerGridPos.x, y: centerGridPos.y, z: centerGridPos.z }
    },
    offsetFromCenter,
    camera: camera,
    canvasDimensions: { width: canvasWidth, height: canvasHeight },
    canvasRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    dpr: dpr
  });
}; 