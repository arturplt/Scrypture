/**
 * WebGL Performance Monitoring System
 * Tracks rendering performance, frame rates, and optimization metrics
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
  cullingEfficiency: number;
  memoryUsage: number;
  gpuTime: number;
  cpuTime: number;
  timestamp: number;
}

export interface RenderBatch {
  type: string;
  count: number;
  triangles: number;
  time: number;
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastFrameTime = 0;
  private frameTimes: number[] = [];
  private maxFrameTimeHistory = 60; // Keep last 60 frames
  
  private currentMetrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    vertices: 0,
    cullingEfficiency: 0,
    memoryUsage: 0,
    gpuTime: 0,
    cpuTime: 0,
    timestamp: 0
  };
  
  private renderBatches: RenderBatch[] = [];
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private queryExt: any = null;
  private timeQuery: WebGLQuery | null = null;
  private isQuerySupported = false;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
    this.initializeGPUQueries();
  }

  /**
   * Initialize GPU timing queries if supported
   */
  private initializeGPUQueries(): void {
    // Only initialize GPU queries for WebGL2 contexts
    if (this.gl instanceof WebGL2RenderingContext) {
      this.queryExt = this.gl.getExtension('EXT_disjoint_timer_query_webgl2');
      this.isQuerySupported = !!this.queryExt;
    } else {
      // WebGL1 doesn't support timing queries, so disable GPU timing
      this.queryExt = null;
      this.isQuerySupported = false;
    }
  }

  /**
   * Start frame timing
   */
  startFrame(): void {
    this.currentMetrics.timestamp = performance.now();
    this.currentMetrics.drawCalls = 0;
    this.currentMetrics.triangles = 0;
    this.currentMetrics.vertices = 0;
    this.currentMetrics.gpuTime = 0;
    this.currentMetrics.cpuTime = 0;
    this.renderBatches = [];

    if (this.isQuerySupported && this.queryExt && this.gl instanceof WebGL2RenderingContext) {
      this.timeQuery = this.gl.createQuery();
      this.gl.beginQuery(this.queryExt.TIME_ELAPSED_EXT, this.timeQuery);
    }
  }

  /**
   * End frame timing and calculate metrics
   */
  endFrame(): PerformanceMetrics {
    const currentTime = performance.now();
    const frameTime = currentTime - this.currentMetrics.timestamp;
    
    // Update frame time history
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxFrameTimeHistory) {
      this.frameTimes.shift();
    }
    
    // Calculate FPS
    const avgFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    
    // Get GPU time if supported
    if (this.isQuerySupported && this.timeQuery && this.gl instanceof WebGL2RenderingContext) {
      this.gl.endQuery(this.queryExt.TIME_ELAPSED_EXT);
      
      // Check if query result is available
      if (this.gl.getQueryParameter(this.timeQuery, this.gl.QUERY_RESULT_AVAILABLE)) {
        const gpuTime = this.gl.getQueryParameter(this.timeQuery, this.gl.QUERY_RESULT);
        this.currentMetrics.gpuTime = gpuTime / 1000000; // Convert to milliseconds
      }
    }
    
    // Calculate CPU time
    this.currentMetrics.cpuTime = frameTime - this.currentMetrics.gpuTime;
    
    // Update metrics
    this.currentMetrics.fps = Math.round(fps);
    this.currentMetrics.frameTime = Math.round(frameTime * 100) / 100;
    
    // Estimate memory usage
    this.currentMetrics.memoryUsage = this.estimateMemoryUsage();
    
    return this.getMetrics();
  }

  /**
   * Record a draw call
   */
  recordDrawCall(type: string, count: number, triangles: number, time: number = 0): void {
    this.currentMetrics.drawCalls++;
    this.currentMetrics.triangles += triangles;
    this.currentMetrics.vertices += count;
    
    this.renderBatches.push({
      type,
      count,
      triangles,
      time
    });
  }

  /**
   * Update culling efficiency
   */
  updateCullingEfficiency(totalBlocks: number, visibleBlocks: number): void {
    if (totalBlocks > 0) {
      this.currentMetrics.cullingEfficiency = (visibleBlocks / totalBlocks) * 100;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.currentMetrics };
  }

  /**
   * Collect metrics for external modification (used by canvas rendering)
   * Returns a mutable object that can be extended with additional properties
   */
  collectMetrics(): any {
    return {
      ...this.currentMetrics,
      renderTime: 0,
      blockCount: 0,
      visibleBlocks: 0,
      drawCalls: 0
    };
  }

  /**
   * Get render batch statistics
   */
  getRenderBatches(): RenderBatch[] {
    return [...this.renderBatches];
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): string {
    const metrics = this.getMetrics();
    return `
Performance Summary:
- FPS: ${metrics.fps}
- Frame Time: ${metrics.frameTime}ms
- Draw Calls: ${metrics.drawCalls}
- Triangles: ${metrics.triangles}
- Vertices: ${metrics.vertices}
- Culling Efficiency: ${metrics.cullingEfficiency.toFixed(1)}%
- GPU Time: ${metrics.gpuTime.toFixed(2)}ms
- CPU Time: ${metrics.cpuTime.toFixed(2)}ms
- Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
    `.trim();
  }

  /**
   * Estimate WebGL memory usage
   */
  private estimateMemoryUsage(): number {
    let memoryUsage = 0;
    
    // Estimate texture memory
    const textureCount = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
    memoryUsage += textureCount * 1024 * 1024; // Rough estimate
    
    // Estimate buffer memory
    const bufferCount = this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS);
    memoryUsage += bufferCount * 512 * 1024; // Rough estimate
    
    return memoryUsage;
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    const metrics = this.getMetrics();
    return metrics.fps >= 30 && metrics.frameTime < 33;
  }

  /**
   * Get performance warnings
   */
  getPerformanceWarnings(): string[] {
    const warnings: string[] = [];
    const metrics = this.getMetrics();
    
    if (metrics.fps < 30) {
      warnings.push(`Low FPS: ${metrics.fps} (target: 30+)`);
    }
    
    if (metrics.frameTime > 33) {
      warnings.push(`High frame time: ${metrics.frameTime}ms (target: <33ms)`);
    }
    
    if (metrics.drawCalls > 1000) {
      warnings.push(`High draw calls: ${metrics.drawCalls} (consider batching)`);
    }
    
    if (metrics.cullingEfficiency < 50) {
      warnings.push(`Poor culling efficiency: ${metrics.cullingEfficiency.toFixed(1)}%`);
    }
    
    return warnings;
  }

  /**
   * Reset performance monitoring
   */
  reset(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.renderBatches = [];
    this.currentMetrics = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      vertices: 0,
      cullingEfficiency: 0,
      memoryUsage: 0,
      gpuTime: 0,
      cpuTime: 0,
      timestamp: 0
    };
  }
} 