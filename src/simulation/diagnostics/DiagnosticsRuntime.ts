import type {
  AnalyticsTelemetry,
  ConveyorTelemetry,
  FaultId,
  FaultTelemetry,
  ForceTorqueTelemetry,
  GripperTelemetry,
  IoTelemetry,
  SafetyTelemetry,
  ToolTelemetry,
} from "../types/SimulationSnapshot";
import type { SimulationStepContext } from "../types/SimulationSubsystem";
import { SimulationEventCode } from "../events/SimulationEvent";
import { AnalyticsTracker } from "../analytics/AnalyticsTracker";
import { FaultInjector } from "../faults/FaultInjector";
import { FAULT_CATALOG } from "../faults/types";
import { findScenario } from "../scenarios/catalog";
import { NOMINAL_SCENARIO_ID, type ScenarioDefinition } from "../scenarios/types";
import { InstrumentationRuntime } from "@/workcell/instrumentation/InstrumentationRuntime";
import type { DigitalInput } from "@/workcell/io/digitalIo";
import { SafetySystem } from "@/workcell/safety/SafetySystem";
import { perceptionRuntime } from "@/perception/runtime";
import { robotRuntime } from "@/robotics";
import { workcellRuntime } from "@/workcell/runtime";

type EmitEvent = (
  severity: "info" | "warning" | "error" | "critical",
  source: string,
  eventCode: string,
  message: string,
  metadata?: Record<string, unknown>
) => void;

export interface DiagnosticsView {
  scenario: ScenarioDefinition;
  faults: FaultId[];
  safety: SafetyTelemetry;
  io: IoTelemetry | null;
  forceTorque: ForceTorqueTelemetry | null;
  conveyor: ConveyorTelemetry | null;
  gripper: GripperTelemetry | null;
  analytics: AnalyticsTelemetry;
  revision: number;
}

export class DiagnosticsRuntime {
  readonly faults = new FaultInjector();
  readonly safety = new SafetySystem();
  readonly instrumentation: InstrumentationRuntime;
  readonly analytics = new AnalyticsTracker();

  private scenario: ScenarioDefinition = findScenario(NOMINAL_SCENARIO_ID);
  private emitEvent: EmitEvent | null = null;
  private viewListeners = new Set<() => void>();
  private revision = 0;
  private view: DiagnosticsView;
  private lastPublishMs = Number.NEGATIVE_INFINITY;
  private scheduledApplied = new Set<string>();
  private lastProtective = false;
  private lastOverheat = false;
  private lastOverload = false;
  private lastPlcLoss = false;
  private lastJam = false;

  constructor(seed: number) {
    this.instrumentation = new InstrumentationRuntime(seed);
    this.view = this.buildView();
  }

  setEventEmitter(emitEvent: EmitEvent): void {
    this.emitEvent = emitEvent;
  }

  loadScenario(id: string): ScenarioDefinition {
    this.scenario = findScenario(id);
    this.scheduledApplied.clear();
    this.configureSubsystems();
    this.emit(
      "info",
      "simulation.scenario",
      SimulationEventCode.SCENARIO_LOADED,
      `Scenario ${this.scenario.name}`,
      { scenarioId: this.scenario.id }
    );
    return this.scenario;
  }

  getScenario(): ScenarioDefinition {
    return this.scenario;
  }

  injectFault(id: FaultId, timestampMs: number): void {
    if (!this.faults.inject(id, timestampMs)) {
      return;
    }
    this.emit(
      "warning",
      "simulation.faults",
      SimulationEventCode.FAULT_INJECTED,
      `${labelForFault(id)} injected`,
      { faultId: id }
    );
    this.applyFaultEdges(timestampMs);
    this.publish();
  }

  clearFault(id: FaultId): void {
    if (!this.faults.clear(id)) {
      return;
    }
    this.emit(
      "info",
      "simulation.faults",
      SimulationEventCode.FAULT_CLEARED,
      `${labelForFault(id)} cleared`,
      { faultId: id }
    );
    this.applyFaultEdges(0);
    this.publish();
  }

  setIoOverride(key: DigitalInput, value: boolean | null): void {
    this.instrumentation.setOverride(key, value);
    this.publish();
  }

  setEStop(active: boolean): void {
    this.safety.setEStop(active);
    this.publish();
  }

  setGuardDoorClosed(closed: boolean): void {
    this.safety.setGuardDoorClosed(closed);
    this.publish();
  }

  setLightCurtainClear(clear: boolean): void {
    this.safety.setLightCurtainClear(clear);
    this.publish();
  }

  setWarningOccupied(occupied: boolean): void {
    this.safety.setWarningOccupied(occupied);
    this.publish();
  }

  setProtectiveOccupied(occupied: boolean): void {
    this.safety.setProtectiveOccupied(occupied);
    this.publish();
  }

  reset(seed: number): void {
    this.faults.reset();
    this.safety.reset();
    this.instrumentation.reset(seed);
    this.analytics.reset();
    this.scheduledApplied.clear();
    this.lastProtective = false;
    this.lastOverheat = false;
    this.lastOverload = false;
    this.lastPlcLoss = false;
    this.lastJam = false;
    this.configureSubsystems();
    this.applyImmediateScenarioFaults();
    this.applyFaultEdges(0);
    this.publish();
  }

  step(ctx: SimulationStepContext): void {
    this.applyScheduledFaults(ctx.timestampMs);
    this.applyScenarioIntrusion();
    this.applyFaultEdges(ctx.timestampMs);

    const safety = this.safety.getTelemetry();
    robotRuntime.setSpeedScale(safety.speedScale);
    if (safety.protectiveStop && !this.lastProtective) {
      workcellRuntime.abortForSafety();
      robotRuntime.cancelMotion();
      this.emit(
        "critical",
        "workcell.safety",
        SimulationEventCode.SAFETY_STOP,
        "Protective stop — motion inhibited",
        { eStop: safety.eStop, zone: safety.protectiveZoneOccupied }
      );
    } else if (safety.reducedSpeed) {
      const edge = this.safety.consumeEdge();
      if (edge.warningEntered) {
        this.emit(
          "warning",
          "workcell.safety",
          SimulationEventCode.SAFETY_WARNING,
          "Warning zone occupied — reduced speed",
          { speedScale: safety.speedScale }
        );
      }
    } else {
      this.safety.consumeEdge();
    }
    this.lastProtective = safety.protectiveStop;

    const vacuum = workcellRuntime.getTool().vacuum;
    const workcell = workcellRuntime.getWorkcell();
    const payloadKg =
      workcellRuntime.getGraspedMassKg() * (this.scenario.payloadScale ?? 1);
    robotRuntime.setActuationHints({
      payloadKg,
      overheat: this.scenario.motorOverheat === true,
      overload: this.faults.isActive("joint_overload"),
      encoderMismatch: this.faults.isActive("encoder_mismatch"),
    });

    this.instrumentation.step(ctx, {
      contacting: workcell.parts.some((part) => part.status === "grasped"),
      payloadKg,
      linearAccelMmSec2: robotRuntime.getLinearAccelMmSec2(),
      vacuumEnabled: vacuum?.enabled === true,
      vacuumOk: vacuum?.objectSecured === true || (vacuum?.pressureKPa ?? 101) < 70,
      vacuumSeal: vacuum?.sealQuality ?? 0,
      partPresent: workcell.remainingCount > 0,
      safetyClear: safety.safetyClear,
      robotReady: robotRuntime.isReady() && !safety.protectiveStop,
      cellFault: this.faults.getActive().length > 0 || robotRuntime.getRobot()?.fault === true,
      conveyorCommanded: workcell.pickPhase === "place" || workcell.pickPhase === "transfer",
      gripperClose: vacuum?.enabled === true,
    });

    this.analytics.observePhase(
      workcell.pickPhase,
      ctx.timestampMs,
      workcell.lastFailure,
      ctx.stepCount > 0,
      ctx.dtMs
    );

    if (ctx.timestampMs - this.lastPublishMs >= 50) {
      this.lastPublishMs = ctx.timestampMs;
      this.publish();
    }
  }

  getView = (): DiagnosticsView => this.view;

  subscribeView = (listener: () => void): (() => void) => {
    this.viewListeners.add(listener);
    return () => {
      this.viewListeners.delete(listener);
    };
  };

  getForceTorque = (): ForceTorqueTelemetry | null =>
    this.instrumentation.getForceTorque();

  getConveyor = (): ConveyorTelemetry | null => this.instrumentation.getConveyor();

  getIo = (): IoTelemetry | null => this.instrumentation.getIo();

  getSafety = (): SafetyTelemetry | null => this.safety.getTelemetry();

  getFaults = (): FaultTelemetry | null => this.faults.getTelemetry();

  getAnalytics = (): AnalyticsTelemetry | null => this.analytics.getTelemetry();

  getTool = (workcellTool: ToolTelemetry | null): ToolTelemetry | null => {
    if (!workcellTool) {
      return this.instrumentation.getTool(null);
    }
    return this.instrumentation.getTool(workcellTool.vacuum);
  };

  isFaultActive(id: FaultId): boolean {
    return this.faults.isActive(id);
  }

  private configureSubsystems(): void {
    workcellRuntime.configure({
      partCount: this.scenario.partCount,
      vacuumLeak: this.scenario.vacuumLeak ?? 0,
      graspSlipBias: this.scenario.graspSlipBias ?? 0,
    });
    perceptionRuntime.setDegradation({
      extraNoiseMm: this.scenario.perceptionNoiseMm ?? 0,
      extraDropout: this.scenario.perceptionDropout ?? 0,
      extraLatencyMs: this.scenario.networkLatencyMs ?? 0,
      cameraOffline:
        this.scenario.cameraOffline === true || this.faults.isActive("camera_disconnect"),
    });
    this.instrumentation.setJammed(this.scenario.conveyorJammed === true);
  }

  private applyImmediateScenarioFaults(): void {
    if (this.scenario.conveyorJammed && !this.lastJam) {
      this.emit(
        "warning",
        "workcell.conveyor",
        SimulationEventCode.CONVEYOR_JAM,
        "Conveyor jammed"
      );
      this.lastJam = true;
    }
    for (const fault of this.scenario.faults ?? []) {
      if (fault.atMs === undefined || fault.atMs <= 0) {
        this.faults.inject(fault.id, 0);
        this.scheduledApplied.add(`${fault.id}:0`);
      }
    }
  }

  private applyScheduledFaults(timestampMs: number): void {
    for (const fault of this.scenario.faults ?? []) {
      const key = `${fault.id}:${fault.atMs ?? 0}`;
      if (this.scheduledApplied.has(key)) {
        continue;
      }
      if ((fault.atMs ?? 0) <= timestampMs) {
        this.injectFault(fault.id, timestampMs);
        this.scheduledApplied.add(key);
      }
    }
  }

  private applyScenarioIntrusion(): void {
    if (this.scenario.safetyIntrusion === "warning") {
      this.safety.setWarningOccupied(true);
    }
    const protective =
      this.scenario.safetyIntrusion === "protective" ||
      this.faults.isActive("safety_trip");
    this.safety.setProtectiveOccupied(protective);
  }

  private applyFaultEdges(timestampMs: number): void {
    void timestampMs;
    perceptionRuntime.setDegradation({
      extraNoiseMm:
        (this.scenario.perceptionNoiseMm ?? 0) +
        (this.faults.isActive("depth_noise") ? 7 : 0),
      extraDropout:
        (this.scenario.perceptionDropout ?? 0) +
        (this.faults.isActive("depth_noise") ? 0.22 : 0),
      extraLatencyMs: this.scenario.networkLatencyMs ?? 0,
      cameraOffline:
        this.scenario.cameraOffline === true || this.faults.isActive("camera_disconnect"),
    });
    this.instrumentation.setCommsOk(!this.faults.isActive("plc_loss"));
    this.instrumentation.setJammed(this.scenario.conveyorJammed === true);

    if (this.faults.isActive("plc_loss") && !this.lastPlcLoss) {
      this.emit("error", "workcell.io", SimulationEventCode.PLC_LOSS, "PLC communications lost");
    }
    this.lastPlcLoss = this.faults.isActive("plc_loss");

    if (this.scenario.motorOverheat && !this.lastOverheat) {
      this.emit(
        "warning",
        "robotics.thermal",
        SimulationEventCode.MOTOR_OVERHEAT,
        "Motor thermal bias active"
      );
    }
    this.lastOverheat = this.scenario.motorOverheat === true;

    if (this.faults.isActive("joint_overload") && !this.lastOverload) {
      this.emit(
        "error",
        "robotics.joints",
        SimulationEventCode.JOINT_OVERLOAD,
        "Joint overload injected"
      );
    }
    this.lastOverload = this.faults.isActive("joint_overload");
  }

  private emit(
    severity: "info" | "warning" | "error" | "critical",
    source: string,
    eventCode: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.emitEvent?.(severity, source, eventCode, message, metadata);
  }

  private buildView(): DiagnosticsView {
    return {
      scenario: this.scenario,
      faults: this.faults.getTelemetry().activeIds,
      safety: this.safety.getTelemetry(),
      io: this.instrumentation.getIo(),
      forceTorque: this.instrumentation.getForceTorque(),
      conveyor: this.instrumentation.getConveyor(),
      gripper: this.instrumentation.getGripper(),
      analytics: this.analytics.getTelemetry(),
      revision: this.revision,
    };
  }

  private publish(): void {
    this.revision += 1;
    this.view = this.buildView();
    this.viewListeners.forEach((listener) => listener());
  }
}

function labelForFault(id: FaultId): string {
  return FAULT_CATALOG.find((fault) => fault.id === id)?.name ?? id;
}
