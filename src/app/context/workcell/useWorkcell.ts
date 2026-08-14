import { useSyncExternalStore } from "react";
import { getWorkcellView, subscribeWorkcellView, type WorkcellView } from "@/workcell";

export function useWorkcell(): WorkcellView {
  return useSyncExternalStore(
    subscribeWorkcellView,
    getWorkcellView,
    getWorkcellView
  );
}
