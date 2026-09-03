import type {
  AssetDomain,
  AssetKind,
  SensorKind,
  TerrainClass,
  ZoneType,
} from "../types";

/** null means impassable for that kind. Numbers multiply the base cell cost. */
export interface KindProfile {
  kind: AssetKind;
  domain: AssetDomain;
  label: string;
  shortLabel: string;
  cruiseMps: number;
  accelMps2: number;
  whPerKm: number;
  capacityWh: number;
  /** Energy burned per second while stationary but powered (hover, idle engine). */
  idleWPerS: number;
  chargeRatePctPerS: number;
  /** Cruise altitude for air assets, 0 otherwise. */
  altitudeM: number;
  /** Fixed-wing corners get rounded to approximate this radius. */
  minTurnRadiusM: number;
  serviceIntervalHours: number;
  sensorSuite: SensorKind[];
  terrainCost: Record<TerrainClass, number | null>;
  zoneCost: Record<ZoneType, number | null>;
}

const AIR_TERRAIN: Record<TerrainClass, number> = {
  water: 1,
  road: 1,
  open: 1,
  urban: 1.3,
  steep: 1.1,
  wetland: 1,
};

const AIR_ZONES: Record<ZoneType, number | null> = {
  no_fly: null,
  restricted: null,
  hazard: 3,
  shallow_water: 1,
  low_comms: 1.5,
};

const GROUND_ZONES: Record<ZoneType, number | null> = {
  no_fly: 1,
  restricted: null,
  hazard: 3,
  shallow_water: 1,
  low_comms: 1.5,
};

export const KIND_PROFILES: Record<AssetKind, KindProfile> = {
  uav_quad: {
    kind: "uav_quad",
    domain: "air",
    label: "Quadrotor UAV",
    shortLabel: "quad",
    cruiseMps: 12,
    accelMps2: 3,
    whPerKm: 22,
    capacityWh: 400,
    idleWPerS: 0.09,
    chargeRatePctPerS: 0.6,
    altitudeM: 90,
    minTurnRadiusM: 0,
    serviceIntervalHours: 60,
    sensorSuite: ["gps", "imu", "barometer", "camera_eo", "radio", "motor_temp"],
    terrainCost: AIR_TERRAIN,
    zoneCost: AIR_ZONES,
  },
  uav_fixed_wing: {
    kind: "uav_fixed_wing",
    domain: "air",
    label: "Fixed-wing UAV",
    shortLabel: "fixed",
    cruiseMps: 22,
    accelMps2: 2,
    whPerKm: 12,
    capacityWh: 900,
    idleWPerS: 0.02,
    chargeRatePctPerS: 0.4,
    altitudeM: 120,
    minTurnRadiusM: 180,
    serviceIntervalHours: 120,
    sensorSuite: ["gps", "imu", "pitot", "camera_eo", "camera_ir", "radio"],
    terrainCost: AIR_TERRAIN,
    zoneCost: AIR_ZONES,
  },
  ugv_rover: {
    kind: "ugv_rover",
    domain: "ground",
    label: "Wheeled rover",
    shortLabel: "rover",
    cruiseMps: 4,
    accelMps2: 1,
    whPerKm: 90,
    capacityWh: 2400,
    idleWPerS: 0.01,
    chargeRatePctPerS: 0.35,
    altitudeM: 0,
    minTurnRadiusM: 0,
    serviceIntervalHours: 200,
    sensorSuite: ["gps", "imu", "lidar", "odometry", "radio", "motor_temp"],
    terrainCost: { water: null, road: 1, open: 2.5, urban: 1.5, steep: null, wetland: null },
    zoneCost: GROUND_ZONES,
  },
  ugv_tracked: {
    kind: "ugv_tracked",
    domain: "ground",
    label: "Tracked UGV",
    shortLabel: "tracked",
    cruiseMps: 2.5,
    accelMps2: 0.8,
    whPerKm: 160,
    capacityWh: 5200,
    idleWPerS: 0.02,
    chargeRatePctPerS: 0.25,
    altitudeM: 0,
    minTurnRadiusM: 0,
    serviceIntervalHours: 150,
    sensorSuite: ["gps", "imu", "lidar", "radar", "radio", "motor_temp"],
    terrainCost: { water: null, road: 1, open: 1.5, urban: 1.5, steep: 3, wetland: null },
    zoneCost: GROUND_ZONES,
  },
  legged: {
    kind: "legged",
    domain: "ground",
    label: "Legged robot",
    shortLabel: "legged",
    cruiseMps: 1.5,
    accelMps2: 1.2,
    whPerKm: 120,
    capacityWh: 600,
    idleWPerS: 0.03,
    chargeRatePctPerS: 0.5,
    altitudeM: 0,
    minTurnRadiusM: 0,
    serviceIntervalHours: 40,
    sensorSuite: ["imu", "stereo", "lidar", "foot_contact", "gps", "radio"],
    terrainCost: { water: null, road: 1, open: 1.2, urban: 1.2, steep: 2, wetland: 4 },
    zoneCost: GROUND_ZONES,
  },
  usv: {
    kind: "usv",
    domain: "sea",
    label: "Surface vessel",
    shortLabel: "usv",
    cruiseMps: 6,
    accelMps2: 0.6,
    whPerKm: 140,
    capacityWh: 8000,
    idleWPerS: 0.03,
    chargeRatePctPerS: 0.2,
    altitudeM: 0,
    minTurnRadiusM: 40,
    serviceIntervalHours: 300,
    sensorSuite: ["gps", "imu", "sonar", "ais", "radio", "motor_temp"],
    terrainCost: { water: 1, road: null, open: null, urban: null, steep: null, wetland: null },
    zoneCost: { no_fly: 1, restricted: null, hazard: 3, shallow_water: null, low_comms: 1.5 },
  },
};

export const ASSET_KINDS: AssetKind[] = Object.keys(KIND_PROFILES) as AssetKind[];

export function kindProfile(kind: AssetKind): KindProfile {
  return KIND_PROFILES[kind];
}
