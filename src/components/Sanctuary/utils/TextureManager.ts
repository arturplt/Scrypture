/**
 * WebGL Texture Management System for Sanctuary Component
 * Handles texture atlas loading, caching, and efficient texture sampling
 */

import { IsometricTileData, TILE_SHEET_CONFIG } from '../../../data/isometric-tiles';

export interface TextureAtlasInfo {
  texture: WebGLTexture;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  loaded: boolean;
  error?: string;
}

export interface TextureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  u1: number; // Top-left U coordinate
  v1: number; // Top-left V coordinate
  u2: number; // Bottom-right U coordinate
  v2: number; // Bottom-right V coordinate
}

export class TextureManager {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private atlasInfo: TextureAtlasInfo | null = null;
  private tileRegions: Map<number, TextureRegion> = new Map();
  private loadingPromises: Map<string, Promise<TextureAtlasInfo>> = new Map();
  private compressionSupported: boolean = false;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
    this.checkCompressionSupport();
  }

  /**
   * Check if texture compression is supported
   */
  private checkCompressionSupport(): void {
    const ext = this.gl.getExtension('WEBGL_compressed_texture_s3tc') ||
                this.gl.getExtension('WEBGL_compressed_texture_etc') ||
                this.gl.getExtension('WEBGL_compressed_texture_astc');
    this.compressionSupported = !!ext;
  }

  /**
   * Load the texture atlas
   */
  async loadTextureAtlas(): Promise<TextureAtlasInfo> {
    return this.loadTileAtlas();
  }

  /**
   * Get the atlas texture
   */
  getAtlasTexture(): WebGLTexture | null {
    return this.atlasInfo?.texture || null;
  }

  /**
   * Check if the atlas is loaded
   */
  isAtlasLoaded(): boolean {
    return this.atlasInfo?.loaded || false;
  }



  /**
   * Load the main tile atlas texture
   */
  async loadTileAtlas(): Promise<TextureAtlasInfo> {
    const cacheKey = 'tile-atlas';
    
    // Return cached promise if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadPromise = this.loadTextureAtlasFromPath(TILE_SHEET_CONFIG.imagePath);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      this.atlasInfo = await loadPromise;
      this.generateTileRegions();
      return this.atlasInfo;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Load a texture atlas from an image URL
   */
  private async loadTextureAtlasFromPath(imagePath: string): Promise<TextureAtlasInfo> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => {
        try {
          const texture = this.createTextureFromImage(image);
          const atlasInfo: TextureAtlasInfo = {
            texture,
            width: image.width,
            height: image.height,
            tileWidth: TILE_SHEET_CONFIG.tileWidth,
            tileHeight: TILE_SHEET_CONFIG.tileHeight,
            loaded: true
          };
          resolve(atlasInfo);
        } catch (error) {
          reject(new Error(`Failed to create texture: ${error}`));
        }
      };

      image.onerror = () => {
        reject(new Error(`Failed to load image: ${imagePath}`));
      };

      // Set crossOrigin for CORS support
      image.crossOrigin = 'anonymous';
      image.src = imagePath;
    });
  }

  /**
   * Create a WebGL texture from an HTML image
   */
  private createTextureFromImage(image: HTMLImageElement): WebGLTexture {
    const texture = this.gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create WebGL texture');
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Upload the image data
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );

    // Generate mipmaps for better quality at different scales
    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    // Set texture parameters for optimal rendering
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    return texture;
  }

  /**
   * Generate texture regions for all tiles
   */
  private generateTileRegions(): void {
    if (!this.atlasInfo) return;

    const { width: atlasWidth, height: atlasHeight, tileWidth, tileHeight } = this.atlasInfo;

    // Clear existing regions
    this.tileRegions.clear();

    // Generate regions for each tile in the atlas
    for (let row = 0; row < atlasHeight / tileHeight; row++) {
      for (let col = 0; col < atlasWidth / tileWidth; col++) {
        const x = col * tileWidth;
        const y = row * tileHeight;
        
        const region: TextureRegion = {
          x,
          y,
          width: tileWidth,
          height: tileHeight,
          u1: x / atlasWidth,
          v1: y / atlasHeight,
          u2: (x + tileWidth) / atlasWidth,
          v2: (y + tileHeight) / atlasHeight
        };

        // Calculate tile ID based on position
        const tileId = row * (atlasWidth / tileWidth) + col + 1;
        this.tileRegions.set(tileId, region);
      }
    }
  }

  /**
   * Get texture region for a specific tile ID
   */
  getTileRegion(tileId: number): TextureRegion | null {
    return this.tileRegions.get(tileId) || null;
  }

  /**
   * Get texture region for a tile data object
   */
  getTileRegionFromData(tileData: IsometricTileData): TextureRegion {
    const { sourceX, sourceY, width, height } = tileData;
    
    if (!this.atlasInfo) {
      throw new Error('Texture atlas not loaded');
    }

    return {
      x: sourceX,
      y: sourceY,
      width,
      height,
      u1: sourceX / this.atlasInfo.width,
      v1: sourceY / this.atlasInfo.height,
      u2: (sourceX + width) / this.atlasInfo.width,
      v2: (sourceY + height) / this.atlasInfo.height
    };
  }

  /**
   * Bind the tile atlas texture for rendering
   */
  bindTileAtlas(textureUnit: number = 0): void {
    if (!this.atlasInfo?.texture) {
      throw new Error('Tile atlas not loaded');
    }

    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlasInfo.texture);
  }

  /**
   * Create vertex data for a tile with proper texture coordinates
   */
  createTileVertices(
    x: number, 
    y: number, 
    _z: number, 
    tileId: number, 
    size: number = 32
  ): Float32Array | null {
    const region = this.getTileRegion(tileId);
    if (!region) return null;

    const halfSize = size / 2;
    const quarterSize = size / 4;

    // Create isometric tile vertices with proper texture coordinates
    return new Float32Array([
      // Position (x, y), Texture coordinates (u, v), Color (r, g, b)
      x, y - quarterSize, region.u1, region.v1, 1.0, 1.0, 1.0, 1.0,           // Top
      x + halfSize, y, region.u2, region.v1, 1.0, 1.0, 1.0, 1.0,             // Right
      x, y + quarterSize, region.u1, region.v2, 1.0, 1.0, 1.0, 1.0,          // Bottom
      x - halfSize, y, region.u2, region.v2, 1.0, 1.0, 1.0, 1.0              // Left
    ]);
  }

  /**
   * Create vertex data for a tile with custom texture coordinates
   */
  createTileVerticesWithRegion(
    x: number, 
    y: number, 
    _z: number, 
    region: TextureRegion, 
    size: number = 32
  ): Float32Array {
    const halfSize = size / 2;
    const quarterSize = size / 4;

    return new Float32Array([
      // Position (x, y), Texture coordinates (u, v), Color (r, g, b)
      x, y - quarterSize, region.u1, region.v1, 1.0, 1.0, 1.0, 1.0,           // Top
      x + halfSize, y, region.u2, region.v1, 1.0, 1.0, 1.0, 1.0,             // Right
      x, y + quarterSize, region.u1, region.v2, 1.0, 1.0, 1.0, 1.0,          // Bottom
      x - halfSize, y, region.u2, region.v2, 1.0, 1.0, 1.0, 1.0              // Left
    ]);
  }

  /**
   * Get atlas information
   */
  getAtlasInfo(): TextureAtlasInfo | null {
    return this.atlasInfo;
  }

  /**
   * Get compression support status
   */
  isCompressionSupported(): boolean {
    return this.compressionSupported;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.atlasInfo?.texture) {
      this.gl.deleteTexture(this.atlasInfo.texture);
    }
    this.tileRegions.clear();
    this.loadingPromises.clear();
    this.atlasInfo = null;
  }

  /**
   * Clean up resources (alias for dispose)
   */
  cleanup(): void {
    this.dispose();
  }

  /**
   * Reload the texture atlas (useful for context restoration)
   */
  async reload(): Promise<TextureAtlasInfo> {
    this.dispose();
    return this.loadTileAtlas();
  }

  /**
   * Get memory usage information
   */
  getMemoryInfo(): { textureCount: number; totalRegions: number; atlasSize: string } {
    const textureCount = this.atlasInfo ? 1 : 0;
    const totalRegions = this.tileRegions.size;
    const atlasSize = this.atlasInfo 
      ? `${this.atlasInfo.width}x${this.atlasInfo.height} (${Math.round((this.atlasInfo.width * this.atlasInfo.height * 4) / 1024)}KB)`
      : 'Not loaded';

    return { textureCount, totalRegions, atlasSize };
  }

  getTileTexture(
    _x: number,
    _y: number,
    _z: number,
    _type: string,
    _palette: string
  ): WebGLTexture | null {
    // This method is not used in the provided code, so it's kept as is.
    // If it were to be used, it would need to be implemented.
    return null;
  }
} 