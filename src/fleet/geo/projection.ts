import type { LatLng, XY } from "../types/geo";
import { EARTH_RADIUS_M } from "./haversine";

const DEG = Math.PI / 180;

export interface Projection {
  center: LatLng;
  toXY(point: LatLng): XY;
  toLatLng(point: XY): LatLng;
}

/**
 * Equirectangular projection centered on the operating area. At a 15 km scale
 * the distortion is well under 0.1%, which is far below the cost-map cell size.
 */
export function createProjection(center: LatLng): Projection {
  const cosLat = Math.cos(center.lat * DEG);
  const metersPerDegLat = EARTH_RADIUS_M * DEG;
  const metersPerDegLng = metersPerDegLat * cosLat;
  return {
    center,
    toXY(point) {
      return {
        x: (point.lng - center.lng) * metersPerDegLng,
        y: (point.lat - center.lat) * metersPerDegLat,
      };
    },
    toLatLng(point) {
      return {
        lat: center.lat + point.y / metersPerDegLat,
        lng: center.lng + point.x / metersPerDegLng,
      };
    },
  };
}
