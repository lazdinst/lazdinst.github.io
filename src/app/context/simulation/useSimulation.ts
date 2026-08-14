import { useSyncExternalStore } from "react";
import {
  getSimulationView,
  subscribeSimulationView,
  type SimulationView,
} from "@/simulation";

export function useSimulation(): SimulationView {
  return useSyncExternalStore(
    subscribeSimulationView,
    getSimulationView,
    getSimulationView
  );
}
