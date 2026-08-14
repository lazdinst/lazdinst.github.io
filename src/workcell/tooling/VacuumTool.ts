import type { VacuumTelemetry } from "@/simulation";

const ATMOSPHERE_KPA = 101.3;
const TARGET_VACUUM_KPA = 42;
const SEAL_THRESHOLD = 0.42;
const SECURE_PRESSURE_KPA = 58;

export class VacuumTool {
  private enabled = false;
  private pressureKPa = ATMOSPHERE_KPA;
  private flowLMin = 0;
  private sealQuality = 0;
  private objectSecured = false;
  private leak = 0;
  private slip = false;
  private wasSecured = false;

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
    this.objectSecured = false;
  }

  setLeak(leak: number): void {
    this.leak = Math.min(1, Math.max(0, leak));
  }

  setSlip(slip: boolean): void {
    this.slip = slip;
  }

  consumeSlip(): boolean {
    const slipped = this.wasSecured && !this.objectSecured && this.slip;
    this.wasSecured = this.objectSecured;
    return slipped;
  }

  isLow(): boolean {
    return this.enabled && this.pressureKPa > SECURE_PRESSURE_KPA + 8;
  }

  reset(): void {
    this.enabled = false;
    this.pressureKPa = ATMOSPHERE_KPA;
    this.flowLMin = 0;
    this.sealQuality = 0;
    this.objectSecured = false;
    this.wasSecured = false;
  }

  step(dtMs: number, contacting: boolean, quality: number): void {
    const dtSec = dtMs / 1000;
    const qualityAdj = quality * (1 - this.leak) * (this.slip ? 0.28 : 1);
    if (this.enabled) {
      const targetPressure = contacting
        ? TARGET_VACUUM_KPA + (1 - qualityAdj) * 18 + this.leak * 42
        : 78;
      this.pressureKPa += (targetPressure - this.pressureKPa) * Math.min(1, dtSec * 6);
      this.flowLMin = contacting ? 4 + (1 - qualityAdj) * 8 + this.leak * 10 : 14;
      this.sealQuality +=
        ((contacting ? Math.max(0.05, qualityAdj) : 0.08) - this.sealQuality) *
        Math.min(1, dtSec * 8);
      this.objectSecured =
        contacting &&
        !this.slip &&
        this.sealQuality >= SEAL_THRESHOLD &&
        this.pressureKPa <= SECURE_PRESSURE_KPA;
      return;
    }

    this.pressureKPa += (ATMOSPHERE_KPA - this.pressureKPa) * Math.min(1, dtSec * 4);
    this.flowLMin *= Math.max(0, 1 - dtSec * 8);
    this.sealQuality *= Math.max(0, 1 - dtSec * 6);
    this.objectSecured = false;
  }

  getTelemetry(): VacuumTelemetry {
    return {
      enabled: this.enabled,
      pressureKPa: this.pressureKPa,
      flowLMin: this.flowLMin,
      sealQuality: this.sealQuality,
      objectSecured: this.objectSecured,
    };
  }
}
