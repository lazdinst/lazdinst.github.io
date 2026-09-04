import { useHotkey } from "@tanstack/react-hotkeys";
import { fleetRuntime, sortAssets } from "@/fleet";
import { useFleetSnapshot, useFleetView, useSelectedAsset } from "../hooks";
import { useZoneEditor } from "../context/useZoneEditor";
import { useDevicePrefs } from "../shell/useDevicePrefs";
import { useShellUi } from "../shell/useShellUi";


const OPTIONS = { ignoreInputs: true, preventDefault: true } as const;

export function FleetHotkeys() {
  const snapshot = useFleetSnapshot();
  const view = useFleetView();
  const selected = useSelectedAsset();
  const ui = useShellUi();
  const zoneEditor = useZoneEditor();
  const { toggleFavorite } = useDevicePrefs();

  const step = (direction: 1 | -1) => {
    const order = sortAssets(snapshot.assets, "callsign");
    if (order.length === 0) return;
    const index = order.findIndex((asset) => asset.id === snapshot.selectedAssetId);
    const next = index === -1 ? (direction === 1 ? 0 : order.length - 1) : (index + direction + order.length) % order.length;
    ui.focusAsset(order[next].id);
  };

  useHotkey("Mod+K", () => ui.focusSearch(), OPTIONS);
  useHotkey("J", () => step(1), OPTIONS);
  useHotkey("K", () => step(-1), OPTIONS);
  useHotkey("F", () => ui.setFollow(!ui.follow), { ...OPTIONS, enabled: selected !== null });
  useHotkey("M", () => (ui.drawerPanel === "operations" ? ui.closeDrawer() : ui.openDrawer("operations")), OPTIONS);
  useHotkey("Z", () => zoneEditor.startDraw("exclusion"), OPTIONS);
  useHotkey("Enter", () => zoneEditor.finishDraw(), { ...OPTIONS, enabled: zoneEditor.mode === "draw" });
  useHotkey("L", () => ui.setLogOpen(!ui.logOpen), OPTIONS);
  useHotkey("H", () => ui.setKeysOpen(!ui.keysOpen), OPTIONS);
  useHotkey(
    "P",
    () => {
      if (selected) ui.openDrawer("planner");
    },
    { ...OPTIONS, enabled: selected !== null }
  );
  useHotkey(
    "B",
    () => {
      if (selected) fleetRuntime.returnToBase(selected.id);
    },
    { ...OPTIONS, enabled: selected !== null }
  );
  useHotkey(
    "X",
    () => {
      if (selected?.missionId) fleetRuntime.abortMission(selected.missionId);
    },
    { ...OPTIONS, enabled: selected?.missionId != null }
  );
  useHotkey(
    "S",
    () => {
      if (selected) toggleFavorite(selected.id);
    },
    { ...OPTIONS, enabled: selected !== null }
  );
  useHotkey(
    "Space",
    () => (view.status === "running" ? fleetRuntime.pause() : fleetRuntime.start()),
    OPTIONS
  );
  useHotkey(
    "Escape",
    () => {
      if (zoneEditor.mode !== "idle") {
        zoneEditor.cancel();
      } else if (ui.contextMenu) {
        ui.closeContextMenu();
      } else if (ui.keysOpen) {
        ui.setKeysOpen(false);
      } else if (ui.drawerOpen) {
        ui.closeDrawer();
      } else if (snapshot.selectedAssetId) {
        fleetRuntime.selectAsset(null);
      }
    },
    OPTIONS
  );

  return null;
}
