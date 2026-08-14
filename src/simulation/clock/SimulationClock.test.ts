import { describe, expect, it } from "vitest";
import { SimulationClock } from "./SimulationClock";

const DT_MS = 1000 / 60;

describe("SimulationClock", () => {
  it("starts at ready with zero simulation time", () => {
    const clock = new SimulationClock(DT_MS);
    expect(clock.getStatus()).toBe("ready");
    expect(clock.getSimTimeMs()).toBe(0);
    expect(clock.getDtMs()).toBe(DT_MS);
    expect(clock.getTimeScale()).toBe(1);
  });

  it("rejects non-positive dt", () => {
    expect(() => new SimulationClock(0)).toThrow(/dtMs/);
  });

  it("does not step while ready or paused", () => {
    const clock = new SimulationClock(DT_MS);
    expect(clock.step()).toBe(false);
    expect(clock.getSimTimeMs()).toBe(0);

    clock.start();
    clock.pause();
    expect(clock.step()).toBe(false);
    expect(clock.getSimTimeMs()).toBe(0);
  });

  it("advances by dt while running", () => {
    const clock = new SimulationClock(DT_MS);
    expect(clock.start()).toBe(true);
    expect(clock.start()).toBe(false);
    expect(clock.step()).toBe(true);
    expect(clock.getSimTimeMs()).toBe(DT_MS);
    clock.step();
    expect(clock.getSimTimeMs()).toBe(DT_MS * 2);
  });

  it("reset returns to ready at t=0", () => {
    const clock = new SimulationClock(DT_MS);
    clock.start();
    clock.step();
    clock.reset();
    expect(clock.getStatus()).toBe("ready");
    expect(clock.getSimTimeMs()).toBe(0);
  });

  it("does not apply timeScale inside step", () => {
    const clock = new SimulationClock(DT_MS, 2);
    clock.start();
    clock.step();
    expect(clock.getSimTimeMs()).toBe(DT_MS);
    expect(clock.getTimeScale()).toBe(2);
  });
});
