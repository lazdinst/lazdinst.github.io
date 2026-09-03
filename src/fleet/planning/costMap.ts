import type { FleetScenario, VectorField } from "../types";
import type { KindProfile } from "../data/kinds";
import { TERRAIN_CLASSES, ZONE_TYPES, zoneBit, type TerrainGrid } from "./terrainGrid";

/** Per-kind, per-scenario traversal costs over the terrain grid. */
export interface CostMap {
  grid: TerrainGrid;
  profile: KindProfile;
  scenario: FleetScenario;
  /** 1 when the kind may occupy the cell. */
  passable: Uint8Array;
  /** Terrain multiplier on time and energy (>= 1). */
  move: Float32Array;
  /** Additional risk density per unit distance (0 = none). */
  risk: Float32Array;
  covered: Uint8Array;
  /** Wind for air, current for sea, still air for ground. */
  flow: VectorField;
}

const STILL: VectorField = { towardDeg: 0, speedMps: 0 };

export function buildCostMap(
  grid: TerrainGrid,
  profile: KindProfile,
  scenario: FleetScenario,
  covered: Uint8Array
): CostMap {
  const size = grid.cols * grid.rows;
  const passable = new Uint8Array(size);
  const move = new Float32Array(size);
  const risk = new Float32Array(size);

  for (let index = 0; index < size; index += 1) {
    const terrainCost = profile.terrainCost[TERRAIN_CLASSES[grid.terrain[index]]];
    const mask = grid.zoneMask[index];
    let ok = terrainCost !== null;
    let riskMultiplier = 1;
    ZONE_TYPES.forEach((type) => {
      if ((mask & zoneBit(type)) === 0) return;
      const zoneCost = profile.zoneCost[type];
      if (zoneCost === null) {
        ok = false;
      } else {
        riskMultiplier *= zoneCost;
      }
    });
    passable[index] = ok ? 1 : 0;
    move[index] = terrainCost ?? 1;
    const zoneRisk = (riskMultiplier - 1) * scenario.riskMultiplier;
    const coverageRisk = covered[index] ? 0 : 1;
    risk[index] = zoneRisk + coverageRisk;
  }

  const flow =
    profile.domain === "air"
      ? scenario.wind
      : profile.domain === "sea"
        ? scenario.current
        : STILL;

  return { grid, profile, scenario, passable, move, risk, covered, flow };
}
