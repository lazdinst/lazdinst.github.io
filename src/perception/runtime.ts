import { DEFAULT_SIMULATION_SEED, simulationEngine } from "@/simulation";
import { workcellRuntime } from "@/workcell/runtime";
import { PerceptionRuntime } from "./runtime/PerceptionRuntime";

export const perceptionRuntime = new PerceptionRuntime(
  workcellRuntime,
  DEFAULT_SIMULATION_SEED
);

perceptionRuntime.setEventEmitter(
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

workcellRuntime.setPoseSource(perceptionRuntime);
simulationEngine.setPerceptionProvider(perceptionRuntime);
simulationEngine.registerSubsystem({
  reset: (seed) => perceptionRuntime.reset(seed),
  step: (ctx) => perceptionRuntime.step(ctx),
});

export function subscribePerceptionView(onStoreChange: () => void): () => void {
  return perceptionRuntime.subscribeView(onStoreChange);
}

export function getPerceptionView() {
  return perceptionRuntime.getView();
}
