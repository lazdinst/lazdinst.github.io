import type {
  FleetScenario,
  LatLng,
  OperatingArea,
  TerrainClass,
  XY,
  Zone,
  ZoneType,
} from "../types";
import { createProjection, type Projection } from "../geo/projection";
import { distanceToPolylineXY, pointInPolygon } from "../geo/polygon";
import { isCovered } from "../sensors/linkModel";

export const TERRAIN_CLASSES: TerrainClass[] = [
  "water",
  "road",
  "open",
  "urban",
  "steep",
  "wetland",
];

export const ZONE_TYPES: ZoneType[] = [
  "no_fly",
  "restricted",
  "hazard",
  "shallow_water",
  "low_comms",
  "exclusion",
];

export function zoneBit(type: ZoneType): number {
  return 1 << ZONE_TYPES.indexOf(type);
}

/**
 * Kind-independent raster of the operating area: terrain class and zone
 * membership per cell. Built once per area and shared by every cost map.
 */
export interface TerrainGrid {
  area: OperatingArea;
  projection: Projection;
  cols: number;
  rows: number;
  cellSizeM: number;
  /** Projected coordinate of the south-west corner. */
  origin: XY;
  terrain: Uint8Array;
  zoneMask: Uint8Array;
  cellCenters: LatLng[];
}

export function buildTerrainGrid(area: OperatingArea): TerrainGrid {
  const projection = createProjection(area.center);
  const cellSizeM = area.cellSizeM;
  const cols = Math.ceil(area.boundsSizeM / cellSizeM);
  const rows = cols;
  const half = area.boundsSizeM / 2;
  const origin = { x: -half, y: -half };
  const terrain = new Uint8Array(cols * rows);
  const zoneMask = new Uint8Array(cols * rows);
  const cellCenters: LatLng[] = new Array(cols * rows);

  const roadsXY = area.roads.map((road) => ({
    halfWidthM: road.halfWidthM,
    line: road.points.map((point) => projection.toXY(point)),
  }));

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const xy = {
        x: origin.x + (col + 0.5) * cellSizeM,
        y: origin.y + (row + 0.5) * cellSizeM,
      };
      const center = projection.toLatLng(xy);
      cellCenters[index] = center;

      let terrainClass: TerrainClass = "open";
      if (pointInPolygon(center, area.seaPolygon)) {
        terrainClass = "water";
      } else if (
        roadsXY.some((road) => distanceToPolylineXY(xy, road.line) <= road.halfWidthM)
      ) {
        terrainClass = "road";
      } else {
        const patch = area.terrainPatches.find((candidate) =>
          pointInPolygon(center, candidate.polygon)
        );
        if (patch) terrainClass = patch.class;
      }
      terrain[index] = TERRAIN_CLASSES.indexOf(terrainClass);
    }
  }

  const grid: TerrainGrid = { area, projection, cols, rows, cellSizeM, origin, terrain, zoneMask, cellCenters };
  rasterizeZones(grid, area.zones);
  return grid;
}

/**
 * Recomputes zone membership for every cell in place. Terrain is untouched,
 * so editing zones never needs the full grid rebuilt.
 */
export function rasterizeZones(grid: TerrainGrid, zones: Zone[]): void {
  grid.area = { ...grid.area, zones };
  for (let index = 0; index < grid.zoneMask.length; index += 1) {
    const center = grid.cellCenters[index];
    let mask = 0;
    zones.forEach((zone) => {
      if (zone.polygon.length >= 3 && pointInPolygon(center, zone.polygon)) {
        mask |= zoneBit(zone.type);
      }
    });
    grid.zoneMask[index] = mask;
  }
}

export function cellIndexAt(grid: TerrainGrid, point: LatLng): number | null {
  const xy = grid.projection.toXY(point);
  const col = Math.floor((xy.x - grid.origin.x) / grid.cellSizeM);
  const row = Math.floor((xy.y - grid.origin.y) / grid.cellSizeM);
  if (col < 0 || row < 0 || col >= grid.cols || row >= grid.rows) return null;
  return row * grid.cols + col;
}

export function terrainAt(grid: TerrainGrid, point: LatLng): TerrainClass {
  const index = cellIndexAt(grid, point);
  return index === null ? "open" : TERRAIN_CLASSES[grid.terrain[index]];
}

export function zonesAt(grid: TerrainGrid, point: LatLng): ZoneType[] {
  const index = cellIndexAt(grid, point);
  if (index === null) return [];
  const mask = grid.zoneMask[index];
  return ZONE_TYPES.filter((type) => (mask & zoneBit(type)) !== 0);
}

/** Relay coverage per cell for a scenario. Cheap enough to rebuild per scenario. */
export function buildCoverage(grid: TerrainGrid, scenario: FleetScenario): Uint8Array {
  const covered = new Uint8Array(grid.cols * grid.rows);
  for (let index = 0; index < covered.length; index += 1) {
    covered[index] = isCovered(
      grid.cellCenters[index],
      grid.area.relays,
      scenario.disabledRelayIds,
      scenario.linkRangeScale
    )
      ? 1
      : 0;
  }
  return covered;
}
