import { Pause, Play, Radio, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FLEET_SCENARIOS, fleetRuntime } from "@/fleet";
import { formatSimTimeSeconds } from "@/simulation";
import { cn } from "@/lib/utils";
import { FleetSelect } from "../../components";
import { useFleetView } from "../../hooks";

export const FLEET_TITLE = "Fleet Ops";
const TIME_SCALES = [1, 2, 5, 10];

export function FleetCommandBar() {
  const view = useFleetView();
  const alert = view.faultCount > 0 || view.lostLinkCount > 0;
  const statusLabel =
    view.status === "running" ? "RUNNING" : view.status === "paused" ? "PAUSED" : "READY";

  return (
    <>
      <h1 className="shrink-0 truncate text-xs font-medium text-foreground">{FLEET_TITLE}</h1>
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 font-mono font-normal tracking-wide",
          view.status === "running" && !alert && "border-success/40 text-success",
          view.status === "paused" && "border-warning/40 text-warning",
          alert && "border-destructive/40 text-destructive"
        )}
      >
        {alert ? `${statusLabel} · ${view.faultCount + view.lostLinkCount} ALERT` : statusLabel}
      </Badge>
      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
        {formatSimTimeSeconds(view.timestampMs)}
      </span>
      <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline">
        {view.activeCount} active
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="xs"
          disabled={view.status === "running"}
          aria-label="Start fleet simulation"
          onClick={() => fleetRuntime.start()}
        >
          <Play />
          Start
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={view.status !== "running"}
          aria-label="Pause fleet simulation"
          onClick={() => fleetRuntime.pause()}
        >
          <Pause />
          Pause
        </Button>
        <Button
          variant="outline"
          size="xs"
          aria-label="Reset fleet simulation"
          onClick={() => fleetRuntime.reset()}
        >
          <RotateCcw />
          Reset
        </Button>
        {view.playbackMode === "scrub" ? (
          <Button
            variant="outline"
            size="xs"
            aria-label="Resume live view"
            onClick={() => fleetRuntime.resumeLive()}
          >
            <Radio />
            Live
          </Button>
        ) : null}
        <label className="sr-only" htmlFor="fleet-time-scale">
          Time scale
        </label>
        <FleetSelect
          id="fleet-time-scale"
          value={view.timeScale}
          aria-label="Time scale"
          className="text-muted-foreground"
          onChange={(event) => fleetRuntime.setTimeScale(Number(event.target.value))}
        >
          {TIME_SCALES.map((scale) => (
            <option key={scale} value={scale}>
              {scale}×
            </option>
          ))}
        </FleetSelect>
        <label className="sr-only" htmlFor="fleet-scenario">
          Scenario
        </label>
        <FleetSelect
          id="fleet-scenario"
          value={view.scenarioId}
          aria-label="Scenario"
          className="max-w-40 text-muted-foreground"
          onChange={(event) => fleetRuntime.setScenario(event.target.value)}
        >
          {FLEET_SCENARIOS.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name.toUpperCase()}
            </option>
          ))}
        </FleetSelect>
      </div>
    </>
  );
}
