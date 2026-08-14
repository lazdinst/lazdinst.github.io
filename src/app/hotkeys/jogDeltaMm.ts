export interface JogHolds {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  up: boolean;
  down: boolean;
  q: boolean;
  e: boolean;
}

export const JOG_SPEED_MM_PER_SEC = 120;
export const JOG_ROLL_RAD_PER_SEC = (60 * Math.PI) / 180;

export function jogDeltaMm(
  holds: JogHolds,
  dtSec: number,
  speedMmPerSec = JOG_SPEED_MM_PER_SEC
): [number, number, number] | null {
  const x = (holds.d ? 1 : 0) - (holds.a ? 1 : 0);
  const y = (holds.w ? 1 : 0) - (holds.s ? 1 : 0);
  const z = (holds.up ? 1 : 0) - (holds.down ? 1 : 0);
  const length = Math.hypot(x, y, z);
  if (length === 0 || dtSec <= 0) {
    return null;
  }
  const distance = speedMmPerSec * dtSec;
  return [(x / length) * distance, (y / length) * distance, (z / length) * distance];
}

export function jogRollRad(
  holds: JogHolds,
  dtSec: number,
  speedRadPerSec = JOG_ROLL_RAD_PER_SEC
): number {
  const roll = (holds.e ? 1 : 0) - (holds.q ? 1 : 0);
  if (roll === 0 || dtSec <= 0) {
    return 0;
  }
  return roll * speedRadPerSec * dtSec;
}
