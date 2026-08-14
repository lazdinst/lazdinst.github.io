import type { SafetyTelemetry } from "@/simulation";
import { DEFAULT_SAFETY_ZONES, type SafetyZoneLayout } from "./zones";

const REDUCED_SPEED_SCALE = 0.4;

export class SafetySystem {
  readonly zones: SafetyZoneLayout;
  private warningOccupied = false;
  private protectiveOccupied = false;
  private lightCurtainClear = true;
  private eStop = false;
  private guardDoorClosed = true;
  private lastProtective = false;
  private lastWarning = false;

  constructor(zones: SafetyZoneLayout = DEFAULT_SAFETY_ZONES) {
    this.zones = zones;
  }

  setWarningOccupied(occupied: boolean): void {
    this.warningOccupied = occupied;
  }

  setProtectiveOccupied(occupied: boolean): void {
    this.protectiveOccupied = occupied;
  }

  setLightCurtainClear(clear: boolean): void {
    this.lightCurtainClear = clear;
  }

  setEStop(active: boolean): void {
    this.eStop = active;
  }

  setGuardDoorClosed(closed: boolean): void {
    this.guardDoorClosed = closed;
  }

  reset(): void {
    this.warningOccupied = false;
    this.protectiveOccupied = false;
    this.lightCurtainClear = true;
    this.eStop = false;
    this.guardDoorClosed = true;
    this.lastProtective = false;
    this.lastWarning = false;
  }

  consumeEdge(): {
    warningEntered: boolean;
    protectiveEntered: boolean;
  } {
    const warningEntered = this.warningOccupied && !this.lastWarning;
    const protectiveEntered =
      this.isProtectiveStop() && !this.lastProtective;
    this.lastWarning = this.warningOccupied;
    this.lastProtective = this.isProtectiveStop();
    return { warningEntered, protectiveEntered };
  }

  isProtectiveStop(): boolean {
    return (
      this.eStop ||
      this.protectiveOccupied ||
      !this.lightCurtainClear ||
      !this.guardDoorClosed
    );
  }

  getSpeedScale(): number {
    if (this.isProtectiveStop()) {
      return 0;
    }
    if (this.warningOccupied) {
      return REDUCED_SPEED_SCALE;
    }
    return 1;
  }

  getTelemetry(): SafetyTelemetry {
    const protectiveStop = this.isProtectiveStop();
    const reducedSpeed = !protectiveStop && this.warningOccupied;
    const scannerClear = !this.warningOccupied && !this.protectiveOccupied;
    const safetyClear = scannerClear && this.lightCurtainClear && !this.eStop && this.guardDoorClosed;
    return {
      scannerClear,
      lightCurtainClear: this.lightCurtainClear,
      eStop: this.eStop,
      guardDoorClosed: this.guardDoorClosed,
      safetyClear,
      reducedSpeed,
      protectiveStop,
      warningZoneOccupied: this.warningOccupied,
      protectiveZoneOccupied: this.protectiveOccupied,
      speedScale: this.getSpeedScale(),
    };
  }
}
