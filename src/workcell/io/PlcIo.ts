import type { IoTelemetry } from "@/simulation";
import { deriveIo } from "./deriveIo";
import type { DigitalInput, IoSource } from "./digitalIo";

export class PlcIo {
  private overrides: Partial<Record<DigitalInput, boolean>> = {};
  private commsOk = true;
  private frozen: IoTelemetry | null = null;

  setOverride(key: DigitalInput, value: boolean | null): void {
    if (value === null) {
      delete this.overrides[key];
      return;
    }
    this.overrides[key] = value;
  }

  clearOverrides(): void {
    this.overrides = {};
  }

  setCommsOk(commsOk: boolean): void {
    this.commsOk = commsOk;
    if (commsOk) {
      this.frozen = null;
    }
  }

  reset(): void {
    this.overrides = {};
    this.commsOk = true;
    this.frozen = null;
  }

  sample(source: IoSource): IoTelemetry {
    const next = deriveIo(source, this.overrides, this.commsOk);
    if (!this.commsOk) {
      if (!this.frozen) {
        this.frozen = { ...next, commsOk: false };
      }
      return this.frozen;
    }
    this.frozen = null;
    return next;
  }
}
