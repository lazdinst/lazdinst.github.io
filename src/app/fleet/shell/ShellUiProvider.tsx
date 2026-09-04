import { useCallback, useMemo, useState, type ReactNode } from "react";
import { fleetRuntime, type LatLng } from "@/fleet";
import {
  SEARCH_INPUT_ID,
  ShellUiContext,
  type ContextMenuTarget,
  type DrawerPanel,
  type FocusRequest,
} from "./useShellUi";

export function ShellUiProvider({ children }: { children: ReactNode }) {
  const [drawerPanel, setDrawerPanel] = useState<DrawerPanel | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const [follow, setFollow] = useState(false);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null);

  const [selectedHostileId, setSelectedHostileId] = useState<string | null>(null);

  const focusAsset = useCallback((assetId: string) => {
    fleetRuntime.selectAsset(assetId);
    setSelectedHostileId(null);
    setFocusRequest((current) => ({ assetId, nonce: (current?.nonce ?? 0) + 1 }));
  }, []);

  const focusPoint = useCallback((point: LatLng) => {
    setFocusRequest((current) => ({ point, nonce: (current?.nonce ?? 0) + 1 }));
  }, []);

  const selectHostile = useCallback((hostileId: string | null) => setSelectedHostileId(hostileId), []);

  const focusSearch = useCallback(() => {
    const input = document.getElementById(SEARCH_INPUT_ID);
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
  }, []);

  const openDrawer = useCallback((panel: DrawerPanel) => setDrawerPanel(panel), []);
  const closeDrawer = useCallback(() => setDrawerPanel(null), []);
  const setDrawerOpen = useCallback((open: boolean) => setDrawerPanel(open ? "operations" : null), []);

  const openContextMenu = useCallback((target: ContextMenuTarget) => setContextMenu(target), []);
  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const value = useMemo(
    () => ({
      drawerPanel,
      openDrawer,
      closeDrawer,
      drawerOpen: drawerPanel !== null,
      setDrawerOpen,
      logOpen,
      setLogOpen,
      keysOpen,
      setKeysOpen,
      follow,
      setFollow,
      focusRequest,
      focusAsset,
      focusPoint,
      selectedHostileId,
      selectHostile,
      focusSearch,
      contextMenu,
      openContextMenu,
      closeContextMenu,
    }),
    [
      drawerPanel,
      openDrawer,
      closeDrawer,
      setDrawerOpen,
      logOpen,
      keysOpen,
      follow,
      focusRequest,
      focusAsset,
      focusPoint,
      selectedHostileId,
      selectHostile,
      focusSearch,
      contextMenu,
      openContextMenu,
      closeContextMenu,
    ]
  );

  return <ShellUiContext.Provider value={value}>{children}</ShellUiContext.Provider>;
}
