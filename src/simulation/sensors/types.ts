export type SensorHealth = "ok" | "degraded" | "fault" | "offline";

export type SensorType =
  | "rgb_camera"
  | "depth_camera"
  | "point_cloud"
  | "joint_encoder"
  | "motor_torque"
  | "motor_current"
  | "motor_temperature"
  | "tcp_force_torque"
  | "gripper_position"
  | "gripper_force"
  | "vacuum_pressure"
  | "vacuum_flow"
  | "conveyor_encoder"
  | "photoelectric"
  | "load_cell"
  | "safety_scanner"
  | "light_curtain"
  | "digital_input"
  | "digital_output"
  | "controller_state";

export interface Sensor<T> {
  id: string;
  name: string;
  type: SensorType;
  enabled: boolean;
  health: SensorHealth;
  updateRateHz: number;
  latencyMs: number;
  lastUpdateTimestampMs: number | null;
  quality: number;
  data: T;
}

export function createSensor<T>(
  fields: Omit<Sensor<T>, "lastUpdateTimestampMs" | "quality"> & {
    lastUpdateTimestampMs?: number | null;
    quality?: number;
  }
): Sensor<T> {
  return {
    lastUpdateTimestampMs: null,
    quality: 1,
    ...fields,
  };
}
