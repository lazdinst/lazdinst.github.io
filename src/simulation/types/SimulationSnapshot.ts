export type SimulationStatus = "ready" | "running" | "paused";

export type Vec3 = [number, number, number];
export type Quaternion = [number, number, number, number];

export interface JointTelemetry {
  id: string;
  positionRad: number;
  velocityRadSec: number;
  accelerationRadSec2: number;
  torqueNm: number;
  motorCurrentA: number;
  temperatureC: number;
  limitUtilization: number;
}

export interface RobotTelemetry {
  joints: JointTelemetry[];
  controllerMode: string;
  fault: boolean;
}

export interface TcpTelemetry {
  positionMm: Vec3;
  orientationRad: Vec3;
  linearVelocityMmSec: number;
  angularVelocityRadSec: number;
}

export interface GripperTelemetry {
  openingWidthMm: number;
  commandedWidthMm: number;
  gripForceN: number;
  contact: boolean;
  objectSecured: boolean;
}

export interface VacuumTelemetry {
  enabled: boolean;
  pressureKPa: number;
  flowLMin: number;
  sealQuality: number;
  objectSecured: boolean;
}

export interface ToolTelemetry {
  kind: "parallel_gripper" | "vacuum";
  gripper: GripperTelemetry | null;
  vacuum: VacuumTelemetry | null;
}

export interface ForceTorqueTelemetry {
  fxN: number;
  fyN: number;
  fzN: number;
  txNm: number;
  tyNm: number;
  tzNm: number;
}

export interface CameraTelemetry {
  fps: number;
  exposureMs: number;
  gainDb: number;
  latencyMs: number;
  pointsObserved: number;
  invalidDepthPercent: number;
}

export interface Detection {
  id: string;
  partId: string;
  className: string;
  confidence: number;
  positionMm: Vec3;
  quaternion: Quaternion;
  dimensionsMm: Vec3;
  occlusion: number;
  pointCount: number;
}

export type PointCloudColorMode =
  | "rgb"
  | "height"
  | "segmentation"
  | "confidence";

export interface PerceptionFrame {
  camera: CameraTelemetry | null;
  detections: Detection[];
  selectedDetectionId: string | null;
  pointCount: number;
  lastUpdateTimestampMs: number | null;
}

export type WorkpieceGeometry = "box" | "cylinder" | "disk";

export type WorkpieceStatus =
  | "in_tote"
  | "selected"
  | "grasped"
  | "placed"
  | "lost";

export interface WorkpieceTelemetry {
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

export type PickPhase =
  | "idle"
  | "acquire"
  | "detect"
  | "estimate_pose"
  | "plan_grasp"
  | "plan_motion"
  | "approach"
  | "grasp"
  | "verify"
  | "lift"
  | "transfer"
  | "place"
  | "retract"
  | "complete"
  | "failed"
  | "recovering";

export interface WorkcellTelemetry {
  partCount: number;
  remainingCount: number;
  placedCount: number;
  selectedPartId: string | null;
  targetPartId: string | null;
  pickPhase: PickPhase;
  autoPick: boolean;
  cycleIndex: number;
  lastFailure: string | null;
  parts: WorkpieceTelemetry[];
}

export interface ConveyorTelemetry {
  velocityMmSec: number;
  distanceMm: number;
  jammed: boolean;
}

export type CellStatus =
  | "ready"
  | "running"
  | "paused"
  | "fault"
  | "protective_stop";

export type FaultId =
  | "camera_disconnect"
  | "depth_noise"
  | "grasp_slip"
  | "vacuum_loss"
  | "joint_overload"
  | "encoder_mismatch"
  | "motion_timeout"
  | "safety_trip"
  | "plc_loss";

export type FailureCategory =
  | "perception"
  | "unreachable"
  | "collision"
  | "grasp_failure"
  | "vacuum_loss"
  | "safety"
  | "motion";

export interface SafetyTelemetry {
  scannerClear: boolean;
  lightCurtainClear: boolean;
  eStop: boolean;
  guardDoorClosed: boolean;
  safetyClear: boolean;
  reducedSpeed: boolean;
  protectiveStop: boolean;
  warningZoneOccupied: boolean;
  protectiveZoneOccupied: boolean;
  speedScale: number;
}

export interface IoTelemetry {
  digitalInputs: Record<string, boolean>;
  digitalOutputs: Record<string, boolean>;
  overrides: Partial<Record<string, boolean>>;
  commsOk: boolean;
}

export interface FaultTelemetry {
  activeIds: FaultId[];
}

export interface AnalyticsTelemetry {
  totalCycles: number;
  successfulPicks: number;
  failedPicks: number;
  successRate: number;
  meanCycleTimeMs: number;
  p95CycleTimeMs: number;
  picksPerHour: number;
  recentCycleTimesMs: number[];
  failures: Record<FailureCategory, number>;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

export type PlaybackMode = "live" | "scrub";

export interface PlaybackTelemetry {
  mode: PlaybackMode;
  scrubTimestampMs: number | null;
}

export interface ProcessTelemetry {
  heartbeatCount: number;
  lastHeartbeatMs: number | null;
}

export interface SimulationSnapshot {
  frameId: number;
  timestampMs: number;
  seed: number;
  scenarioId: string;
  status: SimulationStatus;
  timeScale: number;
  robot: RobotTelemetry | null;
  tcp: TcpTelemetry | null;
  tool: ToolTelemetry | null;
  forceTorque: ForceTorqueTelemetry | null;
  perception: PerceptionFrame | null;
  workcell: WorkcellTelemetry | null;
  conveyor: ConveyorTelemetry | null;
  safety: SafetyTelemetry | null;
  io: IoTelemetry | null;
  faults: FaultTelemetry | null;
  analytics: AnalyticsTelemetry | null;
  playback: PlaybackTelemetry;
  process: ProcessTelemetry;
}
