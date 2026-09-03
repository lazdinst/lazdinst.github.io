import { useSimulation, useSimulationEvents } from "@/app/context/simulation";
import { formatSimTimeSeconds, simulationEngine } from "@/simulation";
import { EventConsole } from "../../components/EventConsole";

export function Terminal() {
  const { status } = useSimulation();
  const events = useSimulationEvents();

  return (
    <EventConsole
      events={events}
      status={status}
      formatTime={(timestampMs) => formatSimTimeSeconds(timestampMs, 2)}
      onSeek={(timestampMs) => simulationEngine.seek(timestampMs)}
    />
  );
}

export default Terminal;
