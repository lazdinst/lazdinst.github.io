import { describe, expect, it } from "vitest";
import { ASSET_SEEDS } from "../data/assets";
import { KIND_PROFILES, kindProfile } from "../data/kinds";
import { OPERATING_AREA } from "../data/operatingArea";
import { haversineM, pathLengthM } from "../geo/haversine";
import { pointInPolygon } from "../geo/polygon";
import { findFleetScenario } from "../scenarios/catalog";
import type { Asset } from "../types";
import { FleetPlanner } from "./FleetPlanner";
import { terrainAt, zonesAt } from "./terrainGrid";

const planner = new FleetPlanner(OPERATING_AREA);
const nominal = findFleetScenario("nominal");

function assetAt(kind: Asset["kind"], position: Asset["position"], energyPct = 90): Asset {
  const seed = ASSET_SEEDS.find((s) => s.kind === kind)!;
  return {
    id: seed.id,
    callsign: seed.callsign,
    name: seed.name,
    kind,
    domain: kindProfile(kind).domain,
    position,
    altitudeM: 0,
    headingDeg: 0,
    speedMps: 0,
    status: "idle",
    energyPct,
    sensors: [],
    maintenance: { hoursSinceService: 0, serviceIntervalHours: 10, healthScore: 1, workOrders: [], lastServicedAtMs: null, due: false },
    link: { relayId: null, rssiDbm: -60, quality: 1, latencyMs: 20, lostSinceMs: null },
    missionId: null,
    faults: [],
    tags: [],
    homeDepotId: seed.homeDepotId,
    rssiHistory: [],
    energyHistory: [],
  };
}

const depot = OPERATING_AREA.depots[0].position;
const dock = OPERATING_AREA.depots[1].position;
const wp = (id: string) => OPERATING_AREA.waypoints.find((w) => w.id === id)!.position;

describe("terrain grid", () => {
  it("classifies sea, road, and named patches", () => {
    const grid = planner.getGrid();
    expect(terrainAt(grid, { lat: 36.8, lng: -121.85 })).toBe("water");
    expect(terrainAt(grid, { lat: 36.79, lng: -121.786 })).toBe("road");
    expect(terrainAt(grid, { lat: 36.763, lng: -121.752 })).toBe("urban");
    expect(terrainAt(grid, { lat: 36.735, lng: -121.75 })).toBe("steep");
    expect(zonesAt(grid, { lat: 36.803, lng: -121.78 })).toContain("no_fly");
  });
});

describe("FleetPlanner", () => {
  it("routes a quad to RALLY-B with three feasible variants", () => {
    const coas = planner.generateCoas(assetAt("uav_quad", depot), { type: "transit", target: wp("rally-b"), targetLabel: "RALLY-B" }, nominal);
    expect(coas).toHaveLength(3);
    coas.forEach((coa) => {
      expect(coa.feasible).toBe(true);
      expect(coa.path[0]).toEqual(depot);
      expect(coa.path[coa.path.length - 1]).toEqual(wp("rally-b"));
      expect(coa.distanceM).toBeGreaterThan(haversineM(depot, wp("rally-b")) * 0.99);
      expect(Math.abs(pathLengthM(coa.path) - coa.distanceM)).toBeLessThan(coa.distanceM * 0.02);
    });
    expect(coas.filter((coa) => coa.recommended)).toHaveLength(1);
  });

  it("keeps air routes out of the no-fly zone and boats on water", () => {
    const noFly = OPERATING_AREA.zones.find((zone) => zone.id === "nf-power")!;
    const quad = planner.generateCoas(assetAt("uav_quad", wp("farm-east")), { type: "transit", target: wp("shoal-1") }, nominal);
    quad.forEach((coa) => {
      expect(coa.feasible).toBe(true);
      const inside = coa.path.filter((point) => pointInPolygon(point, noFly.polygon));
      expect(inside).toHaveLength(0);
    });

    const boat = planner.generateCoas(assetAt("usv", dock), { type: "transit", target: wp("buoy-s") }, nominal);
    boat.forEach((coa) => {
      expect(coa.feasible).toBe(true);
      // Sample the path and make sure every point is water.
      coa.path.forEach((point) => {
        expect(terrainAt(planner.getGrid(), point)).toBe("water");
      });
    });

    const boatToLand = planner.generateCoas(assetAt("usv", dock), { type: "transit", target: wp("ridge-op") }, nominal);
    expect(boatToLand.every((coa) => !coa.feasible)).toBe(true);
    expect(boatToLand[0].reason).toMatch(/surface vessel/i);
  });

  it("safe variant avoids the live-fire hazard the direct variant crosses", () => {
    const hazard = OPERATING_AREA.zones.find((zone) => zone.id === "hz-range")!;
    const from = { lat: 36.752, lng: -121.748 };
    const to = { lat: 36.729, lng: -121.748 };
    const coas = planner.generateCoas(assetAt("uav_quad", from), { type: "transit", target: to }, nominal);
    const direct = coas.find((coa) => coa.variant === "direct")!;
    const safe = coas.find((coa) => coa.variant === "safe")!;
    const crosses = (path: typeof direct.path) => {
      // Densify each leg so a straight segment through the zone is caught.
      for (let i = 1; i < path.length; i += 1) {
        for (let t = 0; t <= 1; t += 0.05) {
          const p = {
            lat: path[i - 1].lat + (path[i].lat - path[i - 1].lat) * t,
            lng: path[i - 1].lng + (path[i].lng - path[i - 1].lng) * t,
          };
          if (pointInPolygon(p, hazard.polygon)) return true;
        }
      }
      return false;
    };
    expect(crosses(direct.path)).toBe(true);
    expect(crosses(safe.path)).toBe(false);
    expect(safe.riskScore).toBeLessThan(direct.riskScore);
    expect(safe.distanceM).toBeGreaterThan(direct.distanceM);
  });

  it("rovers stay on roads where the efficient variant is chosen", () => {
    const coas = planner.generateCoas(assetAt("ugv_rover", depot), { type: "transit", target: wp("rally-a") }, nominal);
    const efficient = coas.find((coa) => coa.variant === "efficient")!;
    expect(efficient.feasible).toBe(true);
    let onRoad = 0;
    let samples = 0;
    for (let i = 1; i < efficient.path.length; i += 1) {
      for (let t = 0; t < 1; t += 0.1) {
        const p = {
          lat: efficient.path[i - 1].lat + (efficient.path[i].lat - efficient.path[i - 1].lat) * t,
          lng: efficient.path[i - 1].lng + (efficient.path[i].lng - efficient.path[i - 1].lng) * t,
        };
        samples += 1;
        if (terrainAt(planner.getGrid(), p) === "road") onRoad += 1;
      }
    }
    expect(onRoad / samples).toBeGreaterThan(0.6);
  });

  it("plans a patrol loop that returns to its first waypoint", () => {
    const seed = ASSET_SEEDS.find((s) => s.id === "hawk-03")!;
    const coas = planner.generateCoas(assetAt("uav_quad", seed.position), seed.patrol!, nominal);
    const coa = coas.find((c) => c.recommended)!;
    expect(coa.loopStartIndex).not.toBeNull();
    const first = seed.patrol!.waypoints![0];
    expect(coa.path[coa.loopStartIndex!]).toEqual(first);
    expect(coa.path[coa.path.length - 1]).toEqual(first);
  });

  it("generates three COAs for every kind well under budget", () => {
    const started = performance.now();
    (Object.keys(KIND_PROFILES) as Asset["kind"][]).forEach((kind) => {
      const start = KIND_PROFILES[kind].domain === "sea" ? dock : depot;
      const target = KIND_PROFILES[kind].domain === "sea" ? wp("channel-n") : wp("rally-b");
      planner.generateCoas(assetAt(kind, start), { type: "transit", target }, nominal);
    });
    const elapsed = performance.now() - started;
    expect(elapsed).toBeLessThan(6 * 250);
  });
});
