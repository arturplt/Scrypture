import { useRef, useCallback, useEffect, useState } from 'react';
import { SanctuaryState } from './useSanctuaryState';
import { Block } from '../types/Block';
import { Camera } from '../types/Camera';
import { CullingSystem } from '../systems/CullingSystem';
import { SpatialIndex } from '../systems/SpatialIndexSystem';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export interface CanvasRenderingState {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hoverCanvasRef: React.RefObject<HTMLCanvasElement>;
  animationFrameRef: React.MutableRefObject<number | null>;
  lastRenderTimeRef: React.MutableRefObject<number>;
  isLoaded: boolean;
  tileSheet: HTMLImageElement | null;
  tileSheetLoaded: boolean;
  performanceMetrics: any | null; // Will be properly typed later
}

export interface CanvasRenderingActions {
  // Canvas management
  setCanvasLoaded: (loaded: boolean) => void;
  setTileSheet: (sheet: HTMLImageElement | null) => void;
  setTileSheetLoaded: (loaded: boolean) => void;
  
  // Coordinate conversion
  screenToGrid: (screenX: number, screenY: number) => { x: number; y: number; z: number };
  gridToScreen: (gridX: number, gridY: number, gridZ: number) => { x: number; y: number };
  
  // Rendering functions
  renderBlock: (ctx: CanvasRenderingContext2D, block: Block, tileSheet: HTMLImageElement) => void;
  renderHoverPreview: (ctx: CanvasRenderingContext2D, tileSheet: HTMLImageElement) => void;
  renderSelectionHighlight: (ctx: CanvasRenderingContext2D) => void;
  renderGrid: (ctx: CanvasRenderingContext2D) => void;
  renderScene: (ctx: CanvasRenderingContext2D, tileSheet: HTMLImageElement) => void;
  renderFallbackScene: (ctx: CanvasRenderingContext2D) => void;
  
  // Game loop
  startGameLoop: () => void;
  stopGameLoop: () => void;
  
  // Performance
  setPerformanceMetrics: (metrics: any) => void;
}

export const useCanvasRendering = (
  state: SanctuaryState,
  cullingSystem: CullingSystem,
  performanceMonitor: PerformanceMonitor
): [CanvasRenderingState, CanvasRenderingActions] => {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  
  // Loading state
  const [isLoaded, setIsLoaded] = useState(false);
  const [tileSheet, setTileSheet] = useState<HTMLImageElement | null>(null);
  const [tileSheetLoaded, setTileSheetLoaded] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any | null>(null);
  
  // Coordinate conversion utilities
  const screenToGrid = useCallback((screenX: number, screenY: number): { x: number; y: number; z: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, z: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    // Convert to world coordinates (accounting for camera)
    const worldX = (canvasX - state.camera.position.x) / state.camera.zoom;
    const worldY = (canvasY - state.camera.position.y) / state.camera.zoom;
    
    // Convert to isometric grid coordinates using actual tile dimensions
    const tileWidth = 32; // Actual tile width from tile sheet
    const tileHeight = 16; // Half height for isometric projection
    
    // Isometric to grid conversion
    // For isometric projection: x = (gridX - gridY) * tileWidth/2, y = (gridX + gridY) * tileHeight/2
    // Solving for gridX and gridY:
    // gridX = (x / (tileWidth/2) + y / (tileHeight/2)) / 2
    // gridY = (y / (tileHeight/2) - x / (tileWidth/2)) / 2
    const gridX = Math.round((worldX / (tileWidth / 2) + worldY / (tileHeight / 2)) / 2);
    const gridY = Math.round((worldY / (tileHeight / 2) - worldX / (tileWidth / 2)) / 2);
    const gridZ = state.currentZLevel;
    
    return { x: gridX, y: gridY, z: gridZ };
  }, [state.camera, state.currentZLevel]);
  
  const gridToScreen = useCallback((gridX: number, gridY: number, gridZ: number): { x: number; y: number } => {
    const tileWidth = 32; // Actual tile width from tile sheet
    const tileHeight = 16; // Half height for isometric projection
    
    // Isometric projection
    const isoX = (gridX - gridY) * (tileWidth / 2);
    const isoY = (gridX + gridY) * (tileHeight / 2) - gridZ * (tileHeight * 2); // Account for Z-level spacing
    
    // Convert to screen coordinates (accounting for camera)
    const screenX = isoX * state.camera.zoom + state.camera.position.x;
    const screenY = isoY * state.camera.zoom + state.camera.position.y;
    
    return { x: screenX, y: screenY };
  }, [state.camera]);
  
  // Rendering functions
  const renderBlock = useCallback((ctx: CanvasRenderingContext2D, block: Block, tileSheet: HTMLImageElement) => {
    const { x, y, z } = block.position;
    const tileWidth = 32; // Actual tile width from tile sheet
    const tileHeight = 16; // Half height for isometric projection
    
    // Isometric projection with increased Z-level spacing for more dramatic elevation
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * (tileHeight * 2); // Doubled Z-level spacing
    
    // Snap to pixel boundaries for crisp rendering
    const pixelPerfectX = Math.round(isoX);
    const pixelPerfectY = Math.round(isoY);
    
    ctx.save();
    ctx.translate(pixelPerfectX, pixelPerfectY);
    ctx.rotate((block.rotation * Math.PI) / 180);
    
    // Pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    
    ctx.drawImage(
      tileSheet,
      block.sprite.sourceX, block.sprite.sourceY,
      block.sprite.width, block.sprite.height,
      -block.sprite.width / 2, -block.sprite.height + tileHeight/2,
      block.sprite.width, block.sprite.height
    );
    
    ctx.restore();
  }, []);
  
  const renderHoverPreview = useCallback((ctx: CanvasRenderingContext2D, tileSheet: HTMLImageElement) => {
    if (!state.hoverCell || !state.selectedTile) return;
    
    const { x, y, z } = state.hoverCell;
    const tileWidth = 32; // Actual tile width from tile sheet
    const tileHeight = 16; // Half height for isometric projection
    
    // Isometric projection with increased Z-level spacing
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * (tileHeight * 2);
    
    // Snap to pixel boundaries for crisp rendering
    const pixelPerfectX = Math.round(isoX);
    const pixelPerfectY = Math.round(isoY);
    
    ctx.save();
    ctx.translate(pixelPerfectX, pixelPerfectY);
    
    // Semi-transparent preview
    ctx.globalAlpha = 0.6;
    
    // Draw tile preview (aligned to grid base)
    ctx.drawImage(
      tileSheet,
      state.selectedTile.sourceX, state.selectedTile.sourceY,
      state.selectedTile.width, state.selectedTile.height,
      -state.selectedTile.width / 2, -state.selectedTile.height + tileHeight/2,
      state.selectedTile.width, state.selectedTile.height
    );
    
    ctx.restore();
  }, [state.hoverCell, state.selectedTile]);
  
  const renderSelectionHighlight = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!state.selectedBlock) return;
    
    const { x, y, z } = state.selectedBlock.position;
    const tileWidth = 32; // Actual tile width from tile sheet
    const tileHeight = 16; // Half height for isometric projection
    
    // Calculate isometric position with increased Z-level spacing
    const isoX = (x - y) * (tileWidth / 2);
    const isoY = (x + y) * (tileHeight / 2) - z * (tileHeight * 2);
    
    // Snap to pixel boundaries for crisp rendering
    const pixelPerfectX = Math.round(isoX);
    const pixelPerfectY = Math.round(isoY);
    
    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(pixelPerfectX - tileWidth/2, pixelPerfectY - tileHeight + tileHeight/2, tileWidth, tileHeight);
    ctx.restore();
  }, [state.selectedBlock]);
  
  const renderGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!state.showGrid) return;
    
    const tileWidth = 32; // Actual tile width from tile sheet
    const tileHeight = 16; // Half height for isometric projection
    const gridSize = 20; // Reduced grid size since tiles are larger
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw highlighted cell if hovering
    if (state.hoverCell) {
      const { x, y, z } = state.hoverCell;
      const isoX = (x - y) * (tileWidth / 2);
      const isoY = (x + y) * (tileHeight / 2) - z * (tileHeight * 2); // Account for Z-level spacing
      
      // Snap to pixel boundaries for crisp rendering
      const centerX = Math.round(isoX);
      const centerY = Math.round(isoY);
      
      // Highlight diamond
      const top = { x: centerX, y: centerY - tileHeight/2 };
      const right = { x: centerX + tileWidth/2, y: centerY };
      const bottom = { x: centerX, y: centerY + tileHeight/2 };
      const left = { x: centerX - tileWidth/2, y: centerY };
      
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(right.x, right.y);
      ctx.lineTo(bottom.x, bottom.y);
      ctx.lineTo(left.x, left.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw diamond-shaped grid cells for isometric projection
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let y = -gridSize; y <= gridSize; y++) {
        // Calculate isometric position (adjusted for seamless tiling)
        const isoX = (x - y) * (tileWidth / 2);
        const isoY = (x + y) * (tileHeight / 2) - state.currentZLevel * (tileHeight * 2); // Account for current Z-level
        
        // Draw diamond shape for each grid cell
        const centerX = Math.round(isoX);
        const centerY = Math.round(isoY);
        
        // Isometric diamond grid cells (half height for traditional isometric pixel art)
        const top = { x: centerX, y: centerY - tileHeight/2 };
        const right = { x: centerX + tileWidth/2, y: centerY };
        const bottom = { x: centerX, y: centerY + tileHeight/2 };
        const left = { x: centerX - tileWidth/2, y: centerY };
        
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(right.x, right.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.lineTo(left.x, left.y);
        ctx.closePath();
        ctx.stroke();
        
        // Add a subtle center point for each diamond
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }, [state.showGrid, state.hoverCell, state.currentZLevel]);
  
  const renderScene = useCallback((ctx: CanvasRenderingContext2D, tileSheet: HTMLImageElement) => {
    const startTime = performance.now();
    
    // Get device pixel ratio for proper scaling
    const dpr = window.devicePixelRatio || 1;
    
    // Clear canvas (use actual canvas dimensions, not scaled)
    ctx.clearRect(0, 0, ctx.canvas.width / dpr, ctx.canvas.height / dpr);
    
    // Apply camera transform with pixel-perfect positioning
    ctx.save();
    
    // Snap camera position to pixel boundaries for crisp rendering
    const pixelPerfectX = Math.round(state.camera.position.x);
    const pixelPerfectY = Math.round(state.camera.position.y);
    
    ctx.translate(pixelPerfectX, pixelPerfectY);
    ctx.scale(state.camera.zoom, state.camera.zoom);
    
    // Get visible blocks using culling system and z-level filtering
    // Temporarily disable culling to test coordinate fixes
    const culledBlocks = state.blocks; // cullingSystem.getVisibleBlocks(state.camera);
    const visibleBlocks = state.blocks.filter(block => 
      state.zLevelFilter.length === 0 || state.zLevelFilter.includes(block.position.z)
    );
    const filteredBlocks = visibleBlocks; // culledBlocks.filter(block => 
      // visibleBlocks.some(vb => vb.id === block.id)
    // );
    
    // Sort blocks by depth (z DESC, then y ASC, then x ASC)
    const sortedBlocks = filteredBlocks.sort((a, b) => {
      if (a.position.z !== b.position.z) return b.position.z - a.position.z;
      if (a.position.y !== b.position.y) return a.position.y - b.position.y;
      return a.position.x - b.position.x;
    });
    
    // Render blocks
    let drawCalls = 0;
    sortedBlocks.forEach(block => {
      renderBlock(ctx, block, tileSheet);
      drawCalls++;
    });
    
    // Render hover preview
    renderHoverPreview(ctx, tileSheet);
    
    // Render selection highlight
    renderSelectionHighlight(ctx);
    
    // Render grid
    renderGrid(ctx);
    
    ctx.restore();
    
    // Update performance metrics
    const renderTime = performance.now() - startTime;
    const metrics = performanceMonitor.collectMetrics();
    metrics.renderTime = renderTime;
    metrics.blockCount = state.blocks.length;
    metrics.visibleBlocks = filteredBlocks.length;
    metrics.drawCalls = drawCalls;
    
    setPerformanceMetrics(metrics);
  }, [
    state.camera, 
    state.blocks, 
    state.zLevelFilter, 
    state.hoverCell, 
    state.selectedTile, 
    state.selectedBlock, 
    state.showGrid,
    cullingSystem,
    performanceMonitor,
    renderBlock,
    renderHoverPreview,
    renderSelectionHighlight,
    renderGrid
  ]);
  
  const renderFallbackScene = useCallback((ctx: CanvasRenderingContext2D) => {
    const startTime = performance.now();
    
    // Get device pixel ratio for proper scaling
    const dpr = window.devicePixelRatio || 1;
    
    // Clear canvas (use actual canvas dimensions, not scaled)
    ctx.clearRect(0, 0, ctx.canvas.width / dpr, ctx.canvas.height / dpr);
    
    // Apply camera transform with pixel-perfect positioning
    ctx.save();
    
    // Snap camera position to pixel boundaries for crisp rendering
    const pixelPerfectX = Math.round(state.camera.position.x);
    const pixelPerfectY = Math.round(state.camera.position.y);
    
    ctx.translate(pixelPerfectX, pixelPerfectY);
    ctx.scale(state.camera.zoom, state.camera.zoom);
    
    // Render grid first (so blocks appear on top)
    if (state.showGrid) {
      renderGrid(ctx);
    }
    
    // Render blocks as colored rectangles using corrected coordinate system
    let drawCalls = 0;
    state.blocks.forEach((block) => {
      const { x, y, z } = block.position;
      const tileWidth = 32; // Actual tile width from tile sheet
      const tileHeight = 16; // Half height for isometric projection
      
      // Calculate isometric position (matching the coordinate system)
      const isoX = (x - y) * (tileWidth / 2);
      const isoY = (x + y) * (tileHeight / 2) - z * (tileHeight * 2); // Account for Z-level spacing
      
      // Snap to pixel boundaries for crisp rendering
      const pixelPerfectX = Math.round(isoX);
      const pixelPerfectY = Math.round(isoY);
      
      // Color based on palette
      const colors = {
        green: '#00FF00',
        blue: '#0080FF',
        gray: '#808080',
        orange: '#FF8000'
      };
      
      ctx.fillStyle = colors[block.palette] || '#FF0000';
      ctx.fillRect(pixelPerfectX - tileWidth/2, pixelPerfectY - tileHeight + tileHeight/2, tileWidth, tileHeight);
      
      // Draw border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(pixelPerfectX - tileWidth/2, pixelPerfectY - tileHeight + tileHeight/2, tileWidth, tileHeight);
      
      drawCalls++;
    });
    
    ctx.restore();
    
    // Update performance metrics for fallback scene
    const renderTime = performance.now() - startTime;
    const metrics = performanceMonitor.collectMetrics();
    metrics.renderTime = renderTime;
    metrics.blockCount = state.blocks.length;
    metrics.visibleBlocks = state.blocks.length; // All blocks are visible in fallback
    metrics.drawCalls = drawCalls;
    
    setPerformanceMetrics(metrics);
  }, [state.blocks, state.camera, state.showGrid, renderGrid, performanceMonitor]);
  
  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (currentTime - lastRenderTimeRef.current >= 16.67) { // ~60fps
      const canvas = canvasRef.current;
      if (canvas && isLoaded) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Update culling system frustum
          cullingSystem.updateFrustum(state.camera, canvas.width, canvas.height);
          
          // Use proper tile sheet rendering if loaded, otherwise fallback
          if (tileSheetLoaded && tileSheet) {
            renderScene(ctx, tileSheet);
          } else {
            renderFallbackScene(ctx);
          }
        }
      }
      lastRenderTimeRef.current = currentTime;
    }
    
    // Calculate FPS for performance monitoring
    const frameTime = currentTime - lastRenderTimeRef.current;
    const fps = frameTime > 0 ? 1000 / frameTime : 60;
    
    // Update performance metrics with calculated FPS
    const metrics = performanceMonitor.collectMetrics();
    metrics.fps = fps;
    metrics.frameTime = frameTime;
    setPerformanceMetrics(metrics);
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isLoaded, state.camera, cullingSystem, renderScene, renderFallbackScene, tileSheetLoaded, tileSheet, performanceMonitor]);
  
  const startGameLoop = useCallback(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);
  
  const stopGameLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);
  
  // Start game loop on mount
  useEffect(() => {
    startGameLoop();
    return () => {
      stopGameLoop();
    };
  }, [startGameLoop, stopGameLoop]);
  
  // Compose state object
  const canvasState: CanvasRenderingState = {
    canvasRef,
    hoverCanvasRef,
    animationFrameRef,
    lastRenderTimeRef,
    isLoaded,
    tileSheet,
    tileSheetLoaded,
    performanceMetrics
  };
  
  // Compose actions object
  const canvasActions: CanvasRenderingActions = {
    setCanvasLoaded: setIsLoaded,
    setTileSheet,
    setTileSheetLoaded,
    screenToGrid,
    gridToScreen,
    renderBlock,
    renderHoverPreview,
    renderSelectionHighlight,
    renderGrid,
    renderScene,
    renderFallbackScene,
    startGameLoop,
    stopGameLoop,
    setPerformanceMetrics
  };
  
  return [canvasState, canvasActions];
}; 