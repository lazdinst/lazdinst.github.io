import { useId } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  SignalMeter,
  toneForTemperature,
  toneForUtilization,
} from "../../components/SignalMeter";
import type { AngleUnit } from "@/robotics";
import { formatAngle, radiansToUnit } from "@/robotics";
import type { JointTelemetry } from "@/simulation";
import { cn } from "@/lib/utils";

type StreamingGraphContainerProps = {
  data: { time: number; value: number; name: string }[];
  label: string;
  angleUnit: AngleUnit;
  lowerRad: number;
  upperRad: number;
  signal?: JointTelemetry;
};

function GraphTooltip({
  payload,
  label,
  angleUnit,
}: {
  payload?: { value?: number }[];
  label?: number;
  angleUnit: AngleUnit;
}) {
  if (!payload?.length) {
    return null;
  }

  const value = payload[0]?.value ?? 0;
  const timeLabel =
    typeof label === "number" ? `${(label / 1000).toFixed(2)}s` : "";

  return (
    <div className="bg-popover px-2 py-1 text-xs text-popover-foreground">
      <div className="font-mono tabular-nums tracking-wide text-muted-foreground">
        {timeLabel}
      </div>
      <div className="font-mono tabular-nums text-foreground">
        {angleUnit === "deg"
          ? `${Number(value).toFixed(1)}°`
          : Number(value).toFixed(3)}
      </div>
    </div>
  );
}

export function StreamingGraphContainer({
  data,
  label,
  angleUnit,
  lowerRad,
  upperRad,
  signal,
}: StreamingGraphContainerProps) {
  const reactId = useId();
  const gradientId = `spark-${reactId.replace(/:/g, "")}`;
  const isEmpty = data.length === 0;
  const latestRad = data.length > 0 ? data[data.length - 1].value : undefined;
  const displayData = data.map((sample) => ({
    ...sample,
    displayValue: radiansToUnit(sample.value, angleUnit),
  }));

  return (
    <article className="flex flex-col gap-1">
      <header className="relative z-[1] flex h-4 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "size-1 shrink-0 rounded-full",
              isEmpty
                ? "bg-muted-foreground/40"
                : "hud-live bg-chart-1 shadow-[0_0_6px_var(--chart-1)]"
            )}
            aria-hidden
          />
          <h4 className="truncate text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {label}
          </h4>
        </div>
        <span className="font-mono text-xs tabular-nums tracking-wide text-foreground">
          {latestRad === undefined ? "—" : formatAngle(latestRad, angleUnit)}
        </span>
      </header>
      <div className="hud-plot-grid relative z-[1] h-10 w-full">
        {isEmpty ? (
          <div className="flex h-full items-center text-xs text-muted-foreground">
            Waiting for samples
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 4, right: 2, left: 2, bottom: 2 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.38}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis
                domain={[
                  radiansToUnit(lowerRad, angleUnit),
                  radiansToUnit(upperRad, angleUnit),
                ]}
                hide
              />
              <Tooltip
                cursor={{
                  stroke: "var(--ds-gray-alpha-400)",
                  strokeDasharray: "3 3",
                }}
                content={({ payload, label: tick }) => (
                  <GraphTooltip
                    payload={payload as { value?: number }[] | undefined}
                    label={typeof tick === "number" ? tick : undefined}
                    angleUnit={angleUnit}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="displayValue"
                stroke="none"
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
                tooltipType="none"
              />
              <Line
                type="monotone"
                dataKey="displayValue"
                stroke="var(--chart-1)"
                strokeWidth={4}
                strokeOpacity={0.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                isAnimationActive={false}
                tooltipType="none"
              />
              <Line
                type="monotone"
                dataKey="displayValue"
                stroke="var(--chart-1)"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                isAnimationActive={false}
                activeDot={{
                  r: 2.5,
                  fill: "var(--chart-1)",
                  strokeWidth: 0,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      {signal ? <JointSignalRow signal={signal} angleUnit={angleUnit} /> : null}
    </article>
  );
}

function JointSignalRow({
  signal,
  angleUnit,
}: {
  signal: JointTelemetry;
  angleUnit: AngleUnit;
}) {
  const utilTone = toneForUtilization(signal.limitUtilization);
  const tempTone = toneForTemperature(signal.temperatureC);

  return (
    <div className="relative z-[1] flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="w-7 shrink-0 text-[10px] text-muted-foreground">
          Util
        </span>
        <SignalMeter
          value={signal.limitUtilization}
          tone={utilTone}
          className="flex-1"
        />
        <span
          className={cn(
            "w-8 text-right font-mono text-[10px] tabular-nums",
            utilTone === "warn" && "text-warning",
            utilTone === "alert" && "text-destructive"
          )}
        >
          {(signal.limitUtilization * 100).toFixed(0)}%
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 font-mono text-[10px] tabular-nums text-muted-foreground">
        <span>{formatAngle(signal.velocityRadSec, angleUnit)}/s</span>
        <span>{signal.torqueNm.toFixed(1)} Nm</span>
        <span>{signal.motorCurrentA.toFixed(1)} A</span>
        <span
          className={cn(
            tempTone === "ok" && "text-muted-foreground",
            tempTone === "warn" && "text-warning",
            tempTone === "alert" && "text-destructive"
          )}
        >
          {signal.temperatureC.toFixed(0)}°C
        </span>
      </div>
    </div>
  );
}

export default StreamingGraphContainer;
