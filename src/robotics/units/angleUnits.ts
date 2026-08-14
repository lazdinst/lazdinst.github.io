export type AngleUnit = "deg" | "rad";

export function radiansToUnit(radians: number, unit: AngleUnit): number {
  return unit === "deg" ? radians * (180 / Math.PI) : radians;
}

export function unitToRadians(value: number, unit: AngleUnit): number {
  return unit === "deg" ? value * (Math.PI / 180) : value;
}

export function formatAngle(
  radians: number,
  unit: AngleUnit,
  fractionDigits = unit === "deg" ? 1 : 3
): string {
  const value = radiansToUnit(radians, unit);
  const suffix = unit === "deg" ? "°" : "";
  return `${value.toFixed(fractionDigits)}${suffix}`;
}
