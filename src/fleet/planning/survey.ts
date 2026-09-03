import type { LatLng } from "../types";
import type { Projection } from "../geo/projection";
import { pointInPolygon } from "../geo/polygon";

/**
 * Lawnmower waypoints over a polygon: parallel east-west lines spaced by the
 * swath width, clipped to the polygon by sampling, alternating direction.
 */
export function lawnmowerWaypoints(
  polygon: LatLng[],
  swathM: number,
  projection: Projection
): LatLng[] {
  const xy = polygon.map((point) => projection.toXY(point));
  const minX = Math.min(...xy.map((p) => p.x));
  const maxX = Math.max(...xy.map((p) => p.x));
  const minY = Math.min(...xy.map((p) => p.y));
  const maxY = Math.max(...xy.map((p) => p.y));
  const lines = Math.max(1, Math.floor((maxY - minY) / swathM));
  const sampleStep = Math.max(10, swathM / 4);
  const out: LatLng[] = [];

  for (let line = 0; line <= lines; line += 1) {
    const y = minY + swathM / 2 + line * swathM;
    if (y > maxY) break;
    let first: number | null = null;
    let last: number | null = null;
    for (let x = minX; x <= maxX; x += sampleStep) {
      const inside = pointInPolygon(projection.toLatLng({ x, y }), polygon);
      if (inside) {
        if (first === null) first = x;
        last = x;
      }
    }
    if (first === null || last === null) continue;
    const forward = line % 2 === 0;
    const a = projection.toLatLng({ x: forward ? first : last, y });
    const b = projection.toLatLng({ x: forward ? last : first, y });
    out.push(a, b);
  }
  return out;
}
