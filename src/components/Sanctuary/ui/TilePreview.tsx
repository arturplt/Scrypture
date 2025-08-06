import React from 'react';
import { IsometricTileData } from '../../../data/isometric-tiles';
import { TILE_SHEET_CONFIG } from '../../../data/isometric-tiles';

interface TilePreviewProps {
  tile: IsometricTileData;
  size?: number;
  className?: string;
}

export const TilePreview: React.FC<TilePreviewProps> = ({ tile, size = 32, className }) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url('${TILE_SHEET_CONFIG.imagePath}')`,
        backgroundPosition: `-${tile.sourceX}px -${tile.sourceY}px`,
        backgroundSize: `${TILE_SHEET_CONFIG.sheetWidth}px ${TILE_SHEET_CONFIG.sheetHeight}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        display: 'inline-block'
      }}
    />
  );
}; 