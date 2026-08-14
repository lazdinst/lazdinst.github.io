import { useSyncExternalStore } from "react";
import {
  getDiagnosticsView,
  subscribeDiagnosticsView,
  type DiagnosticsView,
} from "@/simulation/diagnostics/cellDiagnostics";

export function useDiagnostics(): DiagnosticsView {
  return useSyncExternalStore(
    subscribeDiagnosticsView,
    getDiagnosticsView,
    getDiagnosticsView
  );
}
