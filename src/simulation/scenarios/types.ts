import type { FaultId } from "../types/SimulationSnapshot";

export interface ScheduledFault {
  id: FaultId;
  atMs?: number;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  seed?: number;
  partCount?: number;
  perceptionNoiseMm?: number;
  perceptionDropout?: number;
  cameraOffline?: boolean;
  networkLatencyMs?: number;
  vacuumLeak?: number;
  graspSlipBias?: number;
  conveyorJammed?: boolean;
  payloadScale?: number;
  motorOverheat?: boolean;
  safetyIntrusion?: "warning" | "protective";
  faults?: ScheduledFault[];
}

export const NOMINAL_SCENARIO_ID = "nominal";
