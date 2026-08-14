import type { MutableRefObject } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { HotkeyBadge } from "../../components/HotkeyBadge";
import {
  fitRobot,
  focusTcp,
  resetStageCamera,
} from "./stageCameraActions";

interface CameraHudProps {
  controlsRef: MutableRefObject<CameraControlsImpl | null>;
}

export function CameraHud({ controlsRef }: CameraHudProps) {
  const run = (action: (controls: CameraControlsImpl) => void) => {
    const controls = controlsRef.current;
    if (controls) {
      action(controls);
    }
  };

  return (
    <div className="pointer-events-none flex max-w-[min(100%,22rem)] flex-col gap-1">
      <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-md border border-border bg-background/90 px-1.5 py-1 shadow-sm">
        <Button
          variant="ghost"
          size="xs"
          className="h-5 px-1.5 font-mono text-xs"
          onClick={() => run(focusTcp)}
        >
          Focus TCP
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="h-5 px-1.5 font-mono text-xs"
          onClick={() => run(fitRobot)}
        >
          Fit robot
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="h-5 px-1.5 font-mono text-xs"
          onClick={() => run(resetStageCamera)}
        >
          Reset view
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border bg-background/90 px-1.5 py-1 text-xs text-muted-foreground shadow-sm">
        <span className="flex items-center gap-0.5">
          <HotkeyBadge>LMB</HotkeyBadge>
          <span>orbit</span>
        </span>
        <span className="flex items-center gap-0.5">
          <HotkeyBadge>RMB</HotkeyBadge>
          <span>pan</span>
        </span>
        <span className="flex items-center gap-0.5">
          <HotkeyBadge>Shift</HotkeyBadge>
          <span>+ drag pan</span>
        </span>
        <span className="flex items-center gap-0.5">
          <HotkeyBadge>Scroll</HotkeyBadge>
          <span>zoom</span>
        </span>
        <span className="flex items-center gap-0.5">
          <HotkeyBadge>2×</HotkeyBadge>
          <span>focus</span>
        </span>
      </div>
    </div>
  );
}
