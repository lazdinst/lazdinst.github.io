import { describe, expect, it } from "vitest";
import {
  downwardToolQuaternion,
  eulerXyzToQuaternion,
  quaternionToEulerXyz,
  rotateVectorByQuaternion,
  slerp,
} from "./quaternion";

describe("euler/quaternion", () => {
  it("round-trips XYZ euler angles", () => {
    const euler: [number, number, number] = [0.4, -0.2, 1.1];
    const quaternion = eulerXyzToQuaternion(euler);
    const restored = quaternionToEulerXyz(quaternion);
    expect(restored[0]).toBeCloseTo(euler[0], 5);
    expect(restored[1]).toBeCloseTo(euler[1], 5);
    expect(restored[2]).toBeCloseTo(euler[2], 5);
  });
});

describe("quaternion helpers", () => {
  it("maps tool +Z to world -Z", () => {
    const q = downwardToolQuaternion(0);
    const z = rotateVectorByQuaternion(q, [0, 0, 1]);
    expect(z[0]).toBeCloseTo(0, 5);
    expect(z[1]).toBeCloseTo(0, 5);
    expect(z[2]).toBeCloseTo(-1, 5);
  });

  it("slerps endpoints", () => {
    const a: [number, number, number, number] = [0, 0, 0, 1];
    const b = downwardToolQuaternion(0);
    const mid = slerp(a, b, 1);
    expect(mid[0]).toBeCloseTo(b[0], 5);
    expect(mid[3]).toBeCloseTo(b[3], 5);
  });
});
