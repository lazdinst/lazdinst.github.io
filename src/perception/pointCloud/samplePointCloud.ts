import type { SeededRng } from "@/simulation";
import type { Workpiece } from "@/workcell/types";
import { MAX_POINT_COUNT } from "../types";
import type { PointCloudBuffers } from "../types";

export interface SamplePointCloudOptions {
  density: number;
  noiseMm: number;
  dropout: number;
}

export function samplePointCloud(
  parts: Workpiece[],
  rng: SeededRng,
  buffers: PointCloudBuffers,
  options: SamplePointCloudOptions
): void {
  const visible = parts.filter(
    (part) =>
      part.status === "in_tote" ||
      part.status === "selected" ||
      part.status === "grasped"
  );
  const budget = Math.max(
    1,
    Math.floor(MAX_POINT_COUNT * Math.min(1, Math.max(0.1, options.density)))
  );
  const perPart = Math.max(8, Math.floor(budget / Math.max(1, visible.length)));
  let count = 0;

  visible.forEach((part, partIndex) => {
    const points = Math.min(
      perPart,
      Math.floor(perPart * (1 - part.occlusion * 0.6))
    );
    for (let i = 0; i < points && count < MAX_POINT_COUNT; i += 1) {
      if (rng.next() < options.dropout) {
        continue;
      }
      const local = sampleSurface(part, rng);
      const noise = options.noiseMm / 1000;
      const x = part.positionM[0] + local[0] + rng.nextGaussian() * noise;
      const y = part.positionM[1] + local[1] + rng.nextGaussian() * noise;
      const z = part.positionM[2] + local[2] + rng.nextGaussian() * noise * 0.5;
      const offset = count * 3;
      buffers.positions[offset] = x;
      buffers.positions[offset + 1] = y;
      buffers.positions[offset + 2] = z;
      buffers.rgb[offset] = part.color[0];
      buffers.rgb[offset + 1] = part.color[1];
      buffers.rgb[offset + 2] = part.color[2];
      buffers.confidence[count] = Math.max(
        0.05,
        (1 - part.occlusion) * (1 - options.dropout) * 0.85 + rng.nextRange(0, 0.15)
      );
      buffers.partIndex[count] = partIndex;
      count += 1;
    }
  });

  buffers.count = count;
  buffers.revision += 1;
}

function sampleSurface(part: Workpiece, rng: SeededRng): [number, number, number] {
  const [sx, sy, sz] = part.dimensionsM;
  const face = rng.next();
  if (part.geometryType === "box") {
    if (face < 0.55) {
      return [rng.nextRange(-sx / 2, sx / 2), rng.nextRange(-sy / 2, sy / 2), sz / 2];
    }
    if (face < 0.7) {
      return [sx / 2 * (rng.next() < 0.5 ? -1 : 1), rng.nextRange(-sy / 2, sy / 2), rng.nextRange(-sz / 2, sz / 2)];
    }
    return [rng.nextRange(-sx / 2, sx / 2), sy / 2 * (rng.next() < 0.5 ? -1 : 1), rng.nextRange(-sz / 2, sz / 2)];
  }

  const radius = sx / 2;
  const theta = rng.nextRange(0, Math.PI * 2);
  if (face < 0.6) {
    const r = radius * Math.sqrt(rng.next());
    return [Math.cos(theta) * r, Math.sin(theta) * r, sz / 2];
  }
  const z = rng.nextRange(-sz / 2, sz / 2);
  return [Math.cos(theta) * radius, Math.sin(theta) * radius, z];
}
