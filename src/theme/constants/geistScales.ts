import type { ColorScale } from "../types/ColorScale";
import type { GeistScaleName } from "../types/GeistScaleName";

export const GEIST_SCALE_STEPS: ColorScale[] = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
];

export const GEIST_SCALE_NAMES: GeistScaleName[] = [
  "backgrounds",
  "gray",
  "gray-alpha",
  "blue",
  "red",
  "amber",
  "green",
  "teal",
  "purple",
  "pink",
];

export const GEIST_BACKGROUND_STEPS = [100, 200] as const;
