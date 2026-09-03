import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelSection } from "@/app/components/PanelSection";
import { SignalMeter } from "@/app/components/SignalMeter";
import { fleetRuntime, sortAssets } from "@/fleet";
import { cn } from "@/lib/utils";
import { QUEUE_HELP } from "../../help/fleetHelp";
import { useFleetSnapshot } from "../../hooks";

export function MaintenanceQueue() {
  const snapshot = useFleetSnapshot();
  const queue = sortAssets(snapshot.assets, "service").slice(0, 6);
  return (
    <PanelSection
      title="Maintenance queue"
      info={QUEUE_HELP}
      trailing={<span className="font-mono text-[10px] text-muted-foreground">{snapshot.stats.maintenanceDue} due</span>}
    >
      <ul className="flex flex-col gap-1">
        {queue.map((asset) => {
          const ratio = asset.maintenance.hoursSinceService / asset.maintenance.serviceIntervalHours;
          const due = asset.maintenance.due;
          return (
            <li key={asset.id} className="flex items-center gap-1.5">
              <button
                type="button"
                className={cn(
                  "w-16 shrink-0 truncate text-left font-mono text-xs hover:underline",
                  asset.id === snapshot.selectedAssetId ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => fleetRuntime.selectAsset(asset.id)}
              >
                {asset.callsign}
              </button>
              <SignalMeter
                value={Math.min(1, ratio)}
                tone={due ? "alert" : ratio > 0.75 ? "warn" : "ok"}
                className="flex-1"
              />
              <span className={cn("w-12 shrink-0 text-right font-mono text-[10px] tabular-nums", due ? "text-destructive" : "text-muted-foreground")}>
                {due ? "DUE" : `${(asset.maintenance.serviceIntervalHours - asset.maintenance.hoursSinceService).toFixed(1)} h`}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Service ${asset.callsign}`}
                onClick={() => fleetRuntime.markServiced(asset.id)}
              >
                <Wrench />
              </Button>
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
