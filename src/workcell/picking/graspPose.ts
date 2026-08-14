import {
  downwardToolQuaternion,
  quaternionToEulerXyz,
  tcpPositionMm,
  type TcpPose,
} from "@/robotics";
import type { Vec3 } from "@/simulation";
import type { Workpiece } from "../types";

export interface GraspTarget {
  partId: string;
  grasp: TcpPose;
  approach: TcpPose;
  quality: number;
}

export function topDownGrasp(
  part: Workpiece,
  approachClearanceM: number
): GraspTarget {
  const yaw = quaternionToEulerXyz(part.quaternion)[2];
  const quaternion = downwardToolQuaternion(yaw);
  const topZ = part.positionM[2] + part.dimensionsM[2] / 2;
  const graspPosition: Vec3 = [part.positionM[0], part.positionM[1], topZ];
  const approachPosition: Vec3 = [
    part.positionM[0],
    part.positionM[1],
    topZ + approachClearanceM,
  ];
  const quality =
    (1 - part.occlusion) * (0.55 + 0.45 * part.friction) * part.visibility;
  return {
    partId: part.id,
    grasp: poseFrom(graspPosition, quaternion),
    approach: poseFrom(approachPosition, quaternion),
    quality,
  };
}

export function placeTarget(
  slot: Vec3,
  part: Workpiece,
  approachClearanceM: number
): { place: TcpPose; approach: TcpPose } {
  const yaw = quaternionToEulerXyz(part.quaternion)[2];
  const quaternion = downwardToolQuaternion(yaw);
  const topZ = slot[2] + part.dimensionsM[2];
  const placePosition: Vec3 = [slot[0], slot[1], topZ];
  const approachPosition: Vec3 = [slot[0], slot[1], topZ + approachClearanceM];
  return {
    place: poseFrom(placePosition, quaternion),
    approach: poseFrom(approachPosition, quaternion),
  };
}

export function poseToCommand(pose: TcpPose): {
  positionMm: Vec3;
  eulerRad: Vec3;
} {
  return {
    positionMm: tcpPositionMm(pose),
    eulerRad: pose.eulerRad,
  };
}

function poseFrom(positionM: Vec3, quaternion: TcpPose["quaternion"]): TcpPose {
  return {
    positionM,
    quaternion,
    eulerRad: quaternionToEulerXyz(quaternion),
  };
}
