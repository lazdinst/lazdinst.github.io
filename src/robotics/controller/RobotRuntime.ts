import type {
  JointTelemetry,
  RobotTelemetry,
  TcpTelemetry,
  Vec3,
} from "@/simulation";
import { SimulationEventCode } from "@/simulation";
import type { IkStatus } from "../types/IkStatus";
import type { JointSpec } from "../types/JointSpec";
import type { TcpPose } from "../types/TcpPose";
import { metersFromMm, tcpPositionMm } from "../types/TcpPose";
import { clampJointToSpec, jointLimitUtilization } from "../limits/jointLimits";
import { unitToRadians } from "../units/angleUnits";
import { solveDampedLeastSquaresIk } from "../kinematics/jacobianIk";
import { deriveJointActuation } from "../actuation/deriveJointActuation";
import { easeInOut, lerpJoints } from "../motion/interpolate";
import {
  axisAngleToQuaternion,
  eulerXyzToQuaternion,
  identityQuaternion,
  quaternionMultiply,
  quaternionToEulerXyz,
} from "../kinematics/quaternion";
import {
  DEFAULT_URDF_MODEL,
  findUrdfModelById,
  type UrdfModelOption,
} from "../models/urdfCatalog";

export interface RobotView {
  model: UrdfModelOption;
  specs: JointSpec[];
  positionsRad: Record<string, number>;
  targetPositionsRad: Record<string, number>;
  tcp: TcpPose | null;
  ikStatus: IkStatus;
  ikMessage: string | null;
  revision: number;
}

export type MeasureTcp = (positionsRad: number[]) => TcpPose | null;

const EMPTY_TCP: TcpPose = {
  positionM: [0, 0, 0],
  quaternion: identityQuaternion(),
  eulerRad: [0, 0, 0],
};

export class RobotRuntime {
  private model: UrdfModelOption;
  private specs: JointSpec[] = [];
  private positionsRad: Record<string, number> = {};
  private targetPositionsRad: Record<string, number> = {};
  private previousPositionsRad: Record<string, number> = {};
  private tcp: TcpPose | null = null;
  private ikStatus: IkStatus = "idle";
  private ikMessage: string | null = null;
  private measureTcp: MeasureTcp | null = null;
  private revision = 0;
  private view: RobotView;
  private readonly viewListeners = new Set<() => void>();
  private lastSampleTimeMs = 0;
  private lastViewPublishMs = Number.NEGATIVE_INFINITY;
  private velocitiesRadSec: Record<string, number> = {};
  private previousTcp: TcpPose | null = null;
  private linearVelocityMmSec = 0;
  private angularVelocityRadSec = 0;
  private linearAccelMmSec2 = 0;
  private previousLinearVelocityMmSec = 0;
  private temperaturesC: Record<string, number> = {};
  private speedScale = 1;
  private payloadKg = 0;
  private overheat = false;
  private overload = false;
  private encoderMismatch = false;
  private lastActuationDtSec = 1 / 60;
  private motion: {
    startQ: number[];
    targetQ: number[];
    durationMs: number;
    elapsedMs: number;
  } | null = null;
  private emitEvent:
    | ((
        severity: "info" | "warning" | "error",
        source: string,
        eventCode: string,
        message: string,
        metadata?: Record<string, unknown>
      ) => void)
    | null = null;

  constructor(model: UrdfModelOption = DEFAULT_URDF_MODEL) {
    this.model = model;
    this.view = this.buildView();
  }

  setEventEmitter(emitEvent: RobotRuntime["emitEvent"]): void {
    this.emitEvent = emitEvent;
  }

  setSpeedScale(scale: number): void {
    this.speedScale = Math.min(1, Math.max(0, scale));
  }

  setActuationHints(hints: {
    payloadKg?: number;
    overheat?: boolean;
    overload?: boolean;
    encoderMismatch?: boolean;
  }): void {
    if (hints.payloadKg !== undefined) {
      this.payloadKg = hints.payloadKg;
    }
    if (hints.overheat !== undefined) {
      this.overheat = hints.overheat;
    }
    if (hints.overload !== undefined) {
      this.overload = hints.overload;
    }
    if (hints.encoderMismatch !== undefined) {
      this.encoderMismatch = hints.encoderMismatch;
    }
  }

  setKinematics(measureTcp: MeasureTcp | null): void {
    this.measureTcp = measureTcp;
    this.refreshTcp();
    this.publish();
  }

  selectModel(modelId: string): boolean {
    const model = findUrdfModelById(modelId);
    if (!model || model.id === this.model.id) {
      return false;
    }
    this.model = model;
    this.specs = [];
    this.positionsRad = {};
    this.targetPositionsRad = {};
    this.previousPositionsRad = {};
    this.velocitiesRadSec = {};
    this.tcp = null;
    this.measureTcp = null;
    this.motion = null;
    this.ikStatus = "idle";
    this.ikMessage = null;
    this.emit(
      "info",
      "robotics.model",
      SimulationEventCode.MODEL_CHANGED,
      `Robot model set to ${model.name}`,
      { modelId: model.id, path: model.path }
    );
    this.publish();
    return true;
  }

  configureModel(
    specs: JointSpec[],
    initialPositions?: Record<string, number>
  ): void {
    this.specs = specs;
    const next: Record<string, number> = {};
    specs.forEach((spec, index) => {
      const requested =
        initialPositions?.[spec.id] ?? this.homeRad(index);
      next[spec.id] = clampJointToSpec(requested, spec);
    });
    this.positionsRad = next;
    this.targetPositionsRad = { ...next };
    this.previousPositionsRad = { ...next };
    this.velocitiesRadSec = Object.fromEntries(specs.map((spec) => [spec.id, 0]));
    this.temperaturesC = Object.fromEntries(specs.map((spec) => [spec.id, 36]));
    this.ikStatus = "idle";
    this.ikMessage = null;
    this.refreshTcp();
    this.emit(
      "info",
      "robotics.model",
      SimulationEventCode.URDF_LOADED,
      `Loaded ${this.model.name} with ${specs.length} actuated joints`,
      { modelId: this.model.id, joints: specs.map((spec) => spec.id) }
    );
    this.publish();
  }

  setJoint(id: string, valueRad: number): void {
    this.cancelMotion();
    const spec = this.specs.find((item) => item.id === id);
    if (!spec) {
      return;
    }
    const clamped = clampJointToSpec(valueRad, spec);
    if (clamped !== valueRad) {
      this.emit(
        "warning",
        "robotics.joints",
        SimulationEventCode.JOINT_LIMIT_REJECTED,
        `${spec.label} clamped to URDF limit`,
        { jointId: id, requested: valueRad, applied: clamped }
      );
    }
    this.positionsRad = { ...this.positionsRad, [id]: clamped };
    this.targetPositionsRad = { ...this.targetPositionsRad, [id]: clamped };
    this.ikStatus = "idle";
    this.ikMessage = null;
    this.refreshTcp();
    this.publish();
  }

  setJoints(positionsRad: Record<string, number>): void {
    this.cancelMotion();
    const next = { ...this.positionsRad };
    for (const spec of this.specs) {
      if (positionsRad[spec.id] === undefined) {
        continue;
      }
      next[spec.id] = clampJointToSpec(positionsRad[spec.id], spec);
    }
    this.positionsRad = next;
    this.targetPositionsRad = { ...next };
    this.refreshTcp();
    this.publish();
  }

  commandTcp(
    positionMm: Vec3,
    eulerRad: Vec3,
    options: { silent?: boolean } = {}
  ): IkStatus {
    this.cancelMotion();
    const solved = this.solveToTcp(positionMm, eulerRad);
    if (!solved) {
      this.ikStatus = "unreachable";
      this.ikMessage = "Robot kinematics are not ready";
      this.publish();
      return this.ikStatus;
    }

    this.applyIkResult(solved, options.silent === true);
    return this.ikStatus;
  }

  startMoveToTcp(
    positionMm: Vec3,
    eulerRad: Vec3,
    durationMs: number
  ): IkStatus {
    if (this.speedScale <= 0) {
      this.ikStatus = "unreachable";
      this.ikMessage = "Motion blocked by protective stop";
      this.publish();
      return this.ikStatus;
    }
    const solved = this.solveToTcp(positionMm, eulerRad);
    if (!solved) {
      this.ikStatus = "unreachable";
      this.ikMessage = "Robot kinematics are not ready";
      this.publish();
      return this.ikStatus;
    }

    this.ikStatus = solved.status;
    this.ikMessage = ikMessage(solved.status);

    if (solved.status !== "valid" && solved.status !== "singularity") {
      this.motion = null;
      this.publish();
      return this.ikStatus;
    }

    this.targetPositionsRad = this.vectorToMap(solved.q);

    this.motion = {
      startQ: this.getOrderedPositions(),
      targetQ: solved.q,
      durationMs: Math.max(1, durationMs),
      elapsedMs: 0,
    };
    this.publish();
    return this.ikStatus;
  }

  startMoveJ(targetPositionsRad: Record<string, number>, durationMs: number): void {
    const targetQ = this.specs.map((spec) =>
      clampJointToSpec(
        targetPositionsRad[spec.id] ?? this.positionsRad[spec.id] ?? 0,
        spec
      )
    );
    this.targetPositionsRad = this.vectorToMap(targetQ);
    this.motion = {
      startQ: this.getOrderedPositions(),
      targetQ,
      durationMs: Math.max(1, durationMs),
      elapsedMs: 0,
    };
    this.publish();
  }

  step(timestampMs: number, dtMs: number): void {
    this.lastActuationDtSec = dtMs / 1000;
    const wasMoving = this.motion !== null;
    if (this.speedScale <= 0 && this.motion) {
      this.cancelMotion();
    }
    if (this.motion) {
      this.motion.elapsedMs += dtMs * this.speedScale;
      const t = easeInOut(this.motion.elapsedMs / this.motion.durationMs);
      const next = lerpJoints(this.motion.startQ, this.motion.targetQ, t);
      this.positionsRad = this.vectorToMap(next);
      this.refreshTcp();
      if (this.motion.elapsedMs >= this.motion.durationMs) {
        this.positionsRad = this.vectorToMap(this.motion.targetQ);
        this.refreshTcp();
        this.motion = null;
      }
    }
    this.sampleVelocities(timestampMs);
    this.sampleTcpVelocity(dtMs);
    const moving = wasMoving || this.motion !== null;
    if (!moving) {
      return;
    }
    if (this.motion === null || timestampMs - this.lastViewPublishMs >= 32) {
      this.lastViewPublishMs = timestampMs;
      this.publish();
    }
  }

  isMotionActive(): boolean {
    return this.motion !== null;
  }

  isReady(): boolean {
    return this.measureTcp !== null && this.specs.length > 0;
  }

  solveTcp(positionMm: Vec3, eulerRad: Vec3): IkStatus {
    const solved = this.solveToTcp(positionMm, eulerRad);
    if (!solved) {
      this.ikStatus = "unreachable";
      this.ikMessage = "Robot kinematics are not ready";
      this.publish();
      return this.ikStatus;
    }
    this.ikStatus = solved.status;
    this.ikMessage = ikMessage(solved.status);
    this.publish();
    return this.ikStatus;
  }

  cancelMotion(): void {
    this.motion = null;
    this.targetPositionsRad = { ...this.positionsRad };
  }

  completeMotion(): void {
    if (!this.motion) {
      return;
    }
    this.positionsRad = this.vectorToMap(this.motion.targetQ);
    this.motion = null;
    this.refreshTcp();
    this.publish();
  }

  nudgeTcp(deltaMm: Vec3, rollRad = 0): IkStatus {
    if (!this.tcp) {
      return "unreachable";
    }
    const current = tcpPositionMm(this.tcp);
    const nextEuler =
      rollRad === 0
        ? this.tcp.eulerRad
        : quaternionToEulerXyz(
            quaternionMultiply(
              this.tcp.quaternion,
              axisAngleToQuaternion([0, 0, 1], rollRad)
            )
          );
    return this.commandTcp(
      [
        current[0] + deltaMm[0],
        current[1] + deltaMm[1],
        current[2] + deltaMm[2],
      ],
      nextEuler,
      { silent: true }
    );
  }

  resetPose(): void {
    this.cancelMotion();
    const next: Record<string, number> = {};
    this.specs.forEach((spec, index) => {
      next[spec.id] = clampJointToSpec(this.homeRad(index), spec);
    });
    this.positionsRad = next;
    this.targetPositionsRad = { ...next };
    this.ikStatus = "idle";
    this.ikMessage = null;
    this.refreshTcp();
    this.emit(
      "info",
      "robotics.joints",
      SimulationEventCode.POSE_HOMED,
      "Robot returned to home pose"
    );
    this.publish();
  }

  sampleVelocities(
    timestampMs: number,
    nextPositions = this.positionsRad
  ): void {
    const dtSec = (timestampMs - this.lastSampleTimeMs) / 1000;
    if (dtSec > 0 && this.lastSampleTimeMs > 0) {
      for (const spec of this.specs) {
        const previous =
          this.previousPositionsRad[spec.id] ?? nextPositions[spec.id] ?? 0;
        const current = nextPositions[spec.id] ?? 0;
        this.velocitiesRadSec[spec.id] = (current - previous) / dtSec;
      }
    }
    this.previousPositionsRad = { ...nextPositions };
    this.lastSampleTimeMs = timestampMs;
  }

  getView = (): RobotView => this.view;

  subscribeView = (listener: () => void): (() => void) => {
    this.viewListeners.add(listener);
    return () => {
      this.viewListeners.delete(listener);
    };
  };

  getRobotTelemetry(): RobotTelemetry | null {
    if (this.specs.length === 0) {
      return null;
    }
    return {
      joints: this.specs.map((spec) => this.toJointTelemetry(spec)),
      controllerMode: this.speedScale <= 0 ? "protective_stop" : "auto",
      fault:
        this.overload ||
        this.ikStatus === "unreachable" ||
        this.ikStatus === "joint_limit",
    };
  }

  getLinearAccelMmSec2(): number {
    return this.linearAccelMmSec2;
  }

  getTcpTelemetry(): TcpTelemetry | null {
    if (!this.tcp) {
      return null;
    }
    return {
      positionMm: tcpPositionMm(this.tcp),
      orientationRad: this.tcp.eulerRad,
      linearVelocityMmSec: this.linearVelocityMmSec,
      angularVelocityRadSec: this.angularVelocityRadSec,
    };
  }

  getOrderedPositions(): number[] {
    return this.specs.map((spec) => this.positionsRad[spec.id] ?? 0);
  }

  getPositionsRad(): Record<string, number> {
    return this.positionsRad;
  }

  getTargetPositionsRad(): Record<string, number> {
    return this.targetPositionsRad;
  }

  getSpecs(): JointSpec[] {
    return this.specs;
  }

  getModel(): UrdfModelOption {
    return this.model;
  }

  getRobot = (): RobotTelemetry | null => this.getRobotTelemetry();

  getTcp = (): TcpTelemetry | null => this.getTcpTelemetry();

  private solveToTcp(positionMm: Vec3, eulerRad: Vec3) {
    if (!this.measureTcp || this.specs.length === 0) {
      return null;
    }
    const q0 = this.specs.map((spec) => this.positionsRad[spec.id] ?? 0);
    return solveDampedLeastSquaresIk({
      fk: (q) => this.measureTcp!(q) ?? EMPTY_TCP,
      q0,
      targetPositionM: metersFromMm(positionMm),
      targetQuaternion: eulerXyzToQuaternion(eulerRad),
      limits: this.specs.map((spec) => ({
        lowerRad: spec.lowerRad,
        upperRad: spec.upperRad,
      })),
      positionOnly: this.specs.length < 6,
    });
  }

  private applyIkResult(
    result: NonNullable<ReturnType<RobotRuntime["solveToTcp"]>>,
    silent: boolean
  ): void {
    const target = this.vectorToMap(result.q);
    this.targetPositionsRad = target;
    this.ikStatus = result.status;
    this.ikMessage = ikMessage(result.status);

    if (result.status === "valid" || result.status === "singularity") {
      this.positionsRad = { ...target };
      this.refreshTcp();
      if (!silent) {
        this.emit(
          result.status === "valid" ? "info" : "warning",
          "robotics.ik",
          result.status === "valid"
            ? SimulationEventCode.TCP_COMMANDED
            : SimulationEventCode.IK_SINGULARITY,
          result.status === "valid"
            ? "Cartesian target applied"
            : "Cartesian target applied near a singularity",
          {
            positionErrorMm: result.positionErrorM * 1000,
            orientationErrorRad: result.orientationErrorRad,
            iterations: result.iterations,
          }
        );
      }
    } else if (!silent) {
      this.emit(
        "warning",
        "robotics.ik",
        result.status === "joint_limit"
          ? SimulationEventCode.JOINT_LIMIT_REJECTED
          : SimulationEventCode.IK_UNREACHABLE,
        this.ikMessage ?? "IK failed",
        {
          positionErrorMm: result.positionErrorM * 1000,
          orientationErrorRad: result.orientationErrorRad,
        }
      );
    }

    this.publish();
  }

  private vectorToMap(values: number[]): Record<string, number> {
    return Object.fromEntries(
      this.specs.map((spec, index) => [spec.id, values[index] ?? 0])
    );
  }

  private sampleTcpVelocity(dtMs: number): void {
    const dtSec = dtMs / 1000;
    if (!this.tcp || !this.previousTcp || dtSec <= 0) {
      this.linearVelocityMmSec = 0;
      this.angularVelocityRadSec = 0;
      this.previousTcp = this.tcp;
      return;
    }
    const dx = (this.tcp.positionM[0] - this.previousTcp.positionM[0]) * 1000;
    const dy = (this.tcp.positionM[1] - this.previousTcp.positionM[1]) * 1000;
    const dz = (this.tcp.positionM[2] - this.previousTcp.positionM[2]) * 1000;
    this.linearVelocityMmSec = Math.hypot(dx, dy, dz) / dtSec;
    this.linearAccelMmSec2 =
      (this.linearVelocityMmSec - this.previousLinearVelocityMmSec) / dtSec;
    this.previousLinearVelocityMmSec = this.linearVelocityMmSec;
    const dRoll = this.tcp.eulerRad[0] - this.previousTcp.eulerRad[0];
    const dPitch = this.tcp.eulerRad[1] - this.previousTcp.eulerRad[1];
    const dYaw = this.tcp.eulerRad[2] - this.previousTcp.eulerRad[2];
    this.angularVelocityRadSec = Math.hypot(dRoll, dPitch, dYaw) / dtSec;
    this.previousTcp = this.tcp;
  }

  private refreshTcp(): void {
    if (!this.measureTcp || this.specs.length === 0) {
      this.tcp = null;
      return;
    }
    this.tcp = this.measureTcp(this.getOrderedPositions());
    if (this.tcp) {
      this.tcp = {
        ...this.tcp,
        eulerRad: quaternionToEulerXyz(this.tcp.quaternion),
      };
    }
  }

  private toJointTelemetry(spec: JointSpec): JointTelemetry {
    const positionRad = this.positionsRad[spec.id] ?? 0;
    const velocityRadSec = this.velocitiesRadSec[spec.id] ?? 0;
    const dtSec = Math.max(this.lastActuationDtSec, 1e-3);
    const actuation = deriveJointActuation({
      velocityRadSec,
      accelerationRadSec2: velocityRadSec / dtSec,
      payloadKg: this.payloadKg,
      overheat: this.overheat,
      overload: this.overload,
      previousTemperatureC: this.temperaturesC[spec.id] ?? 36,
      dtSec,
    });
    this.temperaturesC[spec.id] = actuation.temperatureC;
    const encoderBias = this.encoderMismatch ? 0.035 : 0;
    return {
      id: spec.id,
      positionRad: positionRad + encoderBias,
      velocityRadSec,
      accelerationRadSec2: velocityRadSec / dtSec,
      torqueNm: actuation.torqueNm,
      motorCurrentA: actuation.motorCurrentA,
      temperatureC: actuation.temperatureC,
      limitUtilization: jointLimitUtilization(positionRad, spec),
    };
  }

  private homeRad(index: number): number {
    return unitToRadians(this.model.homeDeg[index] ?? 0, "deg");
  }

  private emit(
    severity: "info" | "warning" | "error",
    source: string,
    eventCode: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.emitEvent?.(severity, source, eventCode, message, metadata);
  }

  private buildView(): RobotView {
    return {
      model: this.model,
      specs: this.specs,
      positionsRad: this.positionsRad,
      targetPositionsRad: this.targetPositionsRad,
      tcp: this.tcp,
      ikStatus: this.ikStatus,
      ikMessage: this.ikMessage,
      revision: this.revision,
    };
  }

  private publish(): void {
    this.revision += 1;
    this.view = this.buildView();
    this.viewListeners.forEach((listener) => listener());
  }
}

function ikMessage(status: IkStatus): string | null {
  switch (status) {
    case "valid":
      return "Target reachable";
    case "unreachable":
      return "Target unreachable";
    case "joint_limit":
      return "IK rejected at a joint limit";
    case "singularity":
      return "Near a singularity";
    default:
      return null;
  }
}
