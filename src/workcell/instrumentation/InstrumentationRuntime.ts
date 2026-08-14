import { mixSeed, SeededRng } from "@/simulation";
import type {
  ConveyorTelemetry,
  ForceTorqueTelemetry,
  IoTelemetry,
  SimulationStepContext,
  ToolTelemetry,
} from "@/simulation";
import { PlcIo } from "../io/PlcIo";
import type { DigitalInput, IoSource } from "../io/digitalIo";
import { Conveyor } from "./Conveyor";
import { deriveForceTorque } from "./deriveForceTorque";
import { ParallelGripper } from "./ParallelGripper";

const INSTRUMENTATION_SEED_CHANNEL = 0x10f7;

export interface InstrumentationSample {
  contacting: boolean;
  payloadKg: number;
  linearAccelMmSec2: number;
  vacuumEnabled: boolean;
  vacuumOk: boolean;
  vacuumSeal: number;
  partPresent: boolean;
  safetyClear: boolean;
  robotReady: boolean;
  cellFault: boolean;
  conveyorCommanded: boolean;
  gripperClose: boolean;
}

export class InstrumentationRuntime {
  private readonly plc = new PlcIo();
  private readonly gripper = new ParallelGripper();
  private readonly conveyor = new Conveyor();
  private rng: SeededRng;
  private forceTorque: ForceTorqueTelemetry | null = null;
  private io: IoTelemetry | null = null;
  private jammed = false;

  constructor(seed: number) {
    this.rng = new SeededRng(mixSeed(seed, INSTRUMENTATION_SEED_CHANNEL));
  }

  reset(seed: number): void {
    this.rng = new SeededRng(mixSeed(seed, INSTRUMENTATION_SEED_CHANNEL));
    this.plc.reset();
    this.gripper.reset();
    this.conveyor.reset();
    this.conveyor.setJammed(this.jammed);
    this.forceTorque = null;
    this.io = null;
  }

  setJammed(jammed: boolean): void {
    this.jammed = jammed;
    this.conveyor.setJammed(jammed);
  }

  setCommsOk(commsOk: boolean): void {
    this.plc.setCommsOk(commsOk);
  }

  setOverride(key: DigitalInput, value: boolean | null): void {
    this.plc.setOverride(key, value);
  }

  step(ctx: SimulationStepContext, sample: InstrumentationSample): void {
    this.gripper.command(sample.gripperClose ? 8 : 40);
    this.gripper.step(ctx.dtMs, sample.contacting);
    this.conveyor.setRunning(sample.conveyorCommanded && !this.jammed);
    this.conveyor.step(ctx.dtMs);

    this.forceTorque = deriveForceTorque(
      {
        contacting: sample.contacting,
        payloadKg: sample.payloadKg,
        linearAccelMmSec2: sample.linearAccelMmSec2,
        vacuumEnabled: sample.vacuumEnabled,
        vacuumSeal: sample.vacuumSeal,
        gripperForceN: this.gripper.getTelemetry().gripForceN,
      },
      this.rng
    );

    const source: IoSource = {
      partPresent: sample.partPresent,
      gripperClosed: this.gripper.getTelemetry().openingWidthMm < 16,
      vacuumOk: sample.vacuumOk,
      safetyClear: sample.safetyClear,
      conveyorReady: this.conveyor.isReady(),
      robotReady: sample.robotReady,
      conveyorRun: this.conveyor.isRunning(),
      gripperClose: sample.gripperClose,
      vacuumEnable: sample.vacuumEnabled,
      stackLightGreen: !sample.cellFault && sample.safetyClear,
      stackLightRed: sample.cellFault || !sample.safetyClear,
    };
    this.io = this.plc.sample(source);
  }

  getForceTorque = (): ForceTorqueTelemetry | null => this.forceTorque;

  getConveyor = (): ConveyorTelemetry | null => this.conveyor.getTelemetry();

  getIo = (): IoTelemetry | null => this.io;

  getGripper() {
    return this.gripper.getTelemetry();
  }

  getTool(vacuum: ToolTelemetry["vacuum"]): ToolTelemetry {
    return {
      kind: "vacuum",
      gripper: this.gripper.getTelemetry(),
      vacuum,
    };
  }
}
