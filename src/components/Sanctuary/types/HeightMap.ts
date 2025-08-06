export interface HeightMap {
  width: number;
  height: number;
  data: number[][]; // 2D array of height values (0-255)
  minHeight: number;
  maxHeight: number;
  seed: number;
}

export interface HeightMapConfig {
  width: number;
  height: number;
  seed?: number;
  octaves: number; // Number of noise layers
  frequency: number; // Base frequency for noise
  amplitude: number; // Base amplitude for noise
  persistence: number; // How much each octave contributes
  lacunarity: number; // How frequency changes per octave
  minHeight: number;
  maxHeight: number;
  smoothing: number; // Gaussian blur strength
} 