import { describe, expect, it } from "vitest";
import { solveDampedLeastSquaresIk } from "./jacobianIk";
import { eulerXyzToQuaternion } from "./quaternion";
import type { TcpPose } from "../types/TcpPose";

const L1 = 0.33;
const L2 = 0.33;

function planarFk(q: number[]): TcpPose {
  const [q1, q2] = q;
  const x = L1 * Math.cos(q1) + L2 * Math.cos(q1 + q2);
  const y = L1 * Math.sin(q1) + L2 * Math.sin(q1 + q2);
  const yaw = q1 + q2;
  return {
    positionM: [x, y, 0],
    quaternion: eulerXyzToQuaternion([0, 0, yaw]),
    eulerRad: [0, 0, yaw],
  };
}

describe("solveDampedLeastSquaresIk", () => {
  it("reaches a known planar target from a nearby seed", () => {
    const qGoal = [0.4, 0.5];
    const goal = planarFk(qGoal);
    const result = solveDampedLeastSquaresIk({
      fk: planarFk,
      q0: [0.1, 0.1],
      targetPositionM: goal.positionM,
      targetQuaternion: goal.quaternion,
      limits: [
        { lowerRad: -Math.PI, upperRad: Math.PI },
        { lowerRad: -Math.PI, upperRad: Math.PI },
      ],
      positionOnly: true,
    });

    expect(result.status).toBe("valid");
    const reached = planarFk(result.q);
    expect(reached.positionM[0]).toBeCloseTo(goal.positionM[0], 3);
    expect(reached.positionM[1]).toBeCloseTo(goal.positionM[1], 3);
  });

  it("reports unreachable when the target is outside the workspace", () => {
    const result = solveDampedLeastSquaresIk({
      fk: planarFk,
      q0: [0, 0],
      targetPositionM: [3, 0, 0],
      targetQuaternion: eulerXyzToQuaternion([0, 0, 0]),
      limits: [
        { lowerRad: -Math.PI, upperRad: Math.PI },
        { lowerRad: -Math.PI, upperRad: Math.PI },
      ],
      positionOnly: true,
      maxIterations: 20,
    });

    expect(["unreachable", "joint_limit"]).toContain(result.status);
    expect(result.positionErrorM).toBeGreaterThan(1);
  });
});
