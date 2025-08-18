/**
 * Frame Component - 9-slice border rendering for scalable UI frames
 * Uses CSS border-image for pixel-perfect scaling of frame assets
 */

import React, { useMemo } from 'react';
import { useAssetManager } from '../../hooks/useAssetManager';

export interface FrameProps {
  /** Frame ID from the asset manager */
  frameId: string;
  /** Width of the frame in pixels */
  width?: number | string;
  /** Height of the frame in pixels */
  height?: number | string;
  /** Scale factor for the frame (1x, 2x, 4x) */
  scale?: 1 | 2 | 4;
  /** Corner thickness in pixels (default: 16) */
  cornerThickness?: number;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Frame content */
  children?: React.ReactNode;
  /** Whether to show a loading state while assets load */
  showLoading?: boolean;
  /** Fallback content if frame fails to load */
  fallback?: React.ReactNode;
}

export const Frame: React.FC<FrameProps> = ({
  frameId,
  width = 'auto',
  height = 'auto',
  scale = 1,
  cornerThickness = 16,
  className = '',
  style = {},
  children,
  showLoading = true,
  fallback
}) => {
  const { getFrameConfig, getFrameBorderImage, isAssetLoaded } = useAssetManager();

  const frameConfig = getFrameConfig(frameId);
  const isLoaded = isAssetLoaded(frameId.replace('frame-', ''));

  const frameStyles = useMemo(() => {
    if (!frameConfig || !isLoaded) {
      return {};
    }

    const scaledCorner = cornerThickness * scale;
    const borderImage = getFrameBorderImage(frameId);

    return {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderStyle: 'solid',
      borderWidth: `${scaledCorner}px`,
      borderImage: borderImage,
      imageRendering: 'pixelated' as const,
      boxSizing: 'border-box' as const,
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      ...style
    };
  }, [frameConfig, isLoaded, frameId, width, height, scale, cornerThickness, getFrameBorderImage, style]);

  const contentStyles = useMemo(() => {
    if (!frameConfig || !isLoaded) {
      return {};
    }

    return {
      flex: 1,
      padding: `${cornerThickness * scale * 0.5}px`,
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center'
    };
  }, [frameConfig, isLoaded, cornerThickness, scale]);

  // Loading state
  if (!isLoaded && showLoading) {
    return (
      <div
        className={`frame-loading ${className}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          border: '2px dashed #666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px',
          ...style
        }}
      >
        Loading frame...
      </div>
    );
  }

  // Error state
  if (!frameConfig) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={`frame-error ${className}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          border: '2px solid #f44336',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f44336',
          fontSize: '12px',
          ...style
        }}
      >
        Frame not found: {frameId}
      </div>
    );
  }

  return (
    <div
      className={`frame frame-${frameConfig.theme} ${className}`}
      style={frameStyles}
      data-frame-id={frameId}
      data-frame-theme={frameConfig.theme}
      data-frame-scale={scale}
    >
      <div className="frame-content" style={contentStyles}>
        {children}
      </div>
    </div>
  );
};

// Export frame themes for easy access
export const FRAME_THEMES = {
  WOOD: 'frame-wood',
  DIY: 'frame-diy',
  GALACTIC: 'frame-galactic',
  GOO: 'frame-goo',
  ICE: 'frame-ice',
  LEAFY: 'frame-leafy',
  SCROLL: 'frame-scroll',
  SKULL: 'frame-skull'
} as const;

export type FrameTheme = keyof typeof FRAME_THEMES;
