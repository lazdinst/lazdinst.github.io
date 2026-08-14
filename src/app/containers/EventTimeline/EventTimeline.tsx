import { useMemo } from "react";
import { useSimulation, useSimulationEvents } from "@/app/context";
import { simulationEngine, type SimulationEvent } from "@/simulation";
import { cn } from "@/lib/utils";

const TIMELINE_CODES = new Set([
  "OBJECT_DETECTED",
  "POSE_ESTIMATED",
  "GRASP_SELECTED",
  "MOTION_PLAN_READY",
  "APPROACH_COMPLETE",
  "GRIPPER_CONTACT",
  "GRASP_CONFIRMED",
  "VACUUM_LOW",
  "SLIP_DETECTED",
  "PICK_FAILED",
  "SAFETY_STOP",
  "SAFETY_WARNING",
  "RECOVERY_STARTED",
  "CYCLE_COMPLETE",
  "FAULT_INJECTED",
  "CAMERA_OFFLINE",
  "PLC_LOSS",
  "CONVEYOR_JAM",
]);

export function EventTimeline() {
  const events = useSimulationEvents();
  const { timestampMs, historyStartMs, historyEndMs, playbackMode } =
    useSimulation();

  const marks = useMemo(
    () => events.filter((event) => TIMELINE_CODES.has(event.eventCode)),
    [events]
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
          onClick={() => simulationEngine.resumeLive()}
        >
          resume live
        </button>
      </div>
      <input
        type="range"
        aria-label="Scrub simulation history"
        className="absolute inset-x-2 top-4 z-20 h-3 cursor-pointer opacity-0"
        min={start}
        max={end}
        step={10}
        value={Math.min(end, Math.max(start, timestampMs))}
        onChange={(event) => simulationEngine.seek(Number(event.target.value))}
      />
      <div className="relative mt-0.5 h-3 w-full rounded-sm bg-zinc-900">
        {marks.map((event) => (
          <TimelineMark
            key={event.id}
            event={event}
            left={((event.timestampMs - start) / span) * 100}
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
}: {
  event: SimulationEvent;
  left: number;
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
      onClick={() => simulationEngine.seek(event.timestampMs)}
    />
  );
}
