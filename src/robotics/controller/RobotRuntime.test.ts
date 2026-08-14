import { describe, expect, it } from "vitest";
import { RobotRuntime } from "./RobotRuntime";
import { eulerXyzToQuaternion } from "../kinematics/quaternion";
import { tcpPositionMm } from "../types/TcpPose";
import { unitToRadians } from "../units/angleUnits";
import type { JointSpec } from "../types/JointSpec";
import type { TcpPose } from "../types/TcpPose";

const L1 = 0.33;
const L2 = 0.33;

const SPECS: JointSpec[] = [
  {
    id: "j1",
    label: "J1",
    type: "revolute",
    lowerRad: -Math.PI,
    upperRad: Math.PI,
    velocityLimitRadSec: null,
  },
  {
    id: "j2",
    label: "J2",
    type: "revolute",
    lowerRad: -Math.PI,
    upperRad: Math.PI,
    velocityLimitRadSec: null,
  },
];

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

describe("RobotRuntime.resetPose", () => {
  it("returns joints to the model home pose", () => {
    const runtime = new RobotRuntime();
    runtime.configureModel(SPECS, { j1: 0.4, j2: -0.2 });
    runtime.setKinematics(planarFk);

    runtime.resetPose();

    expect(runtime.getView().positionsRad.j1).toBeCloseTo(0);
    expect(runtime.getView().positionsRad.j2).toBeCloseTo(
      unitToRadians(-35.4, "deg")
    );
    expect(runtime.getView().ikStatus).toBe("idle");
  });
});

describe("RobotRuntime.nudgeTcp", () => {
  it("moves TCP without emitting domain events", () => {
    const runtime = new RobotRuntime();
    runtime.configureModel(SPECS, { j1: 0.2, j2: 0.3 });
    runtime.setKinematics(planarFk);

    const events: string[] = [];
    runtime.setEventEmitter((_severity, _source, eventCode) => {
      events.push(eventCode);
    });

    const before = tcpPositionMm(runtime.getView().tcp!);
    const status = runtime.nudgeTcp([0, 8, 0]);
    const after = tcpPositionMm(runtime.getView().tcp!);

    expect(events).toEqual([]);
    expect(["valid", "singularity"]).toContain(status);
    expect(after[1]).toBeGreaterThan(before[1]);
  });

  it("still updates ikStatus when a silent nudge is unreachable", () => {
    const runtime = new RobotRuntime();
    runtime.configureModel(SPECS, { j1: 0, j2: 0 });
    runtime.setKinematics(planarFk);

    const events: string[] = [];
    runtime.setEventEmitter((_severity, _source, eventCode) => {
      events.push(eventCode);
    });

    runtime.nudgeTcp([10_000, 0, 0]);

    expect(events).toEqual([]);
    expect(["unreachable", "joint_limit"]).toContain(runtime.getView().ikStatus);
  });
});

const SIX_SPECS: JointSpec[] = Array.from({ length: 6 }, (_, index) => ({
  id: `j${index + 1}`,
  label: `J${index + 1}`,
  type: "revolute" as const,
  lowerRad: -Math.PI,
  upperRad: Math.PI,
  velocityLimitRadSec: null,
}));

function wristFk(q: number[]): TcpPose {
  const roll = q[5] ?? 0;
  return {
    positionM: [0.4, 0, 0.5],
    quaternion: eulerXyzToQuaternion([0, 0, roll]),
    eulerRad: [0, 0, roll],
  };
}

describe("RobotRuntime.nudgeTcp roll", () => {
  it("rolls the tool about its local Z without moving XYZ", () => {
    const runtime = new RobotRuntime();
    runtime.configureModel(SIX_SPECS, {
      j1: 0,
      j2: 0,
      j3: 0,
      j4: 0,
      j5: 0,
      j6: 0.2,
    });
    runtime.setKinematics(wristFk);

    const before = runtime.getView();
    const beforePos = tcpPositionMm(before.tcp!);
    const status = runtime.nudgeTcp([0, 0, 0], 0.15);
    const after = runtime.getView();
    const afterPos = tcpPositionMm(after.tcp!);

    expect(["valid", "singularity"]).toContain(status);
    expect(after.tcp!.eulerRad[2]).toBeGreaterThan(before.tcp!.eulerRad[2]);
    expect(afterPos[0]).toBeCloseTo(beforePos[0], 3);
    expect(afterPos[1]).toBeCloseTo(beforePos[1], 3);
    expect(afterPos[2]).toBeCloseTo(beforePos[2], 3);
  });
});
