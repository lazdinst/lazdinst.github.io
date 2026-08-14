import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import { Sphere, Vector3 } from "three";
import { robotRuntime } from "@/robotics";

export const DEFAULT_CAMERA_POSITION = [1.6, 1.4, 1.1] as const;
export const DEFAULT_CAMERA_TARGET = [0, 0, 0.33] as const;

const ROBOT_FIT_SPHERE = new Sphere(new Vector3(0, 0, 0.35), 0.75);

export function resetStageCamera(controls: CameraControlsImpl): void {
  const [px, py, pz] = DEFAULT_CAMERA_POSITION;
  const [tx, ty, tz] = DEFAULT_CAMERA_TARGET;
  void controls.setLookAt(px, py, pz, tx, ty, tz, true);
}

export function focusTcp(controls: CameraControlsImpl): void {
  const tcp = robotRuntime.getView().tcp;
  if (!tcp) {
    return;
  }
  const [x, y, z] = tcp.positionM;
  void controls.setTarget(x, y, z, true);
}

export function fitRobot(controls: CameraControlsImpl): void {
  void controls.fitToSphere(ROBOT_FIT_SPHERE, true);
}
