import type { JointSpec } from "../types/JointSpec";

export function clampJointValue(
  value: number,
  lowerRad: number,
  upperRad: number
): number {
  return Math.min(upperRad, Math.max(lowerRad, value));
}

export function clampJointToSpec(value: number, spec: JointSpec): number {
  return clampJointValue(value, spec.lowerRad, spec.upperRad);
}

export function isWithinJointLimits(
  value: number,
  spec: JointSpec,
  epsilon = 1e-9
): boolean {
  return value >= spec.lowerRad - epsilon && value <= spec.upperRad + epsilon;
}

export function jointLimitUtilization(value: number, spec: JointSpec): number {
  const span = spec.upperRad - spec.lowerRad;
  if (span <= 0) {
    return 0;
  }
  const center = (spec.lowerRad + spec.upperRad) / 2;
  const half = span / 2;
  return Math.min(1, Math.abs(value - center) / half);
}

export function validateJointVector(
  values: number[],
  specs: JointSpec[]
): { ok: true } | { ok: false; jointId: string } {
  for (let i = 0; i < specs.length; i += 1) {
    const spec = specs[i];
    const value = values[i];
    if (value === undefined || !isWithinJointLimits(value, spec)) {
      return { ok: false, jointId: spec.id };
    }
  }
  return { ok: true };
}
