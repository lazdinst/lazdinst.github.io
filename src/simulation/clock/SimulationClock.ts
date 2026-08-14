import type { SimulationStatus } from "../types/SimulationSnapshot";

export class SimulationClock {
  private simTimeMs = 0;
  private status: SimulationStatus = "ready";
  private timeScale: number;
  private readonly dtMs: number;

  constructor(dtMs: number, timeScale = 1) {
    if (dtMs <= 0) {
      throw new Error("SimulationClock dtMs must be > 0");
    }
    this.dtMs = dtMs;
    this.timeScale = timeScale;
  }

  getSimTimeMs(): number {
    return this.simTimeMs;
  }

  getStatus(): SimulationStatus {
    return this.status;
  }

  getTimeScale(): number {
    return this.timeScale;
  }

  getDtMs(): number {
    return this.dtMs;
  }

  setTimeScale(timeScale: number): void {
    if (timeScale < 0) {
      throw new Error("SimulationClock timeScale must be >= 0");
    }
    this.timeScale = timeScale;
  }

  start(): boolean {
    if (this.status === "running") {
      return false;
    }
    this.status = "running";
    return true;
  }

  pause(): boolean {
    if (this.status !== "running") {
      return false;
    }
    this.status = "paused";
    return true;
  }

  reset(): void {
    this.simTimeMs = 0;
    this.status = "ready";
  }

  isRunning(): boolean {
    return this.status === "running";
  }

  step(): boolean {
    if (this.status !== "running") {
      return false;
    }
    this.simTimeMs += this.dtMs;
    return true;
  }
}
