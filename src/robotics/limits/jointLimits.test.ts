import { describe, expect, it } from "vitest";
import {
  clampJointValue,
  jointLimitUtilization,
  validateJointVector,
} from "./jointLimits";
import type { JointSpec } from "../types/JointSpec";

const spec: JointSpec = {
  id: "joint_2",
  label: "J2",
  type: "revolute",
  lowerRad: -1.745,
  upperRad: 2.531,
  velocityLimitRadSec: 6.6,
};

describe("jointLimits", () => {
  it("clamps to the URDF range", () => {
    expect(clampJointValue(3, spec.lowerRad, spec.upperRad)).toBe(spec.upperRad);
    expect(clampJointValue(-4, spec.lowerRad, spec.upperRad)).toBe(spec.lowerRad);
    expect(clampJointValue(0, spec.lowerRad, spec.upperRad)).toBe(0);
  });

  it("reports limit utilization from the joint center", () => {
    const center = (spec.lowerRad + spec.upperRad) / 2;
    expect(jointLimitUtilization(center, spec)).toBeCloseTo(0);
    expect(jointLimitUtilization(spec.upperRad, spec)).toBeCloseTo(1);
  });

  it("validates a joint vector against specs", () => {
    expect(validateJointVector([0], [spec]).ok).toBe(true);
    expect(validateJointVector([4], [spec])).toEqual({
      ok: false,
      jointId: "joint_2",
    });
  });
});
