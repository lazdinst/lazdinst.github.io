import type { IoTelemetry } from "@/simulation";
import {
  DIGITAL_INPUTS,
  type DigitalInput,
  type DigitalOutput,
  type IoSource,
} from "./digitalIo";

export function deriveIo(
  source: IoSource,
  overrides: Partial<Record<DigitalInput, boolean>> = {},
  commsOk = true
): IoTelemetry {
  const digitalInputs: Record<string, boolean> = {
    part_present: source.partPresent,
    gripper_closed: source.gripperClosed,
    vacuum_ok: source.vacuumOk,
    safety_clear: source.safetyClear,
    conveyor_ready: source.conveyorReady,
    robot_ready: source.robotReady,
  };

  for (const key of DIGITAL_INPUTS) {
    const override = overrides[key];
    if (override !== undefined) {
      digitalInputs[key] = override;
    }
  }

  const digitalOutputs: Record<string, boolean> = {
    conveyor_run: source.conveyorRun,
    gripper_close: source.gripperClose,
    vacuum_enable: source.vacuumEnable,
    stack_light_green: source.stackLightGreen,
    stack_light_red: source.stackLightRed,
  };

  return {
    digitalInputs,
    digitalOutputs,
    overrides: { ...overrides },
    commsOk,
  };
}

export function readInput(
  io: IoTelemetry,
  key: DigitalInput
): boolean {
  return io.digitalInputs[key] === true;
}

export function readOutput(
  io: IoTelemetry,
  key: DigitalOutput
): boolean {
  return io.digitalOutputs[key] === true;
}
