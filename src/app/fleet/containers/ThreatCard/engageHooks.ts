import { useMemo } from "react";
import { buildEngageObjective, fleetRuntime, haversineM, type Asset, type Hostile } from "@/fleet";
import { useFleetSnapshot } from "../../hooks";
import { useShellUi } from "../../shell/useShellUi";

export function useArmedCandidates(target: Hostile | null) {
  const snapshot = useFleetSnapshot();
  return useMemo(
    () =>
      snapshot.assets
        .filter((asset) => asset.weapon)
        .map((asset) => ({
          asset,
          distanceM: target ? haversineM(asset.position, target.position) : 0,
          blocker: fleetRuntime.dispatchBlocker(asset.id) ?? (asset.weapon!.ammo === 0 ? "No ammunition" : null),
        }))
        .sort((a, b) => a.distanceM - b.distanceM),
    [snapshot.assets, target]
  );
}

/** Plans and dispatches the recommended route against `hostiles`; opens the planner on refusal. */
export function useQuickEngage() {
  const ui = useShellUi();
  return (asset: Asset, hostiles: Hostile[]) => {
    const objective = buildEngageObjective(asset.position, hostiles);
    if (!objective) return false;
    fleetRuntime.selectAsset(asset.id);
    ui.selectHostile(null);
    fleetRuntime.planMission(asset.id, objective);
    const result = fleetRuntime.dispatch();
    if (!result.ok) ui.openDrawer("planner");
    return result.ok;
  };
}

