import type { SeededRng } from "@/simulation";
import type {
  Asset,
  Hostile,
  LatLng,
  Mission,
  Objective,
  Sitrep,
  WeaponSystem,
} from "../types";
import { bearingDeg, haversineM, interpolateLatLng } from "../geo/haversine";
import { HOSTILE_DOMAIN, HOSTILE_KIND_LABEL, type HostileSeed } from "../data/hostiles";

export function hostileFromSeed(seed: HostileSeed): Hostile {
  return {
    id: seed.id,
    callsign: seed.callsign,
    kind: seed.kind,
    domain: HOSTILE_DOMAIN[seed.kind],
    label: seed.label ?? HOSTILE_KIND_LABEL[seed.kind],
    position: { ...seed.patrol[0] },
    headingDeg: seed.patrol.length > 1 ? bearingDeg(seed.patrol[0], seed.patrol[1]) : 0,
    speedMps: seed.speedMps,
    status: "active",
    threat: seed.threat,
    hp: 1,
    weaponRangeM: seed.weaponRangeM,
    damagePerS: seed.damagePerS,
    lastSeenMs: null,
    detectedBy: null,
    eliminatedAtMs: null,
    eliminatedBy: null,
    engagedBy: [],
  };
}

export interface PatrolCursor {
  /** Index of the patrol point being approached. */
  index: number;
}

/** Moves a hostile along its patrol loop by speed × dt. Straight legs, no planning. */
export function stepHostilePatrol(
  hostile: Hostile,
  patrol: LatLng[],
  cursor: PatrolCursor,
  dtMs: number
): void {
  if (hostile.status === "eliminated" || patrol.length < 2) return;
  let remaining = hostile.speedMps * (dtMs / 1000);
  let guard = 0;
  while (remaining > 0 && guard < 8) {
    guard += 1;
    const target = patrol[cursor.index % patrol.length];
    const legM = haversineM(hostile.position, target);
    if (legM < 0.5) {
      cursor.index = (cursor.index + 1) % patrol.length;
      continue;
    }
    hostile.headingDeg = bearingDeg(hostile.position, target);
    if (remaining >= legM) {
      hostile.position = { ...target };
      remaining -= legM;
      cursor.index = (cursor.index + 1) % patrol.length;
    } else {
      hostile.position = interpolateLatLng(hostile.position, target, remaining / legM);
      remaining = 0;
    }
  }
}

/** Hit chance falls off linearly to half at maximum range. */
export function hitProbabilityAt(weapon: WeaponSystem, distanceM: number): number {
  const ratio = Math.max(0, Math.min(1, distanceM / weapon.rangeM));
  return weapon.hitProbability * (1 - 0.5 * ratio);
}

export function resolveShot(rng: SeededRng, weapon: WeaponSystem, distanceM: number): boolean {
  return rng.next() < hitProbabilityAt(weapon, distanceM);
}

/**
 * Orders targets by a greedy nearest-neighbour chain from `from`, so the
 * engagement path sweeps through them without doubling back.
 */
export function orderHostilesFrom(from: LatLng, hostiles: Hostile[]): Hostile[] {
  const pool = hostiles.filter((hostile) => hostile.status !== "eliminated");
  const ordered: Hostile[] = [];
  let cursor = from;
  while (pool.length > 0) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    pool.forEach((hostile, index) => {
      const distance = haversineM(cursor, hostile.position);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    const [next] = pool.splice(bestIndex, 1);
    ordered.push(next);
    cursor = next.position;
  }
  return ordered;
}

export function buildEngageObjective(from: LatLng, hostiles: Hostile[]): Objective | null {
  const ordered = orderHostilesFrom(from, hostiles);
  if (ordered.length === 0) return null;
  return {
    type: "engage",
    hostileIds: ordered.map((hostile) => hostile.id),
    waypoints: ordered.map((hostile) => ({ ...hostile.position })),
    targetLabel:
      ordered.length === 1 ? ordered[0].callsign : `${ordered.length} hostiles · ${ordered.map((h) => h.callsign).join(", ")}`,
  };
}

export function buildSitrep(
  mission: Mission,
  asset: Asset,
  hostiles: Map<string, Hostile>,
  timestampMs: number,
  engagementStartedMs: number | null,
  lastContactMs: number | null,
  armorAtStart: number
): Sitrep {
  const ids = mission.objective.hostileIds ?? [];
  const eliminatedByUs = ids.filter((id) => {
    const hostile = hostiles.get(id);
    return hostile?.status === "eliminated" && hostile.eliminatedBy === asset.id;
  }).length;
  const remaining = ids.filter((id) => hostiles.get(id)?.status !== "eliminated").length;
  const weapon = asset.weapon;
  const ammoRemaining = weapon?.ammo ?? 0;
  const ammoCapacity = weapon?.system.ammoCapacity ?? 0;
  const damageTakenPct = Math.max(0, armorAtStart - asset.armorPct);
  const elapsedMs = engagementStartedMs === null ? 0 : Math.max(0, timestampMs - engagementStartedMs);
  const shots = weapon ? weapon.shotsFired : 0;
  const hits = weapon ? weapon.hits : 0;
  const summary =
    `${asset.callsign} SITREP · ${eliminatedByUs}/${ids.length} targets eliminated` +
    ` · ${shots} rds ${hits} hits · ammo ${ammoRemaining}/${ammoCapacity}` +
    ` · armor ${asset.armorPct.toFixed(0)}%` +
    (remaining > 0 ? ` · ${remaining} remaining` : " · objective clear");
  return {
    missionId: mission.id,
    callsign: asset.callsign,
    targetsAssigned: ids.length,
    targetsEliminated: eliminatedByUs,
    targetsRemaining: remaining,
    shotsFired: shots,
    hits,
    ammoRemaining,
    ammoCapacity,
    armorPct: asset.armorPct,
    damageTakenPct,
    engagementStartedMs,
    lastContactMs,
    elapsedMs,
    summary,
  };
}
