import { HeightMap, HeightMapConfig } from '../types';

export class HeightMapGenerator {
  private seed: number;
  private noise: (x: number, y: number) => number;

  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
    this.noise = this.createNoiseFunction();
  }

  private createNoiseFunction(): (x: number, y: number) => number {
    // Improved Perlin-like noise function
    const hash = (x: number, y: number): number => {
      const n = x + y * 57 + this.seed;
      const hash1 = Math.sin(n) * 43758.5453;
      const hash2 = Math.sin(n * 1.5) * 23456.789;
      const hash3 = Math.sin(n * 0.7) * 34567.123;
      return (hash1 + hash2 + hash3) / 3 - Math.floor((hash1 + hash2 + hash3) / 3);
    };

    return (x: number, y: number): number => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;

      const h00 = hash(xi, yi);
      const h10 = hash(xi + 1, yi);
      const h01 = hash(xi, yi + 1);
      const h11 = hash(xi + 1, yi + 1);

      const smoothstep = (t: number) => t * t * (3 - 2 * t);
      const sx = smoothstep(xf);
      const sy = smoothstep(yf);

      const top = h00 + (h10 - h00) * sx;
      const bottom = h01 + (h11 - h01) * sx;
      return top + (bottom - top) * sy;
    };
  }

  generateHeightMap(config: HeightMapConfig): HeightMap {
    const { width, height, octaves, frequency, amplitude, persistence, lacunarity, minHeight, maxHeight, smoothing } = config;
    
    // Initialize height map data
    const data: number[][] = [];
    for (let y = 0; y < height; y++) {
      data[y] = [];
      for (let x = 0; x < width; x++) {
        data[y][x] = 0;
      }
    }

    // Generate multi-octave noise
    let currentAmplitude = amplitude;
    let currentFrequency = frequency;
    let maxValue = 0;

    for (let octave = 0; octave < octaves; octave++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const nx = x * currentFrequency;
          const ny = y * currentFrequency;
          const noiseValue = this.noise(nx, ny) * currentAmplitude;
          data[y][x] += noiseValue;
          maxValue = Math.max(maxValue, data[y][x]);
        }
      }
      currentAmplitude *= persistence;
      currentFrequency *= lacunarity;
    }

    // Normalize to 0-1 range
    if (maxValue > 0) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          data[y][x] = data[y][x] / maxValue;
        }
      }
    }

    // Apply smoothing if specified
    if (smoothing > 0) {
      this.applyGaussianBlur(data, smoothing);
    }

    // Scale to desired height range
    const heightRange = maxHeight - minHeight;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        data[y][x] = minHeight + (data[y][x] * heightRange);
      }
    }

    return {
      width,
      height,
      data,
      minHeight,
      maxHeight,
      seed: this.seed
    };
  }

  private applyGaussianBlur(data: number[][], strength: number): number[][] {
    const kernel = this.createGaussianKernel(strength);
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);
    const height = data.length;
    const width = data[0].length;
    const result: number[][] = [];

    for (let y = 0; y < height; y++) {
      result[y] = [];
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let weightSum = 0;

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const sampleY = Math.max(0, Math.min(height - 1, y + ky - halfKernel));
            const sampleX = Math.max(0, Math.min(width - 1, x + kx - halfKernel));
            const weight = kernel[ky][kx];
            sum += data[sampleY][sampleX] * weight;
            weightSum += weight;
          }
        }

        result[y][x] = weightSum > 0 ? sum / weightSum : data[y][x];
      }
    }

    return result;
  }

  private createGaussianKernel(strength: number): number[][] {
    const size = Math.max(3, Math.floor(strength * 6));
    const halfSize = Math.floor(size / 2);
    const kernel: number[][] = [];
    let sum = 0;

    for (let y = 0; y < size; y++) {
      kernel[y] = [];
      for (let x = 0; x < size; x++) {
        const dx = x - halfSize;
        const dy = y - halfSize;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const value = Math.exp(-(distance * distance) / (2 * strength * strength));
        kernel[y][x] = value;
        sum += value;
      }
    }

    // Normalize kernel
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum;
      }
    }

    return kernel;
  }

  getHeightAt(heightMap: HeightMap, x: number, y: number): number {
    if (x < 0 || x >= heightMap.width || y < 0 || y >= heightMap.height) {
      return heightMap.minHeight;
    }
    return heightMap.data[Math.floor(y)][Math.floor(x)];
  }

  getInterpolatedHeight(heightMap: HeightMap, x: number, y: number): number {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.min(x1 + 1, heightMap.width - 1);
    const y2 = Math.min(y1 + 1, heightMap.height - 1);

    const h11 = this.getHeightAt(heightMap, x1, y1);
    const h12 = this.getHeightAt(heightMap, x1, y2);
    const h21 = this.getHeightAt(heightMap, x2, y1);
    const h22 = this.getHeightAt(heightMap, x2, y2);

    const fx = x - x1;
    const fy = y - y1;

    // Bilinear interpolation
    const h1 = h11 * (1 - fx) + h21 * fx;
    const h2 = h12 * (1 - fx) + h22 * fx;
    return h1 * (1 - fy) + h2 * fy;
  }
} 