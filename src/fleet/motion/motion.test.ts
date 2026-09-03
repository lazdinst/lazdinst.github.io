import { describe, expect, it } from "vitest";
import { KIND_PROFILES } from "../data/kinds";
import { haversineM } from "../geo/haversine";
import { advanceAlongPath } from "./advanceAlongPath";
import { energyForStep, flowEnergyFactor } from "./energyModel";

describe("advanceAlongPath", () => {
  const path = [
    { lat: 36.79, lng: -121.78 },
    { lat: 36.80, lng: -121.78 },
    { lat: 36.80, lng: -121.77 },
  ];

  it("moves the requested distance and consumes waypoints", () => {
    const first = advanceAlongPath(
      path,
      { waypointIndex: 1, position: path[0], headingDeg: 0, travelledM: 0 },
      500
    );
    expect(first.finished).toBe(false);
    expect(first.waypointIndex).toBe(1);
    expect(Math.abs(haversineM(path[0], first.position) - 500)).toBeLessThan(1);
    expect(Math.abs(first.headingDeg)).toBeLessThan(0.5);

    const total = haversineM(path[0], path[1]) + haversineM(path[1], path[2]);
    const done = advanceAlongPath(
      path,
      { waypointIndex: 1, position: path[0], headingDeg: 0, travelledM: 0 },
      total + 10
    );
    expect(done.finished).toBe(true);
    expect(done.reached).toEqual([1, 2]);
    expect(done.position).toEqual(path[2]);
    expect(Math.abs(done.travelledM - total)).toBeLessThan(0.01);
  });
});

describe("energy model", () => {
  it("tailwind is cheaper than headwind", () => {
    const wind = { towardDeg: 90, speedMps: 8 };
    expect(flowEnergyFactor(90, wind, 12)).toBeLessThan(flowEnergyFactor(270, wind, 12));
    expect(flowEnergyFactor(0, { towardDeg: 0, speedMps: 0 }, 12)).toBe(1);
  });

  it("a battery fault triples burn", () => {
    const profile = KIND_PROFILES.uav_quad;
    const base = {
      distanceM: 100,
      headingDeg: 0,
      terrainCost: 1,
      flow: { towardDeg: 0, speedMps: 0 },
      dtMs: 100,
      moving: true,
      overtemp: false,
    };
    const nominal = energyForStep(profile, { ...base, batteryFault: false });
    const faulted = energyForStep(profile, { ...base, batteryFault: true });
    expect(faulted / nominal).toBeCloseTo(3, 5);
  });
});
