export function formatSimTimeSeconds(
  timestampMs: number,
  fractionDigits = 3
): string {
  return `${(timestampMs / 1000).toFixed(fractionDigits)}s`;
}

/**
 * Wall-clock style HH:MM:SS for a simulation instant. `epochMs` is the real
 * time at which sim time zero occurred; adding sim-elapsed time to it yields a
 * clock that freezes while the simulation is paused and stays consistent with
 * event ordering, unlike reading Date.now() at render.
 */
export function formatSimClock(epochMs: number, simTimeMs: number): string {
  const date = new Date(epochMs + simTimeMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
