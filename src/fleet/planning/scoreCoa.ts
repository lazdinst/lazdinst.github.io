import type { LatLng } from "../types";
import type { KindProfile } from "../data/kinds";
import { bearingDeg, haversineM, interpolateLatLng } from "../geo/haversine";
import { flowEnergyFactor } from "../motion/energyModel";
import type { CostMap } from "./costMap";
import { cellIndexAt, zonesAt } from "./terrainGrid";

export interface PathScore {
  distanceM: number;
  etaMs: number;
  energyPct: number;
  riskScore: number;
  coverageGapMs: number;
  hazardM: number;
  meanMove: number;
}

/**
 * Walks the path in half-cell steps and integrates time, energy, risk, and
 * coverage from the cost map, so scores reflect the same terrain the search
 * used.
 */
export function scorePath(map: CostMap, profile: KindProfile, path: LatLng[]): PathScore {
  const stepM = map.grid.cellSizeM / 2;
  let distanceM = 0;
  let timeS = 0;
  let energyWh = 0;
  let riskIntegral = 0;
  let uncoveredS = 0;
  let hazardM = 0;
  let moveSum = 0;
  let samples = 0;

  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const legM = haversineM(a, b);
    if (legM <= 0) continue;
    const heading = bearingDeg(a, b);
    const flow = flowEnergyFactor(heading, map.flow, profile.cruiseMps);
    const steps = Math.max(1, Math.ceil(legM / stepM));
    const dM = legM / steps;
    for (let s = 0; s < steps; s += 1) {
      const t = (s + 0.5) / steps;
      const point = interpolateLatLng(a, b, t);
      const index = cellIndexAt(map.grid, point);
      const move = index === null ? 1 : Math.max(1, map.move[index]);
      const risk = index === null ? 0 : map.risk[index];
      const covered = index === null ? 1 : map.covered[index];
      const speed = profile.cruiseMps / move;
      const dtS = dM / speed;
      distanceM += dM;
      timeS += dtS;
      energyWh += (dM / 1000) * profile.whPerKm * move * flow;
      riskIntegral += risk * dM;
      if (!covered) uncoveredS += dtS;
      if (zonesAt(map.grid, point).includes("hazard")) hazardM += dM;
      moveSum += move;
      samples += 1;
    }
  }

  // Acceleration and settling overhead at each end of the run.
  const accelS = profile.accelMps2 > 0 ? (2 * profile.cruiseMps) / profile.accelMps2 : 0;
  const meanRisk = distanceM > 0 ? riskIntegral / distanceM : 0;

  return {
    distanceM,
    etaMs: (timeS + accelS) * 1000,
    energyPct: (energyWh / profile.capacityWh) * 100,
    riskScore: Math.min(100, meanRisk * 40),
    coverageGapMs: uncoveredS * 1000,
    hazardM,
    meanMove: samples > 0 ? moveSum / samples : 1,
  };
}
