import type { Quaternion, Vec3 } from "@/simulation";
import { slerp } from "../kinematics/quaternion";

export function clamp01(value: number): number {
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

export function easeInOut(t: number): number {
  const x = clamp01(t);
  return 0.5 - 0.5 * Math.cos(Math.PI * x);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function lerpJoints(start: number[], end: number[], t: number): number[] {
  const count = Math.min(start.length, end.length);
  const next = new Array<number>(count);
  for (let i = 0; i < count; i += 1) {
    next[i] = lerp(start[i] ?? 0, end[i] ?? 0, t);
  }
  return next;
}

export function interpolatePose(
  startPositionM: Vec3,
  startQuaternion: Quaternion,
  endPositionM: Vec3,
  endQuaternion: Quaternion,
  t: number
): { positionM: Vec3; quaternion: Quaternion } {
  return {
    positionM: lerpVec3(startPositionM, endPositionM, t),
    quaternion: slerp(startQuaternion, endQuaternion, t),
  };
}
