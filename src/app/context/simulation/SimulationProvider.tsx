import { useEffect, type ReactNode } from "react";
import { simulationEngine } from "@/simulation";

interface SimulationProviderProps {
  children: ReactNode;
}

export function SimulationProvider({ children }: SimulationProviderProps) {
  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      simulationEngine.advance(now - lastTime);
      lastTime = now;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <>{children}</>;
}
