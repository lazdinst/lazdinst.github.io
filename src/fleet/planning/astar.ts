import type { LatLng } from "../types";
import { flowEnergyFactor } from "../motion/energyModel";
import type { CostMap } from "./costMap";
import { cellIndexAt } from "./terrainGrid";

export interface PlanWeights {
  time: number;
  energy: number;
  risk: number;
}

const SQRT2 = Math.SQRT2;
const NEIGHBORS: [number, number, number, number][] = [
  // dcol, drow, distance, heading (deg clockwise from north)
  [1, 0, 1, 90],
  [-1, 0, 1, 270],
  [0, 1, 1, 0],
  [0, -1, 1, 180],
  [1, 1, SQRT2, 45],
  [-1, 1, SQRT2, 315],
  [1, -1, SQRT2, 135],
  [-1, -1, SQRT2, 225],
];

class MinHeap {
  private items: number[] = [];
  private keys: number[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: number, key: number): void {
    this.items.push(item);
    this.keys.push(key);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.keys[parent] <= this.keys[i]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop(): number {
    const top = this.items[0];
    const lastItem = this.items.pop() as number;
    const lastKey = this.keys.pop() as number;
    if (this.items.length > 0) {
      this.items[0] = lastItem;
      this.keys[0] = lastKey;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = left + 1;
        let smallest = i;
        if (left < this.items.length && this.keys[left] < this.keys[smallest]) smallest = left;
        if (right < this.items.length && this.keys[right] < this.keys[smallest]) smallest = right;
        if (smallest === i) break;
        this.swap(i, smallest);
        i = smallest;
      }
    }
    return top;
  }

  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
    [this.keys[a], this.keys[b]] = [this.keys[b], this.keys[a]];
  }
}

/** Nearest passable cell to `index` within `maxRadius` rings, or null. */
export function snapToPassable(map: CostMap, index: number, maxRadius = 12): number | null {
  if (map.passable[index]) return index;
  const { cols, rows } = map.grid;
  const col0 = index % cols;
  const row0 = Math.floor(index / cols);
  for (let radius = 1; radius <= maxRadius; radius += 1) {
    let best: number | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let drow = -radius; drow <= radius; drow += 1) {
      for (let dcol = -radius; dcol <= radius; dcol += 1) {
        if (Math.max(Math.abs(drow), Math.abs(dcol)) !== radius) continue;
        const col = col0 + dcol;
        const row = row0 + drow;
        if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
        const candidate = row * cols + col;
        if (!map.passable[candidate]) continue;
        const dist = dcol * dcol + drow * drow;
        if (dist < bestDist) {
          bestDist = dist;
          best = candidate;
        }
      }
    }
    if (best !== null) return best;
  }
  return null;
}

export interface AStarResult {
  /** Cell indices from start to goal inclusive. */
  cells: number[];
  cost: number;
  expanded: number;
}

/** Per-move cost: weighted time, energy (with flow), and risk over a step of `dist` cells. */
export function moveCost(
  map: CostMap,
  from: number,
  to: number,
  dist: number,
  heading: number,
  weights: PlanWeights
): number {
  const move = (map.move[from] + map.move[to]) / 2;
  const risk = (map.risk[from] + map.risk[to]) / 2;
  const flow = flowEnergyFactor(heading, map.flow, map.profile.cruiseMps);
  return (
    dist * (weights.time * move + weights.energy * move * flow + weights.risk * risk)
  );
}

export function astar(
  map: CostMap,
  startIndex: number,
  goalIndex: number,
  weights: PlanWeights
): AStarResult | null {
  const { cols, rows } = map.grid;
  const size = cols * rows;
  const g = new Float64Array(size).fill(Number.POSITIVE_INFINITY);
  const cameFrom = new Int32Array(size).fill(-1);
  const closed = new Uint8Array(size);
  const goalCol = goalIndex % cols;
  const goalRow = Math.floor(goalIndex / cols);
  // Admissible: cheapest possible unit move is terrain 1, flow factor 0.5, no risk.
  const unit = weights.time + 0.5 * weights.energy;
  const heuristic = (index: number) => {
    const dc = Math.abs((index % cols) - goalCol);
    const dr = Math.abs(Math.floor(index / cols) - goalRow);
    return unit * (Math.max(dc, dr) + (SQRT2 - 1) * Math.min(dc, dr));
  };

  const open = new MinHeap();
  g[startIndex] = 0;
  open.push(startIndex, heuristic(startIndex));
  let expanded = 0;

  while (open.size > 0) {
    const current = open.pop();
    if (closed[current]) continue;
    if (current === goalIndex) {
      const cells: number[] = [];
      let cursor = current;
      while (cursor !== -1) {
        cells.push(cursor);
        cursor = cameFrom[cursor];
      }
      cells.reverse();
      return { cells, cost: g[current], expanded };
    }
    closed[current] = 1;
    expanded += 1;
    const col = current % cols;
    const row = Math.floor(current / cols);

    for (const [dcol, drow, dist, heading] of NEIGHBORS) {
      const ncol = col + dcol;
      const nrow = row + drow;
      if (ncol < 0 || nrow < 0 || ncol >= cols || nrow >= rows) continue;
      const next = nrow * cols + ncol;
      if (closed[next] || !map.passable[next]) continue;
      // No corner cutting past an impassable orthogonal neighbor.
      if (dcol !== 0 && drow !== 0) {
        if (!map.passable[row * cols + ncol] || !map.passable[nrow * cols + col]) continue;
      }
      const tentative = g[current] + moveCost(map, current, next, dist, heading, weights);
      if (tentative < g[next]) {
        g[next] = tentative;
        cameFrom[next] = current;
        open.push(next, tentative + heuristic(next));
      }
    }
  }
  return null;
}

/** Plans between two points, snapping both ends to the nearest passable cell. */
export function planCells(
  map: CostMap,
  from: LatLng,
  to: LatLng,
  weights: PlanWeights
): AStarResult | null {
  const rawStart = cellIndexAt(map.grid, from);
  const rawGoal = cellIndexAt(map.grid, to);
  if (rawStart === null || rawGoal === null) return null;
  const start = snapToPassable(map, rawStart);
  const goal = snapToPassable(map, rawGoal);
  if (start === null || goal === null) return null;
  return astar(map, start, goal, weights);
}
