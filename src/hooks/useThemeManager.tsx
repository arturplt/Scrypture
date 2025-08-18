/**
 * React hook for integrating ThemeManager with React components
 */

import { useState, useEffect, useCallback } from 'react';
import { themeManager, ThemeManagerState, ThemeConfig } from '../utils/themeManager';

export interface UseThemeManagerReturn {
  state: ThemeManagerState;
  setFrameTheme: (themeId: string) => boolean;
  setButtonTheme: (themeId: 'body' | 'mind' | 'soul') => boolean;
  setAutoSwitch: (enabled: boolean) => void;
  getFrameThemeConfig: (themeId: string) => ThemeConfig | undefined;
  getButtonThemeConfig: (themeId: 'body' | 'mind' | 'soul') => ThemeConfig | undefined;
  getAvailableFrameThemes: () => ThemeConfig[];
  getAvailableButtonThemes: () => ThemeConfig[];
  getCurrentColors: () => { frame: ThemeConfig['colors']; button: ThemeConfig['colors'] };
  resetToDefaults: () => void;
  validateTheme: (themeId: string) => boolean;
  getThemeMetadata: (themeId: string) => ThemeConfig['metadata'] | undefined;
  searchThemes: (query: string) => ThemeConfig[];
  getThemesByCategory: (category: 'frame' | 'button' | 'global') => ThemeConfig[];
}

export const useThemeManager = (): UseThemeManagerReturn => {
  const [state, setState] = useState<ThemeManagerState>(themeManager.getState());

  // Poll for state changes (since ThemeManager doesn't have built-in reactivity)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = themeManager.getState();
      setState(currentState);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Listen for theme change events
  useEffect(() => {
    const handleThemeChange = () => {
      setState(themeManager.getState());
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const setFrameTheme = useCallback((themeId: string): boolean => {
    const success = themeManager.setFrameTheme(themeId);
    if (success) {
      setState(themeManager.getState());
    }
    return success;
  }, []);

  const setButtonTheme = useCallback((themeId: 'body' | 'mind' | 'soul'): boolean => {
    const success = themeManager.setButtonTheme(themeId);
    if (success) {
      setState(themeManager.getState());
    }
    return success;
  }, []);

  const setAutoSwitch = useCallback((enabled: boolean): void => {
    themeManager.setAutoSwitch(enabled);
    setState(themeManager.getState());
  }, []);

  const getFrameThemeConfig = useCallback((themeId: string): ThemeConfig | undefined => {
    return themeManager.getFrameThemeConfig(themeId);
  }, []);

  const getButtonThemeConfig = useCallback((themeId: 'body' | 'mind' | 'soul'): ThemeConfig | undefined => {
    return themeManager.getButtonThemeConfig(themeId);
  }, []);

  const getAvailableFrameThemes = useCallback((): ThemeConfig[] => {
    return themeManager.getAvailableFrameThemes();
  }, []);

  const getAvailableButtonThemes = useCallback((): ThemeConfig[] => {
    return themeManager.getAvailableButtonThemes();
  }, []);

  const getCurrentColors = useCallback((): { frame: ThemeConfig['colors']; button: ThemeConfig['colors'] } => {
    return themeManager.getCurrentColors();
  }, []);

  const resetToDefaults = useCallback((): void => {
    themeManager.resetToDefaults();
    setState(themeManager.getState());
  }, []);

  const validateTheme = useCallback((themeId: string): boolean => {
    return themeManager.validateTheme(themeId);
  }, []);

  const getThemeMetadata = useCallback((themeId: string): ThemeConfig['metadata'] | undefined => {
    return themeManager.getThemeMetadata(themeId);
  }, []);

  const searchThemes = useCallback((query: string): ThemeConfig[] => {
    return themeManager.searchThemes(query);
  }, []);

  const getThemesByCategory = useCallback((category: 'frame' | 'button' | 'global'): ThemeConfig[] => {
    return themeManager.getThemesByCategory(category);
  }, []);

  return {
    state,
    setFrameTheme,
    setButtonTheme,
    setAutoSwitch,
    getFrameThemeConfig,
    getButtonThemeConfig,
    getAvailableFrameThemes,
    getAvailableButtonThemes,
    getCurrentColors,
    resetToDefaults,
    validateTheme,
    getThemeMetadata,
    searchThemes,
    getThemesByCategory
  };
};
