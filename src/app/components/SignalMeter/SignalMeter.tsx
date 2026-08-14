import { cn } from "@/lib/utils";

export type SignalTone = "neutral" | "ok" | "warn" | "alert";

interface SignalMeterProps {
  value: number;
  tone?: SignalTone;
  className?: string;
}

const TONE_CLASS: Record<SignalTone, string> = {
  neutral: "bg-chart-1",
  ok: "bg-success",
  warn: "bg-warning",
  alert: "bg-destructive",
};

export function toneForRatio(
  value: number,
  good = 0.85,
  warn = 0.6
): SignalTone {
  if (value >= good) {
    return "ok";
  }
  if (value >= warn) {
    return "warn";
  }
  return "alert";
}

export function toneForUtilization(value: number): SignalTone {
  if (value >= 0.9) {
    return "alert";
  }
  if (value >= 0.7) {
    return "warn";
  }
  return "ok";
}

export function toneForTemperature(celsius: number): SignalTone {
  if (celsius >= 70) {
    return "alert";
  }
  if (celsius >= 50) {
    return "warn";
  }
  return "ok";
}

export function SignalMeter({
  value,
  tone = "neutral",
  className,
}: SignalMeterProps) {
  const width = `${Math.min(100, Math.max(0, value * 100))}%`;

  return (
    <div
      className={cn("h-1 overflow-hidden rounded-full bg-muted", className)}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
    >
      <div
        className={cn("h-full rounded-full transition-[width]", TONE_CLASS[tone])}
        style={{ width }}
      />
    </div>
  );
}
