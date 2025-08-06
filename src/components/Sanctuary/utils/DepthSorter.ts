/**
 * Depth Sorting System for WebGL Isometric Rendering
 * Handles proper Z-sorting for isometric tiles to ensure correct rendering order
 */

import { Block } from '../types/Block';
import { WebGLUtils } from './WebGLUtils';

export interface SortedBlock {
  block: Block;
  depth: number;
  renderOrder: number;
}

export class DepthSorter {
  private static readonly TILE_WIDTH = 32;
  private static readonly TILE_HEIGHT = 16;

  /**
   * Sort blocks by depth for proper isometric rendering
   * Blocks with higher depth values should be rendered first (back to front)
   */
  static sortBlocksByDepth(blocks: Block[]): SortedBlock[] {
    const sortedBlocks: SortedBlock[] = blocks.map(block => ({
      block,
      depth: this.calculateBlockDepth(block),
      renderOrder: 0
    }));

    // Sort by depth (back to front)
    sortedBlocks.sort((a, b) => b.depth - a.depth);

    // Assign render order
    sortedBlocks.forEach((sortedBlock, index) => {
      sortedBlock.renderOrder = index;
    });

    return sortedBlocks;
  }

  /**
   * Calculate depth value for a block in isometric projection
   */
  static calculateBlockDepth(block: Block): number {
    const { x, y, z } = block.position;
    return WebGLUtils.calculateDepth(x, y, z, this.TILE_WIDTH, this.TILE_HEIGHT);
  }

  /**
   * Sort blocks by Z-level first, then by depth within each Z-level
   */
  static sortBlocksByZLevel(blocks: Block[]): SortedBlock[] {
    // Group blocks by Z-level
    const blocksByZLevel = new Map<number, Block[]>();
    
    blocks.forEach(block => {
      if (!blocksByZLevel.has(block.z)) {
        blocksByZLevel.set(block.z, []);
      }
      blocksByZLevel.get(block.z)!.push(block);
    });

    // Sort Z-levels (lowest to highest)
    const sortedZLevels = Array.from(blocksByZLevel.keys()).sort((a, b) => a - b);

    const sortedBlocks: SortedBlock[] = [];
    let renderOrder = 0;

    // Process each Z-level from bottom to top
    sortedZLevels.forEach(zLevel => {
      const blocksInLevel = blocksByZLevel.get(zLevel)!;
      
      // Sort blocks within this Z-level by depth
      const sortedInLevel = this.sortBlocksByDepth(blocksInLevel);
      
      // Add to final sorted list
      sortedInLevel.forEach(sortedBlock => {
        sortedBlock.renderOrder = renderOrder++;
        sortedBlocks.push(sortedBlock);
      });
    });

    return sortedBlocks;
  }

  /**
   * Sort blocks for frustum culling with depth consideration
   */
  static sortBlocksForCulling(blocks: Block[], camera: { position: { x: number; y: number; z: number }; zoom: number }): SortedBlock[] {
    const sortedBlocks: SortedBlock[] = blocks.map(block => ({
      block,
      depth: this.calculateBlockDepth(block),
      renderOrder: 0
    }));

    // Sort by distance from camera (closest first for culling efficiency)
    sortedBlocks.sort((a, b) => {
      const distA = this.calculateDistanceFromCamera(a.block, camera);
      const distB = this.calculateDistanceFromCamera(b.block, camera);
      return distA - distB;
    });

    // Assign render order
    sortedBlocks.forEach((sortedBlock, index) => {
      sortedBlock.renderOrder = index;
    });

    return sortedBlocks;
  }

  /**
   * Calculate distance from camera for culling optimization
   */
  private static calculateDistanceFromCamera(block: Block, camera: { position: { x: number; y: number; z: number }; zoom: number }): number {
    const { x, y, z } = block.position;
    const worldPos = WebGLUtils.gridToWorld(x, y, z, this.TILE_WIDTH, this.TILE_HEIGHT);
    
    const dx = worldPos.x - camera.position.x;
    const dy = worldPos.y - camera.position.y;
    const dz = worldPos.z - camera.position.z;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get blocks in a specific Z-level range
   */
  static getBlocksInZRange(blocks: Block[], minZ: number, maxZ: number): Block[] {
    return blocks.filter(block => block.position.z >= minZ && block.position.z <= maxZ);
  }

  /**
   * Get the Z-level range of all blocks
   */
  static getZLevelRange(blocks: Block[]): { minZ: number; maxZ: number } {
    if (blocks.length === 0) {
      return { minZ: 0, maxZ: 0 };
    }

    const zLevels = blocks.map(block => block.position.z);
    return {
      minZ: Math.min(...zLevels),
      maxZ: Math.max(...zLevels)
    };
  }

  /**
   * Calculate optimal render order for transparent blocks
   */
  static sortTransparentBlocks(blocks: Block[]): SortedBlock[] {
    // For transparent blocks, we want to render back to front
    return this.sortBlocksByDepth(blocks);
  }

  /**
   * Calculate optimal render order for opaque blocks
   */
  static sortOpaqueBlocks(blocks: Block[]): SortedBlock[] {
    // For opaque blocks, we can render front to back for better performance
    const sortedBlocks = this.sortBlocksByDepth(blocks);
    return sortedBlocks.reverse();
  }

  /**
   * Get blocks sorted for efficient rendering (opaque first, then transparent)
   */
  static getOptimizedRenderOrder(blocks: Block[]): { opaque: SortedBlock[]; transparent: SortedBlock[] } {
    // This is a simplified version - in a real implementation, you'd check block transparency
    const opaqueBlocks = blocks.filter(block => true); // All blocks are opaque for now
    const transparentBlocks = blocks.filter(block => false); // No transparent blocks for now

    return {
      opaque: this.sortOpaqueBlocks(opaqueBlocks),
      transparent: this.sortTransparentBlocks(transparentBlocks)
    };
  }
} 