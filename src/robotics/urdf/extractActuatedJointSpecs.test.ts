import { describe, expect, it } from "vitest";
import { extractActuatedJointSpecs } from "./extractActuatedJointSpecs";

describe("extractActuatedJointSpecs", () => {
  it("keeps revolute joints and sorts by joint index", () => {
    const specs = extractActuatedJointSpecs({
      "flange-tool0": {
        name: "flange-tool0",
        jointType: "fixed",
        limit: { lower: 0, upper: 0 },
      },
      joint_2: {
        name: "joint_2",
        jointType: "revolute",
        limit: { lower: -1.7, upper: 2.5 },
      },
      joint_1: {
        name: "joint_1",
        jointType: "revolute",
        limit: { lower: -3, upper: 3 },
      },
    });

    expect(specs.map((spec) => spec.id)).toEqual(["joint_1", "joint_2"]);
    expect(specs[0].label).toBe("J1");
    expect(specs[1].lowerRad).toBe(-1.7);
    expect(specs[1].upperRad).toBe(2.5);
  });
});
