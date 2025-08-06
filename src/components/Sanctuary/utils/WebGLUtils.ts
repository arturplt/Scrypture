/**
 * WebGL Utility Functions for Sanctuary Component
 * Provides matrix operations, rendering helpers, and WebGL-specific utilities
 */

export class WebGLUtils {
  /**
   * Create a 4x4 identity matrix
   */
  static createIdentityMatrix(): Float32Array {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * Create a 4x4 projection matrix for isometric view
   */
  static createProjectionMatrix(width: number, height: number): Float32Array {
    const aspect = width / height;
    const fov = Math.PI / 4; // 45 degrees
    const near = 0.1;
    const far = 1000.0;
    
    const f = 1.0 / Math.tan(fov / 2);
    
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) / (near - far), -1,
      0, 0, (2 * far * near) / (near - far), 0
    ]);
  }

  /**
   * Create a 4x4 model-view matrix for camera transformation
   */
  static createModelViewMatrix(camera: { position: { x: number; y: number; z: number }; zoom: number }): Float32Array {
    const matrix = this.createIdentityMatrix();
    
    // Apply zoom
    matrix[0] = camera.zoom;
    matrix[5] = camera.zoom;
    matrix[10] = camera.zoom;
    
    // Apply translation
    matrix[12] = -camera.position.x;
    matrix[13] = -camera.position.y;
    matrix[14] = -camera.position.z;
    
    return matrix;
  }

  /**
   * Create a 4x4 isometric transformation matrix
   */
  static createIsometricMatrix(tileWidth: number = 32, tileHeight: number = 16): Float32Array {
    const matrix = this.createIdentityMatrix();
    
    // Isometric projection matrix
    // This transforms from world coordinates to isometric screen coordinates
    const isoAngle = Math.PI / 4; // 45 degrees
    const cosAngle = Math.cos(isoAngle);
    const sinAngle = Math.sin(isoAngle);
    
    // Scale factors for isometric projection
    const scaleX = tileWidth / 2;
    const scaleY = tileHeight / 2;
    
    // Apply isometric transformation
    matrix[0] = cosAngle * scaleX;   // X scale and rotation
    matrix[1] = -sinAngle * scaleY;  // Y rotation
    matrix[4] = sinAngle * scaleX;   // X rotation
    matrix[5] = cosAngle * scaleY;   // Y scale and rotation
    matrix[10] = 1.0;                // Z scale (no change)
    
    return matrix;
  }

  /**
   * Create a 4x4 matrix for depth sorting in isometric view
   */
  static createDepthMatrix(zLevel: number, tileHeight: number = 16): Float32Array {
    const matrix = this.createIdentityMatrix();
    
    // Apply Z-level offset for proper depth sorting
    matrix[14] = zLevel * tileHeight;
    
    return matrix;
  }

  /**
   * Multiply two 4x4 matrices
   */
  static multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] = 
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }
    
    return result;
  }

  /**
   * Create vertex data for a quad (rectangle)
   */
  static createQuadVertices(x: number, y: number, width: number, height: number): Float32Array {
    return new Float32Array([
      // Position (x, y), Texture coordinates (u, v), Color (r, g, b)
      x, y, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,           // Bottom-left
      x + width, y, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0,   // Bottom-right
      x, y + height, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // Top-left
      x + width, y + height, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0  // Top-right
    ]);
  }

  /**
   * Create vertex data for an isometric tile
   */
  static createIsometricTileVertices(x: number, y: number, z: number, size: number = 32): Float32Array {
    const halfSize = size / 2;
    const quarterSize = size / 4;
    
    // Isometric tile vertices (diamond shape)
    return new Float32Array([
      // Position (x, y), Texture coordinates (u, v), Color (r, g, b)
      x, y - quarterSize, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,           // Top
      x + halfSize, y, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0,             // Right
      x, y + quarterSize, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,          // Bottom
      x - halfSize, y, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0              // Left
    ]);
  }

  /**
   * Create indices for rendering quads
   */
  static createQuadIndices(): Uint16Array {
    return new Uint16Array([
      0, 1, 2,  // First triangle
      2, 1, 3   // Second triangle
    ]);
  }

  /**
   * Check if WebGL is supported
   */
  static isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch (e) {
      return false;
    }
  }

  /**
   * Get WebGL context with fallback
   */
  static getWebGLContext(canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGL2RenderingContext | WebGLRenderingContext | null {
    // Try WebGL 2.0 first
    let gl = canvas.getContext('webgl2', options);
    
    // Fallback to WebGL 1.0
    if (!gl) {
      gl = canvas.getContext('webgl', options);
    }
    
    return gl;
  }

  /**
   * Create and compile a shader
   */
  static createShader(gl: WebGL2RenderingContext | WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Create and link a program
   */
  static createProgram(gl: WebGL2RenderingContext | WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  /**
   * Create a texture from an image
   */
  static createTexture(gl: WebGL2RenderingContext | WebGLRenderingContext, image: HTMLImageElement): WebGLTexture | null {
    const texture = gl.createTexture();
    if (!texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
  }

  /**
   * Create a buffer and upload data
   */
  static createBuffer(gl: WebGL2RenderingContext | WebGLRenderingContext, data: Float32Array | Uint16Array, target: number = gl.ARRAY_BUFFER): WebGLBuffer | null {
    const buffer = gl.createBuffer();
    if (!buffer) return null;

    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, gl.STATIC_DRAW);

    return buffer;
  }

  /**
   * Set up vertex attributes
   */
  static setupVertexAttributes(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    program: WebGLProgram,
    buffer: WebGLBuffer,
    attributes: { name: string; size: number; type: number; normalized: boolean; stride: number; offset: number }[]
  ): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    attributes.forEach(attr => {
      const location = gl.getAttribLocation(program, attr.name);
      if (location !== -1) {
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, attr.size, attr.type, attr.normalized, attr.stride, attr.offset);
      }
    });
  }

  /**
   * Clear the WebGL context
   */
  static clear(gl: WebGL2RenderingContext | WebGLRenderingContext, color: [number, number, number, number] = [0, 0, 0, 1]): void {
    gl.clearColor(...color);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  /**
   * Convert isometric coordinates to screen coordinates
   */
  static isometricToScreen(isoX: number, isoY: number, isoZ: number, tileWidth: number = 32, tileHeight: number = 16): { x: number; y: number } {
    const screenX = (isoX - isoY) * (tileWidth / 2);
    const screenY = (isoX + isoY) * (tileHeight / 2) - isoZ * tileHeight;
    return { x: screenX, y: screenY };
  }

  /**
   * Convert screen coordinates to isometric coordinates
   */
  static screenToIsometric(screenX: number, screenY: number, tileWidth: number = 32, tileHeight: number = 16): { x: number; y: number; z: number } {
    const isoX = screenX / (tileWidth / 2);
    const isoY = screenY / (tileHeight / 2);
    const isoZ = 0; // Default Z level
    return { x: isoX, y: isoY, z: isoZ };
  }

  /**
   * Convert world coordinates to isometric grid coordinates
   */
  static worldToGrid(worldX: number, worldY: number, worldZ: number, tileWidth: number = 32, tileHeight: number = 16): { x: number; y: number; z: number } {
    // Convert world coordinates to isometric grid coordinates
    // This is the inverse of gridToWorld with isometric projection
    const gridZ = Math.round(worldZ / tileHeight);
    
    // Solve the isometric equations:
    // worldX = (gridX - gridY) * (tileWidth / 2)
    // worldY = (gridX + gridY) * (tileHeight / 2) - gridZ * tileHeight
    
    // Rearranging:
    // gridX - gridY = worldX / (tileWidth / 2)
    // gridX + gridY = (worldY + gridZ * tileHeight) / (tileHeight / 2)
    
    const isoX = worldX / (tileWidth / 2);
    const isoY = (worldY + gridZ * tileHeight) / (tileHeight / 2);
    
    const gridX = Math.round((isoX + isoY) / 2);
    const gridY = Math.round((isoY - isoX) / 2);
    
    return { x: gridX, y: gridY, z: gridZ };
  }

  /**
   * Convert isometric grid coordinates to world coordinates
   */
  static gridToWorld(gridX: number, gridY: number, gridZ: number, tileWidth: number = 32, tileHeight: number = 16): { x: number; y: number; z: number } {
    // Convert isometric grid coordinates to world coordinates
    // This matches the isometric projection used in canvas rendering
    const worldX = (gridX - gridY) * (tileWidth / 2);
    const worldY = (gridX + gridY) * (tileHeight / 2) - gridZ * tileHeight;
    const worldZ = gridZ * tileHeight;
    return { x: worldX, y: worldY, z: worldZ };
  }

  /**
   * Calculate depth value for proper Z-sorting in isometric view
   */
  static calculateDepth(gridX: number, gridY: number, gridZ: number, tileWidth: number = 32, tileHeight: number = 16): number {
    // Depth calculation for proper Z-sorting in isometric projection
    // This ensures that tiles closer to the viewer are rendered on top
    // Use the same isometric projection as gridToWorld
    const worldX = (gridX - gridY) * (tileWidth / 2);
    const worldY = (gridX + gridY) * (tileHeight / 2) - gridZ * tileHeight;
    const worldZ = gridZ * tileHeight;
    
    // Isometric depth calculation (sum of coordinates for proper sorting)
    const isoDepth = worldX + worldY + worldZ;
    return isoDepth;
  }

  /**
   * Set uniform matrix4fv
   */
  static setUniformMatrix4fv(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    value: Float32Array
  ): void {
    const location = gl.getUniformLocation(program, name);
    if (location) {
      gl.uniformMatrix4fv(location, false, value);
    }
  }

  /**
   * Set uniform 1f
   */
  static setUniform1f(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    value: number
  ): void {
    const location = gl.getUniformLocation(program, name);
    if (location) {
      gl.uniform1f(location, value);
    }
  }

  /**
   * Set uniform 1i
   */
  static setUniform1i(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    value: number
  ): void {
    const location = gl.getUniformLocation(program, name);
    if (location) {
      gl.uniform1i(location, value);
    }
  }

  /**
   * Set uniform 3f
   */
  static setUniform3f(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    x: number,
    y: number,
    z: number
  ): void {
    const location = gl.getUniformLocation(program, name);
    if (location) {
      gl.uniform3f(location, x, y, z);
    }
  }

  /**
   * Set uniform 4f
   */
  static setUniform4f(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    x: number,
    y: number,
    z: number,
    w: number
  ): void {
    const location = gl.getUniformLocation(program, name);
    if (location) {
      gl.uniform4f(location, x, y, z, w);
    }
  }
} 