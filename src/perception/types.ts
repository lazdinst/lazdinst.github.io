import type { PointCloudColorMode } from "@/simulation";

export const PERCEPTION_SEED_CHANNEL = 0x9e12e0;
export const PERCEPTION_RATE_HZ = 12;
export const MAX_POINT_COUNT = 4200;

export interface PerceptionSettings {
  visible: boolean;
  pointSize: number;
  density: number;
  noiseMm: number;
  dropout: number;
  colorMode: PointCloudColorMode;
}

export const DEFAULT_PERCEPTION_SETTINGS: PerceptionSettings = {
  visible: true,
  pointSize: 0.004,
  density: 0.7,
  noiseMm: 1.6,
  dropout: 0.08,
  colorMode: "rgb",
};

export interface PointCloudBuffers {
  positions: Float32Array;
  colors: Float32Array;
  rgb: Float32Array;
  confidence: Float32Array;
  partIndex: Uint16Array;
  count: number;
  revision: number;
}
