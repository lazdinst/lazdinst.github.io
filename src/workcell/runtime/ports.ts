import type { Detection, Vec3 } from "@/simulation";
import type { IkStatus, TcpPose } from "@/robotics";

export interface RobotMotionPort {
  isReady(): boolean;
  isMotionActive(): boolean;
  getTcp(): TcpPose | null;
  startMoveToTcp(positionMm: Vec3, eulerRad: Vec3, durationMs: number): IkStatus;
  solveTcp(positionMm: Vec3, eulerRad: Vec3): IkStatus;
  completeMotion(): void;
  cancelMotion(): void;
  resetPose(): void;
}

export interface PoseSource {
  getDetections(): Detection[] | null;
}
