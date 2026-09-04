import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelSection } from "@/app/components/PanelSection";
import { FLEET_SCENARIOS, fleetRuntime } from "@/fleet";
import { FleetSelect, FloatingPanel } from "../components";
import { ActiveMissions } from "../containers/ActiveMissions";
import { FleetTelemetry } from "../containers/FleetTelemetry";
import { MaintenanceQueue } from "../containers/MaintenanceQueue";
import { ThreatBoard } from "../containers/ThreatBoard";
import { ZoneManager } from "../containers/ZoneManager";
import { useFleetView } from "../hooks";

const TIME_SCALES = [1, 2, 5, 10];

interface OperationsDrawerProps {
  onClose: () => void;
}

/**
 * Hamburger drawer: missions, zones, telemetry, maintenance, and simulation
 * settings. Planning has its own panel, opened from a device.
 */
export function OperationsDrawer({ onClose }: OperationsDrawerProps) {
  return (
    <FloatingPanel title="Operations" onClose={onClose} closeLabel="Close operations" className="max-h-full">
      <ActiveMissions />
      <ThreatBoard />
      <ZoneManager />
      <FleetTelemetry />
      <MaintenanceQueue />
      <SimulationSection />
    </FloatingPanel>
  );
}

function SimulationSection() {
  const view = useFleetView();
  return (
    <PanelSection title="Simulation">
      <div className="grid grid-cols-[4.5rem_1fr] items-center gap-x-2 gap-y-1">
        <label htmlFor="fleet-scenario" className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          Scenario
        </label>
        <FleetSelect
          id="fleet-scenario"
          value={view.scenarioId}
          onValueChange={(next) => fleetRuntime.setScenario(next)}
          options={FLEET_SCENARIOS.map((scenario) => ({
            value: scenario.id,
            label: scenario.name,
            description: scenario.description,
          }))}
          contentClassName="w-72"
        />
        <label htmlFor="fleet-time-scale" className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          Time scale
        </label>
        <FleetSelect
          id="fleet-time-scale"
          value={String(view.timeScale)}
          onValueChange={(next) => fleetRuntime.setTimeScale(Number(next))}
          options={TIME_SCALES.map((scale) => ({ value: String(scale), label: `${scale}×` }))}
        />
      </div>
      <Button variant="outline" size="xs" className="self-start" onClick={() => fleetRuntime.reset()}>
        <RotateCcw />
        Reset simulation
      </Button>
    </PanelSection>
  );
}
