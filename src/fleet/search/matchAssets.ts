import type { Asset, AssetDomain, AssetKind, AssetStatus, ObjectiveType } from "../types";

export type MissionFilter = ObjectiveType | "none";

export interface EnergyBand {
  /** Inclusive lower bound in percent. */
  min?: number;
  /** Exclusive upper bound in percent. */
  max?: number;
}

export interface AssetFilters {
  domains: AssetDomain[];
  statuses: AssetStatus[];
  kinds?: AssetKind[];
  energy?: EnergyBand | null;
  missions?: MissionFilter[];
}

export const EMPTY_FILTERS: AssetFilters = { domains: [], statuses: [], kinds: [], energy: null, missions: [] };

export const ENERGY_BANDS: { id: string; label: string; band: EnergyBand }[] = [
  { id: "critical", label: "< 25%", band: { max: 25 } },
  { id: "low", label: "< 50%", band: { max: 50 } },
  { id: "ok", label: "≥ 50%", band: { min: 50 } },
  { id: "full", label: "≥ 80%", band: { min: 80 } },
];

/** Resolves the active mission objective for an asset, or null when idle. */
export type MissionTypeOf = (asset: Asset) => ObjectiveType | null;

const NO_MISSION: MissionTypeOf = () => null;

export function countActiveFilters(filters: AssetFilters): number {
  return (
    filters.domains.length +
    filters.statuses.length +
    (filters.kinds?.length ?? 0) +
    (filters.energy ? 1 : 0) +
    (filters.missions?.length ?? 0)
  );
}

interface ParsedQuery {
  terms: string[];
  fields: { field: string; value: string }[];
}

/**
 * Splits "hawk status:fault energy:<30" into free terms and field filters.
 * Field names accepted: status, kind, domain, tag, fault, energy, mission.
 */
export function parseQuery(query: string): ParsedQuery {
  const terms: string[] = [];
  const fields: ParsedQuery["fields"] = [];
  query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .forEach((token) => {
      const colon = token.indexOf(":");
      if (colon > 0) {
        fields.push({ field: token.slice(0, colon), value: token.slice(colon + 1) });
      } else {
        terms.push(token);
      }
    });
  return { terms, fields };
}

function haystack(asset: Asset): string[] {
  return [
    asset.callsign.toLowerCase(),
    asset.name.toLowerCase(),
    asset.kind.replace(/_/g, " "),
    asset.status.replace(/_/g, " "),
    asset.domain,
    ...asset.tags.map((tag) => tag.toLowerCase()),
    ...asset.faults.map((fault) => fault.replace(/_/g, " ")),
  ];
}

function matchesTerm(asset: Asset, term: string): boolean {
  const normalized = term.replace(/[-_]/g, " ");
  return haystack(asset).some((field) => {
    const f = field.replace(/[-_]/g, " ");
    return f.includes(normalized) || f.split(" ").some((word) => word.startsWith(normalized));
  });
}

function matchesEnergyExpression(asset: Asset, value: string): boolean {
  const match = /^(<=|>=|<|>|=)?(\d+)$/.exec(value);
  if (!match) return true;
  const op = match[1] ?? "<";
  const threshold = Number(match[2]);
  const pct = asset.energyPct;
  switch (op) {
    case "<":
      return pct < threshold;
    case "<=":
      return pct <= threshold;
    case ">":
      return pct > threshold;
    case ">=":
      return pct >= threshold;
    default:
      return Math.round(pct) === threshold;
  }
}

function matchesField(asset: Asset, field: string, value: string, missionType: ObjectiveType | null): boolean {
  const v = value.replace(/-/g, "_");
  switch (field) {
    case "status":
      return asset.status.startsWith(v);
    case "kind":
      return asset.kind.includes(v);
    case "domain":
      return asset.domain === v;
    case "tag":
      return asset.tags.some((tag) => tag.toLowerCase().startsWith(value));
    case "fault":
      return asset.faults.some((fault) => fault.startsWith(v));
    case "energy":
    case "charge":
    case "battery":
      return matchesEnergyExpression(asset, value);
    case "mission":
      if (v === "none" || v === "no") return missionType === null;
      return missionType !== null && missionType.startsWith(v);
    default:
      return true;
  }
}

export function matchesQuery(asset: Asset, query: string, missionTypeOf: MissionTypeOf = NO_MISSION): boolean {
  const { terms, fields } = parseQuery(query);
  const missionType = missionTypeOf(asset);
  return (
    terms.every((term) => matchesTerm(asset, term)) &&
    fields.every(({ field, value }) => matchesField(asset, field, value, missionType))
  );
}

export function matchesFilters(asset: Asset, filters: AssetFilters, missionTypeOf: MissionTypeOf = NO_MISSION): boolean {
  if (filters.domains.length > 0 && !filters.domains.includes(asset.domain)) return false;
  if (filters.statuses.length > 0 && !filters.statuses.includes(asset.status)) return false;
  if (filters.kinds && filters.kinds.length > 0 && !filters.kinds.includes(asset.kind)) return false;
  if (filters.energy) {
    if (filters.energy.min !== undefined && asset.energyPct < filters.energy.min) return false;
    if (filters.energy.max !== undefined && asset.energyPct >= filters.energy.max) return false;
  }
  if (filters.missions && filters.missions.length > 0) {
    const type = missionTypeOf(asset);
    const wanted = type === null ? "none" : type;
    if (!filters.missions.includes(wanted)) return false;
  }
  return true;
}

export type AssetSort = "severity" | "callsign" | "energy" | "service";

const STATUS_SEVERITY: Record<AssetStatus, number> = {
  fault: 0,
  lost_link: 1,
  engaging: 2,
  maintenance: 3,
  returning: 4,
  en_route: 5,
  patrolling: 6,
  charging: 7,
  idle: 8,
};

export function sortAssets(assets: Asset[], sort: AssetSort): Asset[] {
  const sorted = [...assets];
  switch (sort) {
    case "callsign":
      sorted.sort((a, b) => a.callsign.localeCompare(b.callsign));
      break;
    case "energy":
      sorted.sort((a, b) => a.energyPct - b.energyPct);
      break;
    case "service":
      sorted.sort(
        (a, b) =>
          b.maintenance.hoursSinceService / b.maintenance.serviceIntervalHours -
          a.maintenance.hoursSinceService / a.maintenance.serviceIntervalHours
      );
      break;
    case "severity":
    default:
      sorted.sort(
        (a, b) =>
          STATUS_SEVERITY[a.status] - STATUS_SEVERITY[b.status] ||
          a.callsign.localeCompare(b.callsign)
      );
  }
  return sorted;
}

export function filterAssets(
  assets: Asset[],
  query: string,
  filters: AssetFilters,
  sort: AssetSort = "severity",
  missionTypeOf: MissionTypeOf = NO_MISSION
): Asset[] {
  const trimmed = query.trim();
  const matched = assets.filter(
    (asset) =>
      matchesFilters(asset, filters, missionTypeOf) &&
      (trimmed === "" || matchesQuery(asset, trimmed, missionTypeOf))
  );
  return sortAssets(matched, sort);
}
