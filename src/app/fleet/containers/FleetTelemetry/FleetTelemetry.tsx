import { PanelSection } from "@/app/components/PanelSection";
import { Sparkline } from "@/app/components/Sparkline";
import type { AssetStatus } from "@/fleet";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE, TONE_TEXT_CLASS } from "../../components";
import { TELEMETRY_HELP } from "../../help/fleetHelp";
import { useFleetSnapshot } from "../../hooks";

const ORDER: AssetStatus[] = [
  "en_route",
  "patrolling",
  "returning",
  "idle",
  "charging",
  "maintenance",
  "lost_link",
  "fault",
];

export function FleetTelemetry() {
  const { stats } = useFleetSnapshot();
  return (
    <PanelSection title="Fleet telemetry" info={TELEMETRY_HELP}>
      <div className="flex flex-col gap-2">
        <dl className="grid grid-cols-4 gap-x-2 gap-y-1">
          {ORDER.map((status) => (
            <div key={status} className="flex flex-col gap-0.5">
              <dt className={cn("truncate text-[9px] tracking-[0.12em] uppercase", TONE_TEXT_CLASS[STATUS_TONE[status]])}>
                {STATUS_LABEL[status]}
              </dt>
              <dd className="font-mono text-sm leading-none tabular-nums text-foreground">
                {stats.byStatus[status]}
              </dd>
            </div>
          ))}
        </dl>
        <TrendRow label="Mean link" value={`${(stats.meanLinkQuality * 100).toFixed(0)}%`} values={stats.linkHistory} />
        <TrendRow label="Mean energy" value={`${stats.meanEnergyPct.toFixed(0)}%`} values={stats.energyHistory} stroke="var(--chart-2)" />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{stats.activeMissions} missions · {stats.maintenanceDue} due for service</span>
          <span className={cn(stats.faults > 0 && "text-destructive")}>{stats.faults} faults</span>
        </div>
      </div>
    </PanelSection>
  );
}

function TrendRow({ label, value, values, stroke }: { label: string; value: string; values: number[]; stroke?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-foreground">{value}</span>
      </div>
      <div className="hud-plot-grid rounded-sm">
        <Sparkline values={values} className="h-8" stroke={stroke} />
      </div>
    </div>
  );
}
