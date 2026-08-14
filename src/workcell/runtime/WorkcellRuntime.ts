import type {
  Detection,
  PickPhase,
  Quaternion,
  SimulationStepContext,
  ToolTelemetry,
  Vec3,
  WorkcellTelemetry,
} from "@/simulation";
import { DEFAULT_SIMULATION_SEED, SimulationEventCode } from "@/simulation";
import {
  inverseRotateVectorByQuaternion,
  quaternionConjugate,
  quaternionMultiply,
  rotateVectorByQuaternion,
  type IkStatus,
  type TcpPose,
} from "@/robotics";
import type { PickMachineState, WorkcellLayout, Workpiece } from "../types";
import { DEFAULT_WORKCELL_LAYOUT, destinationSlotPosition } from "../layout";
import { applyOcclusion, generateParts } from "../parts/generateParts";
import { workpieceToDetection } from "../parts/workpieceToDetection";
import { createPickState, reducePick } from "../picking/reducePick";
import { placeTarget, poseToCommand, topDownGrasp } from "../picking/graspPose";
import { VacuumTool } from "../tooling/VacuumTool";
import type { PoseSource, RobotMotionPort } from "./ports";

export interface WorkcellView {
  layout: WorkcellLayout;
  parts: Workpiece[];
  selectedPartId: string | null;
  pick: PickMachineState;
  tool: ToolTelemetry;
  message: string | null;
  revision: number;
}

interface MotionGoal {
  positionMm: Vec3;
  eulerRad: Vec3;
  durationMs: number;
}

const DETECT_TIMEOUT_MS = 900;
const GRASP_HOLD_MS = 420;
const VERIFY_HOLD_MS = 220;
const FAIL_HOLD_MS = 240;
const APPROACH_MS = 720;
const DESCEND_MS = 480;
const LIFT_MS = 520;
const TRANSFER_MS = 880;
const PLACE_MS = 500;
const RETRACT_MS = 520;

type EmitEvent = (
  severity: "info" | "warning" | "error",
  source: string,
  eventCode: string,
  message: string,
  metadata?: Record<string, unknown>
) => void;

export interface WorkcellConfig {
  partCount?: number;
  vacuumLeak?: number;
  graspSlipBias?: number;
}

type FaultQuery = (id: "motion_timeout" | "grasp_slip" | "vacuum_loss") => boolean;

export class WorkcellRuntime {
  private readonly layout: WorkcellLayout;
  private readonly robot: RobotMotionPort;
  private readonly vacuum = new VacuumTool();
  private readonly viewListeners = new Set<() => void>();
  private poseSource: PoseSource | null = null;
  private emitEvent: EmitEvent | null = null;
  private faultQuery: FaultQuery | null = null;
  private partCount = 6;
  private vacuumLeak = 0;
  private graspSlipBias = 0;
  private parts: Workpiece[] = [];
  private selectedPartId: string | null = null;
  private pick: PickMachineState = createPickState();
  private detections: Detection[] = [];
  private graspPose: TcpPose | null = null;
  private approachPose: TcpPose | null = null;
  private placePose: TcpPose | null = null;
  private placeApproachPose: TcpPose | null = null;
  private graspQuality = 0;
  private motionQueue: MotionGoal[] = [];
  private motionStarted = false;
  private graspOffset: Vec3 | null = null;
  private graspRelativeQuat: Quaternion | null = null;
  private message: string | null = null;
  private revision = 0;
  private view: WorkcellView;
  private lastPublishMs = Number.NEGATIVE_INFINITY;

  constructor(
    robot: RobotMotionPort,
    layout: WorkcellLayout = DEFAULT_WORKCELL_LAYOUT,
    seed = DEFAULT_SIMULATION_SEED
  ) {
    this.robot = robot;
    this.layout = layout;
    this.parts = generateParts(seed, layout, this.partCount);
    this.view = this.buildView();
  }

  setEventEmitter(emitEvent: EmitEvent): void {
    this.emitEvent = emitEvent;
  }

  setPoseSource(source: PoseSource | null): void {
    this.poseSource = source;
  }

  setFaultQuery(query: FaultQuery | null): void {
    this.faultQuery = query;
  }

  configure(config: WorkcellConfig): void {
    this.partCount = config.partCount ?? 6;
    this.vacuumLeak = config.vacuumLeak ?? 0;
    this.graspSlipBias = config.graspSlipBias ?? 0;
  }

  abortForSafety(): void {
    if (this.pick.phase === "idle") {
      return;
    }
    this.dispatch({ type: "FAIL", reason: "safety protective stop" }, this.pick.phaseEnteredMs);
  }

  getGraspedMassKg(): number {
    return this.parts
      .filter((part) => part.status === "grasped")
      .reduce((sum, part) => sum + part.massKg, 0);
  }

  getVacuum() {
    return this.vacuum;
  }

  reset(seed: number): void {
    this.parts = generateParts(seed, this.layout, this.partCount);
    this.selectedPartId = null;
    this.pick = createPickState();
    this.detections = [];
    this.graspPose = null;
    this.approachPose = null;
    this.placePose = null;
    this.placeApproachPose = null;
    this.motionQueue = [];
    this.motionStarted = false;
    this.graspOffset = null;
    this.graspRelativeQuat = null;
    this.vacuum.reset();
    this.vacuum.setLeak(this.vacuumLeak);
    this.vacuum.setSlip(this.graspSlipBias > 0);
    this.message = null;
    this.emit(
      "info",
      "workcell.parts",
      SimulationEventCode.PARTS_SPAWNED,
      `Spawned ${this.parts.length} workpieces`,
      { count: this.parts.length, seed }
    );
    this.publish();
  }

  startAuto(): void {
    this.dispatch({ type: "START_AUTO" }, 0);
  }

  startStep(): void {
    if (this.pick.phase === "idle") {
      this.dispatch({ type: "START_STEP" }, 0);
      return;
    }
    if (this.robot.isMotionActive()) {
      this.robot.completeMotion();
      return;
    }
    this.dispatch({ type: "PHASE_DONE" }, this.pick.phaseEnteredMs);
  }

  selectPart(partId: string | null): void {
    this.selectedPartId = partId;
    this.parts.forEach((part) => {
      if (part.status === "selected" && part.id !== partId) {
        part.status = "in_tote";
      }
      if (part.id === partId && part.status === "in_tote") {
        part.status = "selected";
      }
    });
    if (partId) {
      this.emit(
        "info",
        "workcell.selection",
        SimulationEventCode.PART_SELECTED,
        `Selected ${partId}`,
        { partId }
      );
    }
    this.publish();
  }

  step(ctx: SimulationStepContext): void {
    const contacting = this.parts.some((part) => part.status === "grasped");
    this.vacuum.setLeak(
      Math.max(this.vacuumLeak, this.faultQuery?.("vacuum_loss") ? 0.78 : 0)
    );
    this.vacuum.setSlip(
      this.graspSlipBias > 0 || this.faultQuery?.("grasp_slip") === true
    );
    this.vacuum.step(ctx.dtMs, contacting, this.graspQuality);
    if (this.vacuum.consumeSlip()) {
      this.emit(
        "warning",
        "workcell.tool",
        SimulationEventCode.SLIP_DETECTED,
        "Vacuum seal lost; slip detected",
        { partId: this.pick.targetPartId }
      );
    }
    if (this.vacuum.isLow() && ctx.stepCount % 30 === 0) {
      this.emit(
        "warning",
        "workcell.tool",
        SimulationEventCode.VACUUM_LOW,
        "Vacuum pressure above seal band",
        { pressureKPa: this.vacuum.getTelemetry().pressureKPa }
      );
    }
    this.followGraspedPart();
    this.stepPhase(ctx);
    if (ctx.timestampMs - this.lastPublishMs >= 32) {
      this.lastPublishMs = ctx.timestampMs;
      this.publish();
    }
  }

  isBusy(): boolean {
    return this.pick.phase !== "idle";
  }

  getView = (): WorkcellView => this.view;

  subscribeView = (listener: () => void): (() => void) => {
    this.viewListeners.add(listener);
    return () => {
      this.viewListeners.delete(listener);
    };
  };

  getWorkcell = (): WorkcellTelemetry => this.toTelemetry();

  getTool = (): ToolTelemetry => ({
    kind: "vacuum",
    gripper: null,
    vacuum: this.vacuum.getTelemetry(),
  });

  getParts(): Workpiece[] {
    return this.parts;
  }

  getLayout(): WorkcellLayout {
    return this.layout;
  }

  getSelectedPartId(): string | null {
    return this.selectedPartId;
  }

  getPickPhase(): PickPhase {
    return this.pick.phase;
  }

  private stepPhase(ctx: SimulationStepContext): void {
    const elapsed = ctx.timestampMs - this.pick.phaseEnteredMs;
    switch (this.pick.phase) {
      case "idle":
        return;
      case "acquire":
        if (!this.robot.isReady()) {
          this.message = "Waiting for robot kinematics";
          return;
        }
        if (this.remainingParts().length === 0) {
          this.message = "Tote empty";
          this.pick = { ...this.pick, phase: "idle", auto: false };
          this.publish();
          return;
        }
        this.message = "Acquiring scene";
        this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        return;
      case "detect": {
        const detections = this.readDetections();
        if (!detections) {
          if (elapsed > DETECT_TIMEOUT_MS) {
            this.dispatch({ type: "FAIL", reason: "perception timeout" }, ctx.timestampMs);
          }
          this.message = "Waiting for perception";
          return;
        }
        this.detections = detections.filter((detection) =>
          this.remainingParts().some((part) => part.id === detection.partId)
        );
        this.emit(
          "info",
          "workcell.perception",
          SimulationEventCode.OBJECT_DETECTED,
          `Detected ${this.detections.length} objects`,
          { count: this.detections.length }
        );
        this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        return;
      }
      case "estimate_pose":
        this.emit(
          "info",
          "workcell.perception",
          SimulationEventCode.POSE_ESTIMATED,
          "6D poses estimated",
          { count: this.detections.length }
        );
        this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        return;
      case "plan_grasp": {
        const planned = this.planGrasp();
        if (!planned) {
          this.dispatch({ type: "FAIL", reason: "no graspable part" }, ctx.timestampMs);
          return;
        }
        this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        return;
      }
      case "plan_motion": {
        if (!this.approachPose) {
          this.dispatch({ type: "FAIL", reason: "missing approach pose" }, ctx.timestampMs);
          return;
        }
        const command = poseToCommand(this.approachPose);
        const status = this.robot.solveTcp(command.positionMm, command.eulerRad);
        if (!isReachable(status)) {
          this.dispatch({ type: "FAIL", reason: "unreachable grasp" }, ctx.timestampMs);
          return;
        }
        this.emit(
          "info",
          "workcell.motion",
          SimulationEventCode.MOTION_PLAN_READY,
          "Approach motion planned",
          { partId: this.pick.targetPartId }
        );
        this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        return;
      }
      case "approach": {
        if (this.motionQueue.length === 0 && !this.motionStarted) {
          this.queueApproach();
        }
        this.serviceMotion(ctx, () => {
          this.emit(
            "info",
            "workcell.motion",
            SimulationEventCode.APPROACH_COMPLETE,
            "Approach complete",
            { partId: this.pick.targetPartId }
          );
          this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        });
        return;
      }
      case "grasp":
        if (elapsed === 0 || !this.vacuum.getTelemetry().enabled) {
          this.vacuum.enable();
          this.emit(
            "info",
            "workcell.tool",
            SimulationEventCode.VACUUM_ENABLED,
            "Vacuum enabled"
          );
          this.attachTarget();
        }
        if (elapsed >= GRASP_HOLD_MS) {
          this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        }
        return;
      case "verify":
        if (elapsed >= VERIFY_HOLD_MS) {
          if (this.vacuum.getTelemetry().objectSecured) {
            this.emit(
              "info",
              "workcell.tool",
              SimulationEventCode.GRASP_CONFIRMED,
              "Grasp confirmed",
              { partId: this.pick.targetPartId, quality: this.graspQuality }
            );
            this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
            return;
          }
          this.emit(
            "warning",
            "workcell.tool",
            SimulationEventCode.GRASP_FAILED,
            "Grasp verification failed",
            { partId: this.pick.targetPartId, quality: this.graspQuality }
          );
          this.dispatch({ type: "FAIL", reason: "grasp failure" }, ctx.timestampMs);
        }
        return;
      case "lift":
        this.runSingleMove(ctx, this.liftPose(), LIFT_MS);
        return;
      case "transfer":
        this.runSingleMove(ctx, this.placeApproachPose, TRANSFER_MS);
        return;
      case "place":
        this.runSingleMove(ctx, this.placePose, PLACE_MS, () => {
          this.vacuum.disable();
          this.detachTarget("placed");
        });
        return;
      case "retract":
        this.runSingleMove(ctx, this.retractPose(), RETRACT_MS);
        return;
      case "complete":
        this.pick = { ...this.pick, cycleIndex: this.pick.cycleIndex + 1 };
        this.emit(
          "info",
          "workcell.pick",
          SimulationEventCode.CYCLE_COMPLETE,
          `Cycle ${this.pick.cycleIndex} complete`,
          { cycleIndex: this.pick.cycleIndex }
        );
        this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        return;
      case "failed":
        this.message = this.pick.lastFailure;
        if (elapsed >= FAIL_HOLD_MS) {
          this.emit(
            "error",
            "workcell.pick",
            SimulationEventCode.PICK_FAILED,
            this.pick.lastFailure ?? "Pick failed",
            { reason: this.pick.lastFailure, partId: this.pick.targetPartId }
          );
          this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        }
        return;
      case "recovering":
        this.emit(
          "warning",
          "workcell.pick",
          SimulationEventCode.RECOVERY_STARTED,
          "Pick recovery started",
          { reason: this.pick.lastFailure }
        );
        this.dropGrasped("lost");
        this.vacuum.reset();
        this.vacuum.setLeak(this.vacuumLeak);
        this.robot.cancelMotion();
        this.robot.resetPose();
        this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
        return;
      default:
        return;
    }
  }

  private runSingleMove(
    ctx: SimulationStepContext,
    pose: TcpPose | null,
    durationMs: number,
    onComplete?: () => void
  ): void {
    if (!pose) {
      this.dispatch({ type: "FAIL", reason: "missing motion pose" }, ctx.timestampMs);
      return;
    }
    if (this.motionQueue.length === 0 && !this.motionStarted) {
      const command = poseToCommand(pose);
      this.motionQueue = [{ ...command, durationMs }];
    }
    this.serviceMotion(ctx, () => {
      onComplete?.();
      this.dispatch({ type: "PHASE_DONE" }, ctx.timestampMs);
    });
  }

  private serviceMotion(
    ctx: SimulationStepContext,
    onComplete: () => void
  ): void {
    if (this.robot.isMotionActive()) {
      if (this.faultQuery?.("motion_timeout")) {
        this.robot.cancelMotion();
        this.dispatch({ type: "FAIL", reason: "motion timeout" }, ctx.timestampMs);
      }
      return;
    }
    const next = this.motionQueue.shift();
    if (next) {
      const status = this.robot.startMoveToTcp(
        next.positionMm,
        next.eulerRad,
        next.durationMs
      );
      if (!isReachable(status)) {
        this.dispatch({ type: "FAIL", reason: "motion unreachable" }, ctx.timestampMs);
        return;
      }
      this.motionStarted = true;
      return;
    }
    if (this.motionStarted) {
      this.motionStarted = false;
      onComplete();
    }
  }

  private queueApproach(): void {
    if (!this.approachPose || !this.graspPose) {
      return;
    }
    this.motionQueue = [
      { ...poseToCommand(this.approachPose), durationMs: APPROACH_MS },
      { ...poseToCommand(this.graspPose), durationMs: DESCEND_MS },
    ];
  }

  private planGrasp(): boolean {
    const remaining = this.remainingParts();
    const preferred =
      remaining.find((part) => part.id === this.selectedPartId) ??
      remaining
        .slice()
        .sort((a, b) => a.occlusion - b.occlusion || b.friction - a.friction)[0];
    if (!preferred) {
      return false;
    }
    const grasp = topDownGrasp(preferred, this.layout.approachClearanceM);
    const placedCount = this.parts.filter((part) => part.status === "placed").length;
    const slot = destinationSlotPosition(this.layout, placedCount);
    const place = placeTarget(slot, preferred, this.layout.approachClearanceM);
    this.pick = { ...this.pick, targetPartId: preferred.id };
    this.selectedPartId = preferred.id;
    this.graspPose = grasp.grasp;
    this.approachPose = grasp.approach;
    this.placePose = place.place;
    this.placeApproachPose = place.approach;
    this.graspQuality = grasp.quality;
    preferred.status = "selected";
    this.emit(
      "info",
      "workcell.grasp",
      SimulationEventCode.GRASP_SELECTED,
      `Grasp selected for ${preferred.sku}`,
      { partId: preferred.id, quality: grasp.quality }
    );
    return true;
  }

  private attachTarget(): void {
    const part = this.parts.find((item) => item.id === this.pick.targetPartId);
    const tcp = this.robot.getTcp();
    if (!part || !tcp) {
      return;
    }
    const delta: Vec3 = [
      part.positionM[0] - tcp.positionM[0],
      part.positionM[1] - tcp.positionM[1],
      part.positionM[2] - tcp.positionM[2],
    ];
    this.graspOffset = inverseRotateVectorByQuaternion(tcp.quaternion, delta);
    this.graspRelativeQuat = quaternionMultiply(
      quaternionConjugate(tcp.quaternion),
      part.quaternion
    );
    part.status = "grasped";
    this.emit(
      "info",
      "workcell.tool",
      SimulationEventCode.GRIPPER_CONTACT,
      "End effector contact",
      { partId: part.id }
    );
  }

  private followGraspedPart(): void {
    const part = this.parts.find((item) => item.status === "grasped");
    const tcp = this.robot.getTcp();
    if (!part || !tcp || !this.graspOffset || !this.graspRelativeQuat) {
      return;
    }
    const worldOffset = rotateVectorByQuaternion(tcp.quaternion, this.graspOffset);
    part.positionM = [
      tcp.positionM[0] + worldOffset[0],
      tcp.positionM[1] + worldOffset[1],
      tcp.positionM[2] + worldOffset[2],
    ];
    part.quaternion = quaternionMultiply(tcp.quaternion, this.graspRelativeQuat);
  }

  private detachTarget(status: "placed" | "lost"): void {
    const part = this.parts.find((item) => item.id === this.pick.targetPartId);
    if (part) {
      part.status = status;
      if (status === "placed" && this.placePose) {
        const pos = this.placePose.positionM;
        part.positionM = [pos[0], pos[1], pos[2] - part.dimensionsM[2] / 2];
      }
    }
    this.graspOffset = null;
    this.graspRelativeQuat = null;
    applyOcclusion(this.parts);
  }

  private dropGrasped(status: "lost"): void {
    this.parts.forEach((part) => {
      if (part.status === "grasped") {
        part.status = status;
      }
      if (part.status === "selected") {
        part.status = "in_tote";
      }
    });
    this.graspOffset = null;
    this.graspRelativeQuat = null;
  }

  private liftPose(): TcpPose | null {
    const tcp = this.robot.getTcp();
    if (!tcp) {
      return this.approachPose;
    }
    return {
      ...tcp,
      positionM: [
        tcp.positionM[0],
        tcp.positionM[1],
        tcp.positionM[2] + this.layout.approachClearanceM,
      ],
      eulerRad: tcp.eulerRad,
    };
  }

  private retractPose(): TcpPose | null {
    if (!this.placeApproachPose) {
      return this.liftPose();
    }
    return this.placeApproachPose;
  }

  private remainingParts(): Workpiece[] {
    return this.parts.filter(
      (part) => part.status === "in_tote" || part.status === "selected"
    );
  }

  private readDetections(): Detection[] | null {
    if (this.poseSource) {
      return this.poseSource.getDetections();
    }
    return this.remainingParts().map((part) => workpieceToDetection(part));
  }

  private dispatch(
    event: Parameters<typeof reducePick>[1],
    timestampMs: number
  ): void {
    const previous = this.pick.phase;
    this.pick = reducePick(this.pick, event, timestampMs);
    if (this.pick.phase !== previous) {
      this.motionQueue = [];
      this.motionStarted = false;
      this.message = this.pick.phase;
      if (this.pick.phase === "acquire") {
        this.emit(
          "info",
          "workcell.pick",
          SimulationEventCode.CYCLE_STARTED,
          `Cycle ${this.pick.cycleIndex + 1} started`
        );
      }
      this.publish();
    }
  }

  private toTelemetry(): WorkcellTelemetry {
    return {
      partCount: this.parts.length,
      remainingCount: this.remainingParts().length,
      placedCount: this.parts.filter((part) => part.status === "placed").length,
      selectedPartId: this.selectedPartId,
      targetPartId: this.pick.targetPartId,
      pickPhase: this.pick.phase,
      autoPick: this.pick.auto,
      cycleIndex: this.pick.cycleIndex,
      lastFailure: this.pick.lastFailure,
      parts: this.parts.map((part) => ({
        id: part.id,
        sku: part.sku,
        geometryType: part.geometryType,
        positionM: part.positionM,
        quaternion: part.quaternion,
        dimensionsM: part.dimensionsM,
        massKg: part.massKg,
        material: part.material,
        friction: part.friction,
        status: part.status,
        visibility: part.visibility,
        occlusion: part.occlusion,
        color: part.color,
      })),
    };
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

  private buildView(): WorkcellView {
    return {
      layout: this.layout,
      parts: this.parts,
      selectedPartId: this.selectedPartId,
      pick: this.pick,
      tool: this.getTool(),
      message: this.message,
      revision: this.revision,
    };
  }

  private publish(): void {
    this.revision += 1;
    this.view = this.buildView();
    this.viewListeners.forEach((listener) => listener());
  }
}

function isReachable(status: IkStatus): boolean {
  return status === "valid" || status === "singularity";
}
