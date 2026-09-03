import type { LatLng } from "../types";
import { moveCost, type PlanWeights } from "./astar";
import type { CostMap } from "./costMap";
import { cellIndexAt } from "./terrainGrid";

/** Supercover line walk: true if every cell between a and b (inclusive) is passable. */
export function lineOfSight(map: CostMap, a: number, b: number): boolean {
  const cols = map.grid.cols;
  let x0 = a % cols;
  let y0 = Math.floor(a / cols);
  const x1 = b % cols;
  const y1 = Math.floor(b / cols);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  for (;;) {
    if (!map.passable[y0 * cols + x0]) return false;
    if (x0 === x1 && y0 === y1) return true;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
      // Also test the cell we slide past so the line cannot slip between diagonals.
      if (e2 < dx && !map.passable[y0 * cols + x0]) return false;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function headingBetween(map: CostMap, a: number, b: number): number {
  const cols = map.grid.cols;
  const dx = (b % cols) - (a % cols);
  const dy = Math.floor(b / cols) - Math.floor(a / cols);
  return ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
}

/** Weighted cost of walking a list of adjacent cells. */
export function cellsCost(map: CostMap, cells: number[], weights: PlanWeights): number {
  let total = 0;
  const cols = map.grid.cols;
  for (let i = 1; i < cells.length; i += 1) {
    const a = cells[i - 1];
    const b = cells[i];
    const diagonal = (a % cols) !== (b % cols) && Math.floor(a / cols) !== Math.floor(b / cols);
    total += moveCost(map, a, b, diagonal ? Math.SQRT2 : 1, headingBetween(map, a, b), weights);
  }
  return total;
}

/** Cells visited by a straight line from a to b (supercover), or null if any is impassable. */
export function lineCells(map: CostMap, a: number, b: number): number[] | null {
  const cols = map.grid.cols;
  let x0 = a % cols;
  let y0 = Math.floor(a / cols);
  const x1 = b % cols;
  const y1 = Math.floor(b / cols);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  const out: number[] = [];
  for (;;) {
    const index = y0 * cols + x0;
    if (!map.passable[index]) return null;
    out.push(index);
    if (x0 === x1 && y0 === y1) return out;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/**
 * Cost-aware string pulling: a shortcut replaces a stretch of the A* path only
 * when the straight line is passable and no more expensive than the stretch it
 * replaces. This keeps ground routes on roads instead of cutting fields.
 */
export function pullString(map: CostMap, cells: number[], weights: PlanWeights): number[] {
  if (cells.length <= 2) return cells;
  const out: number[] = [cells[0]];
  let anchor = 0;
  while (anchor < cells.length - 1) {
    let far = anchor + 1;
    for (let j = cells.length - 1; j > anchor + 1; j -= 1) {
      const line = lineCells(map, cells[anchor], cells[j]);
      if (!line) continue;
      const original = cellsCost(map, cells.slice(anchor, j + 1), weights);
      const shortcut = cellsCost(map, line, weights);
      if (shortcut <= original * 1.02) {
        far = j;
        break;
      }
    }
    out.push(cells[far]);
    anchor = far;
  }
  return out;
}

/** True when every sampled point along the path sits on a passable cell. */
export function pathPassable(map: CostMap, path: LatLng[]): boolean {
  const stepDeg = map.grid.cellSizeM / 111_320 / 2;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(b.lat - a.lat, b.lng - a.lng) / stepDeg));
    for (let s = 0; s <= steps; s += 1) {
      const t = s / steps;
      const index = cellIndexAt(map.grid, {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      });
      if (index === null || !map.passable[index]) return false;
    }
  }
  return true;
}

/**
 * One Chaikin corner-cut iteration in lat/lng space with endpoints pinned.
 * Used to approximate a turn radius for fixed-wing and vessel kinds.
 */
export function chaikin(path: LatLng[], iterations: number): LatLng[] {
  let current = path;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    if (current.length < 3) return current;
    const next: LatLng[] = [current[0]];
    for (let i = 0; i < current.length - 1; i += 1) {
      const a = current[i];
      const b = current[i + 1];
      next.push({ lat: a.lat * 0.75 + b.lat * 0.25, lng: a.lng * 0.75 + b.lng * 0.25 });
      next.push({ lat: a.lat * 0.25 + b.lat * 0.75, lng: a.lng * 0.25 + b.lng * 0.75 });
    }
    next.push(current[current.length - 1]);
    // Drop the duplicate points Chaikin leaves next to the pinned ends.
    current = next.filter(
      (point, index) =>
        index === 0 ||
        point.lat !== next[index - 1].lat ||
        point.lng !== next[index - 1].lng
    );
  }
  return current;
}
