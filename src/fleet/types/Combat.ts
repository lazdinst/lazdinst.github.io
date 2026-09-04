import type { AssetDomain } from "./Asset";
import type { LatLng } from "./geo";

export type WeaponKind = "cannon" | "munition";

export interface WeaponSystem {
  name: string;
  kind: WeaponKind;
  rangeM: number;
  roundsPerMin: number;
  /** Hit chance at point-blank; falls off linearly to half at max range. */
  hitProbability: number;
  /** Fraction of a hostile's hit points removed per hit. */
  damagePerHit: number;
  ammoCapacity: number;
}

export interface WeaponState {
  system: WeaponSystem;
  ammo: number;
  /** Weapons hold: no firing until released. */
  safe: boolean;
  shotsFired: number;
  hits: number;
  targetsEliminated: number;
  lastFiredMs: number | null;
  targetId: string | null;
}

export type HostileKind = "technical" | "hostile_ugv" | "hostile_uav" | "hostile_boat";
export type HostileStatus = "active" | "suppressed" | "eliminated";
export type ThreatLevel = "low" | "medium" | "high";

export interface Hostile {
  id: string;
  callsign: string;
  kind: HostileKind;
  domain: AssetDomain;
  label: string;
  position: LatLng;
  headingDeg: number;
  speedMps: number;
  status: HostileStatus;
  threat: ThreatLevel;
  /** 0..1 */
  hp: number;
  weaponRangeM: number;
  /** Armor percent per second inflicted on a friendly inside range. */
  damagePerS: number;
  lastSeenMs: number | null;
  detectedBy: string | null;
  eliminatedAtMs: number | null;
  eliminatedBy: string | null;
  /** Friendly asset ids currently on an engage mission against this hostile. */
  engagedBy: string[];
}

export interface Sitrep {
  missionId: string;
  callsign: string;
  targetsAssigned: number;
  targetsEliminated: number;
  targetsRemaining: number;
  shotsFired: number;
  hits: number;
  ammoRemaining: number;
  ammoCapacity: number;
  armorPct: number;
  damageTakenPct: number;
  engagementStartedMs: number | null;
  lastContactMs: number | null;
  elapsedMs: number;
  /** One-line summary in radio style. */
  summary: string;
}

export interface EngagementArea {
  id: string;
  label: string;
  polygon: LatLng[];
}
