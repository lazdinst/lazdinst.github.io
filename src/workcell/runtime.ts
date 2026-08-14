import { robotRuntime } from "@/robotics";
import { DEFAULT_SIMULATION_SEED, simulationEngine } from "@/simulation";
import { WorkcellRuntime } from "./runtime/WorkcellRuntime";
import type { RobotMotionPort } from "./runtime/ports";

const robotPort: RobotMotionPort = {
  isReady: () => robotRuntime.isReady(),
  isMotionActive: () => robotRuntime.isMotionActive(),
  getTcp: () => robotRuntime.getView().tcp,
  startMoveToTcp: (positionMm, eulerRad, durationMs) =>
    robotRuntime.startMoveToTcp(positionMm, eulerRad, durationMs),
  solveTcp: (positionMm, eulerRad) => robotRuntime.solveTcp(positionMm, eulerRad),
  completeMotion: () => robotRuntime.completeMotion(),
  cancelMotion: () => robotRuntime.cancelMotion(),
  resetPose: () => robotRuntime.resetPose(),
};

export const workcellRuntime = new WorkcellRuntime(
  robotPort,
  undefined,
  DEFAULT_SIMULATION_SEED
);

workcellRuntime.setEventEmitter(
  (severity, source, eventCode, message, metadata) => {
    simulationEngine.emitDomainEvent(
      severity,
      source,
      eventCode,
      message,
      metadata
    );
  }
);

simulationEngine.setWorkcellProvider(workcellRuntime);
simulationEngine.registerSubsystem({
  reset: (seed) => workcellRuntime.reset(seed),
  step: (ctx) => workcellRuntime.step(ctx),
});

export function subscribeWorkcellView(onStoreChange: () => void): () => void {
  return workcellRuntime.subscribeView(onStoreChange);
}

export function getWorkcellView() {
  return workcellRuntime.getView();
}
