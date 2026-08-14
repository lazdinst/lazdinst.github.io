import { describe, expect, it } from "vitest";
import {
  jogDeltaMm,
  jogRollRad,
  JOG_ROLL_RAD_PER_SEC,
  JOG_SPEED_MM_PER_SEC,
} from "./jogDeltaMm";

const idle = {
  w: false,
  a: false,
  s: false,
  d: false,
  up: false,
  down: false,
  q: false,
  e: false,
};

describe("jogDeltaMm", () => {
  it("maps WASD onto XY and arrows onto Z", () => {
    expect(jogDeltaMm({ ...idle, d: true }, 1)).toEqual([
      JOG_SPEED_MM_PER_SEC,
      0,
      0,
    ]);
    expect(jogDeltaMm({ ...idle, a: true }, 1)).toEqual([
      -JOG_SPEED_MM_PER_SEC,
      0,
      0,
    ]);
    expect(jogDeltaMm({ ...idle, w: true }, 1)).toEqual([
      0,
      JOG_SPEED_MM_PER_SEC,
      0,
    ]);
    expect(jogDeltaMm({ ...idle, s: true }, 1)).toEqual([
      0,
      -JOG_SPEED_MM_PER_SEC,
      0,
    ]);
    expect(jogDeltaMm({ ...idle, up: true }, 1)).toEqual([
      0,
      0,
      JOG_SPEED_MM_PER_SEC,
    ]);
    expect(jogDeltaMm({ ...idle, down: true }, 1)).toEqual([
      0,
      0,
      -JOG_SPEED_MM_PER_SEC,
    ]);
  });

  it("normalizes diagonal motion", () => {
    const delta = jogDeltaMm({ ...idle, w: true, d: true }, 1);
    expect(delta).not.toBeNull();
    const [x, y, z] = delta!;
    expect(z).toBe(0);
    expect(x).toBeCloseTo(JOG_SPEED_MM_PER_SEC / Math.SQRT2);
    expect(y).toBeCloseTo(JOG_SPEED_MM_PER_SEC / Math.SQRT2);
  });

  it("returns null when no jog keys are held", () => {
    expect(jogDeltaMm(idle, 1)).toBeNull();
  });
});

describe("jogRollRad", () => {
  it("maps E to +roll and Q to -roll", () => {
    expect(jogRollRad({ ...idle, e: true }, 1)).toBeCloseTo(JOG_ROLL_RAD_PER_SEC);
    expect(jogRollRad({ ...idle, q: true }, 1)).toBeCloseTo(-JOG_ROLL_RAD_PER_SEC);
  });

  it("returns 0 when Q and E cancel or neither is held", () => {
    expect(jogRollRad(idle, 1)).toBe(0);
    expect(jogRollRad({ ...idle, q: true, e: true }, 1)).toBe(0);
  });
});
