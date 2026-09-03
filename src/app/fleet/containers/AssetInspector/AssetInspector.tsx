import { useState } from "react";
import { Home, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignalMeter } from "@/app/components/SignalMeter";
import { Sparkline } from "@/app/components/Sparkline";
import {
  FLEET_FAULT_CATALOG,
  describeObjective,
  findFleetFault,
  fleetRuntime,
  formatDuration,
  formatLatLng,
  kindProfile,
  type Asset,
  type FleetFaultId,
  type Mission,
} from "@/fleet";
import { cn } from "@/lib/utils";
import {
  FleetSelect,
  SENSOR_STATUS_TONE,
  Stat,
  StatusBadge,
  TONE_BADGE_CLASS,
  TONE_TEXT_CLASS,
  energyTone,
  healthTone,
  linkTone,
} from "../../components";
import { useAssetMission, useSelectedAsset } from "../../hooks";

function EmptyState() {
  return <p className="text-xs text-muted-foreground">Select an asset in the roster.</p>;
}

export function AssetStatusPanel() {
  const asset = useSelectedAsset();
  if (!asset) return <EmptyState />;
  const profile = kindProfile(asset.kind);
  const linkLabel =
    asset.link.relayId === null ? "no relay" : `${asset.link.relayId} · ${asset.link.latencyMs} ms`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-mono text-sm text-foreground">{asset.callsign}</span>
          <span className="truncate text-[10px] text-muted-foreground">
            {profile.label} · {asset.name}
          </span>
        </div>
        <StatusBadge status={asset.status} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Speed" value={asset.speedMps.toFixed(1)} unit="m/s" />
        <Stat label="Heading" value={`${asset.headingDeg.toFixed(0).padStart(3, "0")}°`} />
        <Stat label="Alt" value={asset.altitudeM.toFixed(0)} unit="m" />
      </div>
      <Stat label="Position" value={formatLatLng(asset.position)} />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <span>Energy</span>
          <span className="font-mono tabular-nums text-foreground">{asset.energyPct.toFixed(0)}%</span>
        </div>
        <SignalMeter value={asset.energyPct / 100} tone={energyTone(asset.energyPct)} />
        <Sparkline values={asset.energyHistory} className="h-6" stroke="var(--chart-2)" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <span>Link · {linkLabel}</span>
          <span className={cn("font-mono tabular-nums", TONE_TEXT_CLASS[linkTone(asset.link.quality) === "ok" ? "ok" : linkTone(asset.link.quality) === "warn" ? "warn" : "alert"])}>
            {asset.link.rssiDbm.toFixed(0)} dBm
          </span>
        </div>
        <SignalMeter value={asset.link.quality} tone={linkTone(asset.link.quality)} />
        <Sparkline values={asset.rssiHistory} className="h-6" />
      </div>
      <FaultControls asset={asset} />
      {asset.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1">
          {asset.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="outline" className="rounded-sm font-mono text-[10px] font-normal">
                {tag}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FaultControls({ asset }: { asset: Asset }) {
  const [pending, setPending] = useState<FleetFaultId | "">("");
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <label className="sr-only" htmlFor="fleet-inject-fault">
          Inject fault
        </label>
        <FleetSelect
          id="fleet-inject-fault"
          value={pending}
          className="flex-1 text-muted-foreground"
          onChange={(event) => setPending(event.target.value as FleetFaultId | "")}
        >
          <option value="">INJECT FAULT</option>
          {FLEET_FAULT_CATALOG.filter((fault) => !asset.faults.includes(fault.id)).map((fault) => (
            <option key={fault.id} value={fault.id}>
              {fault.name}
            </option>
          ))}
        </FleetSelect>
        <Button
          variant="outline"
          size="xs"
          disabled={pending === ""}
          onClick={() => {
            if (pending) {
              fleetRuntime.injectFault(asset.id, pending);
              setPending("");
            }
          }}
        >
          Inject
        </Button>
      </div>
      {asset.faults.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {asset.faults.map((fault) => {
            const definition = findFleetFault(fault);
            return (
              <li
                key={fault}
                className="flex items-center justify-between gap-1 rounded-sm border border-destructive/40 px-1 py-0.5"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-mono text-[10px] text-destructive uppercase">
                    {definition.name}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {definition.description}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Clear ${definition.name}`}
                  onClick={() => fleetRuntime.clearFault(asset.id, fault)}
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function SensorsPanel() {
  const asset = useSelectedAsset();
  if (!asset) return <EmptyState />;
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <th className="pb-1 text-left font-medium">Sensor</th>
          <th className="pb-1 text-right font-medium">Value</th>
          <th className="pb-1 pl-2 text-right font-medium">Health</th>
        </tr>
      </thead>
      <tbody>
        {asset.sensors.map((sensor) => {
          const tone = SENSOR_STATUS_TONE[sensor.status];
          return (
            <tr key={sensor.id} className="border-t border-border/60">
              <td className="py-0.5 pr-1 text-foreground">{sensor.label}</td>
              <td className="py-0.5 text-right font-mono tabular-nums text-foreground">
                {sensor.status === "failed" ? "—" : sensor.value.toFixed(sensor.value >= 100 ? 0 : 1)}
                <span className="ml-0.5 text-[10px] text-muted-foreground">{sensor.unit}</span>
              </td>
              <td className="py-0.5 pl-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  <SignalMeter value={sensor.health} tone={healthTone(sensor.health)} className="w-8" />
                  <span className={cn("w-8 text-right font-mono text-[10px] uppercase", TONE_TEXT_CLASS[tone])}>
                    {sensor.status === "ok" ? "ok" : sensor.status === "degraded" ? "deg" : "fail"}
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function MaintenancePanel() {
  const asset = useSelectedAsset();
  if (!asset) return <EmptyState />;
  const record = asset.maintenance;
  const ratio = record.hoursSinceService / record.serviceIntervalHours;
  const remaining = Math.max(0, record.serviceIntervalHours - record.hoursSinceService);
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Hours" value={record.hoursSinceService.toFixed(1)} unit="h" />
        <Stat label="Interval" value={record.serviceIntervalHours.toFixed(0)} unit="h" />
        <Stat
          label="Next due"
          value={record.due ? "NOW" : remaining.toFixed(1)}
          unit={record.due ? undefined : "h"}
          valueClassName={record.due ? "text-warning" : undefined}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <span>Wear</span>
          <span className="font-mono tabular-nums text-foreground">{(ratio * 100).toFixed(0)}%</span>
        </div>
        <SignalMeter value={Math.min(1, ratio)} tone={ratio >= 1 ? "alert" : ratio > 0.75 ? "warn" : "ok"} />
        <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <span>Health</span>
          <span className="font-mono tabular-nums text-foreground">{(record.healthScore * 100).toFixed(0)}%</span>
        </div>
        <SignalMeter value={record.healthScore} tone={healthTone(record.healthScore)} />
      </div>
      {record.workOrders.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {record.workOrders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-foreground">{order.title}</span>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 font-mono text-[10px] font-normal uppercase",
                  TONE_BADGE_CLASS[order.severity === "high" ? "alert" : order.severity === "medium" ? "warn" : "neutral"]
                )}
              >
                {order.severity}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[10px] text-muted-foreground">No open work orders.</p>
      )}
      <Button variant="outline" size="xs" className="self-start" onClick={() => fleetRuntime.markServiced(asset.id)}>
        <Wrench />
        Mark serviced
      </Button>
    </div>
  );
}

export function MissionPanel() {
  const asset = useSelectedAsset();
  const mission = useAssetMission(asset);
  if (!asset) return <EmptyState />;
  return (
    <div className="flex flex-col gap-2">
      {mission ? <MissionSummary mission={mission} /> : <p className="text-xs text-muted-foreground">No active mission.</p>}
      <div className="flex flex-wrap gap-1">
        <Button
          variant="outline"
          size="xs"
          disabled={asset.status === "returning"}
          onClick={() => fleetRuntime.returnToBase(asset.id)}
        >
          <Home />
          Return to base
        </Button>
        {mission ? (
          <Button variant="destructive" size="xs" onClick={() => fleetRuntime.abortMission(mission.id)}>
            <X />
            Abort
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function MissionSummary({ mission }: { mission: Mission }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-foreground">{describeObjective(mission.objective)}</span>
        <Badge variant="outline" className="shrink-0 font-mono text-[10px] font-normal uppercase">
          {mission.coa.variant}
        </Badge>
      </div>
      <SignalMeter value={mission.progress} tone="neutral" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Progress" value={`${(mission.progress * 100).toFixed(0)}%`} />
        <Stat label="ETA" value={formatDuration(mission.etaMs)} />
        <Stat
          label={mission.objective.type === "patrol" ? "Loops" : "Distance"}
          value={
            mission.objective.type === "patrol"
              ? mission.loops
              : `${(mission.coa.distanceM / 1000).toFixed(1)} km`
          }
        />
      </div>
    </div>
  );
}
