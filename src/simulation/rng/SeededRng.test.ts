import { describe, expect, it } from "vitest";
import { SeededRng, mixSeed } from "./SeededRng";
import {
  boundedRandomWalk,
  lowFrequencyDrift,
  sineWave,
} from "./generators";

describe("SeededRng", () => {
  it("replays the same sequence for the same seed", () => {
    const a = new SeededRng(0x51e00001);
    const b = new SeededRng(0x51e00001);
    const sequenceA = Array.from({ length: 8 }, () => a.next());
    const sequenceB = Array.from({ length: 8 }, () => b.next());
    expect(sequenceA).toEqual(sequenceB);
  });

  it("diverges for different seeds", () => {
    const a = new SeededRng(1);
    const b = new SeededRng(2);
    expect(a.next()).not.toBe(b.next());
  });

  it("returns values in [0, 1)", () => {
    const rng = new SeededRng(99);
    for (let i = 0; i < 100; i += 1) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("stays within nextRange bounds", () => {
    const rng = new SeededRng(7);
    for (let i = 0; i < 50; i += 1) {
      const value = rng.nextRange(-2, 5);
      expect(value).toBeGreaterThanOrEqual(-2);
      expect(value).toBeLessThan(5);
    }
  });

  it("mixes seeds into independent channels", () => {
    expect(mixSeed(1, 1)).not.toBe(mixSeed(1, 2));
    expect(mixSeed(1, 1)).toBe(mixSeed(1, 1));
  });

  it("produces deterministic gaussians", () => {
    const a = new SeededRng(123);
    const b = new SeededRng(123);
    expect(a.nextGaussian()).toBe(b.nextGaussian());
    expect(a.nextGaussian()).toBe(b.nextGaussian());
  });
});

describe("signal generators", () => {
  it("computes a sine at known points", () => {
    expect(sineWave(0, 2, 1000)).toBeCloseTo(0);
    expect(sineWave(250, 2, 1000)).toBeCloseTo(2);
    expect(sineWave(0, 1, 0)).toBe(0);
  });

  it("applies deterministic drift and bounded walks", () => {
    const rngA = new SeededRng(42);
    const rngB = new SeededRng(42);
    expect(lowFrequencyDrift(rngA, 10, 0.5)).toBe(
      lowFrequencyDrift(rngB, 10, 0.5)
    );

    let value = 0;
    const walker = new SeededRng(3);
    for (let i = 0; i < 40; i += 1) {
      value = boundedRandomWalk(walker, value, 0.25, -1, 1);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});
