import type { ConveyorTelemetry } from "@/simulation";

const NOMINAL_VELOCITY_MM_SEC = 80;

export class Conveyor {
  private running = false;
  private jammed = false;
  private velocityMmSec = 0;
  private distanceMm = 0;

  setRunning(running: boolean): void {
    this.running = running;
  }

  setJammed(jammed: boolean): void {
    this.jammed = jammed;
  }

  reset(): void {
    this.running = false;
    this.jammed = false;
    this.velocityMmSec = 0;
    this.distanceMm = 0;
  }

  step(dtMs: number): void {
    const dtSec = dtMs / 1000;
    const target = this.running && !this.jammed ? NOMINAL_VELOCITY_MM_SEC : 0;
    this.velocityMmSec += (target - this.velocityMmSec) * Math.min(1, dtSec * 6);
    this.distanceMm += this.velocityMmSec * dtSec;
  }

  getTelemetry(): ConveyorTelemetry {
    return {
      velocityMmSec: this.velocityMmSec,
      distanceMm: this.distanceMm,
      jammed: this.jammed,
    };
  }

  isReady(): boolean {
    return !this.jammed;
  }

  isRunning(): boolean {
    return this.running;
  }
}
