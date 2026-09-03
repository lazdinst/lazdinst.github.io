import { InspectorGroup } from "@/app/components/InspectorGroup";
import {
  MAINTENANCE_HELP,
  MISSION_HELP,
  ROSTER_HELP,
  SENSORS_HELP,
  STATUS_HELP,
} from "../../help/fleetHelp";
import { AssetRoster } from "../AssetRoster";
import {
  AssetStatusPanel,
  MaintenancePanel,
  MissionPanel,
  SensorsPanel,
} from "./AssetInspector";

export function FleetInspector() {
  return (
    <>
      <InspectorGroup label="Roster" info={ROSTER_HELP}>
        <AssetRoster />
      </InspectorGroup>
      <InspectorGroup label="Status" info={STATUS_HELP}>
        <AssetStatusPanel />
      </InspectorGroup>
      <InspectorGroup label="Sensors" info={SENSORS_HELP}>
        <SensorsPanel />
      </InspectorGroup>
      <InspectorGroup label="Maintenance" info={MAINTENANCE_HELP}>
        <MaintenancePanel />
      </InspectorGroup>
      <InspectorGroup label="Mission" info={MISSION_HELP}>
        <MissionPanel />
      </InspectorGroup>
    </>
  );
}
