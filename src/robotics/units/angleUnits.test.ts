import { describe, expect, it } from "vitest";
import { radiansToUnit, unitToRadians } from "./angleUnits";

describe("angleUnits", () => {
  it("converts degrees and radians consistently", () => {
    expect(radiansToUnit(Math.PI, "deg")).toBeCloseTo(180);
    expect(unitToRadians(180, "deg")).toBeCloseTo(Math.PI);
    expect(radiansToUnit(1.25, "rad")).toBe(1.25);
    expect(unitToRadians(1.25, "rad")).toBe(1.25);
  });
});
