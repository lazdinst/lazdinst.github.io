export interface DeviceConfig {
  id: string;
  type: string;
  params: Record<string, unknown>;
}

export interface LineConfig {
  lineName: string;
  devices: DeviceConfig[];
}

export enum PackMLState {
  Stopped = "Stopped",
  Idle = "Idle",
  Starting = "Starting",
  Execute = "Execute",
  Completing = "Completing",
  Complete = "Complete",
  Aborting = "Aborting",
  Aborted = "Aborted",
  Holding = "Holding",
  Held = "Held",
  Unholding = "Unholding",
  Suspending = "Suspending",
  Suspended = "Suspended",
  Unsuspending = "Unsuspending",
  Resetting = "Resetting",
  Clearing = "Clearing"
}

export enum PackMLCommand {
  Start = "Start",
  Stop = "Stop",
  Hold = "Hold",
  Unhold = "Unhold",
  Reset = "Reset",
  Abort = "Abort",
  Clear = "Clear"
}
