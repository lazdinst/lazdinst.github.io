import { createContext, useContext } from "react";
import type { LatLng, Zone, ZoneType } from "@/fleet";

export type ZoneEditorMode = "idle" | "draw" | "edit";

export interface ZoneFocusRequest {
  zoneId: string;
  nonce: number;
}

export interface ZoneEditor {
  mode: ZoneEditorMode;
  /** Type the next drawn zone will get. */
  draftType: ZoneType;
  /** Vertices placed so far while drawing. */
  draftPoints: LatLng[];
  /** Zone whose vertices are currently draggable. */
  editingZoneId: string | null;
  selectedZoneId: string | null;
  /** Zone the list should open a rename field for; cleared by the list. */
  renameRequestId: string | null;
  focusRequest: ZoneFocusRequest | null;
  /** Zone awaiting delete confirmation. */
  pendingDeleteId: string | null;
  /** True while the reset-to-defaults confirmation is up. */
  pendingReset: boolean;

  setDraftType: (type: ZoneType) => void;
  startDraw: (type?: ZoneType, firstPoint?: LatLng) => void;
  addDraftPoint: (point: LatLng) => void;
  undoDraftPoint: () => void;
  /** Creates the zone when at least three points exist. */
  finishDraw: () => Zone | null;
  startEdit: (zoneId: string) => void;
  stopEdit: () => void;
  /** Leaves draw or edit mode without saving a draft. */
  cancel: () => void;
  selectZone: (zoneId: string | null) => void;
  /** Select and fly the map to the zone. */
  focusZone: (zoneId: string) => void;
  requestRename: (zoneId: string) => void;
  clearRenameRequest: () => void;
  /** Opens the delete confirmation; the dialog performs the removal. */
  requestDelete: (zoneId: string) => void;
  cancelDelete: () => void;
  requestReset: () => void;
  cancelReset: () => void;
}

export const ZoneEditorContext = createContext<ZoneEditor | null>(null);

export function useZoneEditor(): ZoneEditor {
  const value = useContext(ZoneEditorContext);
  if (!value) throw new Error("useZoneEditor must be used inside ZoneEditorProvider");
  return value;
}
