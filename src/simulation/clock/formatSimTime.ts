export function formatSimTimeSeconds(
  timestampMs: number,
  fractionDigits = 3
): string {
  return `${(timestampMs / 1000).toFixed(fractionDigits)}s`;
}
