import type { Detection, SeededRng } from "@/simulation";
import { workpieceToDetection } from "@/workcell/parts/workpieceToDetection";
import type { Workpiece } from "@/workcell/types";

export function estimateDetections(
  parts: Workpiece[],
  rng: SeededRng,
  noiseMm: number
): Detection[] {
  return parts
    .filter((part) => part.status === "in_tote" || part.status === "selected")
    .map((part) => {
      const base = workpieceToDetection(part);
      const yawNoise = rng.nextGaussian() * 0.04 * (noiseMm / 2);
      const qw = base.quaternion[3];
      const qz = base.quaternion[2];
      const confidence =
        base.confidence *
        (1 - Math.min(0.45, noiseMm / 12)) *
        (0.92 + rng.nextRange(0, 0.08));
      return {
        ...base,
        positionMm: [
          base.positionMm[0] + rng.nextGaussian() * noiseMm,
          base.positionMm[1] + rng.nextGaussian() * noiseMm,
          base.positionMm[2] + rng.nextGaussian() * noiseMm * 0.6,
        ],
        quaternion: [
          base.quaternion[0],
          base.quaternion[1],
          qz + yawNoise * qw,
          qw,
        ],
        confidence: Math.max(0.08, Math.min(0.99, confidence)),
        occlusion: Math.min(
          0.95,
          base.occlusion + Math.max(0, rng.nextGaussian()) * 0.05
        ),
        pointCount: Math.max(
          24,
          Math.round(
            base.pointCount *
              (1 - part.occlusion) *
              (0.85 + rng.nextRange(0, 0.15))
          )
        ),
      };
    });
}
