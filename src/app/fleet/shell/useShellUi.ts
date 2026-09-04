import { createContext, useContext } from "react";
import type { LatLng } from "@/fleet";

export interface ContextMenuTarget {
  clientX: number;
  clientY: number;
  latlng: LatLng;
  /** Set when the right-click landed on a device marker. */
  assetId: string | null;
  /** Set when the right-click landed on a zone polygon. */
  zoneId?: string | null;
  /** Set when the right-click landed on a hostile marker. */
  hostileId?: string | null;
}

/** What the left column shows besides the device card. */
export type DrawerPanel = "operations" | "planner";

export interface FocusRequest {
  assetId?: string;
  /** Explicit point to fly to, used for hostiles and map features. */
  point?: LatLng;
  nonce: number;
}

export interface ShellUi {
  /** Open drawer panel, or null when the column shows the device card. */
  drawerPanel: DrawerPanel | null;
  openDrawer: (panel: DrawerPanel) => void;
  closeDrawer: () => void;
  /** Convenience for callers that only care whether any drawer is up. */
  drawerOpen: boolean;
  /** Opens the operations drawer or closes whichever panel is up. */
  setDrawerOpen: (open: boolean) => void;
  logOpen: boolean;
  setLogOpen: (open: boolean) => void;
  keysOpen: boolean;
  setKeysOpen: (open: boolean) => void;
  follow: boolean;
  setFollow: (follow: boolean) => void;
  focusRequest: FocusRequest | null;
  /** Select a device and pan the map to it. */
  focusAsset: (assetId: string) => void;
  /** Pan the map to a point without changing the selection. */
  focusPoint: (point: LatLng) => void;
  selectedHostileId: string | null;
  selectHostile: (hostileId: string | null) => void;
  focusSearch: () => void;
  contextMenu: ContextMenuTarget | null;
  openContextMenu: (target: ContextMenuTarget) => void;
  closeContextMenu: () => void;
}

export const SEARCH_INPUT_ID = "fleet-device-search";

export const ShellUiContext = createContext<ShellUi | null>(null);

export function useShellUi(): ShellUi {
  const value = useContext(ShellUiContext);
  if (!value) throw new Error("useShellUi must be used inside ShellUiProvider");
  return value;
}
