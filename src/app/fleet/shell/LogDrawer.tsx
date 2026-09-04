import { Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FleetLog } from "../containers/FleetLog";
import { useFleetEvents } from "../hooks";
import { cn } from "@/lib/utils";

interface LogDrawerProps {
  open: boolean;
  onToggle: () => void;
}

/** Bottom drawer with the timeline and console; collapsed to the latest event line. */
export function LogDrawer({ open, onToggle }: LogDrawerProps) {
  const events = useFleetEvents();
  const latest = [...events].reverse().find((event) => event.severity !== "debug") ?? events[events.length - 1];

  if (!open) {
    return (
      <Button
        variant="outline"
        size="xs"
        className="pointer-events-auto h-7 max-w-full gap-2 rounded-lg bg-background/95 px-2 font-mono shadow-md backdrop-blur"
        aria-label="Open event log"
        onClick={onToggle}
      >
        <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Log</span>
        {latest ? (
          <span className="flex min-w-0 items-center gap-1.5 text-[10px]">
            <span
              className={cn(
                "shrink-0 uppercase",
                latest.severity === "error" || latest.severity === "critical"
                  ? "text-destructive"
                  : latest.severity === "warning"
                    ? "text-warning"
                    : "text-success"
              )}
            >
              {latest.eventCode}
            </span>
            <span className="truncate text-muted-foreground">{latest.message}</span>
          </span>
        ) : null}
      </Button>
    );
  }

  return (
    <div className="pointer-events-auto flex h-[14rem] w-full flex-col overflow-hidden rounded-lg border border-border bg-black shadow-md">
      <div className="flex h-6 shrink-0 items-center justify-between border-b border-white/10 pr-1 pl-2">
        <span className="font-mono text-[10px] font-medium tracking-[0.16em] text-zinc-400 uppercase">
          Event log
        </span>
        <span className="font-mono text-[10px] text-zinc-600">{events.length} events</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Minimize event log"
                className="text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
                onClick={onToggle}
              />
            }
          >
            <Minimize2 />
          </TooltipTrigger>
          <TooltipContent>Minimize</TooltipContent>
        </Tooltip>
      </div>
      <div className="min-h-0 flex-1">
        <FleetLog />
      </div>
    </div>
  );
}
