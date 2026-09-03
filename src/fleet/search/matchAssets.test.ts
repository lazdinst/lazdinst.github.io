import { describe, expect, it } from "vitest";
import type { Asset } from "../types";
import { filterAssets, matchesQuery, parseQuery } from "./matchAssets";

function asset(overrides: Partial<Asset>): Asset {
  return {
    id: "a",
    callsign: "HAWK-01",
    name: "Quad 01",
    kind: "uav_quad",
    domain: "air",
    position: { lat: 0, lng: 0 },
    altitudeM: 0,
    headingDeg: 0,
    speedMps: 0,
    status: "idle",
    energyPct: 50,
    sensors: [],
    maintenance: {
      hoursSinceService: 0,
      serviceIntervalHours: 10,
      healthScore: 1,
      workOrders: [],
      lastServicedAtMs: null,
      due: false,
    },
    link: { relayId: null, rssiDbm: -60, quality: 1, latencyMs: 20, lostSinceMs: null },
    missionId: null,
    faults: [],
    tags: ["isr"],
    homeDepotId: "d",
    rssiHistory: [],
    energyHistory: [],
    ...overrides,
  };
}

describe("matchAssets", () => {
  it("parses free terms and field filters", () => {
    expect(parseQuery("hawk status:fault kind:quad")).toEqual({
      terms: ["hawk"],
      fields: [
        { field: "status", value: "fault" },
        { field: "kind", value: "quad" },
      ],
    });
  });

  it("matches callsign prefix, kind words, and tags", () => {
    const a = asset({});
    expect(matchesQuery(a, "haw")).toBe(true);
    expect(matchesQuery(a, "quad")).toBe(true);
    expect(matchesQuery(a, "isr")).toBe(true);
    expect(matchesQuery(a, "mule")).toBe(false);
  });

  it("applies status and fault field filters", () => {
    const faulted = asset({ id: "b", callsign: "MULE-01", status: "fault", faults: ["gps_loss"] });
    expect(matchesQuery(faulted, "status:fault")).toBe(true);
    expect(matchesQuery(faulted, "fault:gps")).toBe(true);
    expect(matchesQuery(asset({}), "status:fault")).toBe(false);
  });

  it("filters by domain and sorts by severity", () => {
    const list = [
      asset({ id: "1", callsign: "C", status: "idle" }),
      asset({ id: "2", callsign: "B", status: "fault", domain: "ground" }),
      asset({ id: "3", callsign: "A", status: "lost_link" }),
    ];
    const bySeverity = filterAssets(list, "", { domains: [], statuses: [] });
    expect(bySeverity.map((a) => a.id)).toEqual(["2", "3", "1"]);
    const air = filterAssets(list, "", { domains: ["air"], statuses: [] });
    expect(air.map((a) => a.id)).toEqual(["3", "1"]);
  });
});
