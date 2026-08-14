import { useSyncExternalStore } from "react";
import {
  getSimulationEvents,
  subscribeSimulationEvents,
  type SimulationEvent,
} from "@/simulation";

export function useSimulationEvents(): SimulationEvent[] {
  return useSyncExternalStore(
    subscribeSimulationEvents,
    getSimulationEvents,
    getSimulationEvents
  );
}
