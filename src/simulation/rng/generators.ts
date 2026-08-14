import type { SeededRng } from "./SeededRng";

export function sineWave(
  timeMs: number,
  amplitude: number,
  periodMs: number,
  phaseRad = 0
): number {
  if (periodMs <= 0) {
    return 0;
  }
  return amplitude * Math.sin((2 * Math.PI * timeMs) / periodMs + phaseRad);
}

export function lowFrequencyDrift(
  rng: SeededRng,
  current: number,
  maxDelta: number
): number {
  return current + rng.nextRange(-maxDelta, maxDelta);
}

export function boundedRandomWalk(
  rng: SeededRng,
  current: number,
  step: number,
  min: number,
  max: number
): number {
  const next = current + rng.nextRange(-step, step);
  return Math.min(max, Math.max(min, next));
}
