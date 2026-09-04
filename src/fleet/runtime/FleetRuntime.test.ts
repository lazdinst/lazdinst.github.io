import { describe, expect, it } from "vitest";
import { OPERATING_AREA } from "../data/operatingArea";
import { haversineM, pathLengthM } from "../geo/haversine";
import { pointInPolygon } from "../geo/polygon";
import { LINK_LOSS_TIMEOUT_MS } from "../sensors/linkModel";
import { buildEngageObjective } from "../combat/engagement";
import { FleetRuntime } from "./FleetRuntime";

const wp = (id: string) => OPERATING_AREA.waypoints.find((w) => w.id === id)!.position;

describe("FleetRuntime", () => {
  it("seeds a deterministic fleet", () => {
    const a = new FleetRuntime();
    const b = new FleetRuntime();
    a.stepMany(50);
    b.stepMany(50);
    expect(a.getSnapshot().assets.map((x) => [x.id, x.position, x.energyPct, x.status])).toEqual(
      b.getSnapshot().assets.map((x) => [x.id, x.position, x.energyPct, x.status])
    );
    expect(a.getSnapshot().assets).toHaveLength(21);
  });

  it("starts patrols and moves them", () => {
    const runtime = new FleetRuntime();
    const before = runtime.getSnapshot().assets.find((a) => a.id === "hawk-03")!;
    expect(before.status).toBe("patrolling");
    runtime.stepMany(100);
    const after = runtime.getSnapshot().assets.find((a) => a.id === "hawk-03")!;
    expect(after.position).not.toEqual(before.position);
    expect(after.speedMps).toBeGreaterThan(5);
  });

  it("marks an out-of-range vessel lost after the timeout", () => {
    const runtime = new FleetRuntime();
    runtime.stepMany(Math.ceil(LINK_LOSS_TIMEOUT_MS / 100) + 2);
    const skiff = runtime.getSnapshot().assets.find((a) => a.id === "skiff-02")!;
    expect(skiff.link.relayId).toBeNull();
    expect(skiff.status).toBe("lost_link");
    expect(runtime.getEvents().some((e) => e.eventCode === "LINK_LOST")).toBe(true);
  });

  it("flags maintenance from seeded hours and clears it when serviced", () => {
    const runtime = new FleetRuntime();
    const k2 = runtime.getSnapshot().assets.find((a) => a.id === "kestrel-02")!;
    expect(k2.status).toBe("maintenance");
    runtime.markServiced("kestrel-02");
    const serviced = runtime.getSnapshot().assets.find((a) => a.id === "kestrel-02")!;
    expect(serviced.maintenance.hoursSinceService).toBe(0);
    expect(serviced.status).toBe("idle");
  });

  it("plans, refuses, and dispatches with the right guards", () => {
    const runtime = new FleetRuntime();
    // Charging asset below the minimum is refused.
    runtime.planMission("hawk-04", { type: "transit", target: wp("rally-b") });
    expect(runtime.dispatch().ok).toBe(false);
    const events = runtime.getEvents();
    expect(events[events.length - 1]?.eventCode).toBe("DISPATCH_REFUSED");

    // Healthy asset goes.
    const coas = runtime.planMission("hawk-01", { type: "transit", target: wp("rally-b"), targetLabel: "RALLY-B" });
    expect(coas.filter((c) => c.feasible)).toHaveLength(3);
    const result = runtime.dispatch();
    expect(result.ok).toBe(true);
    const hawk = runtime.getSnapshot().assets.find((a) => a.id === "hawk-01")!;
    expect(hawk.status).toBe("en_route");
    expect(runtime.getSnapshot().planner.candidates).toHaveLength(0);

    // Run until it arrives (12 m/s over ~5 km at 10 Hz).
    runtime.stepMany(6000);
    const arrived = runtime.getSnapshot().assets.find((a) => a.id === "hawk-01")!;
    expect(arrived.status).toBe("idle");
    expect(runtime.getEvents().some((e) => e.eventCode === "MISSION_COMPLETE")).toBe(true);
    expect(arrived.energyPct).toBeLessThan(92);
    expect(arrived.maintenance.hoursSinceService).toBeGreaterThan(12.4);
  });

  it("a GPS fault fails the active mission", () => {
    const runtime = new FleetRuntime();
    runtime.planMission("hawk-01", { type: "transit", target: wp("rally-b") });
    runtime.dispatch();
    runtime.stepMany(20);
    runtime.injectFault("hawk-01", "gps_loss");
    const snapshot = runtime.getSnapshot();
    const hawk = snapshot.assets.find((a) => a.id === "hawk-01")!;
    expect(hawk.status).toBe("fault");
    expect(hawk.missionId).toBeNull();
    expect(snapshot.missions.find((m) => m.assetId === "hawk-01")?.status).toBe("failed");
    runtime.planMission("hawk-01", { type: "transit", target: wp("rally-a") });
    expect(runtime.dispatch().reason).toMatch(/GPS/);
  });

  it("scrubbing shows a past snapshot and resume returns to live", () => {
    const runtime = new FleetRuntime();
    runtime.stepMany(40);
    const view = runtime.getView();
    expect(view.historyStartMs).not.toBeNull();
    runtime.seek(1000);
    expect(runtime.getView().playbackMode).toBe("scrub");
    expect(runtime.getSnapshot().timestampMs).toBeLessThanOrEqual(1000);
    runtime.resumeLive();
    expect(runtime.getSnapshot().timestampMs).toBe(4000);
  });
});

describe("zone commands", () => {
  const square = (center: { lat: number; lng: number }, halfDeg: number) => [
    { lat: center.lat + halfDeg, lng: center.lng - halfDeg },
    { lat: center.lat + halfDeg, lng: center.lng + halfDeg },
    { lat: center.lat - halfDeg, lng: center.lng + halfDeg },
    { lat: center.lat - halfDeg, lng: center.lng - halfDeg },
  ];

  it("creates, renames, retypes, and removes zones with events", () => {
    const runtime = new FleetRuntime();
    const count = runtime.getZones().length;
    const zone = runtime.addZone({ type: "exclusion", polygon: square({ lat: 36.85, lng: -121.72 }, 0.002) })!;
    expect(zone.name).toBe("Exclusion 1");
    expect(runtime.getZones()).toHaveLength(count + 1);
    expect(runtime.getArea().zones).toBe(runtime.getZones());
    expect(runtime.zonesModified()).toBe(true);
    expect(runtime.updateZone(zone.id, { name: "Keep out" })).toBe(true);
    expect(runtime.getZones().find((z) => z.id === zone.id)?.name).toBe("Keep out");
    expect(runtime.updateZone(zone.id, { type: "hazard" })).toBe(true);
    expect(runtime.updateZone("nope", { name: "x" })).toBe(false);
    expect(runtime.addZone({ type: "exclusion", polygon: square({ lat: 36.85, lng: -121.72 }, 0.002).slice(0, 2) })).toBeNull();
    expect(runtime.removeZone(zone.id)).toBe(true);
    expect(runtime.getZones()).toHaveLength(count);
    const codes = runtime.getEvents().map((e) => e.eventCode);
    expect(codes).toEqual(expect.arrayContaining(["ZONE_CREATED", "ZONE_UPDATED", "ZONE_REMOVED"]));
    runtime.resetZones();
    expect(runtime.zonesModified()).toBe(false);
  });

  it("re-routes an active mission when an exclusion zone lands on its path", () => {
    const runtime = new FleetRuntime();
    const from = runtime.getSnapshot().assets.find((a) => a.id === "hawk-01")!.position;
    const to = wp("farm-east");
    runtime.planMission("hawk-01", { type: "transit", target: to, targetLabel: "FARM-EAST" });
    const dispatched = runtime.dispatch();
    expect(dispatched.ok).toBe(true);
    runtime.stepMany(20);
    const mission = runtime.getSnapshot().missions.find((m) => m.id === dispatched.missionId)!;
    // Halfway along the remaining path, so the box is on the route but clear of the target.
    const rest = mission.coa.path.slice(mission.waypointIndex - 1);
    const total = pathLengthM(rest);
    let ahead = rest[0];
    let walked = 0;
    for (let i = 1; i < rest.length; i += 1) {
      const leg = haversineM(rest[i - 1], rest[i]);
      if (walked + leg >= total / 2) {
        const t = (total / 2 - walked) / leg;
        ahead = { lat: rest[i - 1].lat + (rest[i].lat - rest[i - 1].lat) * t, lng: rest[i - 1].lng + (rest[i].lng - rest[i - 1].lng) * t };
        break;
      }
      walked += leg;
    }
    const zone = runtime.addZone({ type: "exclusion", polygon: square(ahead, 0.0015) })!;
    const after = runtime.getSnapshot().missions.find((m) => m.id === dispatched.missionId)!;
    expect(after.status).toBe("active");
    expect(after.coa.id).not.toBe(mission.coa.id);
    expect(after.coa.path.some((point) => pointInPolygon(point, zone.polygon))).toBe(false);
    expect(runtime.getEvents().some((e) => e.eventCode === "MISSION_REROUTED")).toBe(true);
    expect(from).toBeDefined();
  });

  it("aborts a mission whose objective sits inside a new exclusion zone", () => {
    const runtime = new FleetRuntime();
    const to = wp("farm-east");
    runtime.planMission("hawk-01", { type: "transit", target: to, targetLabel: "FARM-EAST" });
    const dispatched = runtime.dispatch();
    expect(dispatched.ok).toBe(true);
    runtime.addZone({ type: "exclusion", polygon: square(to, 0.002) });
    const after = runtime.getSnapshot().missions.find((m) => m.id === dispatched.missionId)!;
    expect(after.status).toBe("aborted");
    expect(after.failureReason).toBe("Route blocked by zone");
  });

  it("seeds hostiles that patrol and get detected", () => {
    const runtime = new FleetRuntime();
    const before = runtime.getSnapshot().hostiles;
    expect(before.length).toBeGreaterThanOrEqual(6);
    expect(before.every((h) => h.status === "active")).toBe(true);
    runtime.stepMany(100);
    const after = runtime.getSnapshot().hostiles;
    const moved = after.filter((h, i) => h.position.lat !== before[i].position.lat || h.position.lng !== before[i].position.lng);
    expect(moved.length).toBeGreaterThan(0);
    // Farm-east hostiles sit within detection range of parked assets at FARM-EAST.
    expect(after.some((h) => h.lastSeenMs !== null)).toBe(true);
  });

  it("refuses engage missions for unarmed assets and runs them for armed ones", () => {
    const runtime = new FleetRuntime();
    const snapshot = runtime.getSnapshot();
    const grizzly = snapshot.assets.find((a) => a.id === "grizzly-01")!;
    expect(grizzly.weapon).not.toBeNull();
    const east = snapshot.hostiles.filter((h) => h.id === "hos-u1" || h.id === "hos-u2");
    const objective = buildEngageObjective(grizzly.position, east)!;

    const unarmed = runtime.planMission("mule-01", objective);
    expect(unarmed.every((c) => !c.feasible)).toBe(true);
    expect(unarmed[0].reason).toMatch(/weapon/i);

    const coas = runtime.planMission("grizzly-01", objective);
    expect(coas.some((c) => c.feasible)).toBe(true);
    expect(runtime.dispatch().ok).toBe(true);
    expect(runtime.getSnapshot().assets.find((a) => a.id === "grizzly-01")!.status).toBe("engaging");

    // 3.5 m/s over ~3 km, then a firefight: give it 25 sim minutes.
    runtime.stepMany(15_000);
    const done = runtime.getSnapshot();
    const mission = done.missions.find((m) => m.assetId === "grizzly-01" && m.objective.type === "engage")!;
    expect(mission.sitrep).not.toBeNull();
    expect(mission.sitrep!.shotsFired).toBeGreaterThan(0);
    expect(mission.sitrep!.targetsEliminated).toBeGreaterThan(0);
    expect(done.hostiles.filter((h) => h.status === "eliminated").length).toBeGreaterThan(0);
    const events = runtime.getEvents().map((e) => e.eventCode);
    expect(events).toContain("ENGAGEMENT_STARTED");
    expect(events).toContain("TARGET_ELIMINATED");
    expect(events).toContain("SITREP");
    const after = done.assets.find((a) => a.id === "grizzly-01")!;
    expect(after.weapon!.ammo).toBeLessThan(after.weapon!.system.ammoCapacity);
    // The autocannon outranges these UGVs, so armor should survive intact.
    expect(after.armorPct).toBe(100);
  });
});
