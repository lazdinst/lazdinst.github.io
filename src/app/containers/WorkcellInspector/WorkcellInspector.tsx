import { Badge } from "@/components/ui/badge";
import { OPERATION_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useWorkcell } from "@/app/context";
import { perceptionRuntime } from "@/perception";
import { workcellRuntime } from "@/workcell";
import { cn } from "@/lib/utils";

export function WorkcellInspector() {
  const { parts, selectedPartId, pick, tool, message } = useWorkcell();
  const vacuum = tool.vacuum;
  const remaining = parts.filter(
    (part) => part.status === "in_tote" || part.status === "selected"
  ).length;
  const placed = parts.filter((part) => part.status === "placed").length;

  return (
    <PanelSection title="Workcell" info={OPERATION_HELP}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-1">
          <Badge
            variant="outline"
            className="font-mono font-normal tracking-wide uppercase"
          >
            {pick.phase.replace(/_/g, " ")}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            cycle {pick.cycleIndex}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {remaining} in tote · {placed} placed
          {message ? ` · ${message}` : ""}
        </p>
        {vacuum ? (
          <p className="font-mono text-xs text-muted-foreground">
            vac {vacuum.enabled ? "ON" : "off"} · {vacuum.pressureKPa.toFixed(0)} kPa ·
            seal {(vacuum.sealQuality * 100).toFixed(0)}%
            {vacuum.objectSecured ? " · SECURED" : ""}
          </p>
        ) : null}
        <ul className="flex flex-col gap-0.5">
          {parts.map((part) => (
            <li key={part.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-1 py-0.5 text-left text-xs",
                  part.id === selectedPartId
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60"
                )}
                onClick={() => {
                  workcellRuntime.selectPart(part.id);
                  perceptionRuntime.syncSelectionFromPart(part.id);
                }}
              >
                <span className="font-mono">
                  {part.id} {part.sku}
                </span>
                <span className="uppercase">{part.status.replace("_", " ")}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </PanelSection>
  );
}
