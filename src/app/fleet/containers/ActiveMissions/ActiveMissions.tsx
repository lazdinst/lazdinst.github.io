import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection } from "@/app/components/PanelSection";
import { SignalMeter } from "@/app/components/SignalMeter";
import { describeObjective, fleetRuntime, formatDuration, type Mission } from "@/fleet";
import { cn } from "@/lib/utils";
import { MISSIONS_HELP } from "../../help/fleetHelp";
import { useFleetSnapshot } from "../../hooks";

export function ActiveMissions() {
  const snapshot = useFleetSnapshot();
  const active = snapshot.missions
    .filter((mission) => mission.status === "active")
    .sort((a, b) => a.startedAtMs - b.startedAtMs);
  const recent = snapshot.missions
    .filter((mission) => mission.status !== "active")
    .sort((a, b) => (b.completedAtMs ?? 0) - (a.completedAtMs ?? 0))
    .slice(0, 3);

  return (
    <PanelSection
      title="Active missions"
      info={MISSIONS_HELP}
      trailing={<span className="font-mono text-[10px] text-muted-foreground">{active.length}</span>}
    >
      {active.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing dispatched.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {active.map((mission) => (
            <MissionRow key={mission.id} mission={mission} selected={mission.assetId === snapshot.selectedAssetId} />
          ))}
        </ul>
      )}
      {recent.length > 0 ? (
        <ul className="flex flex-col gap-0.5 border-t border-border pt-1">
          {recent.map((mission) => (
            <li key={mission.id} className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span className="truncate">
                {mission.callsign} · {describeObjective(mission.objective)}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 font-mono text-[10px] font-normal uppercase",
                  mission.status === "complete" && "border-success/40 text-success",
                  mission.status === "failed" && "border-destructive/40 text-destructive",
                  mission.status === "aborted" && "border-warning/40 text-warning"
                )}
              >
                {mission.status}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </PanelSection>
  );
}

function MissionRow({ mission, selected }: { mission: Mission; selected: boolean }) {
  return (
    <li
      className={cn(
        "flex flex-col gap-1 rounded-sm border px-1.5 py-1",
        selected ? "border-chart-1/40 bg-muted" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          className="min-w-0 truncate text-left font-mono text-xs text-foreground hover:underline"
          onClick={() => fleetRuntime.selectAsset(mission.assetId)}
        >
          {mission.callsign}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">{mission.coa.variant}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Abort ${mission.callsign} mission`}
            onClick={() => fleetRuntime.abortMission(mission.id)}
          >
            <X />
          </Button>
        </div>
      </div>
      <span className="truncate text-[10px] text-muted-foreground">{describeObjective(mission.objective)}</span>
      <div className="flex items-center gap-1.5">
        <SignalMeter value={mission.progress} tone="neutral" className="flex-1" />
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {mission.objective.type === "patrol" ? `loop ${mission.loops + 1}` : `eta ${formatDuration(mission.etaMs)}`}
        </span>
      </div>
    </li>
  );
}
