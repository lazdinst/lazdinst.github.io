import { describe, expect, it } from "vitest";
import { SeededRng } from "@/simulation";
import { deriveForceTorque } from "./deriveForceTorque";

describe("deriveForceTorque", () => {
  it("is deterministic for the same seed and input", () => {
    const input = {
      contacting: true,
      payloadKg: 0.08,
      linearAccelMmSec2: 200,
      vacuumEnabled: true,
      vacuumSeal: 0.8,
      gripperForceN: 0,
    };
    const a = deriveForceTorque(input, new SeededRng(7));
    const b = deriveForceTorque(input, new SeededRng(7));
    expect(a).toEqual(b);
    expect(a.fzN).toBeGreaterThan(1);
  });

  it("stays near zero without contact", () => {
    const sample = deriveForceTorque(
      {
        contacting: false,
        payloadKg: 0,
        linearAccelMmSec2: 0,
        vacuumEnabled: false,
        vacuumSeal: 0,
        gripperForceN: 0,
      },
      new SeededRng(3)
    );
    expect(Math.abs(sample.fzN)).toBeLessThan(0.5);
  });
});
