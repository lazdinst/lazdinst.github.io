import type { SimulationSnapshot } from "../types/SimulationSnapshot";

export function findSnapshotAt(
  history: SimulationSnapshot[],
  timestampMs: number
): SimulationSnapshot | null {
  if (history.length === 0) {
    return null;
  }

  let best = history[0];
  let bestDelta = Math.abs(best.timestampMs - timestampMs);
  for (let index = 1; index < history.length; index += 1) {
    const candidate = history[index];
    const delta = Math.abs(candidate.timestampMs - timestampMs);
    if (delta < bestDelta) {
      best = candidate;
      bestDelta = delta;
    }
  }
  return best;
}
