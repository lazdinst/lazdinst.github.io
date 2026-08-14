import type { PickPhase } from "@/simulation";
import type { PickEvent, PickMachineState } from "../types";

const PHASE_ORDER: PickPhase[] = [
  "acquire",
  "detect",
  "estimate_pose",
  "plan_grasp",
  "plan_motion",
  "approach",
  "grasp",
  "verify",
  "lift",
  "transfer",
  "place",
  "retract",
  "complete",
];

export function createPickState(): PickMachineState {
  return {
    phase: "idle",
    auto: false,
    cycleIndex: 0,
    targetPartId: null,
    phaseEnteredMs: 0,
    lastFailure: null,
  };
}

export function reducePick(
  state: PickMachineState,
  event: PickEvent,
  timestampMs: number
): PickMachineState {
  if (event.type === "RESET") {
    return createPickState();
  }

  if (event.type === "FAIL") {
    return {
      ...state,
      phase: "failed",
      lastFailure: event.reason,
      phaseEnteredMs: timestampMs,
    };
  }

  if (event.type === "START_AUTO" || event.type === "START_STEP") {
    if (state.phase !== "idle") {
      return state;
    }
    return {
      ...state,
      phase: "acquire",
      auto: event.type === "START_AUTO",
      lastFailure: null,
      phaseEnteredMs: timestampMs,
    };
  }

  if (event.type !== "PHASE_DONE") {
    return state;
  }

  if (state.phase === "complete") {
    return {
      ...state,
      phase: state.auto ? "acquire" : "idle",
      targetPartId: null,
      phaseEnteredMs: timestampMs,
    };
  }

  if (state.phase === "failed") {
    return {
      ...state,
      phase: "recovering",
      phaseEnteredMs: timestampMs,
    };
  }

  if (state.phase === "recovering") {
    return {
      ...state,
      phase: state.auto ? "acquire" : "idle",
      targetPartId: null,
      phaseEnteredMs: timestampMs,
    };
  }

  if (state.phase === "idle") {
    return state;
  }

  const index = PHASE_ORDER.indexOf(state.phase);
  const next = PHASE_ORDER[index + 1];
  if (!next) {
    return state;
  }
  return {
    ...state,
    phase: next,
    phaseEnteredMs: timestampMs,
  };
}
