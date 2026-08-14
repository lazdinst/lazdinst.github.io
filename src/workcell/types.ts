import type {
  PickPhase,
  Quaternion,
  Vec3,
  WorkpieceGeometry,
  WorkpieceStatus,
} from "@/simulation";

export interface Workpiece {
  id: string;
  sku: string;
  geometryType: WorkpieceGeometry;
  positionM: Vec3;
  quaternion: Quaternion;
  dimensionsM: Vec3;
  massKg: number;
  material: string;
  friction: number;
  status: WorkpieceStatus;
  visibility: number;
  occlusion: number;
  color: Vec3;
}

export interface BoxRegion {
  centerM: Vec3;
  sizeM: Vec3;
}

export interface WorkcellLayout {
  table: BoxRegion;
  tote: {
    centerM: Vec3;
    innerSizeM: Vec3;
    wallM: number;
    heightM: number;
    floorZ: number;
  };
  destination: {
    centerM: Vec3;
    innerSizeM: Vec3;
    heightM: number;
    floorZ: number;
  };
  overheadCamera: {
    positionM: Vec3;
  };
  approachClearanceM: number;
}

export interface PickMachineState {
  phase: PickPhase;
  auto: boolean;
  cycleIndex: number;
  targetPartId: string | null;
  phaseEnteredMs: number;
  lastFailure: string | null;
}

export type PickEvent =
  | { type: "START_AUTO" }
  | { type: "START_STEP" }
  | { type: "PHASE_DONE" }
  | { type: "FAIL"; reason: string }
  | { type: "RESET" };
