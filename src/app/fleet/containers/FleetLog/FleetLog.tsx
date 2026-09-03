import { EventConsole } from "@/app/components/EventConsole";
import { EventTimeline } from "@/app/components/EventTimeline";
import { FLEET_TIMELINE_CODES, fleetRuntime } from "@/fleet";
import { formatSimTimeSeconds } from "@/simulation";
import { useFleetEvents, useFleetView } from "../../hooks";

export function FleetLog() {
  const events = useFleetEvents();
  const view = useFleetView();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <EventTimeline
        events={events}
        markCodes={FLEET_TIMELINE_CODES}
        timestampMs={view.timestampMs}
        historyStartMs={view.historyStartMs}
        historyEndMs={view.historyEndMs}
        playbackMode={view.playbackMode}
        onSeek={(ms) => fleetRuntime.seek(ms)}
        onResumeLive={() => fleetRuntime.resumeLive()}
      />
      <div className="min-h-0 flex-1">
        <EventConsole
          events={events}
          status={view.status}
          formatTime={(ms) => formatSimTimeSeconds(ms, 1)}
          onSeek={(ms) => fleetRuntime.seek(ms)}
          emptyLabel="waiting for fleet events"
          idPrefix="fleet-event"
        />
      </div>
    </div>
  );
}
