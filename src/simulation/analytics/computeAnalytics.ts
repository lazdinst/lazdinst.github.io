import type { AnalyticsTelemetry, FailureCategory } from "../types/SimulationSnapshot";

export interface CycleRecord {
  startedMs: number;
  endedMs: number;
  success: boolean;
  category: FailureCategory | null;
}

const EMPTY_FAILURES: Record<FailureCategory, number> = {
  perception: 0,
  unreachable: 0,
  collision: 0,
  grasp_failure: 0,
  vacuum_loss: 0,
  safety: 0,
  motion: 0,
};

export const TARGET_CYCLE_MS = 8_000;
const RECENT_CYCLE_LIMIT = 32;

export function emptyAnalytics(): AnalyticsTelemetry {
  return {
    totalCycles: 0,
    successfulPicks: 0,
    failedPicks: 0,
    successRate: 0,
    meanCycleTimeMs: 0,
    p95CycleTimeMs: 0,
    picksPerHour: 0,
    recentCycleTimesMs: [],
    failures: { ...EMPTY_FAILURES },
    availability: 1,
    performance: 1,
    quality: 1,
    oee: 1,
  };
}

export function computeAnalytics(
  cycles: CycleRecord[],
  uptimeMs: number,
  stoppedMs: number
): AnalyticsTelemetry {
  const successful = cycles.filter((cycle) => cycle.success);
  const failed = cycles.filter((cycle) => !cycle.success);
  const durations = cycles.map((cycle) => cycle.endedMs - cycle.startedMs);
  const meanCycleTimeMs = mean(durations);
  const p95CycleTimeMs = percentile(durations, 0.95);
  const failures = { ...EMPTY_FAILURES };
  for (const cycle of failed) {
    if (cycle.category) {
      failures[cycle.category] += 1;
    }
  }

  const availability = uptimeMs <= 0 ? 1 : clamp01((uptimeMs - stoppedMs) / uptimeMs);
  const performance =
    meanCycleTimeMs <= 0 ? 1 : clamp01(TARGET_CYCLE_MS / meanCycleTimeMs);
  const quality = cycles.length === 0 ? 1 : successful.length / cycles.length;
  const hours = Math.max(uptimeMs, 1) / 3_600_000;

  return {
    totalCycles: cycles.length,
    successfulPicks: successful.length,
    failedPicks: failed.length,
    successRate: quality,
    meanCycleTimeMs,
    p95CycleTimeMs,
    picksPerHour: successful.length / hours,
    recentCycleTimesMs: durations.slice(-RECENT_CYCLE_LIMIT),
    failures,
    availability,
    performance,
    quality,
    oee: availability * performance * quality,
  };
}

function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], fraction: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * fraction) - 1)
  );
  return sorted[index] ?? 0;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
