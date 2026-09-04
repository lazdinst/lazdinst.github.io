import type { LatLng, XY } from "../types/geo";

/** Ray-casting point-in-polygon in lat/lng space. Works for the small, non-wrapping polygons used here. */
export function pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    const intersects =
      a.lng > point.lng !== b.lng > point.lng &&
      point.lat < ((b.lat - a.lat) * (point.lng - a.lng)) / (b.lng - a.lng) + a.lat;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function distanceToSegmentXY(p: XY, a: XY, b: XY): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  let t = 0;
  if (lengthSq > 0) {
    t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));
  }
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

export function distanceToPolylineXY(p: XY, line: XY[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 1; i < line.length; i += 1) {
    best = Math.min(best, distanceToSegmentXY(p, line[i - 1], line[i]));
  }
  return best;
}

/** Shoelace area of a polygon given in projected meters. */
export function polygonAreaM2(polygon: XY[]): number {
  let sum = 0;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    sum += polygon[j].x * polygon[i].y - polygon[i].x * polygon[j].y;
  }
  return Math.abs(sum) / 2;
}

export function polygonCentroid(polygon: LatLng[]): LatLng {
  let lat = 0;
  let lng = 0;
  polygon.forEach((point) => {
    lat += point.lat;
    lng += point.lng;
  });
  return { lat: lat / polygon.length, lng: lng / polygon.length };
}
