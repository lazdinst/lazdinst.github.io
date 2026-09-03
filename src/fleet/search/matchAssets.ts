import type { Asset, AssetDomain, AssetStatus } from "../types";

export interface AssetFilters {
  domains: AssetDomain[];
  statuses: AssetStatus[];
}

export const EMPTY_FILTERS: AssetFilters = { domains: [], statuses: [] };

interface ParsedQuery {
  terms: string[];
  fields: { field: string; value: string }[];
}

/**
 * Splits "hawk status:fault kind:quad" into free terms and field filters.
 * Field names accepted: status, kind, domain, tag.
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

function matchesField(asset: Asset, field: string, value: string): boolean {
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
    default:
      return true;
  }
}

export function matchesQuery(asset: Asset, query: string): boolean {
  const { terms, fields } = parseQuery(query);
  return (
    terms.every((term) => matchesTerm(asset, term)) &&
    fields.every(({ field, value }) => matchesField(asset, field, value))
  );
}

export function matchesFilters(asset: Asset, filters: AssetFilters): boolean {
  if (filters.domains.length > 0 && !filters.domains.includes(asset.domain)) {
    return false;
  }
  if (filters.statuses.length > 0 && !filters.statuses.includes(asset.status)) {
    return false;
  }
  return true;
}

export type AssetSort = "severity" | "callsign" | "energy" | "service";

const STATUS_SEVERITY: Record<AssetStatus, number> = {
  fault: 0,
  lost_link: 1,
  maintenance: 2,
  returning: 3,
  en_route: 4,
  patrolling: 5,
  charging: 6,
  idle: 7,
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
  sort: AssetSort = "severity"
): Asset[] {
  const trimmed = query.trim();
  const matched = assets.filter(
    (asset) =>
      matchesFilters(asset, filters) && (trimmed === "" || matchesQuery(asset, trimmed))
  );
  return sortAssets(matched, sort);
}
