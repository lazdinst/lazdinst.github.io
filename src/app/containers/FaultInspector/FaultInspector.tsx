import { DIAGNOSTICS_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useDiagnostics, useSimulation } from "@/app/context";
import { diagnosticsRuntime } from "@/simulation/diagnostics/cellDiagnostics";
import {
  FAULT_CATALOG,
  SCENARIO_CATALOG,
  simulationEngine,
  type FaultId,
} from "@/simulation";
import { cn } from "@/lib/utils";

export function FaultInspector() {
  const { scenario, faults } = useDiagnostics();
  const { timestampMs } = useSimulation();

  return (
    <PanelSection title="Scenarios / Faults" info={DIAGNOSTICS_HELP}>
          <div className="flex flex-col gap-1.5">
            <label className="flex flex-col gap-0.5 text-xs">
              Scenario
              <select
                className="h-5 rounded-sm border border-border bg-background px-1 font-mono text-xs"
                value={scenario.id}
                onChange={(event) => {
                  const next = diagnosticsRuntime.loadScenario(event.target.value);
                  simulationEngine.setScenario(next.id, next.seed);
                  simulationEngine.reset();
                }}
              >
                {SCENARIO_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-muted-foreground">{scenario.description}</p>
            <ul className="flex flex-col gap-0.5">
              {FAULT_CATALOG.map((fault) => {
                const active = faults.includes(fault.id);
                return (
                  <li key={fault.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-sm px-1 py-0.5 text-left text-xs",
                        active
                          ? "bg-destructive/15 text-destructive"
                          : "text-muted-foreground hover:bg-muted/60"
                      )}
                      onClick={() =>
                        active
                          ? diagnosticsRuntime.clearFault(fault.id)
                          : diagnosticsRuntime.injectFault(
                              fault.id as FaultId,
                              timestampMs
                            )
                      }
                    >
                      <span>{fault.name}</span>
                      <span className="font-mono uppercase">
                        {active ? "active" : "inject"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
    </PanelSection>
  );
}
