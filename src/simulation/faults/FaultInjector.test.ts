import { describe, expect, it } from "vitest";
import { FaultInjector } from "./FaultInjector";

describe("FaultInjector", () => {
  it("injects and clears a fault once", () => {
    const faults = new FaultInjector();
    expect(faults.inject("vacuum_loss", 100)).toBe(true);
    expect(faults.inject("vacuum_loss", 120)).toBe(false);
    expect(faults.isActive("vacuum_loss")).toBe(true);
    expect(faults.getTelemetry().activeIds).toEqual(["vacuum_loss"]);
    expect(faults.clear("vacuum_loss")).toBe(true);
    expect(faults.isActive("vacuum_loss")).toBe(false);
  });
});
