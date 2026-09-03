import type { AssetKind, FleetFaultId, LatLng, Objective, WorkOrder } from "../types";
import { OPERATING_AREA } from "./operatingArea";

/** Static description of an asset before the runtime derives live state. */
export interface AssetSeed {
  id: string;
  callsign: string;
  name: string;
  kind: AssetKind;
  position: LatLng;
  headingDeg: number;
  energyPct: number;
  hoursSinceService: number;
  workOrders: Omit<WorkOrder, "openedAtMs">[];
  tags: string[];
  homeDepotId: string;
  /** Start charging at the depot instead of idling. */
  charging?: boolean;
  /** Start on a patrol loop. Planned at reset. */
  patrol?: Objective;
  presetFaults?: FleetFaultId[];
}

const depot = OPERATING_AREA.depots[0].position;
const dock = OPERATING_AREA.depots[1].position;
const wp = (id: string): LatLng => {
  const found = OPERATING_AREA.waypoints.find((w) => w.id === id);
  if (!found) throw new Error(`Unknown waypoint ${id}`);
  return found.position;
};

/** Offsets keep parked assets from stacking on the same pixel. */
const parked = (base: LatLng, i: number): LatLng => ({
  lat: base.lat + (i % 3) * 0.00035,
  lng: base.lng + Math.floor(i / 3) * 0.00045,
});

export const ASSET_SEEDS: AssetSeed[] = [
  {
    id: "hawk-01",
    callsign: "HAWK-01",
    name: "Quad 01",
    kind: "uav_quad",
    position: parked(depot, 0),
    headingDeg: 270,
    energyPct: 92,
    hoursSinceService: 12.4,
    workOrders: [],
    tags: ["isr", "eo"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "hawk-02",
    callsign: "HAWK-02",
    name: "Quad 02",
    kind: "uav_quad",
    position: parked(depot, 1),
    headingDeg: 270,
    energyPct: 71,
    hoursSinceService: 41.8,
    workOrders: [],
    tags: ["isr", "eo", "relay"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "hawk-03",
    callsign: "HAWK-03",
    name: "Quad 03",
    kind: "uav_quad",
    position: wp("farm-east"),
    headingDeg: 20,
    energyPct: 64,
    hoursSinceService: 27.1,
    workOrders: [],
    tags: ["isr", "perimeter"],
    homeDepotId: "depot-alpha",
    patrol: {
      type: "patrol",
      targetLabel: "Farm perimeter",
      waypoints: [wp("farm-east"), wp("overlook"), { lat: 36.81, lng: -121.72 }],
    },
  },
  {
    id: "hawk-04",
    callsign: "HAWK-04",
    name: "Quad 04",
    kind: "uav_quad",
    position: parked(depot, 2),
    headingDeg: 270,
    energyPct: 18,
    hoursSinceService: 55.2,
    workOrders: [],
    tags: ["isr"],
    homeDepotId: "depot-alpha",
    charging: true,
  },
  {
    id: "hawk-05",
    callsign: "HAWK-05",
    name: "Quad 05",
    kind: "uav_quad",
    position: wp("rally-a"),
    headingDeg: 180,
    energyPct: 49,
    hoursSinceService: 8.0,
    workOrders: [],
    tags: ["isr", "eo"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "kestrel-01",
    callsign: "KESTREL-01",
    name: "Fixed-wing 01",
    kind: "uav_fixed_wing",
    position: { lat: 36.83, lng: -121.815 },
    headingDeg: 190,
    energyPct: 55,
    hoursSinceService: 66.5,
    workOrders: [],
    tags: ["isr", "ir", "coastal"],
    homeDepotId: "depot-alpha",
    patrol: {
      type: "patrol",
      targetLabel: "Coastal patrol",
      waypoints: [
        { lat: 36.83, lng: -121.815 },
        { lat: 36.76, lng: -121.812 },
        { lat: 36.775, lng: -121.845 },
        { lat: 36.84, lng: -121.835 },
      ],
    },
  },
  {
    id: "kestrel-02",
    callsign: "KESTREL-02",
    name: "Fixed-wing 02",
    kind: "uav_fixed_wing",
    position: parked(depot, 3),
    headingDeg: 270,
    energyPct: 100,
    hoursSinceService: 121.5,
    workOrders: [
      { id: "wo-k2-1", title: "Replace aileron servo", severity: "high" },
    ],
    tags: ["isr", "ir"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "kestrel-03",
    callsign: "KESTREL-03",
    name: "Fixed-wing 03",
    kind: "uav_fixed_wing",
    position: parked(depot, 4),
    headingDeg: 270,
    energyPct: 97,
    hoursSinceService: 30.2,
    workOrders: [],
    tags: ["isr", "ir", "long-range"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "mule-01",
    callsign: "MULE-01",
    name: "Rover 01",
    kind: "ugv_rover",
    position: parked(depot, 5),
    headingDeg: 90,
    energyPct: 88,
    hoursSinceService: 74.0,
    workOrders: [],
    tags: ["logistics", "lidar"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "mule-02",
    callsign: "MULE-02",
    name: "Rover 02",
    kind: "ugv_rover",
    position: wp("rally-b"),
    headingDeg: 0,
    energyPct: 60,
    hoursSinceService: 150.3,
    workOrders: [],
    tags: ["logistics"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "mule-03",
    callsign: "MULE-03",
    name: "Tracked 03",
    kind: "ugv_tracked",
    position: parked(depot, 6),
    headingDeg: 90,
    energyPct: 32,
    hoursSinceService: 22.7,
    workOrders: [],
    tags: ["logistics", "radar", "heavy"],
    homeDepotId: "depot-alpha",
    charging: true,
  },
  {
    id: "mule-04",
    callsign: "MULE-04",
    name: "Tracked 04",
    kind: "ugv_tracked",
    position: wp("farm-east"),
    headingDeg: 300,
    energyPct: 77,
    hoursSinceService: 98.4,
    workOrders: [
      { id: "wo-m4-1", title: "Track tension out of spec", severity: "medium" },
    ],
    tags: ["logistics", "radar"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "mule-05",
    callsign: "MULE-05",
    name: "Rover 05",
    kind: "ugv_rover",
    position: { lat: 36.766, lng: -121.755 },
    headingDeg: 45,
    energyPct: 66,
    hoursSinceService: 11.9,
    workOrders: [],
    tags: ["logistics", "urban"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "spot-01",
    callsign: "SPOT-01",
    name: "Legged 01",
    kind: "legged",
    position: parked(depot, 7),
    headingDeg: 90,
    energyPct: 95,
    hoursSinceService: 6.3,
    workOrders: [],
    tags: ["inspection", "stereo"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "spot-02",
    callsign: "SPOT-02",
    name: "Legged 02",
    kind: "legged",
    position: wp("ridge-op"),
    headingDeg: 135,
    energyPct: 40,
    hoursSinceService: 39.1,
    workOrders: [],
    tags: ["inspection", "ridge"],
    homeDepotId: "depot-alpha",
  },
  {
    id: "skiff-01",
    callsign: "SKIFF-01",
    name: "USV 01",
    kind: "usv",
    position: parked(dock, 0),
    headingDeg: 250,
    energyPct: 84,
    hoursSinceService: 120.0,
    workOrders: [],
    tags: ["survey", "sonar"],
    homeDepotId: "moss-dock",
  },
  {
    id: "skiff-02",
    callsign: "SKIFF-02",
    name: "USV 02",
    kind: "usv",
    position: { lat: 36.842, lng: -121.846 },
    headingDeg: 320,
    energyPct: 58,
    hoursSinceService: 61.4,
    workOrders: [],
    tags: ["survey", "sonar", "ais"],
    homeDepotId: "moss-dock",
  },
  {
    id: "skiff-03",
    callsign: "SKIFF-03",
    name: "USV 03",
    kind: "usv",
    position: wp("shoal-1"),
    headingDeg: 200,
    energyPct: 70,
    hoursSinceService: 15.6,
    workOrders: [],
    tags: ["survey", "sonar"],
    homeDepotId: "moss-dock",
    patrol: {
      type: "patrol",
      targetLabel: "Bay sweep",
      waypoints: [wp("shoal-1"), wp("buoy-s"), { lat: 36.78, lng: -121.85 }],
    },
  },
];
