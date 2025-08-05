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

// Tile sheet configuration
export const TILE_SHEET_CONFIG = {
  imagePath: '/assets/Tilemaps/isometric-sandbox-sheet.png',
  tileWidth: 32,
  tileHeight: 32,
  sheetWidth: 192, // 6 columns * 32px = 192px
  sheetHeight: 288, // 9 rows * 32px = 288px
  isometric: true,
};

// Updated tile data with correct naming convention (excluding empty sprites)
export const ISOMETRIC_TILES: IsometricTileData[] = [
  // Green Palette (Rows 1-3)
  // Row 1: [Cube][Half Cube][Slope North][Slope East][Stairs East][Stairs North]
  { id: 1, name: 'Cube', type: 'cube', palette: 'green', sourceX: 0, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 2, name: 'Half Cube', type: 'cube', palette: 'green', sourceX: 32, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 3, name: 'Slope North', type: 'ramp', palette: 'green', sourceX: 64, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 4, name: 'Slope East', type: 'ramp', palette: 'green', sourceX: 96, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 5, name: 'Stairs East', type: 'staircase', palette: 'green', sourceX: 128, sourceY: 0, width: 32, height: 32, isometric: true },
  { id: 6, name: 'Stairs North', type: 'staircase', palette: 'green', sourceX: 160, sourceY: 0, width: 32, height: 32, isometric: true },
  
  // Row 2: [Curb][Flat][Slope West][Slope South][Wall North][Wall South]
  { id: 7, name: 'Curb', type: 'corner', palette: 'green', sourceX: 0, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 8, name: 'Flat', type: 'flat', palette: 'green', sourceX: 32, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 9, name: 'Slope West', type: 'ramp', palette: 'green', sourceX: 64, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 10, name: 'Slope South', type: 'ramp', palette: 'green', sourceX: 96, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 11, name: 'Wall North', type: 'cube', palette: 'green', sourceX: 128, sourceY: 32, width: 32, height: 32, isometric: true },
  { id: 12, name: 'Wall South', type: 'cube', palette: 'green', sourceX: 160, sourceY: 32, width: 32, height: 32, isometric: true },
  
  // Row 3: [x][x][x][x][Wall West][Wall East] - Only valid tiles (excluding empty sprites)
  { id: 17, name: 'Wall West', type: 'cube', palette: 'green', sourceX: 128, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 18, name: 'Wall East', type: 'cube', palette: 'green', sourceX: 160, sourceY: 64, width: 32, height: 32, isometric: true },
  
  // Gray Palette (Rows 4-6) - Same naming pattern
  // Row 4: [Cube][Half Cube][Slope North][Slope East][Stairs East][Stairs North]
  { id: 19, name: 'Cube', type: 'cube', palette: 'gray', sourceX: 0, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 20, name: 'Half Cube', type: 'cube', palette: 'gray', sourceX: 32, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 21, name: 'Slope North', type: 'ramp', palette: 'gray', sourceX: 64, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 22, name: 'Slope East', type: 'ramp', palette: 'gray', sourceX: 96, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 23, name: 'Stairs East', type: 'staircase', palette: 'gray', sourceX: 128, sourceY: 96, width: 32, height: 32, isometric: true },
  { id: 24, name: 'Stairs North', type: 'staircase', palette: 'gray', sourceX: 160, sourceY: 96, width: 32, height: 32, isometric: true },
  
  // Row 5: [Curb][Flat][Slope West][Slope South][Wall North][Wall South]
  { id: 25, name: 'Curb', type: 'corner', palette: 'gray', sourceX: 0, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 26, name: 'Flat', type: 'flat', palette: 'gray', sourceX: 32, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 27, name: 'Slope West', type: 'ramp', palette: 'gray', sourceX: 64, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 28, name: 'Slope South', type: 'ramp', palette: 'gray', sourceX: 96, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 29, name: 'Wall North', type: 'cube', palette: 'gray', sourceX: 128, sourceY: 128, width: 32, height: 32, isometric: true },
  { id: 30, name: 'Wall South', type: 'cube', palette: 'gray', sourceX: 160, sourceY: 128, width: 32, height: 32, isometric: true },
  
  // Row 6: [x][x][x][x][Wall West][Wall East] - Only valid tiles (excluding empty sprites)
  { id: 35, name: 'Wall West', type: 'cube', palette: 'gray', sourceX: 128, sourceY: 160, width: 32, height: 32, isometric: true },
  { id: 36, name: 'Wall East', type: 'cube', palette: 'gray', sourceX: 160, sourceY: 160, width: 32, height: 32, isometric: true },
  
  // Orange Palette (Rows 7-9) - Same naming pattern with pillars
  // Row 7: [Cube][Half Cube][Slope North][Slope East][Stairs East][Stairs North]
  { id: 37, name: 'Cube', type: 'cube', palette: 'orange', sourceX: 0, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 38, name: 'Half Cube', type: 'cube', palette: 'orange', sourceX: 32, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 39, name: 'Slope North', type: 'ramp', palette: 'orange', sourceX: 64, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 40, name: 'Slope East', type: 'ramp', palette: 'orange', sourceX: 96, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 41, name: 'Stairs East', type: 'staircase', palette: 'orange', sourceX: 128, sourceY: 192, width: 32, height: 32, isometric: true },
  { id: 42, name: 'Stairs North', type: 'staircase', palette: 'orange', sourceX: 160, sourceY: 192, width: 32, height: 32, isometric: true },
  
  // Row 8: [Curb][Flat][Slope West][Slope South][Wall North][Wall South]
  { id: 43, name: 'Curb', type: 'corner', palette: 'orange', sourceX: 0, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 44, name: 'Flat', type: 'flat', palette: 'orange', sourceX: 32, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 45, name: 'Slope West', type: 'ramp', palette: 'orange', sourceX: 64, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 46, name: 'Slope South', type: 'ramp', palette: 'orange', sourceX: 96, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 47, name: 'Wall North', type: 'cube', palette: 'orange', sourceX: 128, sourceY: 224, width: 32, height: 32, isometric: true },
  { id: 48, name: 'Wall South', type: 'cube', palette: 'orange', sourceX: 160, sourceY: 224, width: 32, height: 32, isometric: true },
  
  // Row 9: [Pillar Long][Pillar Short][x][x][Wall West][Wall East] - Orange has pillars (excluding empty sprites)
  { id: 49, name: 'Pillar Long', type: 'pillar', palette: 'orange', sourceX: 0, sourceY: 256, width: 32, height: 32, isometric: true },
  { id: 50, name: 'Pillar Short', type: 'pillar', palette: 'orange', sourceX: 32, sourceY: 256, width: 32, height: 32, isometric: true },
  { id: 53, name: 'Wall West', type: 'cube', palette: 'orange', sourceX: 128, sourceY: 256, width: 32, height: 32, isometric: true },
  { id: 54, name: 'Wall East', type: 'cube', palette: 'orange', sourceX: 160, sourceY: 256, width: 32, height: 32, isometric: true },
  
  // Water Blocks - Only valid water tiles
  { id: 55, name: 'Water Block 1', type: 'water', palette: 'blue', sourceX: 0, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 56, name: 'Water Block 2', type: 'water', palette: 'blue', sourceX: 96, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 57, name: 'Water Block 3', type: 'water', palette: 'blue', sourceX: 64, sourceY: 64, width: 32, height: 32, isometric: true },
  { id: 58, name: 'Water Block 4', type: 'water', palette: 'blue', sourceX: 32, sourceY: 64, width: 32, height: 32, isometric: true },
];

export const getTileById = (id: number): IsometricTileData | undefined => {
  return ISOMETRIC_TILES.find(tile => tile.id === id);
};

export const getTilesByType = (type: IsometricTileData['type']): IsometricTileData[] => {
  return ISOMETRIC_TILES.filter(tile => tile.type === type);
};

export const getTilesByPalette = (palette: IsometricTileData['palette']): IsometricTileData[] => {
  return ISOMETRIC_TILES.filter(tile => tile.palette === palette);
}; 