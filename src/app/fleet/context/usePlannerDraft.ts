import { createContext, useContext } from "react";
import type { LatLng, ObjectiveType } from "@/fleet";

export interface PlannerDraft {
  objectiveType: ObjectiveType;
  /** Named waypoint id for transit, or null when a map point is used. */
  waypointId: string | null;
  /** Map-picked transit target. */
  pickedTarget: LatLng | null;
  /** Waypoint ids for patrol loops, in order. */
  patrolWaypointIds: string[];
  surveyAreaId: string | null;
  /** Engage: hostile ids to target; empty means every active hostile. */
  engageHostileIds: string[];
  swathM: number;
  /** True while the next map click sets the transit target. */
  pickMode: boolean;
}

export interface PlannerDraftValue {
  draft: PlannerDraft;
  update: (patch: Partial<PlannerDraft>) => void;
  setPickMode: (on: boolean) => void;
  setPickedTarget: (target: LatLng) => void;
}

export const PlannerDraftContext = createContext<PlannerDraftValue | null>(null);

export function usePlannerDraft(): PlannerDraftValue {
  const value = useContext(PlannerDraftContext);
  if (!value) throw new Error("usePlannerDraft must be used inside PlannerDraftProvider");
  return value;
}
