import { useMemo, useSyncExternalStore } from "react";
import {
  fleetRuntime,
  getFleetEvents,
  getFleetSnapshot,
  getFleetView,
  subscribeFleetEvents,
  subscribeFleetSnapshot,
  subscribeFleetView,
  type Asset,
  type FleetSnapshot,
  type FleetView,
  type Mission,
  type OperatingArea,
} from "@/fleet";
import type { SimulationEvent } from "@/simulation";

export function useFleetView(): FleetView {
  return useSyncExternalStore(subscribeFleetView, getFleetView, getFleetView);
}

export function useFleetSnapshot(): FleetSnapshot {
  return useSyncExternalStore(subscribeFleetSnapshot, getFleetSnapshot, getFleetSnapshot);
}

export function useFleetEvents(): SimulationEvent[] {
  return useSyncExternalStore(subscribeFleetEvents, getFleetEvents, getFleetEvents);
}

export function useSelectedAsset(): Asset | null {
  const snapshot = useFleetSnapshot();
  return useMemo(
    () => snapshot.assets.find((asset) => asset.id === snapshot.selectedAssetId) ?? null,
    [snapshot.assets, snapshot.selectedAssetId]
  );
}

export function useAssetMission(asset: Asset | null): Mission | null {
  const snapshot = useFleetSnapshot();
  return useMemo(() => {
    if (!asset?.missionId) return null;
    return snapshot.missions.find((mission) => mission.id === asset.missionId) ?? null;
  }, [snapshot.missions, asset?.missionId]);
}

/** The operating area; a new object whenever zones change, so edits re-render. */
export function useFleetArea(): OperatingArea {
  return useSyncExternalStore(subscribeFleetSnapshot, fleetRuntime.getArea, fleetRuntime.getArea);
}
