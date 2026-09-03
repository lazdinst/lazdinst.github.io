import type { AssetStatus, SensorStatus } from "@/fleet";
import type { SignalTone } from "@/app/components/SignalMeter";

export const STATUS_LABEL: Record<AssetStatus, string> = {
  idle: "IDLE",
  en_route: "EN ROUTE",
  patrolling: "PATROL",
  returning: "RTB",
  charging: "CHARGING",
  maintenance: "MAINT",
  lost_link: "LOST LINK",
  fault: "FAULT",
};

export type StatusTone = "neutral" | "ok" | "info" | "warn" | "alert";

export const STATUS_TONE: Record<AssetStatus, StatusTone> = {
  idle: "neutral",
  en_route: "ok",
  patrolling: "ok",
  returning: "info",
  charging: "warn",
  maintenance: "warn",
  lost_link: "alert",
  fault: "alert",
};

/** Badge classes matching the workcell's outline status badge. */
export const TONE_BADGE_CLASS: Record<StatusTone, string> = {
  neutral: "border-border text-muted-foreground",
  ok: "border-success/40 text-success",
  info: "border-chart-1/40 text-chart-1",
  warn: "border-warning/40 text-warning",
  alert: "border-destructive/40 text-destructive",
};

export const TONE_TEXT_CLASS: Record<StatusTone, string> = {
  neutral: "text-muted-foreground",
  ok: "text-success",
  info: "text-chart-1",
  warn: "text-warning",
  alert: "text-destructive",
};

export const TONE_DOT_CLASS: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  ok: "bg-success",
  info: "bg-chart-1",
  warn: "bg-warning",
  alert: "bg-destructive",
};

export function energyTone(pct: number): SignalTone {
  if (pct < 25) return "alert";
  if (pct < 45) return "warn";
  return "ok";
}

export function healthTone(score: number): SignalTone {
  if (score < 0.4) return "alert";
  if (score < 0.7) return "warn";
  return "ok";
}

export function linkTone(quality: number): SignalTone {
  if (quality <= 0) return "alert";
  if (quality < 0.35) return "warn";
  return "ok";
}

export const SENSOR_STATUS_TONE: Record<SensorStatus, StatusTone> = {
  ok: "ok",
  degraded: "warn",
  failed: "alert",
};
