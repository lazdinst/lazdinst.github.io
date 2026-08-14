import { useSyncExternalStore } from "react";
import {
  getPerceptionView,
  subscribePerceptionView,
  type PerceptionView,
} from "@/perception";

export function usePerception(): PerceptionView {
  return useSyncExternalStore(
    subscribePerceptionView,
    getPerceptionView,
    getPerceptionView
  );
}
