import type { MaintenanceRecord, WorkOrder } from "../types";

const SEVERITY_WEIGHT: Record<WorkOrder["severity"], number> = {
  low: 0.05,
  medium: 0.12,
  high: 0.3,
};

export function computeHealthScore(
  hoursSinceService: number,
  serviceIntervalHours: number,
  workOrders: WorkOrder[],
  faultCount: number,
  meanSensorHealth: number
): number {
  const wear = Math.min(1.2, hoursSinceService / serviceIntervalHours);
  const orders = workOrders.reduce((sum, order) => sum + SEVERITY_WEIGHT[order.severity], 0);
  const score = 1 - 0.45 * wear - orders - 0.2 * faultCount - 0.25 * (1 - meanSensorHealth);
  return Math.max(0, Math.min(1, score));
}

export function isMaintenanceDue(record: Pick<MaintenanceRecord, "hoursSinceService" | "serviceIntervalHours" | "workOrders">): boolean {
  return (
    record.hoursSinceService >= record.serviceIntervalHours ||
    record.workOrders.some((order) => order.severity === "high")
  );
}

/** Sim hours to add for a tick where the asset moved. */
export function hoursForTick(dtMs: number, moving: boolean): number {
  return moving ? dtMs / 3_600_000 : 0;
}
