import type { GripperTelemetry } from "@/simulation";

const OPEN_WIDTH_MM = 40;
const CLOSED_WIDTH_MM = 8;
const CONTACT_WIDTH_MM = 18;
const SECURE_FORCE_N = 12;

export class ParallelGripper {
  private openingWidthMm = OPEN_WIDTH_MM;
  private commandedWidthMm = OPEN_WIDTH_MM;
  private gripForceN = 0;
  private contact = false;
  private objectSecured = false;

  command(widthMm: number): void {
    this.commandedWidthMm = Math.min(OPEN_WIDTH_MM, Math.max(CLOSED_WIDTH_MM, widthMm));
  }

  close(): void {
    this.command(CLOSED_WIDTH_MM);
  }

  open(): void {
    this.command(OPEN_WIDTH_MM);
  }

  reset(): void {
    this.openingWidthMm = OPEN_WIDTH_MM;
    this.commandedWidthMm = OPEN_WIDTH_MM;
    this.gripForceN = 0;
    this.contact = false;
    this.objectSecured = false;
  }

  step(dtMs: number, contacting: boolean): void {
    const dtSec = dtMs / 1000;
    this.openingWidthMm +=
      (this.commandedWidthMm - this.openingWidthMm) * Math.min(1, dtSec * 8);
    this.contact = contacting && this.openingWidthMm <= CONTACT_WIDTH_MM;
    this.gripForceN = this.contact
      ? Math.min(40, (CONTACT_WIDTH_MM - this.openingWidthMm) * 2.4)
      : Math.max(0, this.gripForceN * (1 - dtSec * 6));
    this.objectSecured = this.contact && this.gripForceN >= SECURE_FORCE_N;
  }

  getTelemetry(): GripperTelemetry {
    return {
      openingWidthMm: this.openingWidthMm,
      commandedWidthMm: this.commandedWidthMm,
      gripForceN: this.gripForceN,
      contact: this.contact,
      objectSecured: this.objectSecured,
    };
  }
}
