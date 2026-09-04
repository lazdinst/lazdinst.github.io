import { describe, expect, it } from "vitest";
import { SeededRng } from "@/simulation";
import { HOSTILE_SEEDS } from "../data/hostiles";
import { KIND_PROFILES } from "../data/kinds";
import { haversineM } from "../geo/haversine";
import {
  buildEngageObjective,
  hitProbabilityAt,
  hostileFromSeed,
  orderHostilesFrom,
  resolveShot,
  stepHostilePatrol,
} from "./engagement";

describe("engagement helpers", () => {
  it("hit probability halves at max range", () => {
    const weapon = KIND_PROFILES.ugv_armored.weapon!;
    expect(hitProbabilityAt(weapon, 0)).toBeCloseTo(weapon.hitProbability);
    expect(hitProbabilityAt(weapon, weapon.rangeM)).toBeCloseTo(weapon.hitProbability / 2);
    const rng = new SeededRng(7);
    let hits = 0;
    for (let i = 0; i < 2000; i += 1) if (resolveShot(rng, weapon, 300)) hits += 1;
    expect(hits / 2000).toBeGreaterThan(0.4);
    expect(hits / 2000).toBeLessThan(0.55);
  });

  it("orders hostiles as a nearest-neighbour chain", () => {
    const hostiles = HOSTILE_SEEDS.map(hostileFromSeed);
    const depot = { lat: 36.782, lng: -121.735 };
    const ordered = orderHostilesFrom(depot, hostiles);
    expect(ordered).toHaveLength(hostiles.length);
    const first = ordered[0];
    hostiles.forEach((hostile) => {
      expect(haversineM(depot, first.position)).toBeLessThanOrEqual(haversineM(depot, hostile.position) + 1e-6);
    });
    const objective = buildEngageObjective(depot, hostiles.slice(0, 2))!;
    expect(objective.type).toBe("engage");
    expect(objective.hostileIds).toHaveLength(2);
    expect(objective.waypoints).toHaveLength(2);
  });

  it("patrols along the loop and wraps", () => {
    const seed = HOSTILE_SEEDS[0];
    const hostile = hostileFromSeed(seed);
    const cursor = { index: 1 };
    const start = { ...hostile.position };
    stepHostilePatrol(hostile, seed.patrol, cursor, 10_000);
    expect(haversineM(start, hostile.position)).toBeCloseTo(seed.speedMps * 10, 0);
    for (let i = 0; i < 400; i += 1) stepHostilePatrol(hostile, seed.patrol, cursor, 10_000);
    expect(cursor.index).toBeLessThan(seed.patrol.length);
    expect(hostile.status).toBe("active");
  });
});
