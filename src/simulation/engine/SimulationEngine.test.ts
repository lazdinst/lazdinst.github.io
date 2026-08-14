import { describe, expect, it } from "vitest";
import { SimulationEventCode } from "../events/SimulationEvent";
import { createSimulationEngine } from "./createSimulationEngine";

const DT_MS = 1000 / 60;

function runSteps(
  engine: ReturnType<typeof createSimulationEngine>,
  steps: number
): void {
  for (let i = 0; i < steps; i += 1) {
    engine.advance(DT_MS);
  }
}

function heartbeatTimes(
  engine: ReturnType<typeof createSimulationEngine>
): number[] {
  return engine
    .getEvents()
    .filter((event) => event.eventCode === SimulationEventCode.HEARTBEAT)
    .map((event) => event.timestampMs);
}

describe("SimulationEngine", () => {
  it("starts paused-ready and emits SIM_STARTED", () => {
    const engine = createSimulationEngine({
      dtMs: DT_MS,
      maxStepsPerAdvance: 10_000,
    });
    expect(engine.getView().status).toBe("ready");
    engine.start();
    expect(engine.getView().status).toBe("running");
    expect(engine.getEvents().map((event) => event.eventCode)).toEqual([
      SimulationEventCode.SIM_STARTED,
    ]);
  });

  it("emits SIM_PAUSED and SIM_RESUMED around a pause", () => {
    const engine = createSimulationEngine({
      dtMs: DT_MS,
      maxStepsPerAdvance: 10_000,
    });
    engine.start();
    engine.pause();
    engine.start();
    expect(engine.getEvents().map((event) => event.eventCode)).toEqual([
      SimulationEventCode.SIM_STARTED,
      SimulationEventCode.SIM_PAUSED,
      SimulationEventCode.SIM_RESUMED,
    ]);
  });

  it("does not advance while paused", () => {
    const engine = createSimulationEngine({
      dtMs: DT_MS,
      maxStepsPerAdvance: 10_000,
    });
    engine.start();
    runSteps(engine, 10);
    const timestamp = engine.getView().timestampMs;
    engine.pause();
    runSteps(engine, 10);
    expect(engine.getView().timestampMs).toBe(timestamp);
  });

  it("emits a heartbeat every simulated second", () => {
    const engine = createSimulationEngine({
      dtMs: DT_MS,
      maxStepsPerAdvance: 10_000,
    });
    engine.start();
    runSteps(engine, 180);
    expect(heartbeatTimes(engine)).toHaveLength(3);
    expect(engine.getSnapshot().process.heartbeatCount).toBe(3);
  });

  it("records history at 30 Hz", () => {
    const engine = createSimulationEngine({
      dtMs: DT_MS,
      historyHz: 30,
      maxStepsPerAdvance: 10_000,
    });
    engine.start();
    runSteps(engine, 60);
    expect(engine.getHistory()).toHaveLength(30);
  });

  it("keeps later domain slots empty in milestone 1", () => {
    const engine = createSimulationEngine({
      dtMs: DT_MS,
      maxStepsPerAdvance: 10_000,
    });
    engine.start();
    const snapshot = engine.getSnapshot();
    expect(snapshot.robot).toBeNull();
    expect(snapshot.tcp).toBeNull();
    expect(snapshot.perception).toBeNull();
    expect(snapshot.workcell).toBeNull();
    expect(snapshot.forceTorque).toBeNull();
    expect(snapshot.safety).toBeNull();
    expect(snapshot.io).toBeNull();
    expect(snapshot.faults).toBeNull();
    expect(snapshot.analytics).toBeNull();
    expect(snapshot.playback.mode).toBe("live");
    expect(snapshot.scenarioId).toBe("nominal");
  });

  it("replays the same events after reset with the same seed", () => {
    const engine = createSimulationEngine({
      seed: 0x51e00001,
      dtMs: DT_MS,
      maxStepsPerAdvance: 10_000,
    });

    engine.start();
    runSteps(engine, 180);
    const first = engine
      .getEvents()
      .filter((event) => event.eventCode === SimulationEventCode.HEARTBEAT)
      .map((event) => ({
        id: event.id,
        timestampMs: event.timestampMs,
        noise: event.metadata?.noise,
      }));

    engine.reset();
    expect(engine.getView()).toMatchObject({
      status: "ready",
      timestampMs: 0,
      timeScale: 1,
      playbackMode: "live",
      scenarioId: "nominal",
    });
    expect(engine.getEvents().map((event) => event.eventCode)).toEqual([
      SimulationEventCode.SIM_RESET,
    ]);
    expect(engine.getHistory()).toEqual([]);

    engine.start();
    runSteps(engine, 180);
    const second = engine
      .getEvents()
      .filter((event) => event.eventCode === SimulationEventCode.HEARTBEAT)
      .map((event) => ({
        id: event.id,
        timestampMs: event.timestampMs,
        noise: event.metadata?.noise,
      }));

    expect(second).toEqual(first);
  });

  it("seeks history without mutating live time", () => {
    const engine = createSimulationEngine({
      dtMs: DT_MS,
      historyHz: 30,
      maxStepsPerAdvance: 10_000,
    });
    engine.start();
    runSteps(engine, 120);
    const liveTime = engine.getView().timestampMs;
    const snapshot = engine.seek(200);
    expect(engine.getView().playbackMode).toBe("scrub");
    expect(snapshot?.timestampMs).toBeGreaterThanOrEqual(0);
    expect(engine.getView().status).toBe("paused");
    engine.resumeLive();
    expect(engine.getView().playbackMode).toBe("live");
    expect(engine.getView().timestampMs).toBe(liveTime);
  });

  it("caps steps per advance to avoid a spiral", () => {
    const engine = createSimulationEngine({
      dtMs: DT_MS,
      maxStepsPerAdvance: 8,
    });
    engine.start();
    const steps = engine.advance(10_000);
    expect(steps).toBe(8);
  });
});
