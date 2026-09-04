import { useEffect } from "react";
import { fleetRuntime } from "@/fleet";
import { cn } from "@/lib/utils";
import { DeviceCard } from "../containers/DeviceCard";
import { DeviceSearch } from "../containers/DeviceSearch";
import { FleetMap } from "../containers/FleetMap";
import { MapContextMenu } from "../containers/MapContextMenu";
import { ThreatCard } from "../containers/ThreatCard";
import { ZoneDeleteDialog } from "../containers/ZoneManager";
import { useFleetSnapshot, useSelectedAsset } from "../hooks";
import { FleetHotkeys } from "../hotkeys/FleetHotkeys";
import { ZoneEditorProvider } from "../context/ZoneEditorProvider";
import { LogDrawer } from "./LogDrawer";
import { ModeBanners } from "./ModeBanners";
import { OperationsDrawer } from "./OperationsDrawer";
import { PlannerDrawer } from "./PlannerDrawer";
import { SimStatusBar } from "./SimStatusBar";
import { DevicePrefsProvider } from "./DevicePrefsProvider";
import { ShellUiProvider } from "./ShellUiProvider";
import { useDevicePrefs } from "./useDevicePrefs";
import { useShellUi } from "./useShellUi";

/**
 * Map-first shell. The map fills the viewport; everything else floats over
 * it with a 12 px gutter: search and a left column (operations drawer or the
 * selected device card), the simulation bar top-right, map controls
 * bottom-right, and the event log along the bottom.
 */
export function FleetShell() {
  return (
    <DevicePrefsProvider>
      <ShellUiProvider>
        <ZoneEditorProvider>
          <FleetShellLayout />
          <FleetHotkeys />
          <ZoneDeleteDialog />
        </ZoneEditorProvider>
      </ShellUiProvider>
    </DevicePrefsProvider>
  );
}

function FleetShellLayout() {
  const snapshot = useFleetSnapshot();
  const selected = useSelectedAsset();
  const { pushRecent } = useDevicePrefs();
  const { drawerPanel, openDrawer, closeDrawer, logOpen, setLogOpen, selectedHostileId, selectHostile } = useShellUi();
  const selectedHostile = snapshot.hostiles.find((hostile) => hostile.id === selectedHostileId) ?? null;

  useEffect(() => {
    if (snapshot.selectedAssetId) pushRecent(snapshot.selectedAssetId);
  }, [snapshot.selectedAssetId, pushRecent]);

  return (
    <div className="relative isolate h-svh w-svw overflow-hidden bg-background text-foreground">
      <MapContextMenu>
        <FleetMap />
      </MapContextMenu>

      <div className="pointer-events-none absolute top-14 bottom-3 left-3 z-10 flex w-[min(100vw-1.5rem,23rem)] flex-col gap-2 lg:top-3">
        <DeviceSearch
          menuOpen={drawerPanel === "operations"}
          onToggleMenu={() => (drawerPanel === "operations" ? closeDrawer() : openDrawer("operations"))}
          onSelect={() => closeDrawer()}
        />
        <div className={cn("flex min-h-0 flex-1 flex-col", logOpen && "pb-[13.5rem]")}>
          {drawerPanel === "operations" ? (
            <OperationsDrawer onClose={closeDrawer} />
          ) : drawerPanel === "planner" ? (
            <PlannerDrawer onClose={closeDrawer} />
          ) : selectedHostile ? (
            <ThreatCard hostile={selectedHostile} onClose={() => selectHostile(null)} />
          ) : selected ? (
            <DeviceCard
              asset={selected}
              onClose={() => fleetRuntime.selectAsset(null)}
              onPlan={() => openDrawer("planner")}
            />
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute top-3 right-3 z-10 flex max-w-[calc(100vw-1.5rem)] flex-col items-stretch gap-2">
        <SimStatusBar logOpen={logOpen} onToggleLog={() => setLogOpen(!logOpen)} />
        <ModeBanners />
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-3 z-10 flex justify-center",
          logOpen ? "right-16 left-3" : "right-16 left-3 sm:left-[24.5rem]"
        )}
      >
        <div className={cn("flex min-w-0", logOpen ? "w-full" : "max-w-full")}>
          <LogDrawer open={logOpen} onToggle={() => setLogOpen(!logOpen)} />
        </div>
      </div>
    </div>
  );
}
