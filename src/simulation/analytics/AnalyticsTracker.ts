import type { AnalyticsTelemetry, PickPhase } from "../types/SimulationSnapshot";
import { classifyFailure } from "./classifyFailure";
import { computeAnalytics, type CycleRecord } from "./computeAnalytics";

export class AnalyticsTracker {
  private cycles: CycleRecord[] = [];
  private cycleStartedMs: number | null = null;
  private lastPhase: PickPhase = "idle";
  private uptimeMs = 0;
  private stoppedMs = 0;

  reset(): void {
    this.cycles = [];
    this.cycleStartedMs = null;
    this.lastPhase = "idle";
    this.uptimeMs = 0;
    this.stoppedMs = 0;
  }

  observePhase(
    phase: PickPhase,
    timestampMs: number,
    failureReason: string | null,
    running: boolean,
    dtMs: number
  ): void {
    this.uptimeMs += dtMs;
    if (!running) {
      this.stoppedMs += dtMs;
    }

    if (phase === "acquire" && this.lastPhase !== "acquire") {
      this.cycleStartedMs = timestampMs;
    }

    if (phase === "complete" && this.lastPhase !== "complete") {
      this.finish(timestampMs, true, null);
    }

    if (phase === "failed" && this.lastPhase !== "failed") {
      this.finish(timestampMs, false, failureReason);
    }

    this.lastPhase = phase;
  }

  getTelemetry(): AnalyticsTelemetry {
    return computeAnalytics(this.cycles, this.uptimeMs, this.stoppedMs);
  }

  private finish(
    timestampMs: number,
    success: boolean,
    reason: string | null
  ): void {
    const startedMs = this.cycleStartedMs ?? timestampMs;
    this.cycles.push({
      startedMs,
      endedMs: timestampMs,
      success,
      category: success ? null : classifyFailure(reason),
    });
    this.cycleStartedMs = null;
  }
}
