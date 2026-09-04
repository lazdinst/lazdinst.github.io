import { useState } from "react";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelSection } from "@/app/components/PanelSection";
import { SignalMeter } from "@/app/components/SignalMeter";
import { HOSTILE_KIND_LABEL, type Hostile } from "@/fleet";
import { cn } from "@/lib/utils";
import { FleetSelect } from "../../components";
import { THREATS_HELP } from "../../help/fleetHelp";
import { useFleetSnapshot } from "../../hooks";
import { useShellUi } from "../../shell/useShellUi";
import { useArmedCandidates, useQuickEngage } from "../ThreatCard";

const ORDER: Record<Hostile["status"], number> = { active: 0, suppressed: 1, eliminated: 2 };

export function ThreatBoard() {
  const snapshot = useFleetSnapshot();
  const ui = useShellUi();
  const candidates = useArmedCandidates(null);
  const quickEngage = useQuickEngage();
  const [pick, setPick] = useState<string | null>(null);
  const chosen = candidates.find((c) => c.asset.id === pick) ?? candidates.find((c) => c.blocker === null) ?? null;
  const hostiles = [...snapshot.hostiles].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.callsign.localeCompare(b.callsign));
  const active = hostiles.filter((hostile) => hostile.status !== "eliminated");

  return (
    <PanelSection
      title="Threats"
      info={THREATS_HELP}
      trailing={
        <span className={cn("font-mono text-[10px]", active.length > 0 ? "text-destructive" : "text-muted-foreground")}>
          {active.length} active · {hostiles.length - active.length} down
        </span>
      }
    >
      <div className="flex flex-col gap-2">
        <ul className="flex flex-col gap-0.5">
          {hostiles.map((hostile) => (
            <li key={hostile.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-1 py-0.5 text-left text-xs hover:bg-muted/60",
                  hostile.id === ui.selectedHostileId && "bg-muted",
                  hostile.status === "eliminated" && "opacity-60"
                )}
                onClick={() => {
                  ui.selectHostile(hostile.id);
                  ui.focusPoint(hostile.position);
                }}
              >
                <span className={cn("size-1.5 shrink-0 rotate-45", hostile.status === "eliminated" ? "bg-muted-foreground" : "bg-destructive")} />
                <span className="w-16 shrink-0 truncate font-mono text-foreground">{hostile.callsign}</span>
                <span className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">{HOSTILE_KIND_LABEL[hostile.kind]}</span>
                <SignalMeter value={hostile.hp} tone={hostile.status === "eliminated" ? "neutral" : "alert"} className="w-10 shrink-0" />
                <span
                  className={cn(
                    "w-14 shrink-0 text-right font-mono text-[10px] uppercase",
                    hostile.status === "active" ? "text-destructive" : hostile.status === "suppressed" ? "text-warning" : "text-muted-foreground"
                  )}
                >
                  {hostile.status === "eliminated" ? "down" : hostile.threat}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {active.length > 0 ? (
          <div className="flex items-center gap-1">
            <FleetSelect
              aria-label="Armed device for engagement"
              className="flex-1"
              value={chosen?.asset.id ?? null}
              placeholder="No armed device available"
              onValueChange={setPick}
              options={candidates.map(({ asset, blocker }) => ({
                value: asset.id,
                label: asset.callsign,
                description: blocker ?? `${asset.weapon!.system.name} · ${asset.weapon!.ammo} rds · armor ${asset.armorPct.toFixed(0)}%`,
                disabled: blocker !== null,
              }))}
            />
            <Button size="xs" disabled={!chosen || chosen.blocker !== null} onClick={() => chosen && quickEngage(chosen.asset, active)}>
              <Crosshair />
              Engage all
            </Button>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground">Objectives clear.</p>
        )}
      </div>
    </PanelSection>
  );
}
