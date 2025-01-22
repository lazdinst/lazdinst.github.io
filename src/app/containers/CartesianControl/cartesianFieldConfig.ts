import { CartesianPositionsType } from "../../context/cartesian/cartesian.types";

export const cartesianFieldConfig: Record<
  keyof CartesianPositionsType,
  { label: string; min: number; max: number }
> = {
  x: { label: "X Position", min: 0, max: 100 },
  y: { label: "Y Position", min: 0, max: 100 },
  z: { label: "Z Position", min: 0, max: 100 },
  r1: { label: "Rotation 1", min: 0, max: 360 },
  r2: { label: "Rotation 2", min: 0, max: 360 },
  r3: { label: "Rotation 3", min: 0, max: 360 },
};
