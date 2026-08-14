import type { Vec3 } from "@/simulation";
import type { BoxRegion } from "../types";

export interface SafetyZoneLayout {
  warning: BoxRegion;
  protective: BoxRegion;
  lightCurtain: BoxRegion;
}

export const DEFAULT_SAFETY_ZONES: SafetyZoneLayout = {
  warning: {
    centerM: [0.42, 0, 0.01],
    sizeM: [1.35, 1.55, 0.02],
  },
  protective: {
    centerM: [0.08, 0, 0.01],
    sizeM: [0.42, 0.9, 0.02],
  },
  lightCurtain: {
    centerM: [0.48, -0.44, 0.22],
    sizeM: [0.72, 0.012, 0.44],
  },
};

export function zoneContains(zone: BoxRegion, pointM: Vec3): boolean {
  return (
    Math.abs(pointM[0] - zone.centerM[0]) <= zone.sizeM[0] / 2 &&
    Math.abs(pointM[1] - zone.centerM[1]) <= zone.sizeM[1] / 2 &&
    Math.abs(pointM[2] - zone.centerM[2]) <= zone.sizeM[2] / 2
  );
}
