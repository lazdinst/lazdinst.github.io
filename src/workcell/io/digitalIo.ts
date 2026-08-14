export const DIGITAL_INPUTS = [
  "part_present",
  "gripper_closed",
  "vacuum_ok",
  "safety_clear",
  "conveyor_ready",
  "robot_ready",
] as const;

export const DIGITAL_OUTPUTS = [
  "conveyor_run",
  "gripper_close",
  "vacuum_enable",
  "stack_light_green",
  "stack_light_red",
] as const;

export type DigitalInput = (typeof DIGITAL_INPUTS)[number];
export type DigitalOutput = (typeof DIGITAL_OUTPUTS)[number];

export interface IoSource {
  partPresent: boolean;
  gripperClosed: boolean;
  vacuumOk: boolean;
  safetyClear: boolean;
  conveyorReady: boolean;
  robotReady: boolean;
  conveyorRun: boolean;
  gripperClose: boolean;
  vacuumEnable: boolean;
  stackLightGreen: boolean;
  stackLightRed: boolean;
}
