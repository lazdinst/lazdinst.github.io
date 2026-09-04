import type { SimulationStatus, PlaybackMode } from "@/simulation";
import type { Asset, AssetStatus, FleetFaultId } from "./Asset";
import type { Hostile } from "./Combat";
import type { CourseOfAction, Mission, Objective } from "./Mission";

export interface FleetStats {
  total: number;
  byStatus: Record<AssetStatus, number>;
  activeMissions: number;
  faults: number;
  meanLinkQuality: number;
  meanEnergyPct: number;
  maintenanceDue: number;
  hostilesActive: number;
  hostilesEliminated: number;
  linkHistory: number[];
  energyHistory: number[];
}

export interface PlannerState {
  assetId: string | null;
  objective: Objective | null;
  candidates: CourseOfAction[];
  selectedCoaId: string | null;
  generatedAtMs: number | null;
  /** Why the last dispatch was refused, cleared on the next plan or dispatch. */
  refusal: string | null;
}

export interface FleetSnapshot {
  frameId: number;
  timestampMs: number;
  seed: number;
  scenarioId: string;
  status: SimulationStatus;
  assets: Asset[];
  missions: Mission[];
  planner: PlannerState;
  stats: FleetStats;
  selectedAssetId: string | null;
  hostiles: Hostile[];
}

export interface FleetView {
  status: SimulationStatus;
  timestampMs: number;
  timeScale: number;
  playbackMode: PlaybackMode;
  scrubTimestampMs: number | null;
  scenarioId: string;
  historyStartMs: number | null;
  historyEndMs: number | null;
  activeCount: number;
  faultCount: number;
  lostLinkCount: number;
  /** Active or suppressed hostiles. */
  hostileCount: number;
  selectedAssetId: string | null;
}

export interface VectorField {
  /** Direction the flow moves toward, degrees clockwise from north. */
  towardDeg: number;
  speedMps: number;
}

export interface FleetScenario {
  id: string;
  name: string;
  description: string;
  seed: number;
  wind: VectorField;
  current: VectorField;
  riskMultiplier: number;
  linkRangeScale: number;
  serviceIntervalScale: number;
  disabledRelayIds: string[];
  presetFaults: { assetId: string; faultId: FleetFaultId }[];
}
