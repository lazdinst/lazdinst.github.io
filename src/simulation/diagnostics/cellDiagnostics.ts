import { DEFAULT_SIMULATION_SEED, simulationEngine } from "@/simulation";
import { workcellRuntime } from "@/workcell/runtime";
import { DiagnosticsRuntime } from "./DiagnosticsRuntime";

export type { DiagnosticsView } from "./DiagnosticsRuntime";

export const diagnosticsRuntime = new DiagnosticsRuntime(DEFAULT_SIMULATION_SEED);

diagnosticsRuntime.setEventEmitter(
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

workcellRuntime.setFaultQuery((id) => diagnosticsRuntime.isFaultActive(id));

simulationEngine.setInstrumentationProvider(diagnosticsRuntime);
simulationEngine.setSafetyProvider(diagnosticsRuntime);
simulationEngine.setDiagnosticsProvider(diagnosticsRuntime);
simulationEngine.registerSubsystem({
  reset: (seed) => diagnosticsRuntime.reset(seed),
  step: (ctx) => diagnosticsRuntime.step(ctx),
});

export function subscribeDiagnosticsView(onStoreChange: () => void): () => void {
  return diagnosticsRuntime.subscribeView(onStoreChange);
}

export function getDiagnosticsView() {
  return diagnosticsRuntime.getView();
}
