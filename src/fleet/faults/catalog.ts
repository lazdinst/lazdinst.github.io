import type { FleetFaultId } from "../types";

export interface FleetFaultDefinition {
  id: FleetFaultId;
  name: string;
  description: string;
  /** Faults that stop a mission in progress. */
  abortsMission: boolean;
}

export const FLEET_FAULT_CATALOG: FleetFaultDefinition[] = [
  {
    id: "gps_loss",
    name: "GPS loss",
    description: "No fix. Position freezes at the last good solution and dispatch is refused.",
    abortsMission: true,
  },
  {
    id: "imu_drift",
    name: "IMU drift",
    description: "Heading wanders and drift rate climbs. Missions continue with a wobble.",
    abortsMission: false,
  },
  {
    id: "motor_overtemp",
    name: "Motor overtemp",
    description: "Speed limited to half cruise, temperature reads hot, energy burn rises.",
    abortsMission: false,
  },
  {
    id: "radio_failure",
    name: "Radio failure",
    description: "Link drops regardless of relay range. Dispatch is refused until cleared.",
    abortsMission: false,
  },
  {
    id: "armor_breach",
    name: "Armor breach",
    description: "Hostile fire breached the hull. Mobility kill: the asset holds position until recovered.",
    abortsMission: true,
  },
  {
    id: "battery_cell",
    name: "Battery cell fault",
    description: "Usable capacity drops and energy drains three times faster.",
    abortsMission: false,
  },
];

export function findFleetFault(id: FleetFaultId): FleetFaultDefinition {
  const found = FLEET_FAULT_CATALOG.find((fault) => fault.id === id);
  if (!found) throw new Error(`Unknown fault ${id}`);
  return found;
}
