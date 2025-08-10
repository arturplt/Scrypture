/// <reference lib="webworker" />
import { WorldGenerator } from '../WorldGenerator';

interface GenerateMsg {
  type: 'GenerateChunk';
  payload: { id: { cx: number; cy: number; worldId: string }; worldSeed: number };
}

type InMsg = GenerateMsg;

const ctx: DedicatedWorkerGlobalScope = self as any;

ctx.onmessage = (e: MessageEvent<InMsg>) => {
  const msg = e.data;
  if (msg.type === 'GenerateChunk') {
    const gen = new WorldGenerator({ worldSeed: msg.payload.worldSeed });
    const chunk = gen.generateChunk(msg.payload.id);
    // Note: structured clone handles typed arrays
    ctx.postMessage({ type: 'ChunkReady', payload: { chunk } });
  }
};

export {}; // ensure module scope

