// Isometric Sandbox Sheet Configuration
// This file contains the tile mapping data for the isometric sandbox sheet

export interface IsometricTileData {
  id: number;
  name: string;
  type: 'cube' | 'ramp' | 'corner' | 'staircase' | 'flat' | 'pillar' | 'water';
  palette: 'green' | 'gray' | 'orange' | 'blue';
  sourceX: number;
  sourceY: number;
  width: number;
  height: number;
  isometric: boolean;
}

export const ISOMETRIC_TILES: IsometricTileData[] = [
  // Green Palette (Rows 1-3)
  // Row 1
  { id: 1, name: 'Green Cube 1', type: 'cube', palette: 'green', sourceX: 0, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 2, name: 'Green Flat 1', type: 'flat', palette: 'green', sourceX: 32, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 3, name: 'Green Ramp Left', type: 'ramp', palette: 'green', sourceX: 64, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 4, name: 'Green Corner Left', type: 'corner', palette: 'green', sourceX: 96, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 5, name: 'Green Staircase', type: 'staircase', palette: 'green', sourceX: 128, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 6, name: 'Green Pillar 1', type: 'pillar', palette: 'green', sourceX: 160, sourceY: 0, width: 32, height: 32, isometric: true },
  
  // Row 2
  { id: 7, name: 'Green Cube 2', type: 'cube', palette: 'green', sourceX: 0, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 8, name: 'Green Flat 2', type: 'flat', palette: 'green', sourceX: 32, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 9, name: 'Green Ramp Right', type: 'ramp', palette: 'green', sourceX: 64, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 10, name: 'Green Corner Right', type: 'corner', palette: 'green', sourceX: 96, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 11, name: 'Green Cube 3', type: 'cube', palette: 'green', sourceX: 128, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 12, name: 'Green Pillar 2', type: 'pillar', palette: 'green', sourceX: 160, sourceY: 32, width: 32, height: 32, isometric: true },
  
  // Row 3
  { id: 13, name: 'Green Cube 4', type: 'cube', palette: 'green', sourceX: 0, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 14, name: 'Green Flat 3', type: 'flat', palette: 'green', sourceX: 32, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 15, name: 'Green Cube 5', type: 'cube', palette: 'green', sourceX: 64, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 16, name: 'Green Cube 6', type: 'cube', palette: 'green', sourceX: 96, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 17, name: 'Green Cube 7', type: 'cube', palette: 'green', sourceX: 128, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 18, name: 'Green Cube 8', type: 'cube', palette: 'green', sourceX: 160, sourceY: 64, width: 32, height: 32, isometric: true },
  
  // Gray Palette (Rows 4-6) - Previously Orange
  // Row 4
  { id: 19, name: 'Gray Cube 1', type: 'cube', palette: 'gray', sourceX: 0, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 20, name: 'Gray Flat 1', type: 'flat', palette: 'gray', sourceX: 32, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 21, name: 'Gray Ramp Left', type: 'ramp', palette: 'gray', sourceX: 64, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 22, name: 'Gray Corner Left', type: 'corner', palette: 'gray', sourceX: 96, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 23, name: 'Gray Staircase', type: 'staircase', palette: 'gray', sourceX: 128, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 24, name: 'Gray Pillar 1', type: 'pillar', palette: 'gray', sourceX: 160, sourceY: 96, width: 32, height: 32, isometric: true },
  
  // Row 5
  { id: 25, name: 'Gray Cube 2', type: 'cube', palette: 'gray', sourceX: 0, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 26, name: 'Gray Flat 2', type: 'flat', palette: 'gray', sourceX: 32, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 27, name: 'Gray Ramp Right', type: 'ramp', palette: 'gray', sourceX: 64, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 28, name: 'Gray Corner Right', type: 'corner', palette: 'gray', sourceX: 96, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 29, name: 'Gray Cube 3', type: 'cube', palette: 'gray', sourceX: 128, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 30, name: 'Gray Pillar 2', type: 'pillar', palette: 'gray', sourceX: 160, sourceY: 128, width: 32, height: 32, isometric: true },
  
  // Row 6
  { id: 31, name: 'Gray Cube 4', type: 'cube', palette: 'gray', sourceX: 0, sourceY: 160, width: 32, height: 32, isometric: true },
  { id: 32, name: 'Gray Flat 3', type: 'flat', palette: 'gray', sourceX: 32, sourceY: 160, width: 32, height: 32, isometric: true },
  { id: 33, name: 'Gray Cube 5', type: 'cube', palette: 'gray', sourceX: 64, sourceY: 160, width: 32, height: 32, isometric: true },
  { id: 34, name: 'Gray Cube 6', type: 'cube', palette: 'gray', sourceX: 96, sourceY: 160, width: 32, height: 32, isometric: true },
  { id: 35, name: 'Gray Cube 7', type: 'cube', palette: 'gray', sourceX: 128, sourceY: 160, width: 32, height: 32, isometric: true },
  { id: 36, name: 'Gray Cube 8', type: 'cube', palette: 'gray', sourceX: 160, sourceY: 160, width: 32, height: 32, isometric: true },
  
  // Orange Palette (Rows 7-9) - Previously Gray
  // Row 7
  { id: 37, name: 'Orange Cube 1', type: 'cube', palette: 'orange', sourceX: 0, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 38, name: 'Orange Flat 1', type: 'flat', palette: 'orange', sourceX: 32, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 39, name: 'Orange Ramp Left', type: 'ramp', palette: 'orange', sourceX: 64, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 40, name: 'Orange Corner Left', type: 'corner', palette: 'orange', sourceX: 96, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 41, name: 'Orange Staircase', type: 'staircase', palette: 'orange', sourceX: 128, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 42, name: 'Orange Pillar 1', type: 'pillar', palette: 'orange', sourceX: 160, sourceY: 192, width: 32, height: 32, isometric: true },
  
  // Row 8
  { id: 43, name: 'Orange Cube 2', type: 'cube', palette: 'orange', sourceX: 0, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 44, name: 'Orange Flat 2', type: 'flat', palette: 'orange', sourceX: 32, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 45, name: 'Orange Ramp Right', type: 'ramp', palette: 'orange', sourceX: 64, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 46, name: 'Orange Corner Right', type: 'corner', palette: 'orange', sourceX: 96, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 47, name: 'Orange Cube 3', type: 'cube', palette: 'orange', sourceX: 128, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 48, name: 'Orange Pillar 2', type: 'pillar', palette: 'orange', sourceX: 160, sourceY: 224, width: 32, height: 32, isometric: true },
  
  // Row 9
  { id: 49, name: 'Orange Cube 4', type: 'cube', palette: 'orange', sourceX: 0, sourceY: 256, width: 32, height: 32, isometric: true },
  { id: 50, name: 'Orange Flat 3', type: 'flat', palette: 'orange', sourceX: 32, sourceY: 256, width: 32, height: 32, isometric: true },
  { id: 51, name: 'Orange Cube 5', type: 'cube', palette: 'orange', sourceX: 64, sourceY: 256, width: 32, height: 32, isometric: true },
  { id: 52, name: 'Orange Cube 6', type: 'cube', palette: 'orange', sourceX: 96, sourceY: 256, width: 32, height: 32, isometric: true },
  { id: 53, name: 'Orange Cube 7', type: 'cube', palette: 'orange', sourceX: 128, sourceY: 256, width: 32, height: 32, isometric: true },
  { id: 54, name: 'Orange Cube 8', type: 'cube', palette: 'orange', sourceX: 160, sourceY: 256, width: 32, height: 32, isometric: true },
  
  // Water Blocks (Row 3 - coordinates 0,64 96,64 64,64 32,64)
  { id: 55, name: 'Water Block 1', type: 'water', palette: 'blue', sourceX: 0, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 56, name: 'Water Block 2', type: 'water', palette: 'blue', sourceX: 96, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 57, name: 'Water Block 3', type: 'water', palette: 'blue', sourceX: 64, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 58, name: 'Water Block 4', type: 'water', palette: 'blue', sourceX: 32, sourceY: 64, width: 32, height: 32, isometric: true },
];

export const TILE_SHEET_CONFIG = {
  imagePath: '/assets/Tilemaps/isometric-sandbox-sheet.png',
  tileWidth: 32,
  tileHeight: 32,
  sheetWidth: 192, // 6 columns * 32px = 192px
  sheetHeight: 288, // 9 rows * 32px = 288px
  isometric: true,
};

export const getTileById = (id: number): IsometricTileData | undefined => {
  return ISOMETRIC_TILES.find(tile => tile.id === id);
};

export const getTilesByType = (type: IsometricTileData['type']): IsometricTileData[] => {
  return ISOMETRIC_TILES.filter(tile => tile.type === type);
};

export const getTilesByPalette = (palette: IsometricTileData['palette']): IsometricTileData[] => {
  return ISOMETRIC_TILES.filter(tile => tile.palette === palette);
}; 