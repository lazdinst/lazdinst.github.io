import { describe, expect, it } from "vitest";
import { easeInOut, lerp, lerpJoints, lerpVec3 } from "./interpolate";

describe("interpolate", () => {
  it("eases from 0 to 1", () => {
    expect(easeInOut(0)).toBeCloseTo(0);
    expect(easeInOut(1)).toBeCloseTo(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5);
  });

  it("lerps vectors and joints", () => {
    expect(lerp(0, 10, 0.25)).toBeCloseTo(2.5);
    expect(lerpVec3([0, 0, 0], [10, 0, 0], 0.5)).toEqual([5, 0, 0]);
    expect(lerpJoints([0, 2], [2, 0], 0.5)).toEqual([1, 1]);
  });
});
