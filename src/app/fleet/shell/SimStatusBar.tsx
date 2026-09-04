import { useMemo, useState } from "react";
import { ArrowLeft, Pause, Play, Radio, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { fleetRuntime } from "@/fleet";
import { formatSimClock } from "@/simulation";
import { cn } from "@/lib/utils";
import { useFleetSnapshot, useFleetView } from "../hooks";
import { deriveAlerts } from "./deriveAlerts";
import { KeysHelp } from "./KeysHelp";

interface SimStatusBarProps {
  logOpen: boolean;
  onToggleLog: () => void;
}

export function SimStatusBar({ logOpen, onToggleLog }: SimStatusBarProps) {
  const view = useFleetView();
  const snapshot = useFleetSnapshot();
  const alerts = useMemo(() => deriveAlerts(snapshot), [snapshot]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const worst = alerts.some((alert) => alert.severity === "alert") ? "alert" : alerts.length > 0 ? "warn" : null;
  const statusLabel = view.status === "running" ? "RUNNING" : view.status === "paused" ? "PAUSED" : "READY";

  return (
    <div className="pointer-events-auto flex h-9 items-center gap-1 rounded-lg border border-border bg-background/95 px-1 shadow-md backdrop-blur">
      <span className="hidden px-1 text-xs font-medium text-foreground sm:inline">SkyNet</span>
      <Badge
        variant="outline"
        className={cn(
          "font-mono font-normal tracking-wide",
          view.status === "running" ? "border-success/40 text-success" : "border-warning/40 text-warning"
        )}
      >
        {statusLabel}
      </Badge>
      <Popover open={alertsOpen} onOpenChange={setAlertsOpen}>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="xs"
                    aria-label={`${alerts.length} alerts`}
                    className={cn(
                      "h-4 gap-1 rounded-full px-1.5 font-mono text-[10px] tracking-wide",
                      worst === "alert" && "border-destructive/40 text-destructive hover:text-destructive",
                      worst === "warn" && "border-warning/40 text-warning hover:text-warning",
                      worst === null && "text-muted-foreground"
                    )}
                  />
                }
              />
            }
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                worst === "alert" && "hud-live bg-destructive",
                worst === "warn" && "bg-warning",
                worst === null && "bg-muted-foreground"
              )}
            />
            {alerts.length} {alerts.length === 1 ? "ALERT" : "ALERTS"}
          </TooltipTrigger>
          <TooltipContent>Devices and missions needing attention</TooltipContent>
        </Tooltip>
        <PopoverContent align="end" side="bottom" className="w-80 p-0">
          <div className="flex h-7 items-center justify-between border-b border-border px-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Alerts</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {alerts.filter((a) => a.severity === "alert").length} critical · {alerts.filter((a) => a.severity === "warn").length} warning
            </span>
          </div>
          {alerts.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">Nothing needs attention.</p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-px overflow-y-auto p-1">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 rounded-sm px-1.5 py-1 text-left hover:bg-muted"
                    onClick={() => {
                      fleetRuntime.selectAsset(alert.assetId);
                      setAlertsOpen(false);
                    }}
                  >
                    <span
                      className={cn(
                        "mt-1 size-1.5 shrink-0 rounded-full",
                        alert.severity === "alert" ? "bg-destructive" : "bg-warning"
                      )}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xs text-foreground">{alert.callsign}</span>
                        <span
                          className={cn(
                            "truncate font-mono text-[10px] uppercase",
                            alert.severity === "alert" ? "text-destructive" : "text-warning"
                          )}
                        >
                          {alert.title}
                        </span>
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">{alert.detail}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
      <span className="px-1 font-mono text-xs tabular-nums text-muted-foreground">
        {formatSimClock(view.epochMs, view.timestampMs)}
        {view.timeScale !== 1 ? <span className="ml-1 text-[10px]">{view.timeScale}×</span> : null}
      </span>
      <span className="hidden font-mono text-[10px] text-muted-foreground md:inline">
        {view.activeCount} active
        {view.hostileCount > 0 ? <span className="text-destructive"> · {view.hostileCount} hostile</span> : null}
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={view.status === "running" ? "Pause simulation" : "Start simulation"}
              onClick={() => (view.status === "running" ? fleetRuntime.pause() : fleetRuntime.start())}
            />
          }
        >
          {view.status === "running" ? <Pause /> : <Play />}
        </TooltipTrigger>
        <TooltipContent>{view.status === "running" ? "Pause" : "Start"}</TooltipContent>
      </Tooltip>
      {view.playbackMode === "scrub" ? (
        <Button variant="outline" size="xs" aria-label="Resume live view" onClick={() => fleetRuntime.resumeLive()}>
          <Radio />
          Live
        </Button>
      ) : null}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant={logOpen ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Toggle event log"
              aria-pressed={logOpen}
              onClick={onToggleLog}
            />
          }
        >
          <ScrollText />
        </TooltipTrigger>
        <TooltipContent>Event log</TooltipContent>
      </Tooltip>
      <KeysHelp />
      <ThemeToggle />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Back to portfolio" nativeButton={false} render={<Link to="/" />} />
          }
        >
          <ArrowLeft />
        </TooltipTrigger>
        <TooltipContent>Back to portfolio</TooltipContent>
      </Tooltip>
    </div>
  );
}
