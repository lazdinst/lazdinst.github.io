import { describe, expect, it } from "vitest";
import { emptyAnalytics } from "../analytics/computeAnalytics";
import type { SimulationSnapshot } from "../types/SimulationSnapshot";
import { findSnapshotAt } from "./findSnapshotAt";

function frame(timestampMs: number): SimulationSnapshot {
  return {
    frameId: timestampMs,
    timestampMs,
    seed: 1,
    scenarioId: "nominal",
    status: "running",
    timeScale: 1,
    robot: null,
    tcp: null,
    tool: null,
    forceTorque: null,
    perception: null,
    workcell: null,
    conveyor: null,
    safety: null,
    io: null,
    faults: null,
    analytics: emptyAnalytics(),
    playback: { mode: "live", scrubTimestampMs: null },
    process: { heartbeatCount: 0, lastHeartbeatMs: null },
  };
}

describe("findSnapshotAt", () => {
  it("returns the nearest historical frame", () => {
    const history = [frame(0), frame(100), frame(200)];
    expect(findSnapshotAt(history, 130)?.timestampMs).toBe(100);
    expect(findSnapshotAt(history, 180)?.timestampMs).toBe(200);
    expect(findSnapshotAt([], 10)).toBeNull();
  });
});
