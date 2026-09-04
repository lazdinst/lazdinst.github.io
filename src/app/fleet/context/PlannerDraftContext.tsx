import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { LatLng } from "@/fleet";
import { PlannerDraftContext, type PlannerDraft } from "./usePlannerDraft";

const DEFAULT_DRAFT: PlannerDraft = {
  objectiveType: "transit",
  waypointId: "ridge-op",
  pickedTarget: null,
  patrolWaypointIds: ["rally-a", "farm-east"],
  surveyAreaId: "svy-farm",
  engageHostileIds: [],
  swathM: 150,
  pickMode: false,
};

export function PlannerDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<PlannerDraft>(DEFAULT_DRAFT);
  const update = useCallback((patch: Partial<PlannerDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);
  const setPickMode = useCallback((on: boolean) => {
    setDraft((current) => ({ ...current, pickMode: on }));
  }, []);
  const setPickedTarget = useCallback((target: LatLng) => {
    setDraft((current) => ({ ...current, pickedTarget: target, waypointId: null, pickMode: false }));
  }, []);
  const value = useMemo(
    () => ({ draft, update, setPickMode, setPickedTarget }),
    [draft, update, setPickMode, setPickedTarget]
  );
  return <PlannerDraftContext.Provider value={value}>{children}</PlannerDraftContext.Provider>;
}
