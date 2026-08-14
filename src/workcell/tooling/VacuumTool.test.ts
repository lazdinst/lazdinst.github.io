import { describe, expect, it } from "vitest";
import { VacuumTool } from "./VacuumTool";

describe("VacuumTool", () => {
  it("does not secure without contact", () => {
    const tool = new VacuumTool();
    tool.enable();
    for (let i = 0; i < 40; i += 1) {
      tool.step(16, false, 0.9);
    }
    expect(tool.getTelemetry().enabled).toBe(true);
    expect(tool.getTelemetry().objectSecured).toBe(false);
  });

  it("seals on contact with sufficient quality", () => {
    const tool = new VacuumTool();
    tool.enable();
    for (let i = 0; i < 40; i += 1) {
      tool.step(16, true, 0.85);
    }
    const telemetry = tool.getTelemetry();
    expect(telemetry.objectSecured).toBe(true);
    expect(telemetry.pressureKPa).toBeLessThan(70);
    expect(telemetry.sealQuality).toBeGreaterThan(0.5);
  });

  it("fails to seal when a leak or slip is injected", () => {
    const leak = new VacuumTool();
    leak.setLeak(0.8);
    leak.enable();
    for (let i = 0; i < 40; i += 1) {
      leak.step(16, true, 0.9);
    }
    expect(leak.getTelemetry().objectSecured).toBe(false);
    expect(leak.isLow()).toBe(true);

    const slip = new VacuumTool();
    slip.setSlip(true);
    slip.enable();
    for (let i = 0; i < 40; i += 1) {
      slip.step(16, true, 0.9);
    }
    expect(slip.getTelemetry().objectSecured).toBe(false);
  });
});
