import type { FaultId } from "../types/SimulationSnapshot";

export interface ActiveFault {
  id: FaultId;
  injectedAtMs: number;
}

export const FAULT_CATALOG: Array<{
  id: FaultId;
  name: string;
  description: string;
}> = [
  {
    id: "camera_disconnect",
    name: "Camera disconnect",
    description: "RGB-D camera drops offline and perception frames stop.",
  },
  {
    id: "depth_noise",
    name: "Depth noise",
    description: "Depth noise and dropout increase, lowering detection confidence.",
  },
  {
    id: "grasp_slip",
    name: "Grasp slip",
    description: "Seal quality collapses after contact and the part is not secured.",
  },
  {
    id: "vacuum_loss",
    name: "Vacuum loss",
    description: "Vacuum leak raises pressure and prevents a stable seal.",
  },
  {
    id: "joint_overload",
    name: "Joint overload",
    description: "Motor torque and current spike; controller reports a fault.",
  },
  {
    id: "encoder_mismatch",
    name: "Encoder mismatch",
    description: "Joint telemetry is offset from the commanded encoder reading.",
  },
  {
    id: "motion_timeout",
    name: "Motion timeout",
    description: "Active robot motion is aborted as a controller timeout.",
  },
  {
    id: "safety_trip",
    name: "Safety trip",
    description: "Protective zone is occupied and motion is stopped.",
  },
  {
    id: "plc_loss",
    name: "PLC loss",
    description: "I/O communications freeze at the last sampled values.",
  },
];
