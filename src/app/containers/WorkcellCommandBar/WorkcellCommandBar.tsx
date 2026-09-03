import { Bot, Pause, Play, Radio, RotateCcw, StepForward } from "lucide-react";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toggleAngleUnit } from "@/redux/slices/settings";
import { RootState, useAppDispatch } from "@/redux/store";
import { APP_TITLE } from "../../components/AppChrome/constants/chromeLayout";
import { cn } from "@/lib/utils";
import { useDiagnostics, useRobot, useSimulation } from "@/app/context";
import { URDF_MODELS, robotRuntime } from "@/robotics";
import { workcellRuntime } from "@/workcell";
import { diagnosticsRuntime } from "@/simulation/diagnostics/cellDiagnostics";
import {
  FAULT_CATALOG,
  formatSimTimeSeconds,
  simulationEngine,
  type CellStatus,
  type FaultId,
} from "@/simulation";

const STATUS_LABEL: Record<CellStatus, string> = {
  ready: "READY",
  running: "RUNNING",
  paused: "PAUSED",
  fault: "FAULT",
  protective_stop: "PROTECTIVE STOP",
};

/** Workcell title, cell status, clock, and simulation controls. */
export function WorkcellCommandBar() {
  const { status, timestampMs, cellStatus, playbackMode } = useSimulation();
  const { model } = useRobot();
  const { faults } = useDiagnostics();

  return (
    <>
      <h1 className="shrink-0 truncate text-xs font-medium text-foreground">
        {APP_TITLE}
      </h1>
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 font-mono font-normal tracking-wide",
          cellStatus === "running" && "border-success/40 text-success",
          cellStatus === "paused" && "border-warning/40 text-warning",
          (cellStatus === "fault" || cellStatus === "protective_stop") &&
            "border-destructive/40 text-destructive"
        )}
      >
        {STATUS_LABEL[cellStatus]}
      </Badge>
      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
        {formatSimTimeSeconds(timestampMs)}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="xs"
          disabled={status === "running"}
          aria-label="Start simulation"
          onClick={() => simulationEngine.start()}
        >
          <Play />
          Start
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={status !== "running"}
          aria-label="Pause simulation"
          onClick={() => simulationEngine.pause()}
        >
          <Pause />
          Pause
        </Button>
        <Button
          variant="outline"
          size="xs"
          aria-label="Reset simulation and home robot"
          onClick={() => simulationEngine.reset()}
        >
          <RotateCcw />
          Reset
        </Button>
        <Button
          variant="outline"
          size="xs"
          aria-label="Start autonomous pick"
          onClick={() => {
            if (status !== "running") {
              simulationEngine.start();
            }
            workcellRuntime.startAuto();
          }}
        >
          <Bot />
          Auto pick
        </Button>
        <Button
          variant="outline"
          size="xs"
          aria-label="Step pick state machine"
          onClick={() => {
            if (status !== "running") {
              simulationEngine.start();
            }
            workcellRuntime.startStep();
          }}
        >
          <StepForward />
          Step
        </Button>
        <label className="sr-only" htmlFor="inject-fault">
          Inject fault
        </label>
        <select
          id="inject-fault"
          className="h-5 max-w-32 truncate rounded-sm border border-border bg-background px-1 font-mono text-xs text-muted-foreground"
          value=""
          aria-label="Inject fault"
          onChange={(event) => {
            const id = event.target.value as FaultId;
            if (id) {
              diagnosticsRuntime.injectFault(id, timestampMs);
            }
          }}
        >
          <option value="">INJECT FAULT</option>
          {FAULT_CATALOG.map((fault) => (
            <option key={fault.id} value={fault.id}>
              {faults.includes(fault.id) ? `● ${fault.name}` : fault.name}
            </option>
          ))}
        </select>
        {playbackMode === "scrub" ? (
          <Button
            variant="outline"
            size="xs"
            aria-label="Resume live simulation view"
            onClick={() => simulationEngine.resumeLive()}
          >
            <Radio />
            Live
          </Button>
        ) : null}
      </div>
      <label className="sr-only" htmlFor="urdf-model">
        Robot model
      </label>
      <select
        id="urdf-model"
        className="h-5 max-w-36 shrink-0 truncate rounded-sm border border-border bg-background px-1 font-mono text-xs text-muted-foreground"
        value={model.id}
        aria-label="Robot model"
        onChange={(event) => robotRuntime.selectModel(event.target.value)}
      >
        {URDF_MODELS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </>
  );
}

/** deg/rad toggle shown at the right edge of the workcell command bar. */
export function AngleUnitToggle() {
  const dispatch = useAppDispatch();
  const { angleUnit } = useSelector((state: RootState) => state.settings);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="xs"
            className="h-5 px-1.5 font-mono text-xs tabular-nums"
            aria-label="Toggle angle unit"
            onClick={() => dispatch(toggleAngleUnit())}
          />
        }
      >
        {angleUnit === "deg" ? "deg" : "rad"}
      </TooltipTrigger>
      <TooltipContent>Angle unit</TooltipContent>
    </Tooltip>
  );
}
