import type {
  Asset,
  CoaVariant,
  CourseOfAction,
  FleetScenario,
  LatLng,
  Objective,
  OperatingArea,
} from "../types";
import { kindProfile, type KindProfile } from "../data/kinds";

import { pathLengthM } from "../geo/haversine";
import { astar, planCells, snapToPassable, type PlanWeights } from "./astar";
import { buildCostMap, type CostMap } from "./costMap";
import { scorePath } from "./scoreCoa";
import { chaikin, pathPassable, pullString } from "./smoothPath";
import { lawnmowerWaypoints } from "./survey";
import {
  buildCoverage,
  buildTerrainGrid,
  cellIndexAt,
  type TerrainGrid,
} from "./terrainGrid";

export const VARIANT_WEIGHTS: Record<CoaVariant, PlanWeights> = {
  direct: { time: 1, energy: 0.1, risk: 0.1 },
  safe: { time: 0.35, energy: 0.15, risk: 3 },
  efficient: { time: 0.3, energy: 2, risk: 0.5 },
};

export const COA_VARIANTS: CoaVariant[] = ["direct", "safe", "efficient"];

/** Reserve the recommendation policy insists on after the mission. */
export const ENERGY_RESERVE_PCT = 20;

export interface PlannedPath {
  path: LatLng[];
  /** For patrols: index in `path` where the repeating loop begins. */
  loopStartIndex: number | null;
}

/**
 * Owns the terrain grid and a cache of cost maps keyed by kind and scenario.
 * Everything here is synchronous and deterministic.
 */
export class FleetPlanner {
  private readonly grid: TerrainGrid;
  private readonly costMaps = new Map<string, CostMap>();
  private coverage: { scenarioId: string; covered: Uint8Array } | null = null;
  private coaSeq = 0;

  constructor(area: OperatingArea) {
    this.grid = buildTerrainGrid(area);
  }

  getGrid(): TerrainGrid {
    return this.grid;
  }

  getCostMap(profile: KindProfile, scenario: FleetScenario): CostMap {
    const key = `${profile.kind}:${scenario.id}`;
    let map = this.costMaps.get(key);
    if (!map) {
      map = buildCostMap(this.grid, profile, scenario, this.getCoverage(scenario));
      this.costMaps.set(key, map);
    }
    return map;
  }

  private getCoverage(scenario: FleetScenario): Uint8Array {
    if (!this.coverage || this.coverage.scenarioId !== scenario.id) {
      this.coverage = { scenarioId: scenario.id, covered: buildCoverage(this.grid, scenario) };
    }
    return this.coverage.covered;
  }

  /** Straight-line path between two points, or null if no route exists. */
  planLeg(
    map: CostMap,
    from: LatLng,
    to: LatLng,
    weights: PlanWeights,
    exactEnds = true
  ): LatLng[] | null {
    const result = planCells(map, from, to, weights);
    if (!result) return null;
    const pulled = pullString(map, result.cells, weights);
    const path = pulled.map((index) => this.grid.cellCenters[index]);
    if (exactEnds) {
      path[0] = from;
      path[path.length - 1] = to;
    }
    if (map.profile.minTurnRadiusM > 0 && path.length > 2) {
      const rounded = chaikin(path, 2);
      if (pathPassable(map, rounded)) return rounded;
    }
    return path;
  }

  planObjective(
    map: CostMap,
    start: LatLng,
    objective: Objective,
    weights: PlanWeights
  ): PlannedPath | null {
    switch (objective.type) {
      case "transit":
      case "rtb": {
        if (!objective.target) return null;
        const path = this.planLeg(map, start, objective.target, weights);
        return path ? { path, loopStartIndex: null } : null;
      }
      case "patrol": {
        const waypoints = objective.waypoints ?? [];
        if (waypoints.length < 2) return null;
        const approach = this.planLeg(map, start, waypoints[0], weights);
        if (!approach) return null;
        const path = [...approach];
        const loopStartIndex = path.length - 1;
        const loop = [...waypoints.slice(1), waypoints[0]];
        let cursor = waypoints[0];
        for (const waypoint of loop) {
          const leg = this.planLeg(map, cursor, waypoint, weights);
          if (!leg) return null;
          path.push(...leg.slice(1));
          cursor = waypoint;
        }
        return { path, loopStartIndex };
      }
      case "survey": {
        if (map.profile.domain !== "air") return null;
        if (!objective.polygon || objective.polygon.length < 3) return null;
        const lines = lawnmowerWaypoints(
          objective.polygon,
          objective.swathM ?? 150,
          this.grid.projection
        );
        if (lines.length < 2) return null;
        const approach = this.planLeg(map, start, lines[0], weights);
        if (!approach) return null;
        // Survey lines are flown straight; only the approach is routed.
        return { path: [...approach, ...lines.slice(1)], loopStartIndex: null };
      }
      default:
        return null;
    }
  }

  generateCoas(asset: Asset, objective: Objective, scenario: FleetScenario): CourseOfAction[] {
    const profile = kindProfile(asset.kind);
    const map = this.getCostMap(profile, scenario);
    const coas = COA_VARIANTS.map((variant) => {
      this.coaSeq += 1;
      const id = `coa-${this.coaSeq}`;
      const planned = this.planObjective(map, asset.position, objective, VARIANT_WEIGHTS[variant]);
      if (!planned) {
        const reason =
          objective.type === "survey" && profile.domain !== "air"
            ? "Survey patterns need an air asset"
            : `No passable route for a ${profile.label.toLowerCase()}`;
        return infeasible(id, variant, asset, objective, reason);
      }
      const score = scorePath(map, profile, planned.path);
      return {
        id,
        variant,
        assetId: asset.id,
        objective,
        path: planned.path,
        loopStartIndex: planned.loopStartIndex,
        distanceM: score.distanceM,
        etaMs: score.etaMs,
        energyPct: score.energyPct,
        riskScore: score.riskScore,
        coverageGapMs: score.coverageGapMs,
        recommended: false,
        feasible: true,
        rationale: rationaleFor(variant, score, profile, asset),
      } satisfies CourseOfAction & { loopStartIndex: number | null };
    });

    const feasible = coas.filter((coa) => coa.feasible);
    const withReserve = feasible.filter(
      (coa) => asset.energyPct - coa.energyPct >= ENERGY_RESERVE_PCT
    );
    const pool = withReserve.length > 0 ? withReserve : feasible;
    if (pool.length > 0) {
      const pick = [...pool].sort(
        (a, b) => a.riskScore - b.riskScore || a.etaMs - b.etaMs
      )[0];
      pick.recommended = true;
    }
    return coas;
  }

  /** True when a point is somewhere the kind can occupy (after snapping). */
  isReachableCell(profile: KindProfile, scenario: FleetScenario, point: LatLng): boolean {
    const map = this.getCostMap(profile, scenario);
    const index = cellIndexAt(this.grid, point);
    return index !== null && snapToPassable(map, index, 4) !== null;
  }
}

function infeasible(
  id: string,
  variant: CoaVariant,
  asset: Asset,
  objective: Objective,
  reason: string
): CourseOfAction & { loopStartIndex: number | null } {
  return {
    id,
    variant,
    assetId: asset.id,
    objective,
    path: [],
    loopStartIndex: null,
    distanceM: 0,
    etaMs: 0,
    energyPct: 0,
    riskScore: 100,
    coverageGapMs: 0,
    recommended: false,
    feasible: false,
    reason,
    rationale: "",
  };
}

function rationaleFor(
  variant: CoaVariant,
  score: ReturnType<typeof scorePath>,
  profile: KindProfile,
  asset: Asset
): string {
  const parts: string[] = [];
  parts.push(
    variant === "direct"
      ? "Shortest route"
      : variant === "safe"
        ? "Avoids hazards and coverage gaps"
        : profile.domain === "ground"
          ? "Prefers roads and gentle terrain"
          : "Rides the flow field"
  );
  if (score.hazardM > 50) {
    parts.push(`crosses hazard for ${(score.hazardM / 1000).toFixed(1)} km`);
  }
  if (score.coverageGapMs > 5_000) {
    parts.push(`${Math.round(score.coverageGapMs / 60_000)} min outside coverage`);
  }
  const remaining = asset.energyPct - score.energyPct;
  if (remaining < ENERGY_RESERVE_PCT) {
    parts.push(`lands with ${Math.max(0, Math.round(remaining))}% reserve`);
  }
  return parts.join(" · ");
}

export { pathLengthM, astar };
