import type { LatLng } from "./geo";

export type AssetDomain = "air" | "ground" | "sea";

export type AssetKind =
  | "uav_quad"
  | "uav_fixed_wing"
  | "ugv_rover"
  | "ugv_tracked"
  | "legged"
  | "usv";

export type AssetStatus =
  | "idle"
  | "en_route"
  | "patrolling"
  | "returning"
  | "charging"
  | "maintenance"
  | "lost_link"
  | "fault";

export type SensorKind =
  | "gps"
  | "imu"
  | "barometer"
  | "pitot"
  | "camera_eo"
  | "camera_ir"
  | "stereo"
  | "lidar"
  | "radar"
  | "sonar"
  | "odometry"
  | "foot_contact"
  | "ais"
  | "radio"
  | "motor_temp";

export type SensorStatus = "ok" | "degraded" | "failed";

export interface SensorReading {
  id: SensorKind;
  label: string;
  value: number;
  unit: string;
  /** 0 = failed, 1 = nominal. */
  health: number;
  status: SensorStatus;
}

export type WorkOrderSeverity = "low" | "medium" | "high";

export interface WorkOrder {
  id: string;
  title: string;
  severity: WorkOrderSeverity;
  openedAtMs: number;
}

export interface MaintenanceRecord {
  hoursSinceService: number;
  serviceIntervalHours: number;
  /** 0..1 composite of hours, open orders, and faults. */
  healthScore: number;
  workOrders: WorkOrder[];
  lastServicedAtMs: number | null;
  /** True when the interval is exceeded or a high-severity order is open. */
  due: boolean;
}

export interface LinkState {
  relayId: string | null;
  rssiDbm: number;
  /** 0..1 */
  quality: number;
  latencyMs: number;
  /** Sim time the link dropped, or null while connected. */
  lostSinceMs: number | null;
}

export type FleetFaultId =
  | "gps_loss"
  | "imu_drift"
  | "motor_overtemp"
  | "radio_failure"
  | "battery_cell";

export interface Asset {
  id: string;
  callsign: string;
  name: string;
  kind: AssetKind;
  domain: AssetDomain;
  position: LatLng;
  altitudeM: number;
  headingDeg: number;
  speedMps: number;
  status: AssetStatus;
  /** Battery or fuel, 0..100. */
  energyPct: number;
  sensors: SensorReading[];
  maintenance: MaintenanceRecord;
  link: LinkState;
  missionId: string | null;
  faults: FleetFaultId[];
  tags: string[];
  homeDepotId: string;
  /** Recent samples, oldest first, for sparklines. */
  rssiHistory: number[];
  energyHistory: number[];
}
