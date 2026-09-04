import { useState } from "react";
import { Crosshair, LocateFixed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignalMeter } from "@/app/components/SignalMeter";
import { HOSTILE_KIND_LABEL, formatDuration, formatLatLng, type Hostile } from "@/fleet";
import { useArmedCandidates, useQuickEngage } from "./engageHooks";
import { cn } from "@/lib/utils";
import { FleetSelect, FloatingPanel, Stat, TONE_BADGE_CLASS } from "../../components";
import { useFleetSnapshot, useFleetView } from "../../hooks";
import { useShellUi } from "../../shell/useShellUi";

const THREAT_TONE = { low: "warn", medium: "warn", high: "alert" } as const;
const STATUS_TONE = { active: "alert", suppressed: "warn", eliminated: "neutral" } as const;

export function ThreatCard({ hostile, onClose }: { hostile: Hostile; onClose: () => void }) {
  const view = useFleetView();
  const snapshot = useFleetSnapshot();
  const ui = useShellUi();
  const candidates = useArmedCandidates(hostile);
  const quickEngage = useQuickEngage();
  const [pick, setPick] = useState<string | null>(null);
  const chosen = candidates.find((c) => c.asset.id === pick) ?? candidates.find((c) => c.blocker === null) ?? null;
  const spotter = hostile.detectedBy ? snapshot.assets.find((asset) => asset.id === hostile.detectedBy) : null;
  const engagers = hostile.engagedBy
    .map((id) => snapshot.assets.find((asset) => asset.id === id)?.callsign)
    .filter((callsign): callsign is string => Boolean(callsign));

  return (
    <FloatingPanel
      className="max-h-full"
      title={
        <span className="flex items-center gap-1.5 normal-case tracking-normal">
          <span className="size-2 rotate-45 bg-destructive" />
          <span className="font-mono text-sm text-foreground">{hostile.callsign}</span>
          <span className="truncate text-[10px] text-muted-foreground">{hostile.label}</span>
        </span>
      }
      trailing={
        <Badge variant="outline" className={cn("font-mono text-[10px] font-normal uppercase", TONE_BADGE_CLASS[STATUS_TONE[hostile.status]])}>
          {hostile.status}
        </Badge>
      }
      onClose={onClose}
      closeLabel="Close threat"
      bodyClassName="gap-2.5 pt-2"
    >
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Threat" value={hostile.threat.toUpperCase()} valueClassName={cn(hostile.threat === "high" ? "text-destructive" : "text-warning")} />
        <Stat label="Kind" value={HOSTILE_KIND_LABEL[hostile.kind]} />
        <Stat label="Speed" value={hostile.speedMps.toFixed(1)} unit="m/s" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <span>Integrity</span>
          <span className="font-mono tabular-nums text-foreground">{(hostile.hp * 100).toFixed(0)}%</span>
        </div>
        <SignalMeter value={hostile.hp} tone={THREAT_TONE[hostile.threat] === "alert" ? "alert" : "warn"} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Weapon range" value={hostile.weaponRangeM.toFixed(0)} unit="m" />
        <Stat
          label="Last seen"
          value={hostile.lastSeenMs === null ? "never" : `${formatDuration(view.timestampMs - hostile.lastSeenMs)} ago`}
        />
        <Stat label="Position" value={formatLatLng(hostile.position)} className="col-span-2" />
        <Stat label="Spotted by" value={spotter?.callsign ?? "—"} />
        <Stat label="Engaged by" value={engagers.length > 0 ? engagers.join(", ") : "—"} />
      </div>
      {hostile.status !== "eliminated" ? (
        <div className="flex flex-col gap-1.5 border-t border-border pt-2">
          <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Engage with</span>
          <div className="flex items-center gap-1">
            <FleetSelect
              aria-label="Armed device"
              className="flex-1"
              value={chosen?.asset.id ?? null}
              placeholder="No armed device available"
              onValueChange={setPick}
              options={candidates.map(({ asset, distanceM, blocker }) => ({
                value: asset.id,
                label: asset.callsign,
                description: `${(distanceM / 1000).toFixed(1)} km · ${blocker ?? `${asset.weapon!.ammo} rds · armor ${asset.armorPct.toFixed(0)}%`}`,
                disabled: blocker !== null,
              }))}
            />
            <Button size="xs" disabled={!chosen || chosen.blocker !== null} onClick={() => chosen && quickEngage(chosen.asset, [hostile])}>
              <Crosshair />
              Engage
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground">
          Eliminated {hostile.eliminatedAtMs !== null ? `${formatDuration(view.timestampMs - hostile.eliminatedAtMs)} ago` : ""}
          {hostile.eliminatedBy ? ` by ${snapshot.assets.find((a) => a.id === hostile.eliminatedBy)?.callsign ?? hostile.eliminatedBy}` : ""}
        </p>
      )}
      <Button variant="outline" size="xs" className="self-start" onClick={() => ui.focusPoint(hostile.position)}>
        <LocateFixed />
        Center on map
      </Button>
    </FloatingPanel>
  );
}
