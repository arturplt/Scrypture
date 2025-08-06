import { useState, useCallback, useEffect, useRef } from 'react';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export interface PerformanceState {
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

export interface PerformanceActions {
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

export const usePerformance = (): [PerformanceState, PerformanceActions] => {
  // Performance state
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.67);
  const [renderTime, setRenderTime] = useState(0);
  const [blockCount, setBlockCount] = useState(0);
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const [drawCalls, setDrawCalls] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [isOptimized, setIsOptimized] = useState(false);
  
  // Performance settings
  const [targetFPS, setTargetFPS] = useState(60);
  const [enableVSync, setEnableVSync] = useState(true);
  const [enableCulling, setEnableCulling] = useState(true);
  const [enableBatching, setEnableBatching] = useState(true);
  const [enableLOD, setEnableLOD] = useState(false);
  
  // Performance monitoring refs
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const renderTimeHistory = useRef<number[]>([]);
  
  // Performance monitor instance - create a simple one without WebGL context
  const performanceMonitor = useRef({
    collectMetrics: () => ({
      fps: 60,
      frameTime: 16.67,
      drawCalls: 0,
      triangles: 0,
      vertices: 0,
      cullingEfficiency: 100,
      memoryUsage: 0,
      gpuTime: 0,
      cpuTime: 0,
      timestamp: performance.now()
    })
  });
  
  // Update performance metrics
  const updateMetrics = useCallback((metrics: any) => {
    if (metrics.fps !== undefined) setFps(metrics.fps);
    if (metrics.frameTime !== undefined) setFrameTime(metrics.frameTime);
    if (metrics.renderTime !== undefined) setRenderTime(metrics.renderTime);
    if (metrics.blockCount !== undefined) setBlockCount(metrics.blockCount);
    if (metrics.visibleBlocks !== undefined) setVisibleBlocks(metrics.visibleBlocks);
    if (metrics.drawCalls !== undefined) setDrawCalls(metrics.drawCalls);
    if (metrics.memoryUsage !== undefined) setMemoryUsage(metrics.memoryUsage);
    
    // Update history for averaging
    fpsHistory.current.push(metrics.fps || fps);
    renderTimeHistory.current.push(metrics.renderTime || renderTime);
    
    // Keep only last 60 frames for averaging
    if (fpsHistory.current.length > 60) {
      fpsHistory.current.shift();
    }
    if (renderTimeHistory.current.length > 60) {
      renderTimeHistory.current.shift();
    }
  }, [fps, renderTime]);
  
  // Reset performance metrics
  const resetMetrics = useCallback(() => {
    setFps(60);
    setFrameTime(16.67);
    setRenderTime(0);
    setBlockCount(0);
    setVisibleBlocks(0);
    setDrawCalls(0);
    setMemoryUsage(0);
    frameCount.current = 0;
    lastTime.current = performance.now();
    fpsHistory.current = [];
    renderTimeHistory.current = [];
  }, []);
  
  // Performance optimization functions
  const optimizeForPerformance = useCallback(() => {
    setTargetFPS(30);
    setEnableVSync(false);
    setEnableCulling(true);
    setEnableBatching(true);
    setEnableLOD(true);
    setIsOptimized(true);
  }, []);
  
  const optimizeForQuality = useCallback(() => {
    setTargetFPS(60);
    setEnableVSync(true);
    setEnableCulling(true);
    setEnableBatching(true);
    setEnableLOD(false);
    setIsOptimized(false);
  }, []);
  
  const autoOptimize = useCallback(() => {
    const avgFps = fpsHistory.current.length > 0 
      ? fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length 
      : 60;
    
    const avgRenderTime = renderTimeHistory.current.length > 0
      ? renderTimeHistory.current.reduce((a, b) => a + b, 0) / renderTimeHistory.current.length
      : 16.67;
    
    // Auto-optimize based on current performance
    if (avgFps < 30 || avgRenderTime > 33) {
      // Poor performance - optimize aggressively
      setTargetFPS(30);
      setEnableVSync(false);
      setEnableCulling(true);
      setEnableBatching(true);
      setEnableLOD(true);
      setIsOptimized(true);
    } else if (avgFps < 45 || avgRenderTime > 22) {
      // Moderate performance - moderate optimization
      setTargetFPS(45);
      setEnableVSync(true);
      setEnableCulling(true);
      setEnableBatching(true);
      setEnableLOD(false);
      setIsOptimized(true);
    } else {
      // Good performance - quality settings
      setTargetFPS(60);
      setEnableVSync(true);
      setEnableCulling(true);
      setEnableBatching(true);
      setEnableLOD(false);
      setIsOptimized(false);
    }
  }, [fpsHistory, renderTimeHistory]);
  
  // Performance analysis
  const getPerformanceReport = useCallback((): string => {
    const avgFps = fpsHistory.current.length > 0 
      ? fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length 
      : fps;
    
    const avgRenderTime = renderTimeHistory.current.length > 0
      ? renderTimeHistory.current.reduce((a, b) => a + b, 0) / renderTimeHistory.current.length
      : renderTime;
    
    const performanceLevel = avgFps >= 55 ? 'Excellent' : 
                           avgFps >= 45 ? 'Good' : 
                           avgFps >= 30 ? 'Acceptable' : 'Poor';
    
    return `
Performance Report:
- Current FPS: ${fps.toFixed(1)}
- Average FPS: ${avgFps.toFixed(1)}
- Frame Time: ${frameTime.toFixed(2)}ms
- Render Time: ${renderTime.toFixed(2)}ms
- Average Render Time: ${avgRenderTime.toFixed(2)}ms
- Block Count: ${blockCount}
- Visible Blocks: ${visibleBlocks}
- Draw Calls: ${drawCalls}
- Memory Usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB
- Performance Level: ${performanceLevel}
- Optimized: ${isOptimized ? 'Yes' : 'No'}
- Target FPS: ${targetFPS}
- VSync: ${enableVSync ? 'Enabled' : 'Disabled'}
- Culling: ${enableCulling ? 'Enabled' : 'Disabled'}
- Batching: ${enableBatching ? 'Enabled' : 'Disabled'}
- LOD: ${enableLOD ? 'Enabled' : 'Disabled'}
    `.trim();
  }, [fps, frameTime, renderTime, blockCount, visibleBlocks, drawCalls, memoryUsage, isOptimized, targetFPS, enableVSync, enableCulling, enableBatching, enableLOD, fpsHistory, renderTimeHistory]);
  
  const isPerformanceAcceptable = useCallback((): boolean => {
    const avgFps = fpsHistory.current.length > 0 
      ? fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length 
      : fps;
    
    return avgFps >= 30 && renderTime < 33;
  }, [fps, renderTime, fpsHistory]);
  
  // Auto-optimization effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (fpsHistory.current.length >= 30) { // Wait for enough data
        autoOptimize();
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [autoOptimize]);
  
  // Compose state object
  const performanceState: PerformanceState = {
    fps,
    frameTime,
    renderTime,
    blockCount,
    visibleBlocks,
    drawCalls,
    memoryUsage,
    isOptimized,
    targetFPS,
    enableVSync,
    enableCulling,
    enableBatching,
    enableLOD
  };
  
  // Compose actions object
  const performanceActions: PerformanceActions = {
    updateMetrics,
    resetMetrics,
    setTargetFPS,
    setEnableVSync,
    setEnableCulling,
    setEnableBatching,
    setEnableLOD,
    optimizeForPerformance,
    optimizeForQuality,
    autoOptimize,
    getPerformanceReport,
    isPerformanceAcceptable
  };
  
  return [performanceState, performanceActions];
}; 