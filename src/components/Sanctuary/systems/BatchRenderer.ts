import { Block, RenderBatch } from '../types';

export class BatchRenderer {
  private batches = new Map<string, RenderBatch>();

  addToBatch(block: Block): void {
    const textureKey = block.sprite.sheetPath;
    
    if (!this.batches.has(textureKey)) {
      this.batches.set(textureKey, {
        texture: textureKey,
        blocks: [],
        vertices: [],
        indices: [],
        count: 0
      });
    }
    
    const batch = this.batches.get(textureKey)!;
    batch.blocks.push(block);
    batch.count++;
  }

  getBatches(): RenderBatch[] {
    return Array.from(this.batches.values());
  }

  clear(): void {
    this.batches.clear();
  }

  getDrawCallCount(): number {
    return this.batches.size;
  }
} 