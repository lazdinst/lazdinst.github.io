import type { Quaternion, Vec3 } from "@/simulation";

export interface TcpPose {
  positionM: Vec3;
  quaternion: Quaternion;
  eulerRad: Vec3;
}

export function tcpPositionMm(pose: TcpPose): Vec3 {
  return [
    pose.positionM[0] * 1000,
    pose.positionM[1] * 1000,
    pose.positionM[2] * 1000,
  ];
}

export function metersFromMm(positionMm: Vec3): Vec3 {
  return [positionMm[0] / 1000, positionMm[1] / 1000, positionMm[2] / 1000];
}
