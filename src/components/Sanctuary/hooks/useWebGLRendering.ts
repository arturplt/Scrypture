import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { SanctuaryState } from './useSanctuaryState';
import { Block } from '../types/Block';
import { Camera } from '../types/Camera';
import { CullingSystem } from '../systems/CullingSystem';
import { SpatialIndex } from '../systems/SpatialIndexSystem';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { WebGLUtils } from '../utils/WebGLUtils';
import { TextureManager } from '../utils/TextureManager';
import { DepthSorter } from '../utils/DepthSorter';
import { BlockRenderer } from '../utils/BlockRenderer';

// WebGL shader sources
const vertexShaderSource = `#version 300 es
precision mediump float;

in vec2 a_position;
in vec2 a_texCoord;
in vec3 a_color;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_isometricMatrix;
uniform float u_zLevel;
uniform float u_tileWidth;
uniform float u_tileHeight;
uniform float u_alpha;

out vec2 v_texCoord;
out vec3 v_color;
out float v_depth;

void main() {
    // Apply isometric projection
    vec4 worldPos = u_modelViewMatrix * vec4(a_position.x, a_position.y, 0.0, 1.0);
    
    // Apply isometric transformation
    vec4 isoPos = u_isometricMatrix * vec4(worldPos.x, worldPos.y, u_zLevel, 1.0);
    
    // Apply projection
    gl_Position = u_projectionMatrix * isoPos;
    
    v_texCoord = a_texCoord;
    v_color = a_color;
    v_depth = u_zLevel;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 v_texCoord;
in vec3 v_color;
in float v_depth;

uniform sampler2D u_texture;
uniform float u_alpha;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    vec4 finalColor = vec4(v_color * texColor.rgb, texColor.a * u_alpha);
    
    // Apply depth-based fog
    float fogFactor = clamp((v_depth - 0.0) / 10.0, 0.0, 1.0);
    finalColor.rgb = mix(finalColor.rgb, vec3(0.7, 0.8, 1.0), fogFactor * 0.3);
    
    fragColor = finalColor;
}
`;

export interface WebGLRenderingState {
  gl: WebGL2RenderingContext | WebGLRenderingContext | null;
  program: WebGLProgram | null;
  textureManager: TextureManager | null;
  textureAtlasLoaded: boolean;
  cullingSystem: CullingSystem | null;
  spatialIndex: SpatialIndex | null;
  performanceMonitor: PerformanceMonitor | null;
  blockRenderer: BlockRenderer | null;
  isInitialized: boolean;
  error: string | null;
}

export interface WebGLRenderingActions {
  initialize: (canvas: HTMLCanvasElement) => void;
  renderScene: (state: SanctuaryState, camera: Camera) => void;
  loadTextureAtlas: () => Promise<void>;
  getTextureManager: () => TextureManager | null;
  getPerformanceMetrics: () => any;
  getCullingStats: () => any;
  setCullingEnabled: (enabled: boolean) => void;
  setMaxRenderDistance: (distance: number) => void;
  cleanup: () => void;
}

export function useWebGLRendering(): [WebGLRenderingState, WebGLRenderingActions] {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureManagerRef = useRef<TextureManager | null>(null);
  const cullingSystemRef = useRef<CullingSystem | null>(null);
  const spatialIndexRef = useRef<SpatialIndex | null>(null);
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  const blockRendererRef = useRef<BlockRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [state, setState] = useState<WebGLRenderingState>({
    gl: null,
    program: null,
    textureManager: null,
    textureAtlasLoaded: false,
    cullingSystem: null,
    spatialIndex: null,
    performanceMonitor: null,
    blockRenderer: null,
    isInitialized: false,
    error: null
  });

  // Initialize WebGL context and shaders
  const initialize = useCallback((canvas: HTMLCanvasElement) => {
    try {
      canvasRef.current = canvas;
      
      // Try WebGL 2.0 first, fallback to 1.0
      let gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
      if (!gl) {
        gl = canvas.getContext('webgl') as WebGLRenderingContext;
        if (!gl) {
          throw new Error('WebGL not supported');
        }
      }

      glRef.current = gl;
      
      // Create and compile shaders
      const vertexShader = WebGLUtils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      
      if (!vertexShader || !fragmentShader) {
        throw new Error('Failed to create shaders');
      }

      // Create program
      const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);
      if (!program) {
        throw new Error('Failed to create program');
      }

      programRef.current = program;

      // Initialize systems
      const spatialIndex = new SpatialIndex({
        cellSize: 64,
        maxBlocksPerCell: 100,
        enableSubdivision: true
      });
      spatialIndexRef.current = spatialIndex;

      const cullingSystem = new CullingSystem(spatialIndex);
      cullingSystemRef.current = cullingSystem;

      const performanceMonitor = new PerformanceMonitor(gl!);
      performanceMonitorRef.current = performanceMonitor;

      const textureManager = new TextureManager(gl);
      textureManagerRef.current = textureManager;

      const blockRenderer = new BlockRenderer(gl, textureManager, program);
      blockRendererRef.current = blockRenderer;

      // Set up WebGL state
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0.2, 0.3, 0.4, 1.0);

      setState(prev => ({
        ...prev,
        gl,
        program,
        textureManager,
        cullingSystem,
        spatialIndex,
        performanceMonitor,
        blockRenderer,
        isInitialized: true,
        error: null
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  // Load texture atlas
  const loadTextureAtlas = useCallback(async () => {
    if (!textureManagerRef.current) return;

    try {
      await textureManagerRef.current.loadTextureAtlas();
      setState(prev => ({
        ...prev,
        textureAtlasLoaded: true
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load texture atlas'
      }));
    }
  }, []);

  // Render scene with performance optimizations
  const renderScene = useCallback((sanctuaryState: SanctuaryState, camera: Camera) => {
    const gl = glRef.current;
    const program = programRef.current;
    const cullingSystem = cullingSystemRef.current;
    const performanceMonitor = performanceMonitorRef.current;
    const blockRenderer = blockRendererRef.current;
    const textureManager = textureManagerRef.current;

    if (!gl || !program || !cullingSystem || !performanceMonitor || !blockRenderer || !textureManager) {
      return;
    }

    // Start performance monitoring
    performanceMonitor.startFrame();

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update frustum for culling
    const canvas = canvasRef.current;
    if (canvas) {
      cullingSystem.updateFrustum(camera, canvas.width, canvas.height);
    }

    // Get visible blocks using culling system
    const visibleBlocks = cullingSystem.getVisibleBlocks(camera);
    
    // Update performance metrics
    performanceMonitor.updateCullingEfficiency(sanctuaryState.blocks.length, visibleBlocks.length);

    // Sort blocks by depth for proper rendering order
    const sortedBlocks = DepthSorter.sortBlocksByZLevel(visibleBlocks);

    // Set up projection matrix
    const projectionMatrix = WebGLUtils.createProjectionMatrix(
      canvas?.width || 800,
      canvas?.height || 600
    );

    // Set up model-view matrix
    const modelViewMatrix = WebGLUtils.createIdentityMatrix();

    // Set up isometric matrix
    const isometricMatrix = WebGLUtils.createIsometricMatrix();

    // Use program
    gl.useProgram(program);

    // Set uniforms
    WebGLUtils.setUniformMatrix4fv(gl, program, 'u_projectionMatrix', projectionMatrix);
    WebGLUtils.setUniformMatrix4fv(gl, program, 'u_modelViewMatrix', modelViewMatrix);
    WebGLUtils.setUniformMatrix4fv(gl, program, 'u_isometricMatrix', isometricMatrix);
    WebGLUtils.setUniform1f(gl, program, 'u_tileWidth', 32);
    WebGLUtils.setUniform1f(gl, program, 'u_tileHeight', 16);

    // Bind texture atlas
    if (textureManager.isAtlasLoaded()) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureManager.getAtlasTexture());
      WebGLUtils.setUniform1i(gl, program, 'u_texture', 0);
    }

    // Render blocks
    let drawCalls = 0;
    let triangles = 0;
    let vertices = 0;

          sortedBlocks.forEach(({ block }) => {
        // Determine if block should be highlighted, hovered, or selected
        const isHovered = !!(sanctuaryState.hoverCell && 
          sanctuaryState.hoverCell.x === block.position.x && 
          sanctuaryState.hoverCell.y === block.position.y && 
          sanctuaryState.hoverCell.z === block.position.z);
        const isSelected = sanctuaryState.selectedBlock?.id === block.id || false;
        const isHighlighted = false; // No highlighted blocks in current state

      // Render block with appropriate options
      blockRenderer.renderBlock(block, {
        alpha: 1.0,
        hover: isHovered,
        selected: isSelected,
        highlight: isHighlighted,
        rotation: block.rotation || 0,
        scale: 1.0
      });

      drawCalls++;
      triangles += 2; // Each block is 2 triangles (4 vertices)
      vertices += 4;
    });

    // Record draw call statistics
    performanceMonitor.recordDrawCall('blocks', vertices, triangles);

    // End performance monitoring
    const metrics = performanceMonitor.endFrame();

    // Log performance warnings in development
    if (process.env.NODE_ENV === 'development') {
      const warnings = performanceMonitor.getPerformanceWarnings();
      if (warnings.length > 0) {
        console.warn('Performance warnings:', warnings);
      }
    }
  }, []);

  // Get texture manager
  const getTextureManager = useCallback(() => {
    return textureManagerRef.current;
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return performanceMonitorRef.current?.getMetrics();
  }, []);

  // Get culling statistics
  const getCullingStats = useCallback(() => {
    return cullingSystemRef.current?.getCullingStats();
  }, []);

  // Set culling enabled
  const setCullingEnabled = useCallback((enabled: boolean) => {
    cullingSystemRef.current?.setCullingEnabled(enabled);
  }, []);

  // Set max render distance
  const setMaxRenderDistance = useCallback((distance: number) => {
    cullingSystemRef.current?.setMaxRenderDistance(distance);
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const gl = glRef.current;
    if (gl) {
      // Clean up WebGL resources
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
      }
      
      // Clean up texture manager
      textureManagerRef.current?.cleanup();
      
      // Clean up spatial index
      spatialIndexRef.current?.clear();
    }

    setState(prev => ({
      ...prev,
      gl: null,
      program: null,
      textureManager: null,
      textureAtlasLoaded: false,
      cullingSystem: null,
      spatialIndex: null,
      performanceMonitor: null,
      blockRenderer: null,
      isInitialized: false
    }));
  }, []);

  // Handle context restoration
  const handleContextRestored = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas && state.isInitialized) {
      // Reinitialize WebGL context
      initialize(canvas);
      
      // Reload texture atlas
      loadTextureAtlas();
    }
  }, [state.isInitialized, initialize, loadTextureAtlas]);

  // Set up context restoration listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
      return () => {
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }
  }, [handleContextRestored]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const actions: WebGLRenderingActions = {
    initialize,
    renderScene,
    loadTextureAtlas,
    getTextureManager,
    getPerformanceMetrics,
    getCullingStats,
    setCullingEnabled,
    setMaxRenderDistance,
    cleanup
  };

  return [state, actions];
} 