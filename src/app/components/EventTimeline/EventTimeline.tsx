import { useMemo } from "react";
import type { PlaybackMode, SimulationEvent } from "@/simulation";
import { cn } from "@/lib/utils";

interface EventTimelineProps {
  events: SimulationEvent[];
  /** Only events whose code is in this set are drawn as marks. */
  markCodes: ReadonlySet<string>;
  timestampMs: number;
  historyStartMs: number | null;
  historyEndMs: number | null;
  playbackMode: PlaybackMode;
  onSeek: (timestampMs: number) => void;
  onResumeLive: () => void;
}

/** Scrubbable history strip with event marks, shared by every showcase. */
export function EventTimeline({
  events,
  markCodes,
  timestampMs,
  historyStartMs,
  historyEndMs,
  playbackMode,
  onSeek,
  onResumeLive,
}: EventTimelineProps) {
  const marks = useMemo(
    () => events.filter((event) => markCodes.has(event.eventCode)),
    [events, markCodes]
  );

  const start = historyStartMs ?? 0;
  const end = Math.max(historyEndMs ?? timestampMs, start + 1);
  const span = end - start;
  const cursor = ((timestampMs - start) / span) * 100;

  return (
    <div className="relative flex h-9 shrink-0 flex-col justify-center border-b border-white/10 bg-black px-2">
      <div className="flex items-center justify-between text-[10px] text-zinc-500">
        <span className="font-mono uppercase">
          {playbackMode === "scrub" ? "scrub" : "live"} timeline
        </span>
        <button
          type="button"
          className="font-mono text-zinc-400 hover:text-zinc-200"
          onClick={onResumeLive}
        >
          resume live
        </button>
      </div>
      <input
        type="range"
        aria-label="Scrub history"
        className="absolute inset-x-2 top-4 z-20 h-3 cursor-pointer opacity-0"
        min={start}
        max={end}
        step={10}
        value={Math.min(end, Math.max(start, timestampMs))}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <div className="relative mt-0.5 h-3 w-full rounded-sm bg-zinc-900">
        {marks.map((event) => (
          <TimelineMark
            key={event.id}
            event={event}
            left={((event.timestampMs - start) / span) * 100}
            onSeek={onSeek}
          />
        ))}
        <div
          className="pointer-events-none absolute top-0 z-10 h-full w-px bg-emerald-400"
          style={{ left: `${Math.min(100, Math.max(0, cursor))}%` }}
        />
      </div>
    </div>
  );
}

function TimelineMark({
  event,
  left,
  onSeek,
}: {
  event: SimulationEvent;
  left: number;
  onSeek: (timestampMs: number) => void;
}) {
  const tone =
    event.severity === "critical" || event.severity === "error"
      ? "bg-red-400"
      : event.severity === "warning"
        ? "bg-amber-400"
        : "bg-sky-400";
  return (
    <button
      type="button"
      title={`${event.eventCode} · ${event.message}`}
      className={cn("absolute top-0.5 h-2 w-1.5 -translate-x-1/2 rounded-sm", tone)}
      style={{ left: `${Math.min(100, Math.max(0, left))}%` }}
      onClick={() => onSeek(event.timestampMs)}
    />
  );
}
