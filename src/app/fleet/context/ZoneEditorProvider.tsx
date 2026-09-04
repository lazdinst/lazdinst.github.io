import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fleetRuntime, type LatLng, type Zone, type ZoneType } from "@/fleet";
import { useFleetArea } from "../hooks";
import { ZoneEditorContext, type ZoneEditorMode, type ZoneFocusRequest } from "./useZoneEditor";

const STORAGE_KEY = "fleet.zones.v1";
/** Two clicks closer than this (about a meter) are the same vertex. */
const DUPLICATE_EPSILON_DEG = 1e-5;

function isLatLng(value: unknown): value is LatLng {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as LatLng).lat === "number" &&
    typeof (value as LatLng).lng === "number"
  );
}

function readSavedZones(): Zone[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const zones = parsed.filter(
      (zone): zone is Zone =>
        typeof zone === "object" &&
        zone !== null &&
        typeof (zone as Zone).id === "string" &&
        typeof (zone as Zone).name === "string" &&
        typeof (zone as Zone).type === "string" &&
        Array.isArray((zone as Zone).polygon) &&
        (zone as Zone).polygon.every(isLatLng)
    );
    return zones;
  } catch {
    return null;
  }
}

function writeSavedZones(zones: Zone[] | null): void {
  try {
    if (zones === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
    }
  } catch {
    // Storage may be unavailable; edits still live in the runtime for the session.
  }
}

/**
 * Draw and edit state for zones. The zones themselves live in the fleet
 * runtime; this only tracks what the operator is doing to them and persists
 * a modified set per browser.
 */
export function ZoneEditorProvider({ children }: { children: ReactNode }) {
  const area = useFleetArea();
  const [mode, setMode] = useState<ZoneEditorMode>("idle");
  const [draftType, setDraftType] = useState<ZoneType>("exclusion");
  const [draftPoints, setDraftPoints] = useState<LatLng[]>([]);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [renameRequestId, setRenameRequestId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<ZoneFocusRequest | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingReset, setPendingReset] = useState(false);
  const restored = useRef(false);

  // Restore a saved zone set once, before the first paint of the map.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const saved = readSavedZones();
    if (saved && saved.length > 0) fleetRuntime.setZones(saved, { silent: true });
  }, []);

  // Persist whenever the runtime's zone set diverges from the defaults.
  useEffect(() => {
    if (!restored.current) return;
    writeSavedZones(fleetRuntime.zonesModified() ? area.zones : null);
  }, [area.zones]);

  // Selection and editing cannot outlive their zone.
  useEffect(() => {
    const ids = new Set(area.zones.map((zone) => zone.id));
    if (selectedZoneId && !ids.has(selectedZoneId)) setSelectedZoneId(null);
    if (pendingDeleteId && !ids.has(pendingDeleteId)) setPendingDeleteId(null);
    if (editingZoneId && !ids.has(editingZoneId)) {
      setEditingZoneId(null);
      setMode((current) => (current === "edit" ? "idle" : current));
    }
  }, [area.zones, selectedZoneId, editingZoneId, pendingDeleteId]);

  const startDraw = useCallback((type?: ZoneType, firstPoint?: LatLng) => {
    if (type) setDraftType(type);
    setEditingZoneId(null);
    setDraftPoints(firstPoint ? [firstPoint] : []);
    setMode("draw");
  }, []);

  const addDraftPoint = useCallback((point: LatLng) => {
    setDraftPoints((current) => {
      const last = current[current.length - 1];
      if (
        last &&
        Math.abs(last.lat - point.lat) < DUPLICATE_EPSILON_DEG &&
        Math.abs(last.lng - point.lng) < DUPLICATE_EPSILON_DEG
      ) {
        return current;
      }
      return [...current, point];
    });
  }, []);

  const undoDraftPoint = useCallback(() => {
    setDraftPoints((current) => current.slice(0, -1));
  }, []);

  const finishDraw = useCallback((): Zone | null => {
    if (draftPoints.length < 3) return null;
    const zone = fleetRuntime.addZone({ type: draftType, polygon: draftPoints });
    setDraftPoints([]);
    setMode("idle");
    if (zone) setSelectedZoneId(zone.id);
    return zone;
  }, [draftPoints, draftType]);

  const startEdit = useCallback((zoneId: string) => {
    setDraftPoints([]);
    setEditingZoneId(zoneId);
    setSelectedZoneId(zoneId);
    setMode("edit");
  }, []);

  const stopEdit = useCallback(() => {
    setEditingZoneId(null);
    setMode((current) => (current === "edit" ? "idle" : current));
  }, []);

  const cancel = useCallback(() => {
    setDraftPoints([]);
    setEditingZoneId(null);
    setMode("idle");
  }, []);

  const selectZone = useCallback((zoneId: string | null) => {
    setSelectedZoneId(zoneId);
  }, []);

  const focusZone = useCallback((zoneId: string) => {
    setSelectedZoneId(zoneId);
    setFocusRequest((current) => ({ zoneId, nonce: (current?.nonce ?? 0) + 1 }));
  }, []);

  const requestRename = useCallback((zoneId: string) => {
    setSelectedZoneId(zoneId);
    setRenameRequestId(zoneId);
  }, []);

  const clearRenameRequest = useCallback(() => setRenameRequestId(null), []);
  const requestDelete = useCallback((zoneId: string) => setPendingDeleteId(zoneId), []);
  const cancelDelete = useCallback(() => setPendingDeleteId(null), []);
  const requestReset = useCallback(() => setPendingReset(true), []);
  const cancelReset = useCallback(() => setPendingReset(false), []);

  const value = useMemo(
    () => ({
      mode,
      draftType,
      draftPoints,
      editingZoneId,
      selectedZoneId,
      renameRequestId,
      focusRequest,
      pendingDeleteId,
      pendingReset,
      setDraftType,
      startDraw,
      addDraftPoint,
      undoDraftPoint,
      finishDraw,
      startEdit,
      stopEdit,
      cancel,
      selectZone,
      focusZone,
      requestRename,
      clearRenameRequest,
      requestDelete,
      cancelDelete,
      requestReset,
      cancelReset,
    }),
    [
      mode,
      draftType,
      draftPoints,
      editingZoneId,
      selectedZoneId,
      renameRequestId,
      focusRequest,
      pendingDeleteId,
      pendingReset,
      startDraw,
      addDraftPoint,
      undoDraftPoint,
      finishDraw,
      startEdit,
      stopEdit,
      cancel,
      selectZone,
      focusZone,
      requestRename,
      clearRenameRequest,
      requestDelete,
      cancelDelete,
      requestReset,
      cancelReset,
    ]
  );

  return <ZoneEditorContext.Provider value={value}>{children}</ZoneEditorContext.Provider>;
}
