import { useEffect, type ReactNode } from "react";
import { fleetRuntime } from "@/fleet";
import { PlannerDraftProvider } from "../context/PlannerDraftContext";

interface FleetProviderProps {
  children: ReactNode;
}

/**
 * Drives the fleet runtime from requestAnimationFrame and starts it on mount
 * so the map is already moving when the page opens.
 */
export function FleetProvider({ children }: FleetProviderProps) {
  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();
    if (fleetRuntime.getView().status === "ready") {
      fleetRuntime.start();
    }
    const tick = (now: number) => {
      fleetRuntime.advance(now - lastTime);
      lastTime = now;
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <PlannerDraftProvider>{children}</PlannerDraftProvider>;
}
