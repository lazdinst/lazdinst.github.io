import { describe, expect, it } from "vitest";
import type { Vec3 } from "@/simulation";
import { downwardToolQuaternion, eulerXyzToQuaternion, type IkStatus, type TcpPose } from "@/robotics";
import { WorkcellRuntime } from "./WorkcellRuntime";
import type { RobotMotionPort } from "./ports";

class FakeRobot implements RobotMotionPort {
  tcp: TcpPose = {
    positionM: [0.48, 0.2, 0.28],
    quaternion: downwardToolQuaternion(0),
    eulerRad: [Math.PI, 0, 0],
  };

  isReady(): boolean {
    return true;
  }

  isMotionActive(): boolean {
    return false;
  }

  getTcp(): TcpPose | null {
    return this.tcp;
  }

  solveTcp(): IkStatus {
    return "valid";
  }

  startMoveToTcp(positionMm: Vec3, eulerRad: Vec3, durationMs: number): IkStatus {
    void durationMs;
    this.tcp = {
      positionM: [positionMm[0] / 1000, positionMm[1] / 1000, positionMm[2] / 1000],
      quaternion: eulerXyzToQuaternion(eulerRad),
      eulerRad,
    };
    return "valid";
  }

  completeMotion(): void {}
  cancelMotion(): void {}
  resetPose(): void {}
}

function stepMany(runtime: WorkcellRuntime, steps: number, dtMs = 16): void {
  for (let i = 1; i <= steps; i += 1) {
    runtime.step({
      timestampMs: i * dtMs,
      dtMs,
      stepCount: i,
      seed: 1,
    });
  }
}

describe("WorkcellRuntime", () => {
  it("spawns deterministic parts on reset", () => {
    const runtime = new WorkcellRuntime(new FakeRobot(), undefined, 1);
    const first = runtime.getParts().map((part) => part.positionM);
    runtime.reset(1);
    expect(runtime.getParts().map((part) => part.positionM)).toEqual(first);
  });

  it("runs a pick cycle onto the destination", () => {
    const runtime = new WorkcellRuntime(new FakeRobot(), undefined, 1);
    runtime.startAuto();
    stepMany(runtime, 400);
    expect(runtime.getWorkcell().placedCount).toBeGreaterThan(0);
    expect(runtime.getWorkcell().cycleIndex).toBeGreaterThan(0);
  });
});
