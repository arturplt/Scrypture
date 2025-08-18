/**
 * Asset Management System for Scrypture
 * Handles loading, caching, and providing access to sprite sheets, buttons, and frame assets
 */

export interface AssetConfig {
  id: string;
  path: string;
  width: number;
  height: number;
  tileWidth?: number;
  tileHeight?: number;
  borderSlice?: number;
  type: 'sprite' | 'frame' | 'button' | 'icon';
}

export interface ButtonState {
  normal: string;
  hover?: string;
  pressed?: string;
  disabled?: string;
}

export interface ButtonConfig {
  id: string;
  size: 'small' | 'wide' | 'themed';
  states: ButtonState;
  width: number;
  height: number;
  sourceX: number;
  sourceY: number;
  theme?: 'body' | 'mind' | 'soul';
}

export interface FrameConfig {
  id: string;
  name: string;
  path: string;
  borderSlice: number;
  theme: string;
  sourceX: number;
  sourceY: number;
  width: number;
  height: number;
}

export interface AssetCache {
  [key: string]: HTMLImageElement;
}

export interface AssetManagerState {
  loaded: boolean;
  loading: boolean;
  error?: string;
  cache: AssetCache;
}

class AssetManager {
  private state: AssetManagerState = {
    loaded: false,
    loading: false,
    cache: {}
  };

  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  // Asset configurations
  private readonly ASSETS_PREFIX = this.getAssetsPrefix();

  // UI Asset configurations
  private readonly UI_ASSETS: AssetConfig[] = [
    {
      id: 'frames-and-buttons',
      path: `${this.ASSETS_PREFIX}/assets/Frames/Framesandbuttonsatlas.png`,
      width: 1024, // Approximate atlas width
      height: 1024, // Approximate atlas height
      type: 'sprite'
    },
    {
      id: 'beaver-icon',
      path: `${this.ASSETS_PREFIX}/assets/Icons/beaver_32.png`,
      width: 32,
      height: 32,
      type: 'icon'
    }
  ];

  // Button configurations based on atlas layout
  private readonly BUTTON_CONFIGS: ButtonConfig[] = [
    // Small buttons (16x16) - Row 1 (normal), Row 2 (active)
    {
      id: 'button-small-1',
      size: 'small',
      states: {
        normal: 'button-small-1-normal',
        hover: 'button-small-1-hover'
      },
      width: 16,
      height: 16,
      sourceX: 0,
      sourceY: 0
    },
    {
      id: 'button-small-2',
      size: 'small',
      states: {
        normal: 'button-small-2-normal',
        hover: 'button-small-2-hover'
      },
      width: 16,
      height: 16,
      sourceX: 16,
      sourceY: 0
    },
    // Wide buttons (16x32) - Row 3 (normal), Row 4 (active)
    {
      id: 'button-wide-1',
      size: 'wide',
      states: {
        normal: 'button-wide-1-normal',
        hover: 'button-wide-1-hover'
      },
      width: 16,
      height: 32,
      sourceX: 0,
      sourceY: 32
    },
    // Themed buttons (Body, Mind, Soul)
    {
      id: 'button-body',
      size: 'themed',
      states: {
        normal: 'button-body-normal',
        hover: 'button-body-hover'
      },
      width: 16,
      height: 16,
      sourceX: 48,
      sourceY: 0,
      theme: 'body'
    },
    {
      id: 'button-mind',
      size: 'themed',
      states: {
        normal: 'button-mind-normal',
        hover: 'button-mind-hover'
      },
      width: 16,
      height: 16,
      sourceX: 64,
      sourceY: 0,
      theme: 'mind'
    },
    {
      id: 'button-soul',
      size: 'themed',
      states: {
        normal: 'button-soul-normal',
        hover: 'button-soul-hover'
      },
      width: 16,
      height: 16,
      sourceX: 80,
      sourceY: 0,
      theme: 'soul'
    }
  ];

  // Frame configurations
  private readonly FRAME_CONFIGS: FrameConfig[] = [
    {
      id: 'frame-diy',
      name: 'DIY',
      path: `${this.ASSETS_PREFIX}/assets/Frames/diy.png`,
      borderSlice: 16,
      theme: 'modern',
      sourceX: 0,
      sourceY: 128,
      width: 64,
      height: 64
    },
    {
      id: 'frame-galactic',
      name: 'Galactic',
      path: `${this.ASSETS_PREFIX}/assets/Frames/Galactic.png`,
      borderSlice: 16,
      theme: 'sci-fi',
      sourceX: 64,
      sourceY: 128,
      width: 64,
      height: 64
    },
    {
      id: 'frame-goo',
      name: 'Goo',
      path: `${this.ASSETS_PREFIX}/assets/Frames/Goo.png`,
      borderSlice: 16,
      theme: 'organic',
      sourceX: 128,
      sourceY: 128,
      width: 64,
      height: 64
    },
    {
      id: 'frame-ice',
      name: 'Ice',
      path: `${this.ASSETS_PREFIX}/assets/Frames/Ice.png`,
      borderSlice: 16,
      theme: 'crystal',
      sourceX: 192,
      sourceY: 128,
      width: 64,
      height: 64
    },
    {
      id: 'frame-leafy',
      name: 'Leafy',
      path: `${this.ASSETS_PREFIX}/assets/Frames/Leafy.png`,
      borderSlice: 16,
      theme: 'nature',
      sourceX: 256,
      sourceY: 128,
      width: 64,
      height: 64
    },
    {
      id: 'frame-scroll',
      name: 'Scroll',
      path: `${this.ASSETS_PREFIX}/assets/Frames/Scroll.png`,
      borderSlice: 16,
      theme: 'parchment',
      sourceX: 320,
      sourceY: 128,
      width: 64,
      height: 64
    },
    {
      id: 'frame-skull',
      name: 'Skull',
      path: `${this.ASSETS_PREFIX}/assets/Frames/Skull.png`,
      borderSlice: 16,
      theme: 'dark',
      sourceX: 384,
      sourceY: 128,
      width: 64,
      height: 64
    },
    {
      id: 'frame-wood',
      name: 'Wood',
      path: `${this.ASSETS_PREFIX}/assets/Frames/Wood.png`,
      borderSlice: 16,
      theme: 'wood',
      sourceX: 448,
      sourceY: 128,
      width: 64,
      height: 64
    }
  ];

  constructor() {
    this.preloadCriticalAssets();
  }

  /**
   * Get assets prefix based on protocol (file:// vs http://)
   */
  private getAssetsPrefix(): string {
    if (typeof window !== 'undefined') {
      return window.location.protocol === 'file:' ? 'public' : '';
    }
    return '';
  }

  /**
   * Preload critical assets on initialization
   */
  private async preloadCriticalAssets(): Promise<void> {
    this.state.loading = true;
    
    try {
      // Preload the main atlas and beaver icon
      await Promise.all([
        this.loadAsset('frames-and-buttons'),
        this.loadAsset('beaver-icon')
      ]);
      
      this.state.loaded = true;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to load assets';
      console.error('Asset preload failed:', error);
    } finally {
      this.state.loading = false;
    }
  }

  /**
   * Load an asset by ID
   */
  async loadAsset(assetId: string): Promise<HTMLImageElement> {
    // Check cache first
    if (this.state.cache[assetId]) {
      return this.state.cache[assetId];
    }

    // Check if already loading
    if (this.loadingPromises.has(assetId)) {
      return this.loadingPromises.get(assetId)!;
    }

    // Find asset config
    const config = this.UI_ASSETS.find(asset => asset.id === assetId);
    if (!config) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    // Create loading promise
    const loadPromise = this.loadImage(config.path);
    this.loadingPromises.set(assetId, loadPromise);

    try {
      const image = await loadPromise;
      this.state.cache[assetId] = image;
      return image;
    } finally {
      this.loadingPromises.delete(assetId);
    }
  }

  /**
   * Load image from path
   */
  private loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      
      // Set crossOrigin for CORS support
      image.crossOrigin = 'anonymous';
      image.src = path;
    });
  }

  /**
   * Get button configuration by ID
   */
  getButtonConfig(buttonId: string): ButtonConfig | undefined {
    return this.BUTTON_CONFIGS.find(config => config.id === buttonId);
  }

  /**
   * Get all button configurations by size
   */
  getButtonsBySize(size: 'small' | 'wide' | 'themed'): ButtonConfig[] {
    return this.BUTTON_CONFIGS.filter(config => config.size === size);
  }

  /**
   * Get frame configuration by ID
   */
  getFrameConfig(frameId: string): FrameConfig | undefined {
    return this.FRAME_CONFIGS.find(config => config.id === frameId);
  }

  /**
   * Get all frame configurations by theme
   */
  getFramesByTheme(theme: string): FrameConfig[] {
    return this.FRAME_CONFIGS.filter(config => config.theme === theme);
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): string[] {
    return [...new Set(this.FRAME_CONFIGS.map(config => config.theme))];
  }

  /**
   * Get CSS background properties for a button state
   */
  getButtonBackground(buttonId: string, state: keyof ButtonState = 'normal'): string {
    const config = this.getButtonConfig(buttonId);
    if (!config) {
      throw new Error(`Button not found: ${buttonId}`);
    }

    const atlas = this.state.cache['frames-and-buttons'];
    if (!atlas) {
      throw new Error('Atlas not loaded');
    }

    const stateKey = config.states[state];
    if (!stateKey) {
      throw new Error(`Button state not found: ${state} for ${buttonId}`);
    }

    // Calculate source position based on state
    let sourceY = config.sourceY;
    if (state === 'hover' || state === 'pressed') {
      sourceY += config.height; // Move to active state row
    }

    return `url('${atlas.src}') -${config.sourceX}px -${sourceY}px`;
  }

  /**
   * Get CSS border-image properties for a frame
   */
  getFrameBorderImage(frameId: string): string {
    const config = this.getFrameConfig(frameId);
    if (!config) {
      throw new Error(`Frame not found: ${frameId}`);
    }

    return `url('${config.path}') ${config.borderSlice} fill`;
  }

  /**
   * Get current state
   */
  getState(): AssetManagerState {
    return { ...this.state };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.state.cache = {};
  }

  /**
   * Check if asset is loaded
   */
  isAssetLoaded(assetId: string): boolean {
    return !!this.state.cache[assetId];
  }

  /**
   * Get loading progress
   */
  getLoadingProgress(): number {
    const totalAssets = this.UI_ASSETS.length;
    const loadedAssets = Object.keys(this.state.cache).length;
    return totalAssets > 0 ? (loadedAssets / totalAssets) * 100 : 0;
  }
}

// Export singleton instance
export const assetManager = new AssetManager();

// Export types for external use
export type { AssetConfig, ButtonConfig, FrameConfig, AssetManagerState };
