import type { LatLng } from "../types/geo";

export const EARTH_RADIUS_M = 6371008.8;
const DEG = Math.PI / 180;

export function haversineM(a: LatLng, b: LatLng): number {
  const dLat = (b.lat - a.lat) * DEG;
  const dLng = (b.lng - a.lng) * DEG;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing from a to b, degrees clockwise from north in [0, 360). */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const phi1 = a.lat * DEG;
  const phi2 = b.lat * DEG;
  const dLng = (b.lng - a.lng) * DEG;
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  const deg = Math.atan2(y, x) / DEG;
  return (deg + 360) % 360;
}

export function destinationPoint(
  origin: LatLng,
  bearing: number,
  distanceM: number
): LatLng {
  const delta = distanceM / EARTH_RADIUS_M;
  const theta = bearing * DEG;
  const phi1 = origin.lat * DEG;
  const lambda1 = origin.lng * DEG;
  const sinPhi2 =
    Math.sin(phi1) * Math.cos(delta) +
    Math.cos(phi1) * Math.sin(delta) * Math.cos(theta);
  const phi2 = Math.asin(sinPhi2);
  const y = Math.sin(theta) * Math.sin(delta) * Math.cos(phi1);
  const x = Math.cos(delta) - Math.sin(phi1) * sinPhi2;
  const lambda2 = lambda1 + Math.atan2(y, x);
  return { lat: phi2 / DEG, lng: (((lambda2 / DEG) + 540) % 360) - 180 };
}

export function pathLengthM(path: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    total += haversineM(path[i - 1], path[i]);
  }
  return total;
}

export function interpolateLatLng(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

/** Shortest signed difference from `from` to `to` in degrees, in (-180, 180]. */
export function headingDelta(from: number, to: number): number {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}
