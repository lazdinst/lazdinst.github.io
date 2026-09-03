import type { LatLng } from "../types";
import { bearingDeg, haversineM, interpolateLatLng } from "../geo/haversine";

export interface PathCursor {
  /** Index of the waypoint currently being approached. */
  waypointIndex: number;
  position: LatLng;
  headingDeg: number;
  /** Total distance moved so far. */
  travelledM: number;
  /** Waypoints passed during this advance, for events. */
  reached: number[];
  /** True once the final waypoint has been reached. */
  finished: boolean;
}

/**
 * Moves `distanceM` along `path` from the cursor, consuming waypoints as they
 * are reached. Returns a new cursor; the input is not mutated.
 */
export function advanceAlongPath(
  path: LatLng[],
  cursor: Omit<PathCursor, "reached" | "finished">,
  distanceM: number
): PathCursor {
  let remaining = distanceM;
  let position = cursor.position;
  let heading = cursor.headingDeg;
  let index = cursor.waypointIndex;
  const reached: number[] = [];

  while (remaining > 0 && index < path.length) {
    const target = path[index];
    const legM = haversineM(position, target);
    if (legM <= 1e-6) {
      reached.push(index);
      index += 1;
      continue;
    }
    heading = bearingDeg(position, target);
    if (remaining >= legM) {
      position = target;
      remaining -= legM;
      reached.push(index);
      index += 1;
    } else {
      position = interpolateLatLng(position, target, remaining / legM);
      remaining = 0;
    }
  }

  return {
    waypointIndex: index,
    position,
    headingDeg: heading,
    travelledM: cursor.travelledM + (distanceM - remaining),
    reached,
    finished: index >= path.length,
  };
}
