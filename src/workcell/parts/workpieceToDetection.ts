import type { Detection } from "@/simulation";
import type { Workpiece } from "../types";

export function workpieceToDetection(
  part: Workpiece,
  confidence = 1 - part.occlusion
): Detection {
  const radius = Math.max(part.dimensionsM[0], part.dimensionsM[1]) / 2;
  const area = part.geometryType === "box"
    ? part.dimensionsM[0] * part.dimensionsM[1]
    : Math.PI * radius * radius;
  return {
    id: `det-${part.id}`,
    partId: part.id,
    className: part.sku,
    confidence: Math.max(0.05, Math.min(1, confidence * part.visibility)),
    positionMm: [
      part.positionM[0] * 1000,
      part.positionM[1] * 1000,
      part.positionM[2] * 1000,
    ],
    quaternion: part.quaternion,
    dimensionsMm: [
      part.dimensionsM[0] * 1000,
      part.dimensionsM[1] * 1000,
      part.dimensionsM[2] * 1000,
    ],
    occlusion: part.occlusion,
    pointCount: Math.round(180 + area * 12000),
  };
}
