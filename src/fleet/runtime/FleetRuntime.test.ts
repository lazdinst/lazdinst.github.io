import { describe, expect, it } from "vitest";
import { OPERATING_AREA } from "../data/operatingArea";
import { LINK_LOSS_TIMEOUT_MS } from "../sensors/linkModel";
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
    expect(a.getSnapshot().assets).toHaveLength(18);
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
