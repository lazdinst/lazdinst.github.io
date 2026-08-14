import { describe, expect, it } from "vitest";
import { ParallelGripper } from "./ParallelGripper";

describe("ParallelGripper", () => {
  it("closes onto a part and reports contact force", () => {
    const gripper = new ParallelGripper();
    gripper.close();
    for (let i = 0; i < 40; i += 1) {
      gripper.step(16, true);
    }
    const telemetry = gripper.getTelemetry();
    expect(telemetry.contact).toBe(true);
    expect(telemetry.gripForceN).toBeGreaterThan(10);
    expect(telemetry.objectSecured).toBe(true);
  });
});
