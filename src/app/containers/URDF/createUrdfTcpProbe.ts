import { Quaternion, Vector3 } from "three";
import type { URDFRobot } from "urdf-loader";
import type { MeasureTcp } from "@/robotics";
import type { TcpPose } from "@/robotics";
import { quaternionToEulerXyz } from "@/robotics";
import { END_EFFECTOR_TCP_NAME } from "./createEndEffector";

const position = new Vector3();
const quaternion = new Quaternion();
const scale = new Vector3();

export function createUrdfTcpProbe(
  robot: URDFRobot,
  jointIds: string[]
): MeasureTcp {
  return (positionsRad) => {
    const previous = jointIds.map((id) => Number(robot.joints[id]?.angle ?? 0));
    jointIds.forEach((id, index) => {
      robot.setJointValue(id, positionsRad[index] ?? 0);
    });
    robot.updateMatrixWorld(true);
    const pose = readTcpPose(robot);
    jointIds.forEach((id, index) => {
      robot.setJointValue(id, previous[index] ?? 0);
    });
    robot.updateMatrixWorld(true);
    return pose;
  };
}

export function readTcpPose(robot: URDFRobot): TcpPose | null {
  const frame =
    robot.getObjectByName(END_EFFECTOR_TCP_NAME) ??
    robot.getFrame("tool0") ??
    robot.getFrame("flange");
  if (!frame) {
    return null;
  }
  frame.updateWorldMatrix(true, false);
  frame.matrixWorld.decompose(position, quaternion, scale);
  const poseQuaternion: TcpPose["quaternion"] = [
    quaternion.x,
    quaternion.y,
    quaternion.z,
    quaternion.w,
  ];
  return {
    positionM: [position.x, position.y, position.z],
    quaternion: poseQuaternion,
    eulerRad: quaternionToEulerXyz(poseQuaternion),
  };
}
