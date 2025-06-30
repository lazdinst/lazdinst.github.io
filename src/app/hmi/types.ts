// src/app/hmi/types.ts

export type DeviceType =
  | "motor"
  | "photoeye"
  | "scanner"
  | "camera"
  | "sensor"
  | "lpa" // Label Printing Application
  | "custom";

export type DeviceSide = "left" | "right";

export type DevicePosition = "charge" | "discharge" | "custom";

export interface Device {
  id: string;
  type: DeviceType;
  x?: number;
  y?: number;
  side?: DeviceSide;
  position?: "charge" | "discharge" | "custom";
}

export interface Package {
  id: string;
  x: number;
  y: number;
}

export interface ConveyorSegmentConfig {
  id: string;
  x: number;
  y: number;
  length: number;
  angle: number;
  devices: Device[];
  packages?: Package[];
}

export interface ProcessFlowConfig {
  segments: ConveyorSegmentConfig[];
}
