import { IsometricTileData } from '../../../data/isometric-tiles';

export interface Block {
  id: string;
  type: IsometricTileData['type'];
  palette: IsometricTileData['palette'];
  position: { x: number; y: number; z: number };
  rotation: 0 | 90 | 180 | 270;
  properties: {
    walkable: boolean;
    climbable: boolean;
    interactable: boolean;
    destructible: boolean;
  };
  sprite: {
    sourceX: number;
    sourceY: number;
    width: number;
    height: number;
    sheetPath: string;
  };
} 