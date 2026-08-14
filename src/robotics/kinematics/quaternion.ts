import type { Quaternion, Vec3 } from "@/simulation";

export function quaternionMultiply(
  a: Quaternion,
  b: Quaternion
): Quaternion {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

export function quaternionConjugate(q: Quaternion): Quaternion {
  return [-q[0], -q[1], -q[2], q[3]];
}

export function quaternionNormalize(q: Quaternion): Quaternion {
  const norm = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / norm, q[1] / norm, q[2] / norm, q[3] / norm];
}

export function quaternionToRotationVector(q: Quaternion): Vec3 {
  const normalized = quaternionNormalize(q);
  let [x, y, z, w] = normalized;
  if (w < 0) {
    x = -x;
    y = -y;
    z = -z;
    w = -w;
  }
  const sinHalf = Math.hypot(x, y, z);
  if (sinHalf < 1e-12) {
    return [0, 0, 0];
  }
  const angle = 2 * Math.atan2(sinHalf, w);
  const scale = angle / sinHalf;
  return [x * scale, y * scale, z * scale];
}

export function eulerXyzToQuaternion(eulerRad: Vec3): Quaternion {
  const [x, y, z] = eulerRad;
  const cx = Math.cos(x * 0.5);
  const sx = Math.sin(x * 0.5);
  const cy = Math.cos(y * 0.5);
  const sy = Math.sin(y * 0.5);
  const cz = Math.cos(z * 0.5);
  const sz = Math.sin(z * 0.5);

  return quaternionNormalize([
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz,
  ]);
}

export function quaternionToEulerXyz(q: Quaternion): Vec3 {
  const [x, y, z, w] = quaternionNormalize(q);
  const sinp = 2 * (w * y - z * x);
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * (Math.PI / 2) : Math.asin(sinp);
  const roll = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
  const yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
  return [roll, pitch, yaw];
}

export function identityQuaternion(): Quaternion {
  return [0, 0, 0, 1];
}

export function quaternionDot(a: Quaternion, b: Quaternion): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

export function slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
  let bx = b[0];
  let by = b[1];
  let bz = b[2];
  let bw = b[3];
  let dot = quaternionDot(a, b);
  if (dot < 0) {
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
    dot = -dot;
  }
  if (dot > 0.9995) {
    return quaternionNormalize([
      a[0] + t * (bx - a[0]),
      a[1] + t * (by - a[1]),
      a[2] + t * (bz - a[2]),
      a[3] + t * (bw - a[3]),
    ]);
  }
  const theta = Math.acos(Math.min(1, dot));
  const sinTheta = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / sinTheta;
  const wb = Math.sin(t * theta) / sinTheta;
  return quaternionNormalize([
    a[0] * wa + bx * wb,
    a[1] * wa + by * wb,
    a[2] * wa + bz * wb,
    a[3] * wa + bw * wb,
  ]);
}

export function rotateVectorByQuaternion(q: Quaternion, v: Vec3): Vec3 {
  const u: Vec3 = [q[0], q[1], q[2]];
  const s = q[3];
  const two = 2;
  const uvCross: Vec3 = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  const uuCross: Vec3 = [
    u[1] * uvCross[2] - u[2] * uvCross[1],
    u[2] * uvCross[0] - u[0] * uvCross[2],
    u[0] * uvCross[1] - u[1] * uvCross[0],
  ];
  return [
    v[0] + two * s * uvCross[0] + two * uuCross[0],
    v[1] + two * s * uvCross[1] + two * uuCross[1],
    v[2] + two * s * uvCross[2] + two * uuCross[2],
  ];
}

export function inverseRotateVectorByQuaternion(q: Quaternion, v: Vec3): Vec3 {
  return rotateVectorByQuaternion(quaternionConjugate(q), v);
}

/** Tool +Z pointing down world -Z, then yaw about world Z. */
export function downwardToolQuaternion(yawRad = 0): Quaternion {
  return eulerXyzToQuaternion([Math.PI, 0, yawRad]);
}

export function axisAngleToQuaternion(axis: Vec3, angleRad: number): Quaternion {
  const half = angleRad * 0.5;
  const sinHalf = Math.sin(half);
  const length = Math.hypot(axis[0], axis[1], axis[2]) || 1;
  return quaternionNormalize([
    (axis[0] / length) * sinHalf,
    (axis[1] / length) * sinHalf,
    (axis[2] / length) * sinHalf,
    Math.cos(half),
  ]);
}
