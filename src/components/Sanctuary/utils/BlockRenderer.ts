/**
 * Block Rendering System for WebGL
 * Handles rendering of different block types with proper visual effects
 */

import { Block } from '../types/Block';
import { WebGLUtils } from './WebGLUtils';
import { TextureManager } from './TextureManager';
import { IsometricTileData } from '../../../data/isometric-tiles';

export interface BlockRenderOptions {
  alpha?: number;
  highlight?: boolean;
  hover?: boolean;
  selected?: boolean;
  rotation?: number;
  scale?: number;
}

export class BlockRenderer {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private textureManager: TextureManager;
  private program: WebGLProgram;

  constructor(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    textureManager: TextureManager,
    program: WebGLProgram
  ) {
    this.gl = gl;
    this.textureManager = textureManager;
    this.program = program;
  }

  /**
   * Render a single block with the given options
   */
  renderBlock(block: Block, options: BlockRenderOptions = {}): void {
    const {
      alpha = 1.0,
      highlight = false,
      hover = false,
      selected = false,
      rotation = block.rotation || 0,
      scale = 1.0
    } = options;

    // Use the program
    this.gl.useProgram(this.program);

    // Create vertex data for the block
    const vertices = this.createBlockVertices(block, rotation, scale);
    const buffer = WebGLUtils.createBuffer(this.gl, vertices);
    
    if (!buffer) return;

    // Set up vertex attributes
    WebGLUtils.setupVertexAttributes(this.gl, this.program, buffer, [
      { name: 'a_position', size: 2, type: this.gl.FLOAT, normalized: false, stride: 32, offset: 0 },
      { name: 'a_texCoord', size: 2, type: this.gl.FLOAT, normalized: false, stride: 32, offset: 8 },
      { name: 'a_color', size: 3, type: this.gl.FLOAT, normalized: false, stride: 32, offset: 16 }
    ]);

    // Set uniforms
    this.setBlockUniforms(block, alpha, highlight, hover, selected);

    // Bind texture if available
    this.bindBlockTexture(block);

    // Draw the block
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
  }

  /**
   * Create vertex data for a block with rotation and scale
   */
  private createBlockVertices(block: Block, rotation: number, scale: number): Float32Array {
    const { x, y, z } = block.position;
    
    // Apply rotation and scale transformations
    const cosRot = Math.cos(rotation * Math.PI / 180);
    const sinRot = Math.sin(rotation * Math.PI / 180);
    
    // Create base isometric tile vertices
    const baseVertices = WebGLUtils.createIsometricTileVertices(x, y, z);
    
    // Apply rotation and scale to vertices
    const transformedVertices = new Float32Array(baseVertices.length);
    
    for (let i = 0; i < baseVertices.length; i += 8) {
      // Position (x, y)
      const px = baseVertices[i];
      const py = baseVertices[i + 1];
      
      // Apply rotation and scale
      const rotatedX = (px * cosRot - py * sinRot) * scale;
      const rotatedY = (px * sinRot + py * cosRot) * scale;
      
      transformedVertices[i] = rotatedX;
      transformedVertices[i + 1] = rotatedY;
      
      // Copy texture coordinates and color (unchanged)
      transformedVertices[i + 2] = baseVertices[i + 2]; // u
      transformedVertices[i + 3] = baseVertices[i + 3]; // v
      transformedVertices[i + 4] = baseVertices[i + 4]; // r
      transformedVertices[i + 5] = baseVertices[i + 5]; // g
      transformedVertices[i + 6] = baseVertices[i + 6]; // b
      transformedVertices[i + 7] = baseVertices[i + 7]; // a
    }
    
    return transformedVertices;
  }

  /**
   * Set uniforms for block rendering
   */
  private setBlockUniforms(block: Block, alpha: number, _highlight: boolean, _hover: boolean, _selected: boolean): void {
    const { x, y, z } = block.position;
    
    // Get uniform locations
    const projectionLocation = this.gl.getUniformLocation(this.program, 'u_projectionMatrix');
    const modelViewLocation = this.gl.getUniformLocation(this.program, 'u_modelViewMatrix');
    const isometricLocation = this.gl.getUniformLocation(this.program, 'u_isometricMatrix');
    const zLevelLocation = this.gl.getUniformLocation(this.program, 'u_zLevel');
    const tileWidthLocation = this.gl.getUniformLocation(this.program, 'u_tileWidth');
    const tileHeightLocation = this.gl.getUniformLocation(this.program, 'u_tileHeight');
    const useTextureLocation = this.gl.getUniformLocation(this.program, 'u_useTexture');
    const alphaLocation = this.gl.getUniformLocation(this.program, 'u_alpha');

    // Set matrices
    if (projectionLocation) {
      const projectionMatrix = WebGLUtils.createProjectionMatrix(this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
    }
    
    if (modelViewLocation) {
      const modelViewMatrix = WebGLUtils.createModelViewMatrix({ position: { x: 0, y: 0, z: 0 }, zoom: 1 });
      this.gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix);
    }
    
    if (isometricLocation) {
      const isometricMatrix = WebGLUtils.createIsometricMatrix(32, 16);
      this.gl.uniformMatrix4fv(isometricLocation, false, isometricMatrix);
    }

    // Set other uniforms
    if (zLevelLocation) this.gl.uniform1f(zLevelLocation, z);
    if (tileWidthLocation) this.gl.uniform1f(tileWidthLocation, 32);
    if (tileHeightLocation) this.gl.uniform1f(tileHeightLocation, 16);
    if (useTextureLocation) this.gl.uniform1i(useTextureLocation, this.textureManager.isAtlasLoaded() ? 1 : 0);
    if (alphaLocation) this.gl.uniform1f(alphaLocation, alpha);
  }

  /**
   * Bind texture for block rendering
   */
  private bindBlockTexture(_block: Block): void {
    if (!this.textureManager.isAtlasLoaded()) return;

    const textureLocation = this.gl.getUniformLocation(this.program, 'u_texture');
    if (!textureLocation) return;

    // Bind the texture atlas
    this.textureManager.bindTileAtlas(0);
    this.gl.uniform1i(textureLocation, 0);
  }

  /**
   * Render a block with hover effect
   */
  renderHoverBlock(block: Block): void {
    this.renderBlock(block, {
      alpha: 0.7,
      hover: true
    });
  }

  /**
   * Render a block with selection highlight
   */
  renderSelectedBlock(block: Block): void {
    this.renderBlock(block, {
      alpha: 1.0,
      selected: true,
      highlight: true
    });
  }

  /**
   * Render a block with highlight effect
   */
  renderHighlightedBlock(block: Block): void {
    this.renderBlock(block, {
      alpha: 0.8,
      highlight: true
    });
  }

  /**
   * Render a transparent block (for preview)
   */
  renderTransparentBlock(block: Block, alpha: number = 0.5): void {
    this.renderBlock(block, {
      alpha,
      hover: true
    });
  }

  /**
   * Render multiple blocks efficiently
   */
  renderBlocks(blocks: Block[], options: BlockRenderOptions = {}): void {
    blocks.forEach(block => {
      this.renderBlock(block, options);
    });
  }

  /**
   * Get block color based on type and properties
   */
  private getBlockColor(block: Block): [number, number, number] {
    // Default color
    let color: [number, number, number] = [1.0, 1.0, 1.0];

    // Apply color based on block type
    switch (block.type) {
      case 'cube':
        color = [0.8, 0.8, 0.8];
        break;
      case 'ramp':
        color = [0.7, 0.7, 0.7];
        break;
      case 'corner':
        color = [0.6, 0.6, 0.6];
        break;
      case 'staircase':
        color = [0.9, 0.9, 0.9];
        break;
      case 'flat':
        color = [0.5, 0.5, 0.5];
        break;
      case 'pillar':
        color = [0.8, 0.6, 0.4];
        break;
      case 'water':
        color = [0.2, 0.4, 0.8];
        break;
    }

    // Apply palette color
    switch (block.palette) {
      case 'green':
        color = [color[0] * 0.3, color[1] * 0.8, color[2] * 0.3];
        break;
      case 'gray':
        color = [color[0] * 0.6, color[1] * 0.6, color[2] * 0.6];
        break;
      case 'orange':
        color = [color[0] * 0.9, color[1] * 0.6, color[2] * 0.2];
        break;
      case 'blue':
        color = [color[0] * 0.2, color[1] * 0.4, color[2] * 0.8];
        break;
    }

    return color;
  }

  /**
   * Check if block should be rendered (for culling)
   */
  shouldRenderBlock(block: Block, _camera: { position: { x: number; y: number; z: number }; zoom: number }): boolean {
    const { x, y, z } = block.position;
    
    // Simple distance-based culling
    const distance = Math.sqrt(x * x + y * y + z * z);
    const maxDistance = 1000; // Adjust based on your needs
    
    return distance <= maxDistance;
  }
} 