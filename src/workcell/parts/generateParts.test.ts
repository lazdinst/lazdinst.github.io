import { describe, expect, it } from "vitest";
import { DEFAULT_SIMULATION_SEED } from "@/simulation";
import { DEFAULT_WORKCELL_LAYOUT } from "../layout";
import { generateParts } from "./generateParts";

describe("generateParts", () => {
  it("is deterministic for a seed", () => {
    const a = generateParts(DEFAULT_SIMULATION_SEED, DEFAULT_WORKCELL_LAYOUT);
    const b = generateParts(DEFAULT_SIMULATION_SEED, DEFAULT_WORKCELL_LAYOUT);
    expect(a.map((part) => ({ id: part.id, sku: part.sku, positionM: part.positionM }))).toEqual(
      b.map((part) => ({ id: part.id, sku: part.sku, positionM: part.positionM }))
    );
  });

  it("places parts inside the tote footprint", () => {
    const parts = generateParts(DEFAULT_SIMULATION_SEED, DEFAULT_WORKCELL_LAYOUT);
    const tote = DEFAULT_WORKCELL_LAYOUT.tote;
    parts.forEach((part) => {
      expect(part.positionM[0]).toBeGreaterThan(tote.centerM[0] - tote.innerSizeM[0] / 2);
      expect(part.positionM[0]).toBeLessThan(tote.centerM[0] + tote.innerSizeM[0] / 2);
      expect(part.positionM[1]).toBeGreaterThan(tote.centerM[1] - tote.innerSizeM[1] / 2);
      expect(part.positionM[1]).toBeLessThan(tote.centerM[1] + tote.innerSizeM[1] / 2);
      expect(part.status).toBe("in_tote");
    });
  });
});
