// Main Sanctuary component (will be created in the next phase)
export { default as Sanctuary } from './Sanctuary';

// Type exports
export * from './types';

// System exports
export { HeightMapGenerator } from './systems/HeightMapSystem';
export { ZLevelManager } from './systems/ZLevelSystem';
export { SpatialIndex } from './systems/SpatialIndexSystem';
export { CullingSystem } from './systems/CullingSystem';
export { BatchRenderer } from './systems/BatchRenderer';
export { EnhancedProceduralMapGenerator } from './systems/MapGenerator';

// Utility exports
export { ObjectPool } from './utils/ObjectPool';
export { PerformanceMonitor } from './utils/PerformanceMonitor';
export { LevelManager } from './utils/LevelManager'; 