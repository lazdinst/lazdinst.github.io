import { SignalMeter, toneForRatio } from "../../components/SignalMeter";
import { Sparkline } from "../../components/Sparkline";
import { CELL_ANALYTICS_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useDiagnostics } from "@/app/context";
import { TARGET_CYCLE_MS, type FailureCategory } from "@/simulation";
import { cn } from "@/lib/utils";

const FAILURE_ROWS: { key: FailureCategory; label: string }[] = [
  { key: "perception", label: "Perception" },
  { key: "unreachable", label: "Unreachable" },
  { key: "collision", label: "Collision" },
  { key: "grasp_failure", label: "Grasp" },
  { key: "vacuum_loss", label: "Vacuum" },
  { key: "safety", label: "Safety" },
  { key: "motion", label: "Motion" },
];

function pct(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

export function AnalyticsPanel() {
  const { analytics } = useDiagnostics();
  const oeeTone = toneForRatio(analytics.oee);
  const peakFailures = Math.max(
    1,
    ...Object.values(analytics.failures)
  );

  return (
    <PanelSection title="Cell analytics" info={CELL_ANALYTICS_HELP}>
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-muted-foreground">
          Simulated metrics — not production OEE.
        </p>

        <article className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              OEE
            </h4>
            <span
              className={cn(
                "font-mono text-lg leading-none tabular-nums",
                oeeTone === "ok" && "text-success",
                oeeTone === "warn" && "text-warning",
                oeeTone === "alert" && "text-destructive"
              )}
            >
              {pct(analytics.oee)}
            </span>
          </div>
          <SignalMeter value={analytics.oee} tone={oeeTone} className="h-1.5" />
          <RatioRow label="Avail" value={analytics.availability} />
          <RatioRow label="Perf" value={analytics.performance} />
          <RatioRow label="Qual" value={analytics.quality} />
        </article>

        <div className="grid grid-cols-3 gap-1.5">
          <MetricTile label="Cycles" value={String(analytics.totalCycles)} />
          <MetricTile
            label="Success"
            value={`${analytics.successfulPicks}/${analytics.totalCycles}`}
            detail={pct(analytics.successRate)}
          />
          <MetricTile
            label="PPH"
            value={analytics.picksPerHour.toFixed(1)}
          />
        </div>

        <article className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Cycle time
            </h4>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              tgt {seconds(TARGET_CYCLE_MS)}
            </span>
          </div>
          {analytics.recentCycleTimesMs.length === 0 ? (
            <p className="h-8 text-xs leading-8 text-muted-foreground">
              Waiting for cycles
            </p>
          ) : (
            <Sparkline
              values={analytics.recentCycleTimesMs.map((ms) => ms / 1000)}
            />
          )}
          <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
            <span>mean {seconds(analytics.meanCycleTimeMs)}</span>
            <span>p95 {seconds(analytics.p95CycleTimeMs)}</span>
          </div>
        </article>

        <article className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Failures
            </h4>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {analytics.failedPicks}
            </span>
          </div>
          <ul className="flex flex-col gap-0.5">
            {FAILURE_ROWS.map(({ key, label }) => {
              const count = analytics.failures[key];
              return (
                <li key={key} className="flex items-center gap-1.5">
                  <span className="w-16 shrink-0 text-[10px] text-muted-foreground">
                    {label}
                  </span>
                  <SignalMeter
                    value={count / peakFailures}
                    tone={count > 0 ? "alert" : "neutral"}
                    className="flex-1"
                  />
                  <span className="w-4 text-right font-mono text-[10px] tabular-nums text-foreground">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </article>
      </div>
    </PanelSection>
  );
}

function RatioRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-8 shrink-0 text-[10px] text-muted-foreground">
        {label}
      </span>
      <SignalMeter
        value={value}
        tone={toneForRatio(value)}
        className="flex-1"
      />
      <span className="w-8 text-right font-mono text-[10px] tabular-nums text-foreground">
        {pct(value)}
      </span>
    </div>
  );
}

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="flex flex-col gap-0.5">
      <h4 className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </h4>
      <p className="font-mono text-sm leading-none tabular-nums text-foreground">
        {value}
      </p>
      {detail ? (
        <p className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {detail}
        </p>
      ) : null}
    </article>
  );
}
