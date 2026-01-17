/**
 * Theme Management System for Scrypture
 * Handles theme switching, user preferences, and theme data for UI components
 */

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  category: 'frame' | 'button' | 'global';
  frameId?: string;
  buttonTheme?: 'body' | 'mind' | 'soul';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
  };
}

export interface ThemePreferences {
  currentFrameTheme: string;
  currentButtonTheme: 'body' | 'mind' | 'soul';
  autoSwitch: boolean;
  lastUpdated: string;
}

export interface ThemeManagerState {
  currentFrameTheme: string;
  currentButtonTheme: 'body' | 'mind' | 'soul';
  availableThemes: ThemeConfig[];
  preferences: ThemePreferences;
  loading: boolean;
  error: string | null;
}

class ThemeManager {
  private state: ThemeManagerState = {
    currentFrameTheme: 'wood',
    currentButtonTheme: 'body',
    availableThemes: [],
    preferences: {
      currentFrameTheme: 'wood',
      currentButtonTheme: 'body',
      autoSwitch: false,
      lastUpdated: new Date().toISOString()
    },
    loading: false,
    error: null
  };

  private readonly STORAGE_KEY = 'scrypture-theme-preferences';
  private readonly DEFAULT_FRAME_THEMES: ThemeConfig[] = [
    {
      id: 'diy',
      name: 'DIY',
      description: 'Rustic wooden DIY frame with a handmade feel',
      category: 'frame',
      frameId: 'frame-diy',
      colors: {
        primary: '#8B4513',
        secondary: '#A0522D',
        accent: '#CD853F',
        background: '#F5DEB3',
        text: '#2F2F2F',
        border: '#654321'
      },
      metadata: {
        tags: ['wooden', 'rustic', 'handmade']
      }
    },
    {
      id: 'galactic',
      name: 'Galactic',
      description: 'Futuristic space-themed frame with cosmic elements',
      category: 'frame',
      frameId: 'frame-galactic',
      colors: {
        primary: '#1E3A8A',
        secondary: '#3B82F6',
        accent: '#60A5FA',
        background: '#0F172A',
        text: '#E2E8F0',
        border: '#1E40AF'
      },
      metadata: {
        tags: ['futuristic', 'space', 'cosmic']
      }
    },
    {
      id: 'goo',
      name: 'Goo',
      description: 'Organic, slimy frame with gooey textures',
      category: 'frame',
      frameId: 'frame-goo',
      colors: {
        primary: '#059669',
        secondary: '#10B981',
        accent: '#34D399',
        background: '#ECFDF5',
        text: '#064E3B',
        border: '#047857'
      },
      metadata: {
        tags: ['organic', 'slimy', 'gooey']
      }
    },
    {
      id: 'ice',
      name: 'Ice',
      description: 'Crystalline ice frame with frosty appearance',
      category: 'frame',
      frameId: 'frame-ice',
      colors: {
        primary: '#0EA5E9',
        secondary: '#38BDF8',
        accent: '#7DD3FC',
        background: '#F0F9FF',
        text: '#0C4A6E',
        border: '#0284C7'
      },
      metadata: {
        tags: ['crystalline', 'frosty', 'cold']
      }
    },
    {
      id: 'leafy',
      name: 'Leafy',
      description: 'Natural leafy frame with organic plant elements',
      category: 'frame',
      frameId: 'frame-leafy',
      colors: {
        primary: '#166534',
        secondary: '#22C55E',
        accent: '#4ADE80',
        background: '#F0FDF4',
        text: '#14532D',
        border: '#16A34A'
      },
      metadata: {
        tags: ['natural', 'organic', 'plant']
      }
    },
    {
      id: 'scroll',
      name: 'Scroll',
      description: 'Ancient parchment scroll frame with mystical elements',
      category: 'frame',
      frameId: 'frame-scroll',
      colors: {
        primary: '#92400E',
        secondary: '#F59E0B',
        accent: '#FBBF24',
        background: '#FFFBEB',
        text: '#451A03',
        border: '#D97706'
      },
      metadata: {
        tags: ['ancient', 'parchment', 'mystical']
      }
    },
    {
      id: 'skull',
      name: 'Skull',
      description: 'Dark skull-themed frame with gothic elements',
      category: 'frame',
      frameId: 'frame-skull',
      colors: {
        primary: '#374151',
        secondary: '#6B7280',
        accent: '#9CA3AF',
        background: '#F9FAFB',
        text: '#111827',
        border: '#4B5563'
      },
      metadata: {
        tags: ['dark', 'gothic', 'skull']
      }
    },
    {
      id: 'wood',
      name: 'Wood',
      description: 'Classic wooden frame with natural grain',
      category: 'frame',
      frameId: 'frame-wood',
      colors: {
        primary: '#8B4513',
        secondary: '#A0522D',
        accent: '#CD853F',
        background: '#F5DEB3',
        text: '#2F2F2F',
        border: '#654321'
      },
      metadata: {
        tags: ['classic', 'wooden', 'natural']
      }
    }
  ];

  private readonly BUTTON_THEMES: ThemeConfig[] = [
    {
      id: 'body',
      name: 'Body',
      description: 'Red-themed buttons representing physical attributes',
      category: 'button',
      buttonTheme: 'body',
      colors: {
        primary: '#DC2626',
        secondary: '#EF4444',
        accent: '#F87171',
        background: '#FEF2F2',
        text: '#7F1D1D',
        border: '#B91C1C'
      },
      metadata: {
        tags: ['physical', 'strength', 'red']
      }
    },
    {
      id: 'mind',
      name: 'Mind',
      description: 'Green-themed buttons representing mental attributes',
      category: 'button',
      buttonTheme: 'mind',
      colors: {
        primary: '#059669',
        secondary: '#10B981',
        accent: '#34D399',
        background: '#F0FDF4',
        text: '#064E3B',
        border: '#047857'
      },
      metadata: {
        tags: ['mental', 'intelligence', 'green']
      }
    },
    {
      id: 'soul',
      name: 'Soul',
      description: 'Brown-themed buttons representing spiritual attributes',
      category: 'button',
      buttonTheme: 'soul',
      colors: {
        primary: '#92400E',
        secondary: '#F59E0B',
        accent: '#FBBF24',
        background: '#FFFBEB',
        text: '#451A03',
        border: '#D97706'
      },
      metadata: {
        tags: ['spiritual', 'wisdom', 'brown']
      }
    }
  ];

  constructor() {
    this.initializeThemes();
    this.loadPreferences();
  }

  private initializeThemes(): void {
    this.state.availableThemes = [
      ...this.DEFAULT_FRAME_THEMES,
      ...this.BUTTON_THEMES
    ];
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const preferences: ThemePreferences = JSON.parse(stored);
        this.state.preferences = {
          ...this.state.preferences,
          ...preferences
        };
        this.state.currentFrameTheme = preferences.currentFrameTheme;
        this.state.currentButtonTheme = preferences.currentButtonTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      const preferences: ThemePreferences = {
        currentFrameTheme: this.state.currentFrameTheme,
        currentButtonTheme: this.state.currentButtonTheme,
        autoSwitch: this.state.preferences.autoSwitch,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      this.state.preferences = preferences;
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }

  // Public API methods
  getState(): ThemeManagerState {
    return { ...this.state };
  }

  getCurrentFrameTheme(): string {
    return this.state.currentFrameTheme;
  }

  getCurrentButtonTheme(): 'body' | 'mind' | 'soul' {
    return this.state.currentButtonTheme;
  }

  getFrameThemeConfig(themeId: string): ThemeConfig | undefined {
    return this.state.availableThemes.find(
      theme => theme.category === 'frame' && theme.id === themeId
    );
  }

  getButtonThemeConfig(themeId: 'body' | 'mind' | 'soul'): ThemeConfig | undefined {
    return this.state.availableThemes.find(
      theme => theme.category === 'button' && theme.buttonTheme === themeId
    );
  }

  getAvailableFrameThemes(): ThemeConfig[] {
    return this.state.availableThemes.filter(theme => theme.category === 'frame');
  }

  getAvailableButtonThemes(): ThemeConfig[] {
    return this.state.availableThemes.filter(theme => theme.category === 'button');
  }

  setFrameTheme(themeId: string): boolean {
    const theme = this.getFrameThemeConfig(themeId);
    if (!theme) {
      this.state.error = `Frame theme '${themeId}' not found`;
      return false;
    }

    this.state.currentFrameTheme = themeId;
    this.state.error = null;
    this.savePreferences();
    this.notifyThemeChange();
    return true;
  }

  setButtonTheme(themeId: 'body' | 'mind' | 'soul'): boolean {
    const theme = this.getButtonThemeConfig(themeId);
    if (!theme) {
      this.state.error = `Button theme '${themeId}' not found`;
      return false;
    }

    this.state.currentButtonTheme = themeId;
    this.state.error = null;
    this.savePreferences();
    this.notifyThemeChange();
    return true;
  }

  setAutoSwitch(enabled: boolean): void {
    this.state.preferences.autoSwitch = enabled;
    this.savePreferences();
  }

  getAutoSwitch(): boolean {
    return this.state.preferences.autoSwitch;
  }

  getCurrentColors(): { frame: ThemeConfig['colors']; button: ThemeConfig['colors'] } {
    const frameTheme = this.getFrameThemeConfig(this.state.currentFrameTheme);
    const buttonTheme = this.getButtonThemeConfig(this.state.currentButtonTheme);

    return {
      frame: frameTheme?.colors || this.DEFAULT_FRAME_THEMES[0].colors,
      button: buttonTheme?.colors || this.BUTTON_THEMES[0].colors
    };
  }

  resetToDefaults(): void {
    this.state.currentFrameTheme = 'wood';
    this.state.currentButtonTheme = 'body';
    this.state.preferences.autoSwitch = false;
    this.state.error = null;
    this.savePreferences();
    this.notifyThemeChange();
  }

  private notifyThemeChange(): void {
    // Dispatch custom event for theme change
    const event = new CustomEvent('themeChange', {
      detail: {
        frameTheme: this.state.currentFrameTheme,
        buttonTheme: this.state.currentButtonTheme,
        colors: this.getCurrentColors()
      }
    });
    window.dispatchEvent(event);
  }

  // Theme validation and utilities
  validateTheme(themeId: string): boolean {
    return this.state.availableThemes.some(theme => theme.id === themeId);
  }

  getThemeMetadata(themeId: string): ThemeConfig['metadata'] | undefined {
    const theme = this.state.availableThemes.find(t => t.id === themeId);
    return theme?.metadata;
  }

  searchThemes(query: string): ThemeConfig[] {
    const lowerQuery = query.toLowerCase();
    return this.state.availableThemes.filter(theme =>
      theme.name.toLowerCase().includes(lowerQuery) ||
      theme.description.toLowerCase().includes(lowerQuery) ||
      theme.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getThemesByCategory(category: 'frame' | 'button' | 'global'): ThemeConfig[] {
    return this.state.availableThemes.filter(theme => theme.category === category);
  }
}

export const themeManager = new ThemeManager();
