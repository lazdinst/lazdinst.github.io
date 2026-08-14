import type {
  CameraTelemetry,
  Detection,
  PerceptionFrame,
  SimulationStepContext,
} from "@/simulation";
import { mixSeed, SeededRng, SimulationEventCode } from "@/simulation";
import type { Workpiece } from "@/workcell/types";
import { estimateDetections } from "../detections/estimateDetections";
import { samplePointCloud } from "../pointCloud/samplePointCloud";
import {
  DEFAULT_PERCEPTION_SETTINGS,
  MAX_POINT_COUNT,
  PERCEPTION_RATE_HZ,
  PERCEPTION_SEED_CHANNEL,
  type PerceptionSettings,
  type PointCloudBuffers,
} from "../types";

export interface PerceptionView {
  camera: CameraTelemetry | null;
  detections: Detection[];
  selectedDetectionId: string | null;
  pointCount: number;
  lastUpdateTimestampMs: number | null;
  settings: PerceptionSettings;
  revision: number;
}

type PartProvider = {
  getParts(): Workpiece[];
  getSelectedPartId(): string | null;
  selectPart(partId: string | null): void;
};

type EmitEvent = (
  severity: "info" | "warning" | "error",
  source: string,
  eventCode: string,
  message: string,
  metadata?: Record<string, unknown>
) => void;

export class PerceptionRuntime {
  private readonly parts: PartProvider;
  private readonly viewListeners = new Set<() => void>();
  private readonly buffers: PointCloudBuffers;
  private rng: SeededRng;
  private settings: PerceptionSettings = { ...DEFAULT_PERCEPTION_SETTINGS };
  private detections: Detection[] = [];
  private camera: CameraTelemetry | null = null;
  private selectedDetectionId: string | null = null;
  private lastUpdateTimestampMs: number | null = null;
  private revision = 0;
  private view: PerceptionView;
  private emitEvent: EmitEvent | null = null;
  private lastFrameEventMs = Number.NEGATIVE_INFINITY;
  private extraNoiseMm = 0;
  private extraDropout = 0;
  private extraLatencyMs = 0;
  private cameraOffline = false;
  private wasOffline = false;

  constructor(parts: PartProvider, seed: number) {
    this.parts = parts;
    this.rng = new SeededRng(mixSeed(seed, PERCEPTION_SEED_CHANNEL));
    this.buffers = createBuffers();
    this.capture(0);
    this.view = this.buildView();
  }

  setEventEmitter(emitEvent: EmitEvent): void {
    this.emitEvent = emitEvent;
  }

  setDegradation(options: {
    extraNoiseMm?: number;
    extraDropout?: number;
    extraLatencyMs?: number;
    cameraOffline?: boolean;
  }): void {
    this.extraNoiseMm = options.extraNoiseMm ?? 0;
    this.extraDropout = options.extraDropout ?? 0;
    this.extraLatencyMs = options.extraLatencyMs ?? 0;
    this.cameraOffline = options.cameraOffline ?? false;
  }

  reset(seed: number): void {
    this.rng = new SeededRng(mixSeed(seed, PERCEPTION_SEED_CHANNEL));
    this.settings = { ...DEFAULT_PERCEPTION_SETTINGS };
    this.lastUpdateTimestampMs = null;
    this.selectedDetectionId = null;
    this.wasOffline = false;
    if (this.cameraOffline) {
      this.detections = [];
      this.camera = null;
      this.publish();
      return;
    }
    this.capture(0);
    this.publish();
  }

  step(ctx: SimulationStepContext): void {
    if (this.cameraOffline) {
      this.detections = [];
      this.camera = null;
      this.lastUpdateTimestampMs = null;
      if (!this.wasOffline) {
        this.wasOffline = true;
        this.emitEvent?.(
          "error",
          "perception.camera",
          SimulationEventCode.CAMERA_OFFLINE,
          "RGB-D camera offline"
        );
        this.publish();
      }
      return;
    }
    this.wasOffline = false;
    const intervalMs = 1000 / PERCEPTION_RATE_HZ;
    if (
      this.lastUpdateTimestampMs !== null &&
      ctx.timestampMs - this.lastUpdateTimestampMs < intervalMs
    ) {
      return;
    }
    this.capture(ctx.timestampMs);
    if (ctx.timestampMs - this.lastFrameEventMs >= 1000) {
      this.lastFrameEventMs = ctx.timestampMs;
      this.emitEvent?.(
        "info",
        "perception.camera",
        SimulationEventCode.PERCEPTION_FRAME,
        `Perception frame ${this.detections.length} detections / ${this.buffers.count} points`,
        {
          detections: this.detections.length,
          pointCount: this.buffers.count,
        }
      );
    }
    this.publish();
  }

  getDetections(): Detection[] | null {
    if (this.cameraOffline || this.lastUpdateTimestampMs === null) {
      return null;
    }
    return this.detections;
  }

  getPointCloud(): PointCloudBuffers {
    return this.buffers;
  }

  getPerception = (): PerceptionFrame => ({
    camera: this.camera,
    detections: this.detections,
    selectedDetectionId: this.selectedDetectionId,
    pointCount: this.buffers.count,
    lastUpdateTimestampMs: this.lastUpdateTimestampMs,
  });

  getView = (): PerceptionView => this.view;

  subscribeView = (listener: () => void): (() => void) => {
    this.viewListeners.add(listener);
    return () => {
      this.viewListeners.delete(listener);
    };
  };

  patchSettings(patch: Partial<PerceptionSettings>): void {
    this.settings = { ...this.settings, ...patch };
    this.publish();
  }

  selectDetection(detectionId: string | null): void {
    this.selectedDetectionId = detectionId;
    const detection = this.detections.find((item) => item.id === detectionId);
    this.parts.selectPart(detection?.partId ?? null);
    this.publish();
  }

  syncSelectionFromPart(partId: string | null): void {
    const detection = this.detections.find((item) => item.partId === partId);
    const nextId = detection?.id ?? null;
    if (nextId === this.selectedDetectionId) {
      return;
    }
    this.selectedDetectionId = nextId;
    this.publish();
  }

  private capture(timestampMs: number): void {
    const parts = this.parts.getParts();
    const noiseMm = this.settings.noiseMm + this.extraNoiseMm;
    const dropout = Math.min(0.85, this.settings.dropout + this.extraDropout);
    this.detections = estimateDetections(parts, this.rng, noiseMm);
    samplePointCloud(parts, this.rng, this.buffers, {
      density: this.settings.density,
      noiseMm,
      dropout,
    });
    const invalid = dropout * 100 + Math.min(12, noiseMm * 1.4);
    this.camera = {
      fps: PERCEPTION_RATE_HZ,
      exposureMs: 8 + noiseMm * 0.4,
      gainDb: 4 + dropout * 10,
      latencyMs: 28 + noiseMm * 2 + this.extraLatencyMs,
      pointsObserved: this.buffers.count,
      invalidDepthPercent: invalid,
    };
    this.lastUpdateTimestampMs = timestampMs;
    this.syncSelectionFromPart(this.parts.getSelectedPartId());
  }

  private buildView(): PerceptionView {
    return {
      camera: this.camera,
      detections: this.detections,
      selectedDetectionId: this.selectedDetectionId,
      pointCount: this.buffers.count,
      lastUpdateTimestampMs: this.lastUpdateTimestampMs,
      settings: this.settings,
      revision: this.revision,
    };
  }

  private publish(): void {
    this.revision += 1;
    this.view = this.buildView();
    this.viewListeners.forEach((listener) => listener());
  }
}

function createBuffers(): PointCloudBuffers {
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
