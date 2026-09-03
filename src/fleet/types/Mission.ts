import type { LatLng } from "./geo";

export type ObjectiveType = "transit" | "rtb" | "patrol" | "survey";

export interface Objective {
  type: ObjectiveType;
  /** Transit and RTB destination. */
  target?: LatLng;
  targetLabel?: string;
  /** Patrol loop. The path returns to the first waypoint. */
  waypoints?: LatLng[];
  /** Survey polygon and swath width. */
  polygon?: LatLng[];
  swathM?: number;
}

export type CoaVariant = "direct" | "safe" | "efficient";

export interface CourseOfAction {
  id: string;
  variant: CoaVariant;
  assetId: string;
  objective: Objective;
  path: LatLng[];
  /** Patrol loops restart from this index once the end of `path` is reached. */
  loopStartIndex: number | null;
  distanceM: number;
  etaMs: number;
  /** Energy the mission is expected to consume, in percent of capacity. */
  energyPct: number;
  /** 0..100 */
  riskScore: number;
  coverageGapMs: number;
  recommended: boolean;
  rationale: string;
  feasible: boolean;
  reason?: string;
}

export type MissionStatus = "active" | "complete" | "aborted" | "failed";

export interface Mission {
  id: string;
  assetId: string;
  callsign: string;
  objective: Objective;
  coa: CourseOfAction;
  status: MissionStatus;
  /** 0..1 along the path. Patrols reset each loop. */
  progress: number;
  distanceTravelledM: number;
  startedAtMs: number;
  completedAtMs: number | null;
  waypointIndex: number;
  loops: number;
  etaMs: number;
  failureReason: string | null;
}
