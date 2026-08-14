import { createSimulationEngine } from "../engine/createSimulationEngine";

export const simulationEngine = createSimulationEngine();

export function subscribeSimulationView(onStoreChange: () => void): () => void {
  return simulationEngine.subscribeView(onStoreChange);
}

export function getSimulationView() {
  return simulationEngine.getView();
}

export function subscribeSimulationEvents(
  onStoreChange: () => void
): () => void {
  return simulationEngine.subscribeEvents(onStoreChange);
}

export function getSimulationEvents() {
  return simulationEngine.getEvents();
}

export function subscribeDisplayedSnapshot(
  onStoreChange: () => void
): () => void {
  return simulationEngine.subscribeView(onStoreChange);
}

export function getDisplayedSnapshot() {
  return simulationEngine.getDisplayedSnapshot();
}
