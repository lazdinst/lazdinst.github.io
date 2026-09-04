import type { ZoneType } from "@/fleet";

export interface ZoneTypeMeta {
  label: string;
  short: string;
  /** Who the zone binds, in operator terms. */
  detail: string;
  /** Tailwind text color matching the map stroke in fleetMap.css. */
  textClass: string;
  /** Tailwind background color for swatches and dots. */
  dotClass: string;
}

export const ZONE_TYPE_META: Record<ZoneType, ZoneTypeMeta> = {
  exclusion: {
    label: "Exclusion",
    short: "EXCL",
    detail: "Keep-out for every asset. Pathing never enters.",
    textClass: "text-destructive",
    dotClass: "bg-destructive",
  },
  no_fly: {
    label: "No-fly",
    short: "NOFLY",
    detail: "Air assets route around. Ground and sea unaffected.",
    textClass: "text-destructive",
    dotClass: "bg-destructive",
  },
  restricted: {
    label: "Restricted",
    short: "RSTR",
    detail: "Closed to all kinds by profile.",
    textClass: "text-destructive",
    dotClass: "bg-destructive",
  },
  hazard: {
    label: "Hazard",
    short: "HAZ",
    detail: "Passable at 3× risk. Safe routes avoid it.",
    textClass: "text-warning",
    dotClass: "bg-warning",
  },
  shallow_water: {
    label: "Shallow water",
    short: "SHOAL",
    detail: "Vessels route around. Others unaffected.",
    textClass: "text-chart-2",
    dotClass: "bg-chart-2",
  },
  low_comms: {
    label: "Low comms",
    short: "LOCOM",
    detail: "Passable at 1.5× risk. Expect coverage gaps.",
    textClass: "text-chart-4",
    dotClass: "bg-chart-4",
  },
};

/** Order for pickers: the operator-drawn keep-out first. */
export const ZONE_TYPE_ORDER: ZoneType[] = [
  "exclusion",
  "no_fly",
  "restricted",
  "hazard",
  "shallow_water",
  "low_comms",
];
