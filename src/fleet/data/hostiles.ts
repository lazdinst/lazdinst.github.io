import type { AssetDomain, EngagementArea, HostileKind, LatLng, ThreatLevel } from "../types";

export interface HostileSeed {
  id: string;
  callsign: string;
  kind: HostileKind;
  label: string;
  /** Closed patrol loop; the first point is the spawn. */
  patrol: LatLng[];
  speedMps: number;
  threat: ThreatLevel;
  weaponRangeM: number;
  /** Armor percent per second inflicted on a friendly inside range. */
  damagePerS: number;
}

export const HOSTILE_DOMAIN: Record<HostileKind, AssetDomain> = {
  technical: "ground",
  hostile_ugv: "ground",
  hostile_uav: "air",
  hostile_boat: "sea",
};

export const HOSTILE_KIND_LABEL: Record<HostileKind, string> = {
  technical: "Armed technical",
  hostile_ugv: "Hostile UGV",
  hostile_uav: "Hostile UAV",
  hostile_boat: "Hostile boat",
};

/** Named objectives drawn on the map so operators can see where contact is expected. */
export const ENGAGEMENT_AREAS: EngagementArea[] = [
  {
    id: "obj-south",
    label: "OBJ SOUTH",
    polygon: [
      { lat: 36.746, lng: -121.758 },
      { lat: 36.746, lng: -121.718 },
      { lat: 36.729, lng: -121.718 },
      { lat: 36.729, lng: -121.758 },
    ],
  },
  {
    id: "obj-east",
    label: "OBJ EAST",
    polygon: [
      { lat: 36.816, lng: -121.722 },
      { lat: 36.816, lng: -121.700 },
      { lat: 36.796, lng: -121.700 },
      { lat: 36.796, lng: -121.722 },
    ],
  },
];

export const HOSTILE_SEEDS: HostileSeed[] = [
  {
    id: "hos-t1",
    callsign: "TANGO-1",
    kind: "technical",
    label: "Technical with heavy MG",
    patrol: [
      { lat: 36.738, lng: -121.746 },
      { lat: 36.741, lng: -121.732 },
      { lat: 36.734, lng: -121.726 },
      { lat: 36.732, lng: -121.744 },
    ],
    speedMps: 3,
    threat: "high",
    weaponRangeM: 650,
    damagePerS: 0.9,
  },
  {
    id: "hos-t2",
    callsign: "TANGO-2",
    kind: "technical",
    label: "Technical with recoilless rifle",
    patrol: [
      { lat: 36.743, lng: -121.724 },
      { lat: 36.736, lng: -121.720 },
      { lat: 36.731, lng: -121.733 },
    ],
    speedMps: 2.5,
    threat: "high",
    weaponRangeM: 700,
    damagePerS: 1.2,
  },
  {
    id: "hos-u1",
    callsign: "UNIFORM-1",
    kind: "hostile_ugv",
    label: "Tracked hostile UGV",
    patrol: [
      { lat: 36.802, lng: -121.706 },
      { lat: 36.812, lng: -121.704 },
      { lat: 36.809, lng: -121.716 },
    ],
    speedMps: 1.8,
    threat: "medium",
    weaponRangeM: 400,
    damagePerS: 0.5,
  },
  {
    id: "hos-u2",
    callsign: "UNIFORM-2",
    kind: "hostile_ugv",
    label: "Wheeled hostile UGV",
    patrol: [
      { lat: 36.799, lng: -121.718 },
      { lat: 36.806, lng: -121.720 },
      { lat: 36.812, lng: -121.710 },
    ],
    speedMps: 2.2,
    threat: "medium",
    weaponRangeM: 350,
    damagePerS: 0.4,
  },
  {
    id: "hos-a1",
    callsign: "ALPHA-1",
    kind: "hostile_uav",
    label: "Hostile quadrotor",
    patrol: [
      { lat: 36.822, lng: -121.758 },
      { lat: 36.828, lng: -121.746 },
      { lat: 36.816, lng: -121.744 },
    ],
    speedMps: 9,
    threat: "low",
    weaponRangeM: 250,
    damagePerS: 0.2,
  },
  {
    id: "hos-b1",
    callsign: "BRAVO-1",
    kind: "hostile_boat",
    label: "Fast boat",
    patrol: [
      { lat: 36.742, lng: -121.836 },
      { lat: 36.752, lng: -121.846 },
      { lat: 36.738, lng: -121.852 },
    ],
    speedMps: 7,
    threat: "medium",
    weaponRangeM: 500,
    damagePerS: 0.6,
  },
];
