import {
  EventLog,
  RingBuffer,
  SeededRng,
  SimulationClock,
  createSimulationEvent,
  mixSeed,
  type EventSeverity,
  type PlaybackMode,
  type SimulationEvent,
} from "@/simulation";
import type {
  Asset,
  AssetStatus,
  CourseOfAction,
  FleetFaultId,
  FleetScenario,
  FleetSnapshot,
  FleetStats,
  FleetView,
  LatLng,
  Mission,
  Objective,
  OperatingArea,
  PlannerState,
  WorkOrder,
} from "../types";
import { ASSET_SEEDS, type AssetSeed } from "../data/assets";
import { kindProfile, type KindProfile } from "../data/kinds";
import { OPERATING_AREA } from "../data/operatingArea";
import { findFleetFault } from "../faults/catalog";
import { haversineM } from "../geo/haversine";
import {
  computeHealthScore,
  hoursForTick,
  isMaintenanceDue,
} from "../maintenance/deriveMaintenance";
import { advanceAlongPath } from "../motion/advanceAlongPath";
import { energyForStep } from "../motion/energyModel";
import { FleetPlanner } from "../planning/FleetPlanner";
import { terrainAt } from "../planning/terrainGrid";
import { findFleetScenario } from "../scenarios/catalog";
import { deriveSensors, meanSensorHealth } from "../sensors/deriveSensors";
import { deriveLink, isLinkLost } from "../sensors/linkModel";
import { FleetEventCode } from "./events";

export interface FleetRuntimeConfig {
  dtMs: number;
  historyHz: number;
  historyDurationMs: number;
  eventCapacity: number;
  maxStepsPerAdvance: number;
  scenarioId: string;
  /** Samples kept for per-asset and fleet sparklines. */
  sparklineSamples: number;
}

export const DEFAULT_FLEET_CONFIG: FleetRuntimeConfig = {
  dtMs: 100,
  historyHz: 1,
  historyDurationMs: 6 * 60_000,
  eventCapacity: 600,
  maxStepsPerAdvance: 60,
  scenarioId: "nominal",
  sparklineSamples: 40,
};

export const LOW_ENERGY_PCT = 25;
export const CHARGE_UNTIL_PCT = 60;
export const DISPATCH_MIN_ENERGY_PCT = 35;
const LINK_DEGRADED_QUALITY = 0.35;
const WORK_ORDER_MEAN_INTERVAL_MS = 20 * 60_000;

const RANDOM_WORK_ORDERS: { title: string; severity: WorkOrder["severity"] }[] = [
  { title: "Prop balance drifting", severity: "low" },
  { title: "Gimbal backlash", severity: "low" },
  { title: "Battery cell imbalance", severity: "medium" },
  { title: "Lidar window scoring", severity: "medium" },
  { title: "Drive motor bearing noise", severity: "high" },
  { title: "Seal weep on hull port", severity: "medium" },
];

export interface DispatchResult {
  ok: boolean;
  reason?: string;
  missionId?: string;
}

interface AssetState extends Asset {
  profile: KindProfile;
  rng: SeededRng;
  movingForS: number;
  /** Timestamp of the last sparkline sample. */
  lastSampleMs: number;
  linkLostFlagged: boolean;
  linkDegradedFlagged: boolean;
  maintenanceDueFlagged: boolean;
  lowEnergyFlagged: boolean;
  charging: boolean;
}

interface MissionState extends Mission {
  loopStartIndex: number | null;
}

const ENGINE = "fleet.runtime";
const PLANNER = "fleet.planner";
const MISSION = "fleet.mission";
const LINK = "fleet.link";
const MAINT = "fleet.maintenance";
const POWER = "fleet.power";
const FAULT = "fleet.fault";

export class FleetRuntime {
  private readonly config: FleetRuntimeConfig;
  private readonly area: OperatingArea;
  private readonly clock: SimulationClock;
  private readonly history: RingBuffer<FleetSnapshot>;
  private readonly eventLog: EventLog;
  private readonly planner: FleetPlanner;
  private readonly viewListeners = new Set<() => void>();
  private readonly snapshotListeners = new Set<() => void>();
  private readonly eventListeners = new Set<() => void>();
  private readonly historyIntervalSteps: number;

  private scenario: FleetScenario;
  private assets = new Map<string, AssetState>();
  private missions = new Map<string, MissionState>();
  private plannerState: PlannerState = emptyPlanner();
  private selectedAssetId: string | null = null;
  private accumulatorMs = 0;
  private stepCount = 0;
  private eventSeq = 0;
  private missionSeq = 0;
  private orderSeq = 0;
  private playbackMode: PlaybackMode = "live";
  private scrubTimestampMs: number | null = null;
  private linkHistory: number[] = [];
  private energyHistory: number[] = [];
  private lastStatsSampleMs = -Infinity;
  private liveSnapshot: FleetSnapshot;
  private displayedSnapshot: FleetSnapshot;
  private viewSnapshot: FleetView;
  private eventsSnapshot: SimulationEvent[] = [];

  constructor(config: Partial<FleetRuntimeConfig> = {}, area: OperatingArea = OPERATING_AREA) {
    this.config = { ...DEFAULT_FLEET_CONFIG, ...config };
    this.area = area;
    this.clock = new SimulationClock(this.config.dtMs);
    this.eventLog = new EventLog(this.config.eventCapacity);
    this.planner = new FleetPlanner(area);
    this.scenario = findFleetScenario(this.config.scenarioId);
    const capacity = Math.max(
      1,
      Math.ceil((this.config.historyDurationMs / 1000) * this.config.historyHz)
    );
    this.history = new RingBuffer<FleetSnapshot>(capacity);
    this.historyIntervalSteps = Math.max(
      1,
      Math.round(1000 / this.config.dtMs / this.config.historyHz)
    );
    this.seedFleet();
    this.liveSnapshot = this.buildSnapshot();
    this.displayedSnapshot = this.liveSnapshot;
    this.viewSnapshot = this.buildView();
  }

  // ---------------------------------------------------------------- lifecycle

  start(): void {
    const previous = this.clock.getStatus();
    if (!this.clock.start()) return;
    this.pushEvent(
      "info",
      ENGINE,
      previous === "paused" ? FleetEventCode.SIM_RESUMED : FleetEventCode.SIM_STARTED,
      previous === "paused" ? "Fleet simulation resumed" : "Fleet simulation started"
    );
    this.publishAll();
  }

  pause(): void {
    if (!this.clock.pause()) return;
    this.pushEvent("info", ENGINE, FleetEventCode.SIM_PAUSED, "Fleet simulation paused");
    this.publishAll();
  }

  reset(): void {
    const wasRunning = this.clock.isRunning();
    this.clock.reset();
    this.accumulatorMs = 0;
    this.stepCount = 0;
    this.eventSeq = 0;
    this.missionSeq = 0;
    this.orderSeq = 0;
    this.history.clear();
    this.eventLog.clear();
    this.playbackMode = "live";
    this.scrubTimestampMs = null;
    this.linkHistory = [];
    this.energyHistory = [];
    this.lastStatsSampleMs = -Infinity;
    this.plannerState = emptyPlanner();
    this.seedFleet();
    this.pushEvent("info", ENGINE, FleetEventCode.SIM_RESET, "Fleet simulation reset", {
      seed: this.scenario.seed,
      scenario: this.scenario.id,
    });
    this.liveSnapshot = this.buildSnapshot();
    this.displayedSnapshot = this.liveSnapshot;
    if (wasRunning) this.clock.start();
    this.publishAll();
  }

  setScenario(scenarioId: string): void {
    this.scenario = findFleetScenario(scenarioId);
    this.config.scenarioId = this.scenario.id;
    this.reset();
    this.pushEvent(
      "info",
      ENGINE,
      FleetEventCode.SCENARIO_LOADED,
      `Scenario loaded: ${this.scenario.name}`,
      { scenarioId: this.scenario.id }
    );
    this.publishAll();
  }

  setTimeScale(timeScale: number): void {
    this.clock.setTimeScale(timeScale);
    this.publishView();
  }

  advance(wallDeltaMs: number): number {
    if (!this.clock.isRunning() || wallDeltaMs <= 0) return 0;
    this.accumulatorMs += wallDeltaMs * this.clock.getTimeScale();
    let steps = 0;
    while (this.accumulatorMs >= this.config.dtMs && steps < this.config.maxStepsPerAdvance) {
      this.step();
      this.accumulatorMs -= this.config.dtMs;
      steps += 1;
    }
    if (steps >= this.config.maxStepsPerAdvance) this.accumulatorMs = 0;
    if (steps > 0) this.publishAll();
    return steps;
  }

  /** Runs exactly `count` fixed steps regardless of clock status. Used by tests. */
  stepMany(count: number): void {
    const wasRunning = this.clock.isRunning();
    if (!wasRunning) this.clock.start();
    for (let i = 0; i < count; i += 1) this.step();
    if (!wasRunning) this.clock.pause();
    this.publishAll();
  }

  seek(timestampMs: number): void {
    if (this.clock.isRunning()) this.clock.pause();
    this.playbackMode = "scrub";
    this.scrubTimestampMs = timestampMs;
    this.displayedSnapshot =
      findFleetSnapshotAt(this.history.toArray(), timestampMs) ?? this.liveSnapshot;
    this.pushEvent("debug", ENGINE, FleetEventCode.PLAYBACK_SEEK, `Seek ${timestampMs.toFixed(0)} ms`, {
      timestampMs,
    });
    this.publishAll();
  }

  resumeLive(): void {
    this.playbackMode = "live";
    this.scrubTimestampMs = null;
    this.displayedSnapshot = this.liveSnapshot;
    this.publishAll();
  }

  // ---------------------------------------------------------------- selection

  selectAsset(assetId: string | null): void {
    if (assetId !== null && !this.assets.has(assetId)) return;
    if (this.selectedAssetId === assetId) return;
    this.selectedAssetId = assetId;
    const asset = assetId ? this.assets.get(assetId) : null;
    if (asset) {
      this.pushEvent("debug", ENGINE, FleetEventCode.ASSET_SELECTED, `Selected ${asset.callsign}`, {
        assetId,
      });
    }
    this.refreshLive();
  }

  // ---------------------------------------------------------------- planning

  planMission(assetId: string, objective: Objective): CourseOfAction[] {
    const asset = this.assets.get(assetId);
    if (!asset) return [];
    const candidates = this.planner.generateCoas(this.publicAsset(asset), objective, this.scenario);
    const recommended = candidates.find((coa) => coa.recommended) ?? null;
    this.plannerState = {
      assetId,
      objective,
      candidates,
      selectedCoaId: recommended?.id ?? candidates.find((c) => c.feasible)?.id ?? null,
      generatedAtMs: this.clock.getSimTimeMs(),
    };
    const feasible = candidates.filter((coa) => coa.feasible).length;
    this.pushEvent(
      feasible === 0 ? "warning" : "info",
      PLANNER,
      FleetEventCode.COA_GENERATED,
      feasible === 0
        ? `${asset.callsign}: no feasible route to ${describeTarget(objective)}`
        : `${asset.callsign}: ${feasible} COA${feasible === 1 ? "" : "s"} to ${describeTarget(objective)}` +
            (recommended ? ` · recommend ${recommended.variant}` : ""),
      { assetId, objective: objective.type, feasible }
    );
    this.refreshLive();
    return candidates;
  }

  selectCoa(coaId: string | null): void {
    if (coaId !== null && !this.plannerState.candidates.some((coa) => coa.id === coaId)) return;
    this.plannerState = { ...this.plannerState, selectedCoaId: coaId };
    this.refreshLive();
  }

  clearPlanner(): void {
    this.plannerState = emptyPlanner();
    this.refreshLive();
  }

  dispatch(coaId?: string, options: { override?: boolean } = {}): DispatchResult {
    const id = coaId ?? this.plannerState.selectedCoaId;
    const coa = this.plannerState.candidates.find((candidate) => candidate.id === id);
    if (!coa) return { ok: false, reason: "No course of action selected" };
    const asset = this.assets.get(coa.assetId);
    if (!asset) return { ok: false, reason: "Asset not found" };
    const refusal = this.dispatchRefusal(asset, coa, options.override === true);
    if (refusal) {
      this.pushEvent(
        "warning",
        MISSION,
        FleetEventCode.DISPATCH_REFUSED,
        `${asset.callsign}: dispatch refused · ${refusal}`,
        { assetId: asset.id, coaId: coa.id }
      );
      this.refreshLive();
      return { ok: false, reason: refusal };
    }
    this.pushEvent(
      "info",
      PLANNER,
      FleetEventCode.COA_APPROVED,
      `${asset.callsign}: ${coa.variant} COA approved · eta ${formatDuration(coa.etaMs)} · ${coa.energyPct.toFixed(0)}% energy`,
      { assetId: asset.id, coaId: coa.id, variant: coa.variant }
    );
    const mission = this.startMission(asset, coa);
    this.plannerState = emptyPlanner();
    this.refreshLive();
    return { ok: true, missionId: mission.id };
  }

  returnToBase(assetId: string): DispatchResult {
    const asset = this.assets.get(assetId);
    if (!asset) return { ok: false, reason: "Asset not found" };
    const depot = this.area.depots.find((candidate) => candidate.id === asset.homeDepotId);
    if (!depot) return { ok: false, reason: "No home depot" };
    if (haversineM(asset.position, depot.position) < 25) {
      return { ok: false, reason: "Already at depot" };
    }
    const objective: Objective = { type: "rtb", target: depot.position, targetLabel: depot.name };
    const candidates = this.planner.generateCoas(this.publicAsset(asset), objective, this.scenario);
    const coa =
      candidates.find((candidate) => candidate.recommended) ??
      candidates.find((candidate) => candidate.feasible);
    if (!coa) {
      return { ok: false, reason: "No route back to depot" };
    }
    this.pushEvent("info", MISSION, FleetEventCode.RTB_ISSUED, `${asset.callsign}: return to ${depot.name}`, {
      assetId,
    });
    const mission = this.startMission(asset, coa);
    this.refreshLive();
    return { ok: true, missionId: mission.id };
  }

  abortMission(missionId: string, reason = "Aborted by operator"): void {
    const mission = this.missions.get(missionId);
    if (!mission || mission.status !== "active") return;
    const asset = this.assets.get(mission.assetId);
    this.finishMission(mission, "aborted", reason);
    if (asset) {
      this.pushEvent(
        "warning",
        MISSION,
        FleetEventCode.MISSION_ABORTED,
        `${asset.callsign}: mission aborted · ${reason}`,
        { assetId: asset.id, missionId }
      );
    }
    this.refreshLive();
  }

  // ---------------------------------------------------------------- faults and maintenance

  injectFault(assetId: string, faultId: FleetFaultId): void {
    const asset = this.assets.get(assetId);
    if (!asset || asset.faults.includes(faultId)) return;
    asset.faults = [...asset.faults, faultId];
    const definition = findFleetFault(faultId);
    this.pushEvent(
      "error",
      FAULT,
      FleetEventCode.FAULT_INJECTED,
      `${asset.callsign}: ${definition.name}`,
      { assetId, faultId }
    );
    if (definition.abortsMission && asset.missionId) {
      const mission = this.missions.get(asset.missionId);
      if (mission && mission.status === "active") {
        this.finishMission(mission, "failed", definition.name);
        this.pushEvent(
          "error",
          MISSION,
          FleetEventCode.MISSION_FAILED,
          `${asset.callsign}: mission failed · ${definition.name}`,
          { assetId, missionId: mission.id }
        );
      }
    }
    this.refreshLive();
  }

  clearFault(assetId: string, faultId: FleetFaultId): void {
    const asset = this.assets.get(assetId);
    if (!asset || !asset.faults.includes(faultId)) return;
    asset.faults = asset.faults.filter((fault) => fault !== faultId);
    this.pushEvent("info", FAULT, FleetEventCode.FAULT_CLEARED, `${asset.callsign}: ${findFleetFault(faultId).name} cleared`, {
      assetId,
      faultId,
    });
    this.refreshLive();
  }

  markServiced(assetId: string): void {
    const asset = this.assets.get(assetId);
    if (!asset) return;
    asset.maintenance = {
      ...asset.maintenance,
      hoursSinceService: 0,
      workOrders: [],
      lastServicedAtMs: this.clock.getSimTimeMs(),
      due: false,
    };
    asset.maintenanceDueFlagged = false;
    this.pushEvent("info", MAINT, FleetEventCode.SERVICED, `${asset.callsign}: serviced`, { assetId });
    this.refreshLive();
  }

  // ---------------------------------------------------------------- reads

  getView = (): FleetView => this.viewSnapshot;
  getSnapshot = (): FleetSnapshot => this.displayedSnapshot;
  getLiveSnapshot = (): FleetSnapshot => this.liveSnapshot;
  getEvents = (): SimulationEvent[] => this.eventsSnapshot;
  getArea = (): OperatingArea => this.area;
  getScenario = (): FleetScenario => this.scenario;
  getPlanner = (): FleetPlanner => this.planner;
  getHistory = (): FleetSnapshot[] => this.history.toArray();

  subscribeView = (listener: () => void): (() => void) => {
    this.viewListeners.add(listener);
    return () => {
      this.viewListeners.delete(listener);
    };
  };

  subscribeSnapshot = (listener: () => void): (() => void) => {
    this.snapshotListeners.add(listener);
    return () => {
      this.snapshotListeners.delete(listener);
    };
  };

  subscribeEvents = (listener: () => void): (() => void) => {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  };

  // ---------------------------------------------------------------- internals

  private seedFleet(): void {
    this.assets.clear();
    this.missions.clear();
    this.selectedAssetId = null;
    ASSET_SEEDS.forEach((seed, index) => {
      const state = this.createAsset(seed, index);
      this.assets.set(state.id, state);
    });
    this.scenario.presetFaults.forEach(({ assetId, faultId }) => {
      const asset = this.assets.get(assetId);
      if (asset && !asset.faults.includes(faultId)) asset.faults = [...asset.faults, faultId];
    });
    // Derive first readings before anything moves so the roster is populated at t=0.
    this.assets.forEach((asset) => this.deriveAssetState(asset, 0, false, 0));
    ASSET_SEEDS.forEach((seed) => {
      if (!seed.patrol) return;
      const asset = this.assets.get(seed.id);
      if (!asset) return;
      const candidates = this.planner.generateCoas(this.publicAsset(asset), seed.patrol, this.scenario);
      const coa = candidates.find((c) => c.recommended) ?? candidates.find((c) => c.feasible);
      if (coa) this.startMission(asset, coa, true);
    });
    this.assets.forEach((asset) => this.deriveAssetState(asset, 0, false, 0));
  }

  private createAsset(seed: AssetSeed, index: number): AssetState {
    const profile = kindProfile(seed.kind);
    const interval = profile.serviceIntervalHours * this.scenario.serviceIntervalScale;
    const workOrders = seed.workOrders.map((order) => ({ ...order, openedAtMs: 0 }));
    return {
      id: seed.id,
      callsign: seed.callsign,
      name: seed.name,
      kind: seed.kind,
      domain: profile.domain,
      position: { ...seed.position },
      altitudeM: 0,
      headingDeg: seed.headingDeg,
      speedMps: 0,
      status: "idle",
      energyPct: seed.energyPct,
      sensors: [],
      maintenance: {
        hoursSinceService: seed.hoursSinceService,
        serviceIntervalHours: interval,
        healthScore: 1,
        workOrders,
        lastServicedAtMs: null,
        due: false,
      },
      link: { relayId: null, rssiDbm: -120, quality: 0, latencyMs: 0, lostSinceMs: null },
      missionId: null,
      faults: [...(seed.presetFaults ?? [])],
      tags: [...seed.tags],
      homeDepotId: seed.homeDepotId,
      rssiHistory: [],
      energyHistory: [],
      profile,
      rng: new SeededRng(mixSeed(this.scenario.seed, index + 1)),
      movingForS: 0,
      lastSampleMs: -Infinity,
      linkLostFlagged: false,
      linkDegradedFlagged: false,
      maintenanceDueFlagged: false,
      lowEnergyFlagged: false,
      charging: seed.charging === true,
    };
  }

  private step(): void {
    this.clock.step();
    this.stepCount += 1;
    const t = this.clock.getSimTimeMs();
    const dt = this.config.dtMs;

    this.assets.forEach((asset) => this.stepAsset(asset, t, dt));
    this.sampleFleetStats(t);

    this.liveSnapshot = this.buildSnapshot();
    if (this.stepCount % this.historyIntervalSteps === 0) {
      this.history.push(this.liveSnapshot);
    }
    if (this.playbackMode === "live") this.displayedSnapshot = this.liveSnapshot;
  }

  private stepAsset(asset: AssetState, t: number, dt: number): void {
    const mission = asset.missionId ? this.missions.get(asset.missionId) ?? null : null;
    const active = mission !== null && mission.status === "active";
    const overtemp = asset.faults.includes("motor_overtemp");
    let distanceM = 0;
    let terrainCost = 1;

    if (active && mission) {
      const cellTerrain = terrainAt(this.planner.getGrid(), asset.position);
      terrainCost = Math.max(1, asset.profile.terrainCost[cellTerrain] ?? 1);
      const targetSpeed = (asset.profile.cruiseMps / terrainCost) * (overtemp ? 0.5 : 1);
      asset.speedMps = approach(asset.speedMps, targetSpeed, asset.profile.accelMps2 * (dt / 1000));
      distanceM = asset.speedMps * (dt / 1000);
      const cursor = advanceAlongPath(
        mission.coa.path,
        {
          waypointIndex: mission.waypointIndex,
          position: asset.position,
          headingDeg: asset.headingDeg,
          travelledM: mission.distanceTravelledM,
        },
        distanceM
      );
      asset.position = cursor.position;
      const wobble = asset.faults.includes("imu_drift") ? asset.rng.nextGaussian() * 6 : 0;
      asset.headingDeg = (cursor.headingDeg + wobble + 360) % 360;
      mission.waypointIndex = cursor.waypointIndex;
      mission.distanceTravelledM = cursor.travelledM;
      mission.progress =
        mission.coa.distanceM > 0 ? Math.min(1, cursor.travelledM / mission.coa.distanceM) : 1;
      const remainingM = Math.max(0, mission.coa.distanceM - cursor.travelledM);
      mission.etaMs = asset.speedMps > 0.05 ? (remainingM / asset.speedMps) * 1000 : mission.coa.etaMs;

      cursor.reached.forEach((index) => {
        if (index === 0 || index >= mission.coa.path.length - 1) return;
        this.pushEvent(
          "debug",
          MISSION,
          FleetEventCode.WAYPOINT_REACHED,
          `${asset.callsign}: waypoint ${index}/${mission.coa.path.length - 1}`,
          { assetId: asset.id, missionId: mission.id, index }
        );
      });

      if (cursor.finished) {
        if (mission.loopStartIndex !== null) {
          mission.loops += 1;
          mission.waypointIndex = mission.loopStartIndex + 1;
          mission.distanceTravelledM = 0;
          mission.progress = 0;
          this.pushEvent(
            "info",
            MISSION,
            FleetEventCode.PATROL_LOOP,
            `${asset.callsign}: patrol loop ${mission.loops} complete`,
            { assetId: asset.id, missionId: mission.id, loops: mission.loops }
          );
        } else {
          this.completeMission(asset, mission, t);
        }
      }
      asset.movingForS += dt / 1000;
    } else {
      asset.speedMps = approach(asset.speedMps, 0, asset.profile.accelMps2 * (dt / 1000) * 2);
      asset.movingForS = Math.max(0, asset.movingForS - dt / 1000);
      if (asset.charging) {
        asset.energyPct = Math.min(100, asset.energyPct + asset.profile.chargeRatePctPerS * (dt / 1000));
        if (asset.energyPct >= 100) {
          asset.charging = false;
          this.pushEvent("info", POWER, FleetEventCode.CHARGING_COMPLETE, `${asset.callsign}: charge complete`, {
            assetId: asset.id,
          });
        }
      }
    }

    asset.altitudeM = active ? asset.profile.altitudeM : 0;

    // Energy.
    const burn = energyForStep(asset.profile, {
      distanceM,
      headingDeg: asset.headingDeg,
      terrainCost,
      flow:
        asset.domain === "air"
          ? this.scenario.wind
          : asset.domain === "sea"
            ? this.scenario.current
            : { towardDeg: 0, speedMps: 0 },
      dtMs: dt,
      moving: distanceM > 0,
      batteryFault: asset.faults.includes("battery_cell"),
      overtemp,
    });
    if (!asset.charging) asset.energyPct = Math.max(0, asset.energyPct - burn);

    if (active && mission) {
      if (asset.energyPct <= 0) {
        this.finishMission(mission, "failed", "Energy exhausted");
        this.pushEvent("critical", POWER, FleetEventCode.ENERGY_EXHAUSTED, `${asset.callsign}: energy exhausted`, {
          assetId: asset.id,
        });
      } else if (
        asset.energyPct < LOW_ENERGY_PCT &&
        mission.objective.type !== "rtb" &&
        !asset.lowEnergyFlagged
      ) {
        asset.lowEnergyFlagged = true;
        this.pushEvent("warning", POWER, FleetEventCode.LOW_ENERGY, `${asset.callsign}: low energy ${asset.energyPct.toFixed(0)}% · returning to base`, {
          assetId: asset.id,
        });
        this.finishMission(mission, "aborted", "Low energy");
        this.returnToBase(asset.id);
      }
    }

    this.deriveAssetState(asset, t, distanceM > 0, dt);
  }

  /** Terrain-aware sensors, link, maintenance, and status for one asset. */
  private deriveAssetState(asset: AssetState, t: number, moving: boolean, dt: number): void {
    const terrain = terrainAt(this.planner.getGrid(), asset.position);
    const previousLink = asset.link;
    asset.link = deriveLink({
      position: asset.position,
      relays: this.area.relays,
      disabledRelayIds: this.scenario.disabledRelayIds,
      rangeScale: this.scenario.linkRangeScale,
      terrain,
      radioFailed: asset.faults.includes("radio_failure"),
      previous: previousLink,
      timestampMs: t,
    });

    asset.sensors = deriveSensors(asset.profile.sensorSuite, {
      speedMps: asset.speedMps,
      cruiseMps: asset.profile.cruiseMps,
      altitudeM: asset.altitudeM,
      terrain,
      rssiDbm: asset.link.rssiDbm,
      faults: asset.faults,
      movingForS: asset.movingForS,
      rng: asset.rng,
    });

    // Link transitions.
    const lost = isLinkLost(asset.link, t);
    if (lost && !asset.linkLostFlagged) {
      asset.linkLostFlagged = true;
      this.pushEvent("error", LINK, FleetEventCode.LINK_LOST, `${asset.callsign}: link lost`, { assetId: asset.id });
    } else if (!lost && asset.linkLostFlagged && asset.link.relayId) {
      asset.linkLostFlagged = false;
      this.pushEvent("info", LINK, FleetEventCode.LINK_RESTORED, `${asset.callsign}: link restored via ${asset.link.relayId}`, {
        assetId: asset.id,
      });
    }
    const degraded = asset.link.relayId !== null && asset.link.quality < LINK_DEGRADED_QUALITY;
    if (degraded && !asset.linkDegradedFlagged) {
      asset.linkDegradedFlagged = true;
      this.pushEvent("warning", LINK, FleetEventCode.LINK_DEGRADED, `${asset.callsign}: link degraded ${asset.link.rssiDbm.toFixed(0)} dBm`, {
        assetId: asset.id,
      });
    } else if (!degraded && asset.link.quality >= LINK_DEGRADED_QUALITY + 0.15) {
      asset.linkDegradedFlagged = false;
    }

    // Maintenance.
    const record = asset.maintenance;
    const hours = record.hoursSinceService + hoursForTick(dt, moving);
    const workOrders = [...record.workOrders];
    if (dt > 0 && hours / record.serviceIntervalHours > 0.6) {
      const p = dt / WORK_ORDER_MEAN_INTERVAL_MS;
      if (asset.rng.next() < p && workOrders.length < 3) {
        const pick = RANDOM_WORK_ORDERS[asset.rng.nextInt(0, RANDOM_WORK_ORDERS.length)];
        this.orderSeq += 1;
        workOrders.push({ id: `wo-${this.orderSeq}`, title: pick.title, severity: pick.severity, openedAtMs: t });
        this.pushEvent(
          pick.severity === "high" ? "warning" : "info",
          MAINT,
          FleetEventCode.WORK_ORDER_OPENED,
          `${asset.callsign}: work order · ${pick.title}`,
          { assetId: asset.id, severity: pick.severity }
        );
      }
    }
    const due = isMaintenanceDue({ hoursSinceService: hours, serviceIntervalHours: record.serviceIntervalHours, workOrders });
    asset.maintenance = {
      ...record,
      hoursSinceService: hours,
      workOrders,
      healthScore: computeHealthScore(hours, record.serviceIntervalHours, workOrders, asset.faults.length, meanSensorHealth(asset.sensors)),
      due,
    };
    if (due && !asset.maintenanceDueFlagged) {
      asset.maintenanceDueFlagged = true;
      if (dt > 0) {
        this.pushEvent("warning", MAINT, FleetEventCode.MAINTENANCE_DUE, `${asset.callsign}: maintenance due`, { assetId: asset.id });
      }
    } else if (!due) {
      asset.maintenanceDueFlagged = false;
    }

    // Sparkline samples once per sim second.
    if (t - asset.lastSampleMs >= 1000 || asset.lastSampleMs === -Infinity) {
      asset.lastSampleMs = t;
      asset.rssiHistory = pushSample(asset.rssiHistory, asset.link.rssiDbm, this.config.sparklineSamples);
      asset.energyHistory = pushSample(asset.energyHistory, asset.energyPct, this.config.sparklineSamples);
    }

    // Charging starts when an idle asset at its depot is low.
    const mission = asset.missionId ? this.missions.get(asset.missionId) ?? null : null;
    const onMission = mission !== null && mission.status === "active";
    if (!onMission && !asset.charging && asset.energyPct < CHARGE_UNTIL_PCT && this.atHomeDepot(asset)) {
      asset.charging = true;
      if (dt > 0) {
        this.pushEvent("info", POWER, FleetEventCode.CHARGING_STARTED, `${asset.callsign}: charging at depot`, { assetId: asset.id });
      }
    }

    asset.status = deriveStatus(asset, mission, lost);
  }

  private atHomeDepot(asset: AssetState): boolean {
    const depot = this.area.depots.find((candidate) => candidate.id === asset.homeDepotId);
    return depot !== undefined && haversineM(asset.position, depot.position) < 120;
  }

  private dispatchRefusal(asset: AssetState, coa: CourseOfAction, override: boolean): string | null {
    if (!coa.feasible) return coa.reason ?? "Route infeasible";
    if (asset.status === "lost_link") return "Link lost";
    if (asset.faults.includes("gps_loss")) return "GPS loss fault active";
    if (asset.faults.includes("radio_failure")) return "Radio failure fault active";
    if (asset.charging && asset.energyPct < DISPATCH_MIN_ENERGY_PCT) {
      return `Charging · ${asset.energyPct.toFixed(0)}% below ${DISPATCH_MIN_ENERGY_PCT}% minimum`;
    }
    if (asset.energyPct - coa.energyPct < 5) return "Insufficient energy for route";
    if (asset.maintenance.due && !override) return "Maintenance due · override required";
    return null;
  }

  private startMission(asset: AssetState, coa: CourseOfAction, silent = false): MissionState {
    if (asset.missionId) {
      const existing = this.missions.get(asset.missionId);
      if (existing && existing.status === "active") {
        this.finishMission(existing, "aborted", "Superseded by new mission");
      }
    }
    this.missionSeq += 1;
    const mission: MissionState = {
      id: `msn-${this.missionSeq}`,
      assetId: asset.id,
      callsign: asset.callsign,
      objective: coa.objective,
      coa,
      status: "active",
      progress: 0,
      distanceTravelledM: 0,
      startedAtMs: this.clock.getSimTimeMs(),
      completedAtMs: null,
      waypointIndex: 1,
      loops: 0,
      etaMs: coa.etaMs,
      failureReason: null,
      loopStartIndex: coa.loopStartIndex,
    };
    this.missions.set(mission.id, mission);
    asset.missionId = mission.id;
    asset.charging = false;
    asset.lowEnergyFlagged = false;
    if (!silent) {
      this.pushEvent(
        "info",
        MISSION,
        FleetEventCode.MISSION_STARTED,
        `${asset.callsign}: ${describeObjective(coa.objective)} · ${(coa.distanceM / 1000).toFixed(1)} km`,
        { assetId: asset.id, missionId: mission.id, objective: coa.objective.type }
      );
    }
    this.pruneMissions();
    return mission;
  }

  private completeMission(asset: AssetState, mission: MissionState, t: number): void {
    this.finishMission(mission, "complete", null);
    asset.position = mission.coa.path[mission.coa.path.length - 1] ?? asset.position;
    this.pushEvent(
      "info",
      MISSION,
      FleetEventCode.MISSION_COMPLETE,
      `${asset.callsign}: ${describeObjective(mission.objective)} complete · ${formatDuration(t - mission.startedAtMs)}`,
      { assetId: asset.id, missionId: mission.id }
    );
  }

  private finishMission(mission: MissionState, status: MissionState["status"], reason: string | null): void {
    mission.status = status;
    mission.completedAtMs = this.clock.getSimTimeMs();
    mission.failureReason = reason;
    const asset = this.assets.get(mission.assetId);
    if (asset && asset.missionId === mission.id) {
      asset.missionId = null;
    }
  }

  /** Keep the mission list bounded: active ones plus the most recent finished. */
  private pruneMissions(): void {
    const finished = Array.from(this.missions.values())
      .filter((mission) => mission.status !== "active")
      .sort((a, b) => (b.completedAtMs ?? 0) - (a.completedAtMs ?? 0));
    finished.slice(12).forEach((mission) => this.missions.delete(mission.id));
  }

  private sampleFleetStats(t: number): void {
    if (t - this.lastStatsSampleMs < 1000) return;
    this.lastStatsSampleMs = t;
    const assets = Array.from(this.assets.values());
    const link = mean(assets.map((asset) => asset.link.quality));
    const energy = mean(assets.map((asset) => asset.energyPct));
    this.linkHistory = pushSample(this.linkHistory, link, this.config.sparklineSamples);
    this.energyHistory = pushSample(this.energyHistory, energy, this.config.sparklineSamples);
  }

  private buildStats(assets: Asset[]): FleetStats {
    const byStatus: Record<AssetStatus, number> = {
      idle: 0,
      en_route: 0,
      patrolling: 0,
      returning: 0,
      charging: 0,
      maintenance: 0,
      lost_link: 0,
      fault: 0,
    };
    assets.forEach((asset) => {
      byStatus[asset.status] += 1;
    });
    return {
      total: assets.length,
      byStatus,
      activeMissions: Array.from(this.missions.values()).filter((m) => m.status === "active").length,
      faults: assets.reduce((sum, asset) => sum + asset.faults.length, 0),
      meanLinkQuality: mean(assets.map((asset) => asset.link.quality)),
      meanEnergyPct: mean(assets.map((asset) => asset.energyPct)),
      maintenanceDue: assets.filter((asset) => asset.maintenance.due).length,
      linkHistory: this.linkHistory,
      energyHistory: this.energyHistory,
    };
  }

  private publicAsset(asset: AssetState): Asset {
    return {
      id: asset.id,
      callsign: asset.callsign,
      name: asset.name,
      kind: asset.kind,
      domain: asset.domain,
      position: { ...asset.position },
      altitudeM: asset.altitudeM,
      headingDeg: asset.headingDeg,
      speedMps: asset.speedMps,
      status: asset.status,
      energyPct: asset.energyPct,
      sensors: asset.sensors,
      maintenance: asset.maintenance,
      link: asset.link,
      missionId: asset.missionId,
      faults: asset.faults,
      tags: asset.tags,
      homeDepotId: asset.homeDepotId,
      rssiHistory: asset.rssiHistory,
      energyHistory: asset.energyHistory,
    };
  }

  private buildSnapshot(): FleetSnapshot {
    const assets = Array.from(this.assets.values()).map((asset) => this.publicAsset(asset));
    const missions = Array.from(this.missions.values()).map((mission) => ({ ...mission }));
    return {
      frameId: this.stepCount,
      timestampMs: this.clock.getSimTimeMs(),
      seed: this.scenario.seed,
      scenarioId: this.scenario.id,
      status: this.clock.getStatus(),
      assets,
      missions,
      planner: this.plannerState,
      stats: this.buildStats(assets),
      selectedAssetId: this.selectedAssetId,
    };
  }

  private buildView(): FleetView {
    const history = this.history.toArray();
    const assets = Array.from(this.assets.values());
    return {
      status: this.clock.getStatus(),
      timestampMs:
        this.playbackMode === "scrub" && this.scrubTimestampMs !== null
          ? this.scrubTimestampMs
          : this.clock.getSimTimeMs(),
      timeScale: this.clock.getTimeScale(),
      playbackMode: this.playbackMode,
      scrubTimestampMs: this.scrubTimestampMs,
      scenarioId: this.scenario.id,
      historyStartMs: history[0]?.timestampMs ?? null,
      historyEndMs: history[history.length - 1]?.timestampMs ?? null,
      activeCount: assets.filter((a) => a.status === "en_route" || a.status === "patrolling" || a.status === "returning").length,
      faultCount: assets.filter((a) => a.status === "fault").length,
      lostLinkCount: assets.filter((a) => a.status === "lost_link").length,
      selectedAssetId: this.selectedAssetId,
    };
  }

  /** Rebuild the live snapshot after a command outside the tick loop. */
  private refreshLive(): void {
    this.assets.forEach((asset) => {
      const mission = asset.missionId ? this.missions.get(asset.missionId) ?? null : null;
      asset.status = deriveStatus(asset, mission, isLinkLost(asset.link, this.clock.getSimTimeMs()));
    });
    this.liveSnapshot = this.buildSnapshot();
    if (this.playbackMode === "live") this.displayedSnapshot = this.liveSnapshot;
    this.publishAll();
  }

  private pushEvent(
    severity: EventSeverity,
    source: string,
    eventCode: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.eventSeq += 1;
    const event = createSimulationEvent(
      `${this.scenario.seed}-${this.eventSeq}`,
      this.clock.getSimTimeMs(),
      { severity, source, eventCode, message, metadata }
    );
    this.eventLog.append(event);
    this.eventsSnapshot = this.eventLog.toArray();
    this.eventListeners.forEach((listener) => listener());
  }

  private publishView(): void {
    this.viewSnapshot = this.buildView();
    this.viewListeners.forEach((listener) => listener());
  }

  private publishAll(): void {
    this.publishView();
    this.snapshotListeners.forEach((listener) => listener());
  }
}

/** Latest history entry at or before `timestampMs`, else the earliest one. */
function findFleetSnapshotAt(history: FleetSnapshot[], timestampMs: number): FleetSnapshot | null {
  if (history.length === 0) return null;
  let found: FleetSnapshot | null = null;
  for (const snapshot of history) {
    if (snapshot.timestampMs <= timestampMs) {
      found = snapshot;
    } else {
      break;
    }
  }
  return found ?? history[0];
}

function emptyPlanner(): PlannerState {
  return { assetId: null, objective: null, candidates: [], selectedCoaId: null, generatedAtMs: null };
}

function approach(current: number, target: number, maxDelta: number): number {
  const delta = target - current;
  if (Math.abs(delta) <= maxDelta) return target;
  return current + Math.sign(delta) * maxDelta;
}

function pushSample(history: number[], value: number, limit: number): number[] {
  const next = history.length >= limit ? history.slice(history.length - limit + 1) : history.slice();
  next.push(Number(value.toFixed(2)));
  return next;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function deriveStatus(asset: AssetState, mission: Mission | null, linkLost: boolean): AssetStatus {
  if (linkLost) return "lost_link";
  if (asset.faults.length > 0) return "fault";
  if (mission && mission.status === "active") {
    if (mission.objective.type === "rtb") return "returning";
    if (mission.objective.type === "patrol") return "patrolling";
    return "en_route";
  }
  if (asset.charging) return "charging";
  if (asset.maintenance.due) return "maintenance";
  return "idle";
}

export function describeTarget(objective: Objective): string {
  if (objective.targetLabel) return objective.targetLabel;
  if (objective.target) return formatLatLng(objective.target);
  if (objective.type === "survey") return "survey area";
  return "route";
}

export function describeObjective(objective: Objective): string {
  switch (objective.type) {
    case "transit":
      return `transit to ${describeTarget(objective)}`;
    case "rtb":
      return `return to ${describeTarget(objective)}`;
    case "patrol":
      return `patrol ${describeTarget(objective)}`;
    case "survey":
      return `survey ${describeTarget(objective)}`;
    default:
      return objective.type;
  }
}

export function formatLatLng(point: LatLng): string {
  return `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
}

export function formatDuration(ms: number): string {
  const totalS = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalS / 60);
  const s = totalS % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}
