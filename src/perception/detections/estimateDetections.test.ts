import { describe, expect, it } from "vitest";
import { mixSeed, SeededRng } from "@/simulation";
import { DEFAULT_WORKCELL_LAYOUT } from "@/workcell/layout";
import { generateParts } from "@/workcell/parts/generateParts";
import { estimateDetections } from "./estimateDetections";

describe("estimateDetections", () => {
  it("emits one detection per remaining part and stays deterministic", () => {
    const parts = generateParts(7, DEFAULT_WORKCELL_LAYOUT);
    const a = estimateDetections(parts, new SeededRng(mixSeed(7, 1)), 1.5);
    const b = estimateDetections(parts, new SeededRng(mixSeed(7, 1)), 1.5);
    expect(a).toHaveLength(parts.length);
    expect(a.map((item) => item.partId)).toEqual(b.map((item) => item.partId));
    expect(a.map((item) => item.positionMm)).toEqual(b.map((item) => item.positionMm));
    a.forEach((detection) => {
      expect(detection.confidence).toBeGreaterThan(0);
      expect(detection.confidence).toBeLessThanOrEqual(1);
    });
  });

  it("ignores placed parts", () => {
    const parts = generateParts(3, DEFAULT_WORKCELL_LAYOUT);
    parts[0]!.status = "placed";
    const detections = estimateDetections(parts, new SeededRng(1), 1);
    expect(detections.some((item) => item.partId === parts[0]!.id)).toBe(false);
  });
});
