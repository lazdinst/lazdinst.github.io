import { mixSeed, SeededRng } from "@/simulation";
import type { WorkcellLayout, Workpiece } from "../types";

export const WORKCELL_SEED_CHANNEL = 0x10c311;
const DEFAULT_COUNT = 6;

const SKUS: Array<{
  sku: string;
  geometryType: Workpiece["geometryType"];
  dimensionsM: Workpiece["dimensionsM"];
  massKg: number;
  material: string;
  friction: number;
  color: Workpiece["color"];
}> = [
  {
    sku: "BOX-40",
    geometryType: "box",
    dimensionsM: [0.04, 0.032, 0.028],
    massKg: 0.08,
    material: "ABS",
    friction: 0.42,
    color: [0.86, 0.42, 0.16],
  },
  {
    sku: "CYL-32",
    geometryType: "cylinder",
    dimensionsM: [0.032, 0.032, 0.036],
    massKg: 0.06,
    material: "nylon",
    friction: 0.31,
    color: [0.2, 0.48, 0.78],
  },
  {
    sku: "DISK-50",
    geometryType: "disk",
    dimensionsM: [0.05, 0.05, 0.012],
    massKg: 0.04,
    material: "POM",
    friction: 0.24,
    color: [0.18, 0.64, 0.52],
  },
  {
    sku: "BOX-28",
    geometryType: "box",
    dimensionsM: [0.028, 0.024, 0.022],
    massKg: 0.045,
    material: "ABS",
    friction: 0.4,
    color: [0.72, 0.22, 0.22],
  },
];

export function generateParts(
  seed: number,
  layout: WorkcellLayout,
  count = DEFAULT_COUNT
): Workpiece[] {
  const rng = new SeededRng(mixSeed(seed, WORKCELL_SEED_CHANNEL));
  const columns = 3;
  const rows = 2;
  const inner = layout.tote.innerSizeM;
  const originX = layout.tote.centerM[0] - inner[0] / 2;
  const originY = layout.tote.centerM[1] - inner[1] / 2;
  const cellX = inner[0] / columns;
  const cellY = inner[1] / rows;
  const parts: Workpiece[] = [];

  for (let index = 0; index < count; index += 1) {
    const spec = SKUS[rng.nextInt(0, SKUS.length)] ?? SKUS[0];
    const col = index % columns;
    const row = Math.floor(index / columns) % rows;
    const height = spec.dimensionsM[2];
    const yaw = rng.nextRange(-0.35, 0.35);
    parts.push({
      id: `part-${index + 1}`,
      sku: spec.sku,
      geometryType: spec.geometryType,
      positionM: [
        originX + (col + 0.5) * cellX + rng.nextRange(-cellX * 0.12, cellX * 0.12),
        originY + (row + 0.5) * cellY + rng.nextRange(-cellY * 0.12, cellY * 0.12),
        layout.tote.floorZ + height / 2,
      ],
      quaternion: [0, 0, Math.sin(yaw / 2), Math.cos(yaw / 2)],
      dimensionsM: spec.dimensionsM,
      massKg: spec.massKg,
      material: spec.material,
      friction: spec.friction,
      status: "in_tote",
      visibility: 1,
      occlusion: 0,
      color: spec.color,
    });
  }

  applyOcclusion(parts);
  return parts;
}

export function applyOcclusion(parts: Workpiece[]): void {
  for (const part of parts) {
    if (part.status !== "in_tote" && part.status !== "selected") {
      part.occlusion = 0;
      continue;
    }
    let overlap = 0;
    for (const other of parts) {
      if (
        other.id === part.id ||
        other.status === "placed" ||
        other.status === "lost"
      ) {
        continue;
      }
      if (other.positionM[2] <= part.positionM[2] + 1e-4) {
        continue;
      }
      const dx = other.positionM[0] - part.positionM[0];
      const dy = other.positionM[1] - part.positionM[1];
      const reach =
        (Math.max(part.dimensionsM[0], part.dimensionsM[1]) +
          Math.max(other.dimensionsM[0], other.dimensionsM[1])) /
        2;
      const distance = Math.hypot(dx, dy);
      if (distance < reach) {
        overlap = Math.max(overlap, 1 - distance / reach);
      }
    }
    part.occlusion = Math.min(0.85, overlap);
  }
}
