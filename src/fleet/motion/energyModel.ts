import type { VectorField } from "../types";
import type { KindProfile } from "../data/kinds";

const DEG = Math.PI / 180;

/**
 * Multiplier on energy per km for moving on `headingDeg` through a flow field.
 * Tailwind helps, headwind hurts, scaled by how fast the flow is relative to
 * the asset. Clamped so a strong headwind cannot exceed ~2.2x.
 */
export function flowEnergyFactor(
  headingDeg: number,
  flow: VectorField,
  cruiseMps: number
): number {
  if (flow.speedMps <= 0 || cruiseMps <= 0) return 1;
  const along = Math.cos((flow.towardDeg - headingDeg) * DEG);
  const ratio = Math.min(0.8, flow.speedMps / cruiseMps);
  // Moving with the flow (along = 1) reduces cost; against (along = -1) raises it.
  return Math.max(0.5, Math.min(2.2, 1 - along * ratio * 1.2));
}

export interface EnergyStep {
  distanceM: number;
  headingDeg: number;
  terrainCost: number;
  flow: VectorField;
  dtMs: number;
  moving: boolean;
  batteryFault: boolean;
  overtemp: boolean;
}

/** Percent of capacity consumed in one tick. */
export function energyForStep(profile: KindProfile, step: EnergyStep): number {
  const idleWh = (profile.idleWPerS * step.dtMs) / 1000;
  const km = step.distanceM / 1000;
  const factor =
    flowEnergyFactor(step.headingDeg, step.flow, profile.cruiseMps) *
    Math.max(1, step.terrainCost) *
    (step.overtemp ? 1.3 : 1);
  const moveWh = km * profile.whPerKm * factor;
  const wh = (idleWh + moveWh) * (step.batteryFault ? 3 : 1);
  return (wh / profile.capacityWh) * 100;
}
