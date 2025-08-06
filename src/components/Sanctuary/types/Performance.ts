export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  blockCount: number;
  visibleBlocks: number;
  memoryUsage: number;
  drawCalls: number;
  timestamp: number;
}

export interface RenderBatch {
  texture: string;
  blocks: any[]; // Will be properly typed when Block is imported
  vertices: number[];
  indices: number[];
  count: number;
} 