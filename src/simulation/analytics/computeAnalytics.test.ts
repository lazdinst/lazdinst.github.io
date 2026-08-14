import { describe, expect, it } from "vitest";
import { classifyFailure } from "./classifyFailure";
import { computeAnalytics, type CycleRecord } from "./computeAnalytics";

describe("classifyFailure", () => {
  it("maps pick reasons to categories", () => {
    expect(classifyFailure("perception timeout")).toBe("perception");
    expect(classifyFailure("unreachable grasp")).toBe("unreachable");
    expect(classifyFailure("grasp failure")).toBe("grasp_failure");
    expect(classifyFailure("safety protective stop")).toBe("safety");
    expect(classifyFailure("vacuum leak")).toBe("vacuum_loss");
    expect(classifyFailure("motion timeout")).toBe("motion");
  });
});

describe("computeAnalytics", () => {
  it("computes success rate, cycle stats, and simulated OEE", () => {
    const cycles: CycleRecord[] = [
      { startedMs: 0, endedMs: 4000, success: true, category: null },
      { startedMs: 4000, endedMs: 9000, success: false, category: "grasp_failure" },
      { startedMs: 9000, endedMs: 13000, success: true, category: null },
    ];
    const analytics = computeAnalytics(cycles, 13_000, 1_000);
    expect(analytics.totalCycles).toBe(3);
    expect(analytics.successfulPicks).toBe(2);
    expect(analytics.failedPicks).toBe(1);
    expect(analytics.successRate).toBeCloseTo(2 / 3);
    expect(analytics.meanCycleTimeMs).toBeCloseTo(4000 + 1000 / 3, 5);
    expect(analytics.failures.grasp_failure).toBe(1);
    expect(analytics.recentCycleTimesMs).toEqual([4000, 5000, 4000]);
    expect(analytics.oee).toBeGreaterThan(0);
    expect(analytics.oee).toBeLessThanOrEqual(1);
  });
});
