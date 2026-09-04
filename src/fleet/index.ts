export * from "./types";
export { OPERATING_AREA } from "./data/operatingArea";
export { ASSET_SEEDS } from "./data/assets";
export { KIND_PROFILES, ASSET_KINDS, kindProfile } from "./data/kinds";
export type { KindProfile } from "./data/kinds";
export { FLEET_SCENARIOS, findFleetScenario, DEFAULT_FLEET_SEED } from "./scenarios/catalog";
export { FLEET_FAULT_CATALOG, findFleetFault } from "./faults/catalog";
export type { FleetFaultDefinition } from "./faults/catalog";
export {
  bearingDeg,
  destinationPoint,
  haversineM,
  headingDelta,
  pathLengthM,
  pointInPolygon,
  polygonAreaM2,
  polygonCentroid,
  createProjection,
} from "./geo";
export {
  filterAssets,
  matchesQuery,
  matchesFilters,
  parseQuery,
  sortAssets,
  countActiveFilters,
  EMPTY_FILTERS,
  ENERGY_BANDS,
} from "./search/matchAssets";
export type { AssetFilters, AssetSort, EnergyBand, MissionFilter, MissionTypeOf } from "./search/matchAssets";
export { SENSOR_TEMPLATES } from "./sensors/deriveSensors";
export { LINK_LOSS_TIMEOUT_MS } from "./sensors/linkModel";
export { FleetPlanner, COA_VARIANTS, VARIANT_WEIGHTS, ENERGY_RESERVE_PCT } from "./planning/FleetPlanner";
export { TERRAIN_CLASSES, ZONE_TYPES, terrainAt, zonesAt } from "./planning/terrainGrid";
export { DEFAULT_ZONES } from "./data/operatingArea";
export {
  FleetRuntime,
  DEFAULT_FLEET_CONFIG,
  LOW_ENERGY_PCT,
  DISPATCH_MIN_ENERGY_PCT,
  describeObjective,
  describeTarget,
  describeZoneType,
  formatDuration,
  formatLatLng,
} from "./runtime/FleetRuntime";
export type { DispatchResult, FleetRuntimeConfig } from "./runtime/FleetRuntime";
export { FleetEventCode, FLEET_TIMELINE_CODES } from "./runtime/events";
export {
  fleetRuntime,
  getFleetEvents,
  getFleetSnapshot,
  getFleetView,
  subscribeFleetEvents,
  subscribeFleetSnapshot,
  subscribeFleetView,
} from "./runtime/runtime";
export { HOSTILE_SEEDS, ENGAGEMENT_AREAS, HOSTILE_KIND_LABEL, HOSTILE_DOMAIN } from "./data/hostiles";
export {
  buildEngageObjective,
  buildSitrep,
  hitProbabilityAt,
  orderHostilesFrom,
} from "./combat/engagement";
