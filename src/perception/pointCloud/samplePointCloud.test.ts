import { describe, expect, it } from "vitest";
import { SeededRng } from "@/simulation";
import { DEFAULT_WORKCELL_LAYOUT } from "@/workcell/layout";
import { generateParts } from "@/workcell/parts/generateParts";
import { MAX_POINT_COUNT } from "../types";
import { samplePointCloud } from "./samplePointCloud";

function buffers() {
  return {
    positions: new Float32Array(MAX_POINT_COUNT * 3),
    colors: new Float32Array(MAX_POINT_COUNT * 3),
    rgb: new Float32Array(MAX_POINT_COUNT * 3),
    confidence: new Float32Array(MAX_POINT_COUNT),
    partIndex: new Uint16Array(MAX_POINT_COUNT),
    count: 0,
    revision: 0,
  };
}

describe("samplePointCloud", () => {
  it("fills a bounded buffer deterministically", () => {
    const parts = generateParts(11, DEFAULT_WORKCELL_LAYOUT);
    const a = buffers();
    const b = buffers();
    samplePointCloud(parts, new SeededRng(11), a, {
      density: 0.5,
      noiseMm: 1,
      dropout: 0.1,
    });
    samplePointCloud(parts, new SeededRng(11), b, {
      density: 0.5,
      noiseMm: 1,
      dropout: 0.1,
    });
    expect(a.count).toBeGreaterThan(20);
    expect(a.count).toBeLessThanOrEqual(MAX_POINT_COUNT);
    expect(a.count).toBe(b.count);
    expect(Array.from(a.positions.subarray(0, 12))).toEqual(
      Array.from(b.positions.subarray(0, 12))
    );
  });
});
