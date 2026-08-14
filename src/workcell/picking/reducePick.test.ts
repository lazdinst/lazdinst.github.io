import { describe, expect, it } from "vitest";
import { createPickState, reducePick } from "./reducePick";

describe("reducePick", () => {
  it("starts auto pick from idle", () => {
    const next = reducePick(createPickState(), { type: "START_AUTO" }, 10);
    expect(next.phase).toBe("acquire");
    expect(next.auto).toBe(true);
  });

  it("walks the happy path to complete then idle", () => {
    let state = reducePick(createPickState(), { type: "START_STEP" }, 0);
    const seen: string[] = [state.phase];
    for (let i = 0; i < 20 && state.phase !== "idle"; i += 1) {
      state = reducePick(state, { type: "PHASE_DONE" }, i + 1);
      seen.push(state.phase);
    }
    expect(seen).toContain("detect");
    expect(seen).toContain("grasp");
    expect(seen).toContain("complete");
    expect(state.phase).toBe("idle");
    expect(state.auto).toBe(false);
  });

  it("routes failure through recovering", () => {
    let state = reducePick(createPickState(), { type: "START_AUTO" }, 0);
    state = reducePick(state, { type: "FAIL", reason: "unreachable grasp" }, 5);
    expect(state.phase).toBe("failed");
    expect(state.lastFailure).toBe("unreachable grasp");
    state = reducePick(state, { type: "PHASE_DONE" }, 6);
    expect(state.phase).toBe("recovering");
    state = reducePick(state, { type: "PHASE_DONE" }, 7);
    expect(state.phase).toBe("acquire");
  });
});
