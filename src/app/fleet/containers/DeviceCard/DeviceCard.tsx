import { useEffect, useState } from "react";
import { Crosshair, Home, RefreshCw, Route, ShieldAlert, ShieldCheck, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
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
  type Sitrep,
} from "@/fleet";
import { cn } from "@/lib/utils";
import {
  AssetGlyph,
  FavoriteButton,
  FleetSelect,
  FloatingPanel,
  SENSOR_STATUS_TONE,
  STATUS_TONE,
  Stat,
  StatusBadge,
  TONE_BADGE_CLASS,
  TONE_TEXT_CLASS,
  energyTone,
  healthTone,
  linkTone,
} from "../../components";
import { useAssetMission, useFleetSnapshot, useFleetView } from "../../hooks";
import { useDevicePrefs } from "../../shell/useDevicePrefs";

type Tab = "overview" | "sensors" | "maintenance" | "mission";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sensors", label: "Sensors" },
  { id: "maintenance", label: "Maint" },
  { id: "mission", label: "Mission" },
];

interface DeviceCardProps {
  asset: Asset;
  onClose: () => void;
  onPlan: () => void;
}

/** Floating detail card for the selected device, tabbed so each view stands alone. */
export function DeviceCard({ asset, onClose, onPlan }: DeviceCardProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const mission = useAssetMission(asset);
  const profile = kindProfile(asset.kind);
  const { isFavorite, toggleFavorite } = useDevicePrefs();

  // A fresh selection always opens on the overview.
  useEffect(() => {
    setTab("overview");
  }, [asset.id]);

  const degradedSensors = asset.sensors.filter((sensor) => sensor.status !== "ok").length;
  const openOrders = asset.maintenance.workOrders.length;

  return (
    <FloatingPanel
      className="max-h-full"
      title={
        <span className="flex min-w-0 items-center gap-1.5 normal-case tracking-normal">
          <AssetGlyph kind={asset.kind} className="text-foreground" />
          <span className="shrink-0 font-mono text-sm whitespace-nowrap text-foreground">
            {asset.callsign}
          </span>
          <span className="min-w-0 truncate text-[10px] text-muted-foreground">
            {profile.label} · {asset.name}
          </span>
        </span>
      }
      trailing={
        <>
          <FavoriteButton
            active={isFavorite(asset.id)}
            callsign={asset.callsign}
            onToggle={() => toggleFavorite(asset.id)}
            size="icon-sm"
          />
          <StatusBadge status={asset.status} />
        </>
      }
      onClose={onClose}
      closeLabel="Close device"
      bodyClassName="gap-2 pt-2"
    >
      <AttentionStrip asset={asset} />
      <div role="tablist" aria-label="Device views" className="grid grid-cols-4 gap-0.5 rounded-md bg-muted p-0.5">
        {TABS.map((option) => {
          const badge =
            option.id === "sensors" && degradedSensors > 0
              ? degradedSensors
              : option.id === "maintenance" && (openOrders > 0 || asset.maintenance.due)
                ? openOrders || "!"
                : option.id === "mission" && mission
                  ? "●"
                  : null;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={tab === option.id}
              className={cn(
                "flex h-5 items-center justify-center gap-1 rounded-sm font-mono text-[10px] tracking-wide uppercase transition-colors",
                tab === option.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setTab(option.id)}
            >
              {option.label}
              {badge !== null ? (
                <span className={cn("text-[9px]", option.id === "mission" ? "text-success" : "text-warning")}>{badge}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {tab === "overview" ? <OverviewTab asset={asset} mission={mission} onPlan={onPlan} /> : null}
      {tab === "sensors" ? <SensorsTab asset={asset} /> : null}
      {tab === "maintenance" ? <MaintenanceTab asset={asset} /> : null}
      {tab === "mission" ? <MissionTab asset={asset} mission={mission} onPlan={onPlan} /> : null}
    </FloatingPanel>
  );
}

/** One line that says why the device needs attention, if it does. */
function AttentionStrip({ asset }: { asset: Asset }) {
  const view = useFleetView();
  const items: { tone: "alert" | "warn"; text: string }[] = [];
  if (asset.status === "lost_link") {
    const forMs = asset.link.lostSinceMs !== null ? view.timestampMs - asset.link.lostSinceMs : 0;
    items.push({ tone: "alert", text: `Link lost ${formatDuration(forMs)} ago · holding last fix` });
  }
  asset.faults.forEach((fault) => {
    items.push({ tone: "alert", text: `Fault · ${findFleetFault(fault).name}` });
  });
  if (asset.maintenance.due) {
    const orders = asset.maintenance.workOrders.length;
    items.push({
      tone: "warn",
      text: `Maintenance due${orders > 0 ? ` · ${orders} open order${orders === 1 ? "" : "s"}` : ""} · dispatch needs override`,
    });
  } else if (asset.status === "charging") {
    items.push({ tone: "warn", text: `Charging · ${asset.energyPct.toFixed(0)}% · dispatch above 35%` });
  }
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li
          key={item.text}
          className={cn(
            "rounded-sm border px-1.5 py-0.5 font-mono text-[10px]",
            item.tone === "alert" ? "border-destructive/40 text-destructive" : "border-warning/40 text-warning"
          )}
        >
          {item.text}
        </li>
      ))}
    </ul>
  );
}

function OverviewTab({ asset, mission, onPlan }: { asset: Asset; mission: Mission | null; onPlan: () => void }) {
  const linkLabel = asset.link.relayId === null ? "no relay" : `${asset.link.relayId} · ${asset.link.latencyMs} ms`;
  const canRtb = asset.status !== "returning" && asset.status !== "lost_link";
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Speed" value={asset.speedMps.toFixed(1)} unit="m/s" />
        <Stat label="Heading" value={`${asset.headingDeg.toFixed(0).padStart(3, "0")}°`} />
        <Stat label="Alt" value={asset.altitudeM.toFixed(0)} unit="m" />
        <Stat label="Health" value={`${(asset.maintenance.healthScore * 100).toFixed(0)}%`} valueClassName={TONE_TEXT_CLASS[healthTone(asset.maintenance.healthScore) === "ok" ? "ok" : healthTone(asset.maintenance.healthScore) === "warn" ? "warn" : "alert"]} />
      </div>
      <Meter
        label="Energy"
        value={`${asset.energyPct.toFixed(0)}%`}
        ratio={asset.energyPct / 100}
        tone={energyTone(asset.energyPct)}
        history={asset.energyHistory}
        stroke="var(--chart-2)"
      />
      <Meter
        label={`Link · ${linkLabel}`}
        value={`${asset.link.rssiDbm.toFixed(0)} dBm`}
        ratio={asset.link.quality}
        tone={linkTone(asset.link.quality)}
        history={asset.rssiHistory}
      />
      {asset.weapon ? <WeaponBlock asset={asset} /> : null}
      {mission ? (
        <div className="flex flex-col gap-1 rounded-md border border-border p-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-foreground">{describeObjective(mission.objective)}</span>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
              {(mission.progress * 100).toFixed(0)}% · eta {formatDuration(mission.etaMs)}
            </span>
          </div>
          <SignalMeter value={mission.progress} tone="neutral" />
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <Stat label="Position" value={formatLatLng(asset.position)} />
        {asset.tags.length > 0 ? (
          <ul className="flex flex-wrap justify-end gap-1">
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
      <div className="flex flex-wrap gap-1">
        <Button size="xs" onClick={onPlan}>
          <Route />
          Plan mission
          <Kbd size="small" className="ml-0.5 opacity-70">P</Kbd>
        </Button>
        <Button variant="outline" size="xs" disabled={!canRtb} onClick={() => fleetRuntime.returnToBase(asset.id)}>
          <Home />
          Return to base
          <Kbd size="small" className="ml-0.5">B</Kbd>
        </Button>
        {mission ? (
          <Button variant="destructive" size="xs" onClick={() => fleetRuntime.abortMission(mission.id)}>
            <X />
            Abort
            <Kbd size="small" className="ml-0.5">X</Kbd>
          </Button>
        ) : null}
        {asset.maintenance.due ? (
          <Button variant="outline" size="xs" onClick={() => fleetRuntime.markServiced(asset.id)}>
            <Wrench />
            Service
          </Button>
        ) : null}
      </div>
      <FaultControls asset={asset} />
    </div>
  );
}

function Meter({
  label,
  value,
  ratio,
  tone,
  history,
  stroke,
}: {
  label: string;
  value: string;
  ratio: number;
  tone: "ok" | "warn" | "alert" | "neutral";
  history: number[];
  stroke?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        <span className="truncate">{label}</span>
        <span className="shrink-0 font-mono tabular-nums text-foreground">{value}</span>
      </div>
      <SignalMeter value={ratio} tone={tone} />
      <div className="hud-plot-grid rounded-sm">
        <Sparkline values={history} className="h-6" stroke={stroke} />
      </div>
    </div>
  );
}

function FaultControls({ asset }: { asset: Asset }) {
  const [pending, setPending] = useState<FleetFaultId | "">("");
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-2">
      <div className="flex items-center gap-1">
        <span className="shrink-0 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Diagnostics</span>
        <FleetSelect<FleetFaultId>
          aria-label="Inject fault"
          value={pending === "" ? null : pending}
          placeholder="Inject fault…"
          className="flex-1"
          muted={pending === ""}
          onValueChange={(next) => setPending(next)}
          options={FLEET_FAULT_CATALOG.filter((fault) => !asset.faults.includes(fault.id)).map((fault) => ({
            value: fault.id,
            label: fault.name,
            description: fault.description,
          }))}
        />
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
              <li key={fault} className="flex items-center justify-between gap-1 rounded-sm border border-destructive/40 px-1 py-0.5">
                <span className="truncate text-[10px] text-muted-foreground">
                  <span className="font-mono text-destructive uppercase">{definition.name}</span> · {definition.description}
                </span>
                <Button variant="ghost" size="icon-xs" aria-label={`Clear ${definition.name}`} onClick={() => fleetRuntime.clearFault(asset.id, fault)}>
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

function SensorsTab({ asset }: { asset: Asset }) {
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
              <td className="py-1 pr-1 text-foreground">{sensor.label}</td>
              <td className="py-1 text-right font-mono tabular-nums text-foreground">
                {sensor.status === "failed" ? "—" : sensor.value.toFixed(sensor.value >= 100 ? 0 : 1)}
                <span className="ml-0.5 text-[10px] text-muted-foreground">{sensor.unit}</span>
              </td>
              <td className="py-1 pl-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  <SignalMeter value={sensor.health} tone={healthTone(sensor.health)} className="w-10" />
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

function MaintenanceTab({ asset }: { asset: Asset }) {
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
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          Work orders · {record.workOrders.length}
        </span>
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
          <p className="text-[10px] text-muted-foreground">None open.</p>
        )}
      </div>
      <Button variant="outline" size="xs" className="self-start" onClick={() => fleetRuntime.markServiced(asset.id)}>
        <Wrench />
        Mark serviced
      </Button>
    </div>
  );
}

function MissionTab({ asset, mission, onPlan }: { asset: Asset; mission: Mission | null; onPlan: () => void }) {
  const snapshot = useFleetSnapshot();
  const history = snapshot.missions
    .filter((candidate) => candidate.assetId === asset.id && candidate.status !== "active")
    .sort((a, b) => (b.completedAtMs ?? 0) - (a.completedAtMs ?? 0))
    .slice(0, 4);
  return (
    <div className="flex flex-col gap-2">
      {mission ? (
        <div className="flex flex-col gap-1.5 rounded-md border border-border p-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-foreground">{describeObjective(mission.objective)}</span>
            <Badge variant="outline" className="shrink-0 font-mono text-[10px] font-normal uppercase">
              {mission.coa.variant}
            </Badge>
          </div>
          <SignalMeter value={mission.progress} tone="neutral" />
          {mission.sitrep ? <SitrepBlock sitrep={mission.sitrep} /> : null}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Progress" value={`${(mission.progress * 100).toFixed(0)}%`} />
            <Stat label="ETA" value={formatDuration(mission.etaMs)} />
            <Stat
              label={mission.objective.type === "patrol" ? "Loops" : "Distance"}
              value={mission.objective.type === "patrol" ? mission.loops : `${(mission.coa.distanceM / 1000).toFixed(1)} km`}
            />
          </div>
          <div className="flex gap-1">
            <Button variant="destructive" size="xs" onClick={() => fleetRuntime.abortMission(mission.id)}>
              <X />
              Abort
            </Button>
            <Button variant="outline" size="xs" onClick={() => fleetRuntime.returnToBase(asset.id)}>
              <Home />
              Return to base
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 rounded-md border border-dashed border-border p-2 text-xs text-muted-foreground">
          <span>No active mission.</span>
          <Button size="xs" className="self-start" onClick={onPlan}>
            <Route />
            Plan mission
          </Button>
        </div>
      )}
      {history.length > 0 ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Recent</span>
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span className="truncate">{describeObjective(item.objective)}</span>
              <span
                className={cn(
                  "shrink-0 font-mono uppercase",
                  item.status === "complete" && "text-success",
                  item.status === "failed" && "text-destructive",
                  item.status === "aborted" && "text-warning"
                )}
              >
                {item.status}
                {item.failureReason ? ` · ${item.failureReason}` : ""}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <span className={cn("text-[10px]", TONE_TEXT_CLASS[STATUS_TONE[asset.status]])} />
    </div>
  );
}

function WeaponBlock({ asset }: { asset: Asset }) {
  const weapon = asset.weapon!;
  const ammoRatio = weapon.system.ammoCapacity > 0 ? weapon.ammo / weapon.system.ammoCapacity : 0;
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border p-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <Crosshair className="size-3" />
          {weapon.system.name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {weapon.system.rangeM} m · {weapon.system.roundsPerMin} rpm
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            <span>Ammo</span>
            <span className="font-mono tabular-nums text-foreground">
              {weapon.ammo}/{weapon.system.ammoCapacity}
            </span>
          </div>
          <SignalMeter value={ammoRatio} tone={ammoRatio <= 0.2 ? "alert" : ammoRatio <= 0.5 ? "warn" : "ok"} />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            <span>Armor</span>
            <span className="font-mono tabular-nums text-foreground">{asset.armorPct.toFixed(0)}%</span>
          </div>
          <SignalMeter value={asset.armorPct / 100} tone={asset.armorPct < 40 ? "alert" : asset.armorPct < 70 ? "warn" : "ok"} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Kills" value={weapon.targetsEliminated} />
        <Stat label="Rounds" value={weapon.shotsFired} />
        <Stat label="Hits" value={weapon.shotsFired > 0 ? `${Math.round((weapon.hits / weapon.shotsFired) * 100)}%` : "—"} />
      </div>
      <div className="flex flex-wrap gap-1">
        <Button
          variant={weapon.safe ? "outline" : "secondary"}
          size="xs"
          aria-pressed={!weapon.safe}
          onClick={() => fleetRuntime.setWeaponsHold(asset.id, !weapon.safe)}
        >
          {weapon.safe ? <ShieldAlert /> : <ShieldCheck />}
          {weapon.safe ? "Weapons hold" : "Weapons free"}
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={weapon.ammo === weapon.system.ammoCapacity && asset.armorPct >= 100}
          onClick={() => fleetRuntime.rearm(asset.id)}
        >
          <RefreshCw />
          Rearm at depot
        </Button>
      </div>
    </div>
  );
}

function SitrepBlock({ sitrep }: { sitrep: Sitrep }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-destructive/40 p-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.16em] text-destructive uppercase">SITREP</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {sitrep.engagementStartedMs === null ? "no contact yet" : `contact ${formatDuration(sitrep.elapsedMs)}`}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat
          label="Eliminated"
          value={`${sitrep.targetsEliminated}/${sitrep.targetsAssigned}`}
          valueClassName={sitrep.targetsRemaining === 0 ? "text-success" : undefined}
        />
        <Stat label="Rounds · hits" value={`${sitrep.shotsFired} · ${sitrep.hits}`} />
        <Stat label="Ammo" value={`${sitrep.ammoRemaining}/${sitrep.ammoCapacity}`} />
        <Stat label="Armor" value={`${sitrep.armorPct.toFixed(0)}%`} valueClassName={sitrep.armorPct < 40 ? "text-destructive" : undefined} />
        <Stat label="Damage taken" value={`${sitrep.damageTakenPct.toFixed(0)}%`} />
        <Stat label="Remaining" value={sitrep.targetsRemaining} />
      </div>
      <p className="font-mono text-[10px] leading-3 text-muted-foreground">{sitrep.summary}</p>
    </div>
  );
}
