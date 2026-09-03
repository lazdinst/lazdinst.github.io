import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  EventSeverity,
  SimulationEvent,
  SimulationStatus,
} from "@/simulation";

const SEVERITY_FILTERS = [
  "all",
  "debug",
  "info",
  "warning",
  "error",
  "critical",
] as const;

type SeverityFilter = (typeof SEVERITY_FILTERS)[number];

const LEVEL_LABEL: Record<EventSeverity, string> = {
  debug: "DEBUG",
  info: "INFO",
  warning: "WARN",
  error: "ERROR",
  critical: "FATAL",
};

const LEVEL_CLASS: Record<EventSeverity, string> = {
  debug: "text-zinc-500",
  info: "text-emerald-500",
  warning: "text-amber-400",
  error: "text-red-400",
  critical: "text-red-500 font-semibold",
};

const STATUS_LABEL: Record<SimulationStatus, string> = {
  ready: "ready",
  running: "running",
  paused: "paused",
};

interface EventConsoleProps {
  events: SimulationEvent[];
  status: SimulationStatus;
  formatTime: (timestampMs: number) => string;
  onSeek?: (timestampMs: number) => void;
  /** Shown before any event has been logged. */
  emptyLabel?: string;
  /** Prefix for the filter element ids so two consoles can coexist. */
  idPrefix?: string;
}

/**
 * Black terminal-style event log with severity and source filters. Purely
 * presentational so any runtime with an EventLog can render one.
 */
export function EventConsole({
  events,
  status,
  formatTime,
  onSeek,
  emptyLabel = "waiting for events",
  idPrefix = "event",
}: EventConsoleProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const sources = useMemo(
    () => ["all", ...Array.from(new Set(events.map((event) => event.source))).sort()],
    [events]
  );

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      if (severityFilter !== "all" && event.severity !== severityFilter) {
        return false;
      }
      if (sourceFilter !== "all" && event.source !== sourceFilter) {
        return false;
      }
      return true;
    });
  }, [events, severityFilter, sourceFilter]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [visibleEvents]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-black font-mono text-[10px] leading-3 text-zinc-300">
      <div className="flex h-5 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-2">
        <h2 className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">
          output
        </h2>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`${idPrefix}-severity-filter`}>
            Filter events by severity
          </label>
          <select
            id={`${idPrefix}-severity-filter`}
            className="h-4 border-0 bg-transparent font-mono text-[10px] text-zinc-500 outline-none"
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value as SeverityFilter)
            }
          >
            {SEVERITY_FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`${idPrefix}-source-filter`}>
            Filter events by source
          </label>
          <select
            id={`${idPrefix}-source-filter`}
            className="h-4 max-w-28 truncate border-0 bg-transparent font-mono text-[10px] text-zinc-500 outline-none"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
          >
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          <span
            className={cn(
              "text-[10px]",
              status === "running" ? "text-emerald-500" : "text-zinc-500"
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-auto px-2 py-1"
      >
        {events.length === 0 ? (
          <p className="text-zinc-600">
            <span className="text-emerald-600">$</span> {emptyLabel}
          </p>
        ) : visibleEvents.length === 0 ? (
          <p className="text-zinc-600">no events match this filter</p>
        ) : (
          <ul className="flex flex-col">
            {visibleEvents.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  className="flex min-w-0 items-baseline gap-2 text-left"
                  onClick={() => onSeek?.(event.timestampMs)}
                >
                  <span className="shrink-0 tabular-nums text-zinc-600">
                    {formatTime(event.timestampMs)}
                  </span>
                  <span
                    className={cn("w-10 shrink-0", LEVEL_CLASS[event.severity])}
                  >
                    {LEVEL_LABEL[event.severity]}
                  </span>
                  <span className="w-[7.5rem] shrink-0 truncate text-zinc-500">
                    {event.eventCode}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 break-words",
                      event.severity === "debug"
                        ? "text-zinc-500"
                        : "text-zinc-300"
                    )}
                  >
                    {event.message}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
