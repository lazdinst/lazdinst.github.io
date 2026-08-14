import { describe, expect, it } from "vitest";
import { deriveIo } from "./deriveIo";
import type { IoSource } from "./digitalIo";

const SOURCE: IoSource = {
  partPresent: true,
  gripperClosed: false,
  vacuumOk: true,
  safetyClear: true,
  conveyorReady: true,
  robotReady: true,
  conveyorRun: false,
  gripperClose: false,
  vacuumEnable: true,
  stackLightGreen: true,
  stackLightRed: false,
};

describe("deriveIo", () => {
  it("maps source bits to named I/O", () => {
    const io = deriveIo(SOURCE);
    expect(io.digitalInputs.part_present).toBe(true);
    expect(io.digitalOutputs.vacuum_enable).toBe(true);
    expect(io.commsOk).toBe(true);
  });

  it("applies input overrides without changing outputs", () => {
    const io = deriveIo(SOURCE, { safety_clear: false });
    expect(io.digitalInputs.safety_clear).toBe(false);
    expect(io.digitalOutputs.stack_light_green).toBe(true);
    expect(io.overrides.safety_clear).toBe(false);
  });
});
