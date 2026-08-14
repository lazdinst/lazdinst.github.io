import type { Vec3 } from "@/simulation";
import type { WorkcellLayout } from "./types";

export const DEFAULT_WORKCELL_LAYOUT: WorkcellLayout = {
  table: {
    centerM: [0.48, 0, -0.02],
    sizeM: [0.72, 0.84, 0.04],
  },
  tote: {
    centerM: [0.48, 0.2, 0.05],
    innerSizeM: [0.28, 0.2, 0.1],
    wallM: 0.008,
    heightM: 0.1,
    floorZ: 0,
  },
  destination: {
    centerM: [0.48, -0.2, 0.03],
    innerSizeM: [0.24, 0.18, 0.06],
    heightM: 0.06,
    floorZ: 0,
  },
  overheadCamera: {
    positionM: [0.48, 0.2, 0.92],
  },
  approachClearanceM: 0.09,
};

export function destinationSlotPosition(
  layout: WorkcellLayout,
  index: number,
  columns = 3,
  rows = 2
): Vec3 {
  const col = index % columns;
  const row = Math.floor(index / columns) % rows;
  const inner = layout.destination.innerSizeM;
  const originX = layout.destination.centerM[0] - inner[0] / 2;
  const originY = layout.destination.centerM[1] - inner[1] / 2;
  const cellX = inner[0] / columns;
  const cellY = inner[1] / rows;
  return [
    originX + (col + 0.5) * cellX,
    originY + (row + 0.5) * cellY,
    layout.destination.floorZ,
  ];
}
