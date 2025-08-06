import { HeightMapConfig } from './HeightMap';

export interface MapGeneratorConfig {
  width: number;
  height: number;
  seed?: number;
  terrainTypes: {
    grass: number;
    stone: number;
    water: number;
    sand: number;
  };
  features: {
    structures: boolean;
    trees: boolean;
    waterBodies: boolean;
    elevation: boolean;
  };
  heightMap?: HeightMapConfig; // New: Height map configuration
  zLevels?: {
    enabled: boolean;
    maxLevels: number;
    structureHeight: number;
  };
} 