import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { IO_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useDiagnostics } from "@/app/context";
import { diagnosticsRuntime } from "@/simulation/diagnostics/cellDiagnostics";
import { DIGITAL_INPUTS, DIGITAL_OUTPUTS, type DigitalInput } from "@/workcell";
import { cn } from "@/lib/utils";

export function CellIoInspector() {
  const { io } = useDiagnostics();

  return (
    <PanelSection title="Cell I/O" info={IO_HELP}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">PLC comms</span>
              <Badge
                variant="outline"
                className={cn(
                  "font-mono font-normal uppercase",
                  io && !io.commsOk && "border-destructive/40 text-destructive"
                )}
              >
                {io?.commsOk === false ? "lost" : "ok"}
              </Badge>
            </div>
            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
              Inputs — override in simulation
            </p>
            {DIGITAL_INPUTS.map((key) => (
              <IoRow
                key={key}
                label={key}
                on={io?.digitalInputs[key] === true}
                override={io?.overrides[key]}
                onToggle={(value) => diagnosticsRuntime.setIoOverride(key, value)}
              />
            ))}
            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
              Outputs
            </p>
            {DIGITAL_OUTPUTS.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between font-mono text-xs"
              >
                <span className="text-muted-foreground">{key}</span>
                <span
                  className={
                    io?.digitalOutputs[key] ? "text-emerald-500" : "text-zinc-500"
                  }
                >
                  {io?.digitalOutputs[key] ? "1" : "0"}
                </span>
              </div>
            ))}
          </div>
    </PanelSection>
  );
}

function IoRow({
  label,
  on,
  override,
  onToggle,
}: {
  label: DigitalInput;
  on: boolean;
  override: boolean | undefined;
  onToggle: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {override !== undefined ? (
          <span className="text-[10px] text-amber-400">OVRD</span>
        ) : null}
        <Switch size="sm" checked={on} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}
