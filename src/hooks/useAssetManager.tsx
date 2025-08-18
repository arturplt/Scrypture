/**
 * React hook for integrating AssetManager with React components
 */

import { useState, useEffect, useCallback } from 'react';
import { assetManager, AssetManagerState, ButtonConfig, FrameConfig } from '../utils/assetManager';

export interface UseAssetManagerReturn {
  state: AssetManagerState;
  loadAsset: (assetId: string) => Promise<void>;
  getButtonConfig: (buttonId: string) => ButtonConfig | undefined;
  getButtonsBySize: (size: 'small' | 'wide' | 'themed') => ButtonConfig[];
  getFrameConfig: (frameId: string) => FrameConfig | undefined;
  getFramesByTheme: (theme: string) => FrameConfig[];
  getAvailableThemes: () => string[];
  getButtonBackground: (buttonId: string, state?: string) => string;
  getFrameBorderImage: (frameId: string) => string;
  isAssetLoaded: (assetId: string) => boolean;
  getLoadingProgress: () => number;
  clearCache: () => void;
}

export const useAssetManager = (): UseAssetManagerReturn => {
  const [state, setState] = useState<AssetManagerState>(assetManager.getState());

  // Update state when asset manager state changes
  useEffect(() => {
    const updateState = () => {
      setState(assetManager.getState());
    };

    // Initial state
    updateState();

    // Set up polling for state changes (since AssetManager doesn't emit events yet)
    const interval = setInterval(updateState, 100);

    return () => clearInterval(interval);
  }, []);

  const loadAsset = useCallback(async (assetId: string): Promise<void> => {
    try {
      await assetManager.loadAsset(assetId);
      setState(assetManager.getState());
    } catch (error) {
      console.error(`Failed to load asset ${assetId}:`, error);
      throw error;
    }
  }, []);

  const getButtonConfig = useCallback((buttonId: string): ButtonConfig | undefined => {
    return assetManager.getButtonConfig(buttonId);
  }, []);

  const getButtonsBySize = useCallback((size: 'small' | 'wide' | 'themed'): ButtonConfig[] => {
    return assetManager.getButtonsBySize(size);
  }, []);

  const getFrameConfig = useCallback((frameId: string): FrameConfig | undefined => {
    return assetManager.getFrameConfig(frameId);
  }, []);

  const getFramesByTheme = useCallback((theme: string): FrameConfig[] => {
    return assetManager.getFramesByTheme(theme);
  }, []);

  const getAvailableThemes = useCallback((): string[] => {
    return assetManager.getAvailableThemes();
  }, []);

  const getButtonBackground = useCallback((buttonId: string, state: string = 'normal'): string => {
    try {
      return assetManager.getButtonBackground(buttonId, state as any);
    } catch (error) {
      console.error(`Failed to get button background for ${buttonId}:`, error);
      return '';
    }
  }, []);

  const getFrameBorderImage = useCallback((frameId: string): string => {
    try {
      return assetManager.getFrameBorderImage(frameId);
    } catch (error) {
      console.error(`Failed to get frame border image for ${frameId}:`, error);
      return '';
    }
  }, []);

  const isAssetLoaded = useCallback((assetId: string): boolean => {
    return assetManager.isAssetLoaded(assetId);
  }, []);

  const getLoadingProgress = useCallback((): number => {
    return assetManager.getLoadingProgress();
  }, []);

  const clearCache = useCallback((): void => {
    assetManager.clearCache();
    setState(assetManager.getState());
  }, []);

  return {
    state,
    loadAsset,
    getButtonConfig,
    getButtonsBySize,
    getFrameConfig,
    getFramesByTheme,
    getAvailableThemes,
    getButtonBackground,
    getFrameBorderImage,
    isAssetLoaded,
    getLoadingProgress,
    clearCache
  };
};
