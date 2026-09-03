import { FleetRuntime } from "./FleetRuntime";

export const fleetRuntime = new FleetRuntime();

export function subscribeFleetView(onStoreChange: () => void): () => void {
  return fleetRuntime.subscribeView(onStoreChange);
}

export function getFleetView() {
  return fleetRuntime.getView();
}

export function subscribeFleetSnapshot(onStoreChange: () => void): () => void {
  return fleetRuntime.subscribeSnapshot(onStoreChange);
}

export function getFleetSnapshot() {
  return fleetRuntime.getSnapshot();
}

export function subscribeFleetEvents(onStoreChange: () => void): () => void {
  return fleetRuntime.subscribeEvents(onStoreChange);
}

export function getFleetEvents() {
  return fleetRuntime.getEvents();
}
