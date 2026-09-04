import type { AssetDomain } from "./Asset";
import type { LatLng } from "./geo";

export type TerrainClass =
  | "water"
  | "road"
  | "open"
  | "urban"
  | "steep"
  | "wetland";

/**
 * Zone semantics come from each kind's `zoneCost` table, except `exclusion`,
 * which the cost map blocks for every kind regardless of profile.
 */
export type ZoneType =
  | "no_fly"
  | "restricted"
  | "hazard"
  | "shallow_water"
  | "low_comms"
  | "exclusion";

/** Editable fields of a zone; id is assigned by the runtime. */
export type ZoneInput = Pick<Zone, "name" | "type" | "polygon">;

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  polygon: LatLng[];
}

export interface TerrainPatch {
  id: string;
  name: string;
  class: Exclude<TerrainClass, "water" | "road" | "open">;
  polygon: LatLng[];
}

export interface RoadCorridor {
  id: string;
  name: string;
  points: LatLng[];
  halfWidthM: number;
}

export interface Relay {
  id: string;
  name: string;
  position: LatLng;
  rangeM: number;
}

export interface Depot {
  id: string;
  name: string;
  position: LatLng;
  domains: AssetDomain[];
}

export interface NamedWaypoint {
  id: string;
  label: string;
  position: LatLng;
  domains: AssetDomain[];
}

export interface SurveyArea {
  id: string;
  label: string;
  polygon: LatLng[];
}

export interface OperatingArea {
  id: string;
  name: string;
  center: LatLng;
  /** Square box side length in meters, centered on `center`. */
  boundsSizeM: number;
  cellSizeM: number;
  seaPolygon: LatLng[];
  terrainPatches: TerrainPatch[];
  roads: RoadCorridor[];
  zones: Zone[];
  relays: Relay[];
  depots: Depot[];
  waypoints: NamedWaypoint[];
  surveyAreas: SurveyArea[];
}
