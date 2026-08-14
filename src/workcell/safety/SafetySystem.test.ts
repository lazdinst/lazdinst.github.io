import { describe, expect, it } from "vitest";
import { SafetySystem } from "./SafetySystem";

describe("SafetySystem", () => {
  it("reduces speed in the warning zone", () => {
    const safety = new SafetySystem();
    safety.setWarningOccupied(true);
    expect(safety.getTelemetry().reducedSpeed).toBe(true);
    expect(safety.getSpeedScale()).toBe(0.4);
    expect(safety.getTelemetry().protectiveStop).toBe(false);
  });

  it("stops motion for protective occupancy, e-stop, curtain, or open door", () => {
    const safety = new SafetySystem();
    safety.setProtectiveOccupied(true);
    expect(safety.getSpeedScale()).toBe(0);
    expect(safety.getTelemetry().protectiveStop).toBe(true);

    safety.reset();
    safety.setEStop(true);
    expect(safety.getTelemetry().protectiveStop).toBe(true);

    safety.reset();
    safety.setLightCurtainClear(false);
    expect(safety.getTelemetry().protectiveStop).toBe(true);

    safety.reset();
    safety.setGuardDoorClosed(false);
    expect(safety.getTelemetry().safetyClear).toBe(false);
    expect(safety.getTelemetry().protectiveStop).toBe(true);
  });
});
