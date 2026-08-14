import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SAFETY_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useDiagnostics } from "@/app/context";
import { diagnosticsRuntime } from "@/simulation/diagnostics/cellDiagnostics";
import { cn } from "@/lib/utils";

export function SafetyInspector() {
  const { safety } = useDiagnostics();

  return (
    <PanelSection title="Safety" info={SAFETY_HELP}>
          <div className="flex flex-col gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                "w-fit font-mono font-normal uppercase",
                safety.protectiveStop && "border-destructive/40 text-destructive",
                safety.reducedSpeed &&
                  !safety.protectiveStop &&
                  "border-warning/40 text-warning"
              )}
            >
              {safety.protectiveStop
                ? "protective stop"
                : safety.reducedSpeed
                  ? "reduced speed"
                  : "clear"}
            </Badge>
            <p className="font-mono text-xs text-muted-foreground">
              speed ×{safety.speedScale.toFixed(1)}
            </p>
            <SafetySwitch
              id="warning-zone"
              label="Warning zone"
              checked={safety.warningZoneOccupied}
              onCheckedChange={(occupied) =>
                diagnosticsRuntime.setWarningOccupied(occupied)
              }
            />
            <SafetySwitch
              id="protective-zone"
              label="Protective zone"
              checked={safety.protectiveZoneOccupied}
              onCheckedChange={(occupied) =>
                diagnosticsRuntime.setProtectiveOccupied(occupied)
              }
            />
            <SafetySwitch
              id="light-curtain"
              label="Light curtain clear"
              checked={safety.lightCurtainClear}
              onCheckedChange={(clear) =>
                diagnosticsRuntime.setLightCurtainClear(clear)
              }
            />
            <SafetySwitch
              id="guard-door"
              label="Guard door closed"
              checked={safety.guardDoorClosed}
              onCheckedChange={(closed) =>
                diagnosticsRuntime.setGuardDoorClosed(closed)
              }
            />
            <SafetySwitch
              id="e-stop"
              label="E-stop"
              checked={safety.eStop}
              onCheckedChange={(active) => diagnosticsRuntime.setEStop(active)}
            />
          </div>
    </PanelSection>
  );
}

function SafetySwitch({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      <Switch
        id={id}
        size="sm"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
