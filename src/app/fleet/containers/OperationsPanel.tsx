import { ActiveMissions } from "./ActiveMissions";
import { FleetTelemetry } from "./FleetTelemetry";
import { MaintenanceQueue } from "./MaintenanceQueue";
import { MissionPlanner } from "./MissionPlanner";

export function OperationsPanel() {
  return (
    <div className="flex flex-col gap-3">
      <MissionPlanner />
      <ActiveMissions />
      <FleetTelemetry />
      <MaintenanceQueue />
    </div>
  );
}
