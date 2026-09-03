import type { FleetScenario } from "../types";

export const DEFAULT_FLEET_SEED = 0xf1ee7001;

export const FLEET_SCENARIOS: FleetScenario[] = [
  {
    id: "nominal",
    name: "Nominal",
    description: "Light onshore breeze, all relays up, standard service intervals.",
    seed: DEFAULT_FLEET_SEED,
    wind: { towardDeg: 80, speedMps: 3 },
    current: { towardDeg: 160, speedMps: 0.4 },
    riskMultiplier: 1,
    linkRangeScale: 1,
    serviceIntervalScale: 1,
    disabledRelayIds: [],
    presetFaults: [],
  },
  {
    id: "storm-front",
    name: "Storm front",
    description: "25 kt wind from the south-west, strong current, degraded radio, hazards weighted up.",
    seed: DEFAULT_FLEET_SEED + 1,
    wind: { towardDeg: 45, speedMps: 13 },
    current: { towardDeg: 30, speedMps: 1.6 },
    riskMultiplier: 1.8,
    linkRangeScale: 0.7,
    serviceIntervalScale: 1,
    disabledRelayIds: [],
    presetFaults: [{ assetId: "kestrel-01", faultId: "imu_drift" }],
  },
  {
    id: "comms-outage",
    name: "Comms outage",
    description: "The dock mast is down. Coverage gaps open over the bay and the north coast.",
    seed: DEFAULT_FLEET_SEED + 2,
    wind: { towardDeg: 80, speedMps: 4 },
    current: { towardDeg: 160, speedMps: 0.5 },
    riskMultiplier: 1.2,
    linkRangeScale: 1,
    serviceIntervalScale: 1,
    disabledRelayIds: ["rly-dock"],
    presetFaults: [{ assetId: "skiff-01", faultId: "radio_failure" }],
  },
  {
    id: "maintenance-crunch",
    name: "Maintenance crunch",
    description: "Service intervals cut to a fifth. Watch the roster tip into maintenance as hours accrue.",
    seed: DEFAULT_FLEET_SEED + 3,
    wind: { towardDeg: 80, speedMps: 3 },
    current: { towardDeg: 160, speedMps: 0.4 },
    riskMultiplier: 1,
    linkRangeScale: 1,
    serviceIntervalScale: 0.2,
    disabledRelayIds: [],
    presetFaults: [{ assetId: "mule-01", faultId: "motor_overtemp" }],
  },
];

export function findFleetScenario(id: string): FleetScenario {
  return FLEET_SCENARIOS.find((scenario) => scenario.id === id) ?? FLEET_SCENARIOS[0];
}
