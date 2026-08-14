import { SimulationClock } from "../clock/SimulationClock";
import { RingBuffer } from "../buffers/RingBuffer";
import { EventLog } from "../events/EventLog";
import {
  createSimulationEvent,
  SimulationEventCode,
  type SimulationEvent,
} from "../events/SimulationEvent";
import { SeededRng } from "../rng/SeededRng";
import { findSnapshotAt } from "../playback/findSnapshotAt";
import type {
  AnalyticsTelemetry,
  CellStatus,
  ConveyorTelemetry,
  FaultTelemetry,
  ForceTorqueTelemetry,
  IoTelemetry,
  PerceptionFrame,
  PlaybackMode,
  ProcessTelemetry,
  RobotTelemetry,
  SafetyTelemetry,
  SimulationSnapshot,
  SimulationStatus,
  TcpTelemetry,
  ToolTelemetry,
  WorkcellTelemetry,
} from "../types/SimulationSnapshot";
import type { SimulationSubsystem } from "../types/SimulationSubsystem";

export interface SimulationEngineConfig {
  seed: number;
  dtMs: number;
  historyHz: number;
  historyDurationMs: number;
  eventCapacity: number;
  scenarioId: string;
  maxStepsPerAdvance: number;
}

export interface SimulationView {
  status: SimulationStatus;
  timestampMs: number;
  timeScale: number;
  cellStatus: CellStatus;
  playbackMode: PlaybackMode;
  scrubTimestampMs: number | null;
  scenarioId: string;
  historyStartMs: number | null;
  historyEndMs: number | null;
}

const ENGINE_SOURCE = "simulation.engine";
const CLOCK_SOURCE = "simulation.clock";

export class SimulationEngine {
  private readonly config: SimulationEngineConfig;
  private readonly clock: SimulationClock;
  private readonly history: RingBuffer<SimulationSnapshot>;
  private readonly eventLog: EventLog;
  private readonly viewListeners = new Set<() => void>();
  private readonly eventListeners = new Set<() => void>();
  private readonly telemetryIntervalSteps: number;
  private readonly analyticsIntervalSteps: number;

  private rng: SeededRng;
  private accumulatorMs = 0;
  private stepCount = 0;
  private eventSeq = 0;
  private heartbeatCount = 0;
  private lastHeartbeatMs: number | null = null;
  private viewSnapshot: SimulationView;
  private eventsSnapshot: SimulationEvent[] = [];
  private readonly subsystems: SimulationSubsystem[] = [];
  private robotTelemetryProvider: {
    getRobot(): RobotTelemetry | null;
    getTcp(): TcpTelemetry | null;
  } | null = null;
  private workcellProvider: {
    getWorkcell(): WorkcellTelemetry | null;
    getTool(): ToolTelemetry | null;
  } | null = null;
  private perceptionProvider: {
    getPerception(): PerceptionFrame | null;
  } | null = null;
  private instrumentationProvider: {
    getForceTorque(): ForceTorqueTelemetry | null;
    getConveyor(): ConveyorTelemetry | null;
    getIo(): IoTelemetry | null;
    getTool?(workcellTool: ToolTelemetry | null): ToolTelemetry | null;
  } | null = null;
  private safetyProvider: {
    getSafety(): SafetyTelemetry | null;
  } | null = null;
  private diagnosticsProvider: {
    getFaults(): FaultTelemetry | null;
    getAnalytics(): AnalyticsTelemetry | null;
  } | null = null;
  private playbackMode: PlaybackMode = "live";
  private scrubTimestampMs: number | null = null;
  private displayedSnapshot: SimulationSnapshot;

  constructor(config: SimulationEngineConfig) {
    this.config = config;
    this.clock = new SimulationClock(config.dtMs);
    this.rng = new SeededRng(config.seed);
    this.eventLog = new EventLog(config.eventCapacity);

    const historyCapacity = Math.max(
      1,
      Math.ceil((config.historyDurationMs / 1000) * config.historyHz)
    );
    this.history = new RingBuffer<SimulationSnapshot>(historyCapacity);

    const stepHz = 1000 / config.dtMs;
    this.telemetryIntervalSteps = Math.max(1, Math.round(stepHz / config.historyHz));
    this.analyticsIntervalSteps = Math.max(1, Math.round(stepHz));

    this.viewSnapshot = this.buildView();
    this.displayedSnapshot = this.buildSnapshot();
  }

  start(): void {
    const previous = this.clock.getStatus();
    if (!this.clock.start()) {
      return;
    }

    const eventCode =
      previous === "paused"
        ? SimulationEventCode.SIM_RESUMED
        : SimulationEventCode.SIM_STARTED;
    const message =
      previous === "paused"
        ? "Simulation resumed"
        : "Simulation started";

    this.pushEvent("info", ENGINE_SOURCE, eventCode, message, {
      status: this.clock.getStatus(),
    });
    this.publishView();
  }

  pause(): void {
    if (!this.clock.pause()) {
      return;
    }

    this.pushEvent(
      "info",
      ENGINE_SOURCE,
      SimulationEventCode.SIM_PAUSED,
      "Simulation paused",
      { status: this.clock.getStatus() }
    );
    this.publishView();
  }

  reset(): void {
    this.clock.reset();
    this.rng = new SeededRng(this.config.seed);
    this.accumulatorMs = 0;
    this.stepCount = 0;
    this.eventSeq = 0;
    this.heartbeatCount = 0;
    this.lastHeartbeatMs = null;
    this.history.clear();
    this.eventLog.clear();
    this.playbackMode = "live";
    this.scrubTimestampMs = null;
    this.subsystems.forEach((subsystem) => subsystem.reset(this.config.seed));

    const resetEvent = createSimulationEvent(
      `${this.config.seed}-reset`,
      this.clock.getSimTimeMs(),
      {
        severity: "info",
        source: ENGINE_SOURCE,
        eventCode: SimulationEventCode.SIM_RESET,
        message: "Simulation reset",
        metadata: { seed: this.config.seed },
      }
    );
    this.eventLog.append(resetEvent);
    this.displayedSnapshot = this.buildSnapshot();
    this.publishEvents();
    this.publishView();
  }

  setTimeScale(timeScale: number): void {
    this.clock.setTimeScale(timeScale);
    this.publishView();
  }

  advance(wallDeltaMs: number): number {
    if (!this.clock.isRunning() || wallDeltaMs <= 0) {
      return 0;
    }

    this.accumulatorMs += wallDeltaMs * this.clock.getTimeScale();

    let steps = 0;
    while (
      this.accumulatorMs >= this.config.dtMs &&
      steps < this.config.maxStepsPerAdvance
    ) {
      this.step();
      this.accumulatorMs -= this.config.dtMs;
      steps += 1;
    }

    if (steps >= this.config.maxStepsPerAdvance) {
      this.accumulatorMs = 0;
    }

    return steps;
  }

  getView = (): SimulationView => this.viewSnapshot;

  getEvents = (): SimulationEvent[] => this.eventsSnapshot;

  getSnapshot(): SimulationSnapshot {
    return this.buildSnapshot();
  }

  getHistory(): SimulationSnapshot[] {
    return this.history.toArray();
  }

  setRobotTelemetryProvider(
    provider: {
      getRobot(): RobotTelemetry | null;
      getTcp(): TcpTelemetry | null;
    } | null
  ): void {
    this.robotTelemetryProvider = provider;
  }

  emitDomainEvent(
    severity: SimulationEvent["severity"],
    source: string,
    eventCode: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.pushEvent(severity, source, eventCode, message, metadata);
  }

  subscribeView = (listener: () => void): (() => void) => {
    this.viewListeners.add(listener);
    return () => {
      this.viewListeners.delete(listener);
    };
  };

  subscribeEvents = (listener: () => void): (() => void) => {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  };

  registerSubsystem(subsystem: SimulationSubsystem): void {
    this.subsystems.push(subsystem);
  }

  setWorkcellProvider(
    provider: {
      getWorkcell(): WorkcellTelemetry | null;
      getTool(): ToolTelemetry | null;
    } | null
  ): void {
    this.workcellProvider = provider;
  }

  setPerceptionProvider(
    provider: { getPerception(): PerceptionFrame | null } | null
  ): void {
    this.perceptionProvider = provider;
  }

  setInstrumentationProvider(
    provider: SimulationEngine["instrumentationProvider"]
  ): void {
    this.instrumentationProvider = provider;
  }

  setSafetyProvider(
    provider: { getSafety(): SafetyTelemetry | null } | null
  ): void {
    this.safetyProvider = provider;
  }

  setDiagnosticsProvider(
    provider: SimulationEngine["diagnosticsProvider"]
  ): void {
    this.diagnosticsProvider = provider;
  }

  setScenario(scenarioId: string, seed?: number): void {
    this.config.scenarioId = scenarioId;
    if (seed !== undefined) {
      this.config.seed = seed;
    }
    this.publishView();
  }

  seek(timestampMs: number): SimulationSnapshot | null {
    if (this.clock.isRunning()) {
      this.clock.pause();
    }
    this.playbackMode = "scrub";
    this.scrubTimestampMs = timestampMs;
    this.displayedSnapshot =
      findSnapshotAt(this.history.toArray(), timestampMs) ?? this.buildSnapshot();
    const snapshot = this.displayedSnapshot;
    this.pushEvent(
      "debug",
      ENGINE_SOURCE,
      SimulationEventCode.PLAYBACK_SEEK,
      `Seek ${timestampMs.toFixed(0)} ms`,
      { timestampMs }
    );
    this.publishView();
    return snapshot;
  }

  resumeLive(): void {
    this.playbackMode = "live";
    this.scrubTimestampMs = null;
    this.displayedSnapshot = this.buildSnapshot();
    this.publishView();
  }

  getDisplayedSnapshot = (): SimulationSnapshot => this.displayedSnapshot;

  private step(): void {
    this.clock.step();
    this.stepCount += 1;

    const ctx = {
      timestampMs: this.clock.getSimTimeMs(),
      dtMs: this.config.dtMs,
      stepCount: this.stepCount,
      seed: this.config.seed,
    };
    this.subsystems.forEach((subsystem) => subsystem.step(ctx));

    if (this.stepCount % this.analyticsIntervalSteps === 0) {
      this.emitHeartbeat();
    }

    if (this.stepCount % this.telemetryIntervalSteps === 0) {
      const snapshot = this.buildSnapshot();
      this.history.push(snapshot);
      if (this.playbackMode === "live") {
        this.displayedSnapshot = snapshot;
      }
      this.publishView();
    }
  }

  private emitHeartbeat(): void {
    this.heartbeatCount += 1;
    this.lastHeartbeatMs = this.clock.getSimTimeMs();
    this.pushEvent(
      "info",
      CLOCK_SOURCE,
      SimulationEventCode.HEARTBEAT,
      "Simulation heartbeat",
      {
        heartbeatCount: this.heartbeatCount,
        timestampMs: this.lastHeartbeatMs,
        noise: this.rng.nextGaussian(),
      }
    );
  }

  private pushEvent(
    severity: SimulationEvent["severity"],
    source: string,
    eventCode: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.eventSeq += 1;
    const event = createSimulationEvent(
      `${this.config.seed}-${this.eventSeq}`,
      this.clock.getSimTimeMs(),
      { severity, source, eventCode, message, metadata }
    );
    this.eventLog.append(event);
    this.publishEvents();
  }

  private buildView(): SimulationView {
    const history = this.history.toArray();
    const safety = this.safetyProvider?.getSafety() ?? null;
    const faults = this.diagnosticsProvider?.getFaults() ?? null;
    const robot = this.robotTelemetryProvider?.getRobot() ?? null;
    return {
      status: this.clock.getStatus(),
      timestampMs:
        this.playbackMode === "scrub" && this.scrubTimestampMs !== null
          ? this.scrubTimestampMs
          : this.clock.getSimTimeMs(),
      timeScale: this.clock.getTimeScale(),
      cellStatus: deriveCellStatus(
        this.clock.getStatus(),
        safety?.protectiveStop === true,
        robot?.fault === true || (faults?.activeIds.length ?? 0) > 0
      ),
      playbackMode: this.playbackMode,
      scrubTimestampMs: this.scrubTimestampMs,
      scenarioId: this.config.scenarioId,
      historyStartMs: history[0]?.timestampMs ?? null,
      historyEndMs: history[history.length - 1]?.timestampMs ?? null,
    };
  }

  private buildSnapshot(): SimulationSnapshot {
    const workcellTool = this.workcellProvider?.getTool() ?? null;
    return {
      frameId: this.stepCount,
      timestampMs: this.clock.getSimTimeMs(),
      seed: this.config.seed,
      scenarioId: this.config.scenarioId,
      status: this.clock.getStatus(),
      timeScale: this.clock.getTimeScale(),
      robot: this.robotTelemetryProvider?.getRobot() ?? null,
      tcp: this.robotTelemetryProvider?.getTcp() ?? null,
      tool: this.instrumentationProvider?.getTool?.(workcellTool) ?? workcellTool,
      forceTorque: this.instrumentationProvider?.getForceTorque() ?? null,
      perception: this.perceptionProvider?.getPerception() ?? null,
      workcell: this.workcellProvider?.getWorkcell() ?? null,
      conveyor: this.instrumentationProvider?.getConveyor() ?? null,
      safety: this.safetyProvider?.getSafety() ?? null,
      io: this.instrumentationProvider?.getIo() ?? null,
      faults: this.diagnosticsProvider?.getFaults() ?? null,
      analytics: this.diagnosticsProvider?.getAnalytics() ?? null,
      playback: {
        mode: this.playbackMode,
        scrubTimestampMs: this.scrubTimestampMs,
      },
      process: this.buildProcessTelemetry(),
    };
  }

  private buildProcessTelemetry(): ProcessTelemetry {
    return {
      heartbeatCount: this.heartbeatCount,
      lastHeartbeatMs: this.lastHeartbeatMs,
    };
  }

  private publishView(): void {
    this.viewSnapshot = this.buildView();
    this.viewListeners.forEach((listener) => listener());
  }

  private publishEvents(): void {
    this.eventsSnapshot = this.eventLog.toArray();
    this.eventListeners.forEach((listener) => listener());
  }
}

function deriveCellStatus(
  status: SimulationStatus,
  protectiveStop: boolean,
  fault: boolean
): CellStatus {
  if (protectiveStop) {
    return "protective_stop";
  }
  if (fault) {
    return "fault";
  }
  if (status === "running") {
    return "running";
  }
  if (status === "paused") {
    return "paused";
  }
  return "ready";
}
