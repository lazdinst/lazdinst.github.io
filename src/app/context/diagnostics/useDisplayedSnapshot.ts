import { useSyncExternalStore } from "react";
import {
  getDisplayedSnapshot,
  subscribeDisplayedSnapshot,
  type SimulationSnapshot,
} from "@/simulation";

export function useDisplayedSnapshot(): SimulationSnapshot {
  return useSyncExternalStore(
    subscribeDisplayedSnapshot,
    getDisplayedSnapshot,
    getDisplayedSnapshot
  );
}
