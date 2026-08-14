import type { FaultId, FaultTelemetry } from "../types/SimulationSnapshot";
import type { ActiveFault } from "./types";

export class FaultInjector {
  private readonly active = new Map<FaultId, ActiveFault>();

  inject(id: FaultId, timestampMs: number): boolean {
    if (this.active.has(id)) {
      return false;
    }
    this.active.set(id, { id, injectedAtMs: timestampMs });
    return true;
  }

  clear(id: FaultId): boolean {
    return this.active.delete(id);
  }

  clearAll(): void {
    this.active.clear();
  }

  isActive(id: FaultId): boolean {
    return this.active.has(id);
  }

  getActive(): ActiveFault[] {
    return [...this.active.values()];
  }

  getTelemetry(): FaultTelemetry {
    return { activeIds: this.getActive().map((fault) => fault.id) };
  }

  reset(): void {
    this.active.clear();
  }
}
