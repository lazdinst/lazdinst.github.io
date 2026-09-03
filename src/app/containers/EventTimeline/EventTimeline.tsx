import { useSimulation, useSimulationEvents } from "@/app/context";
import { simulationEngine } from "@/simulation";
import { EventTimeline as TimelineStrip } from "../../components/EventTimeline";

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

  return (
    <TimelineStrip
      events={events}
      markCodes={TIMELINE_CODES}
      timestampMs={timestampMs}
      historyStartMs={historyStartMs}
      historyEndMs={historyEndMs}
      playbackMode={playbackMode}
      onSeek={(ms) => simulationEngine.seek(ms)}
      onResumeLive={() => simulationEngine.resumeLive()}
    />
  );
}
