import { Block, HeightMap, HeightMapConfig, MapGeneratorConfig } from '../types';
import { HeightMapGenerator } from './HeightMapSystem';

export class EnhancedProceduralMapGenerator {
  private seed: number;
  private heightMapGenerator: HeightMapGenerator;
  private heightMap: HeightMap | null = null;

  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
    this.heightMapGenerator = new HeightMapGenerator(this.seed);
  }

  private generateHeightMap(config: HeightMapConfig): HeightMap {
    console.log(`🗺️ Generating height map for terrain...`);
    return this.heightMapGenerator.generateHeightMap(config);
  }

  private getTerrainTypeFromHeightMap(x: number, y: number, heightMap: HeightMap): { 
    type: string; 
    palette: string; 
    elevation: number;
    slope: number;
  } {
    // Convert world coordinates to height map coordinates
    const mapX = ((x + heightMap.width / 2) % heightMap.width + heightMap.width) % heightMap.width;
    const mapY = ((y + heightMap.height / 2) % heightMap.height + heightMap.height) % heightMap.height;
    
    const clampedX = Math.max(0, Math.min(mapX, heightMap.width - 1));
    const clampedY = Math.max(0, Math.min(mapY, heightMap.height - 1));
    
    const height = this.heightMapGenerator.getHeightAt(heightMap, clampedX, clampedY);
    
    // Calculate slope
    const neighbors = [
      this.heightMapGenerator.getHeightAt(heightMap, Math.min(clampedX + 1, heightMap.width - 1), clampedY),
      this.heightMapGenerator.getHeightAt(heightMap, Math.max(clampedX - 1, 0), clampedY),
      this.heightMapGenerator.getHeightAt(heightMap, clampedX, Math.min(clampedY + 1, heightMap.height - 1)),
      this.heightMapGenerator.getHeightAt(heightMap, clampedX, Math.max(clampedY - 1, 0))
    ];
    
    const maxSlope = Math.max(...neighbors.map(h => Math.abs(h - height)));
    const slope = maxSlope / Math.max(heightMap.maxHeight, 1);
    
    const heightRatio = height / Math.max(heightMap.maxHeight, 1);
    
    let type: string;
    let palette: string;
    
    if (heightRatio < 0.2) {
      type = slope > 0.1 ? 'flat' : 'water';
      palette = type === 'water' ? 'blue' : 'orange';
    } else if (heightRatio < 0.4) {
      type = slope > 0.15 ? 'ramp' : 'flat';
      palette = 'green';
    } else if (heightRatio < 0.7) {
      type = slope > 0.2 ? 'ramp' : 'flat';
      palette = 'gray';
    } else {
      type = slope > 0.25 ? 'cube' : 'flat';
      palette = 'gray';
    }
    
    return {
      type,
      palette,
      elevation: Math.floor(height / 5),
      slope
    };
  }

  private shouldPlaceStructure(x: number, y: number, heightMap: HeightMap): boolean {
    const mapX = ((x + heightMap.width / 2) % heightMap.width + heightMap.width) % heightMap.width;
    const mapY = ((y + heightMap.height / 2) % heightMap.height + heightMap.height) % heightMap.height;
    const clampedX = Math.max(0, Math.min(mapX, heightMap.width - 1));
    const clampedY = Math.max(0, Math.min(mapY, heightMap.height - 1));
    const height = this.heightMapGenerator.getHeightAt(heightMap, clampedX, clampedY);
    
    const heightRatio = height / Math.max(heightMap.maxHeight, 1);
    return heightRatio > 0.3 && heightRatio < 0.7 && Math.abs(x) > 3 && Math.abs(y) > 3;
  }

  private shouldPlaceTree(x: number, y: number, heightMap: HeightMap): boolean {
    const mapX = ((x + heightMap.width / 2) % heightMap.width + heightMap.width) % heightMap.width;
    const mapY = ((y + heightMap.height / 2) % heightMap.height + heightMap.height) % heightMap.height;
    const clampedX = Math.max(0, Math.min(mapX, heightMap.width - 1));
    const clampedY = Math.max(0, Math.min(mapY, heightMap.height - 1));
    const height = this.heightMapGenerator.getHeightAt(heightMap, clampedX, clampedY);
    
    const heightRatio = height / Math.max(heightMap.maxHeight, 1);
    const treeNoise = Math.sin(x * 0.4 + y * 0.3 + this.seed) * 0.5 + 0.5;
    return heightRatio > 0.2 && heightRatio < 0.8 && treeNoise > 0.7;
  }

  generateMap(config: MapGeneratorConfig): Block[] {
    const blocks: Block[] = [];
    
    console.log(`🏗️ Starting enhanced terrain generation for ${config.width}x${config.height} map`);
    console.log(`🏗️ Seed: ${this.seed}`);

    // Generate height map if enabled
    if (config.heightMap) {
      this.heightMap = this.generateHeightMap(config.heightMap);
      console.log(`🗺️ Height map generated: ${this.heightMap.width}x${this.heightMap.height}`);
    }

    // Generate terrain blocks
    for (let x = -config.width / 2; x < config.width / 2; x++) {
      for (let y = -config.height / 2; y < config.height / 2; y++) {
        let terrainInfo: { type: string; palette: string; elevation: number; slope?: number };
        
        if (this.heightMap) {
          terrainInfo = this.getTerrainTypeFromHeightMap(x, y, this.heightMap);
        } else {
          terrainInfo = this.getTerrainTypeFallback(x, y);
        }

        // Create base terrain block
        const baseBlock: Block = {
          id: `terrain_${x}_${y}_0`,
          type: terrainInfo.type as any,
          palette: terrainInfo.palette as any,
          position: { x, y, z: 0 },
          rotation: 0,
          properties: {
            walkable: true,
            climbable: false,
            interactable: false,
            destructible: false
          },
          sprite: {
            sourceX: 0,
            sourceY: 0,
            width: 32,
            height: 32,
            sheetPath: '/assets/Tilemaps/isometric-sandbox-sheet.png'
          }
        };
        
        blocks.push(baseBlock);

        // Add elevation layers
        for (let z = 1; z <= terrainInfo.elevation; z++) {
          const elevationBlock: Block = {
            id: `terrain_${x}_${y}_${z}`,
            type: 'cube',
            palette: terrainInfo.palette as any,
            position: { x, y, z },
            rotation: 0,
            properties: {
              walkable: false,
              climbable: true,
              interactable: false,
              destructible: true
            },
            sprite: {
              sourceX: 0,
              sourceY: 0,
              width: 32,
              height: 32,
              sheetPath: '/assets/Tilemaps/isometric-sandbox-sheet.png'
            }
          };
          blocks.push(elevationBlock);
        }

        // Add features if enabled
        if (config.features.structures && this.shouldPlaceStructure(x, y, this.heightMap!)) {
          const structureBlock: Block = {
            id: `structure_${x}_${y}`,
            type: 'cube',
            palette: 'gray',
            position: { x, y, z: terrainInfo.elevation + 1 },
            rotation: 0,
            properties: {
              walkable: false,
              climbable: false,
              interactable: true,
              destructible: true
            },
            sprite: {
              sourceX: 0,
              sourceY: 0,
              width: 32,
              height: 32,
              sheetPath: '/assets/Tilemaps/isometric-sandbox-sheet.png'
            }
          };
          blocks.push(structureBlock);
        }

        if (config.features.trees && this.shouldPlaceTree(x, y, this.heightMap!)) {
          const treeBlock: Block = {
            id: `tree_${x}_${y}`,
            type: 'cube',
            palette: 'green',
            position: { x, y, z: terrainInfo.elevation + 1 },
            rotation: 0,
            properties: {
              walkable: false,
              climbable: false,
              interactable: true,
              destructible: true
            },
            sprite: {
              sourceX: 0,
              sourceY: 0,
              width: 32,
              height: 32,
              sheetPath: '/assets/Tilemaps/isometric-sandbox-sheet.png'
            }
          };
          blocks.push(treeBlock);
        }
      }
    }

    console.log(`🏗️ Generated ${blocks.length} blocks`);
    return blocks;
  }

  private getTerrainTypeFallback(x: number, y: number): { type: string; palette: string; elevation: number } {
    // Simple fallback terrain generation without height map
    const noise = Math.sin(x * 0.1 + y * 0.1 + this.seed) * 0.5 + 0.5;
    
    if (noise < 0.3) {
      return { type: 'water', palette: 'blue', elevation: 0 };
    } else if (noise < 0.6) {
      return { type: 'flat', palette: 'green', elevation: 0 };
    } else {
      return { type: 'flat', palette: 'gray', elevation: Math.floor(noise * 3) };
    }
  }

  getHeightMap(): HeightMap | null {
    return this.heightMap;
  }
} 