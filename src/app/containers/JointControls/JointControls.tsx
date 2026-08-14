import { House } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOINTS_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useRobot } from "../../context";
import { robotRuntime } from "@/robotics";
import { GhostToggle } from "../GhostToggle/GhostToggle";
import JointIncrementalControl from "./JointIncrementalControl";
import JointSlider from "./JointSlider";

export function JointControls() {
  const { specs, positionsRad } = useRobot();

  return (
    <PanelSection
      title="Joints"
      info={JOINTS_HELP}
      trailing={
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="xs"
            aria-label="Home robot"
            onClick={() => robotRuntime.resetPose()}
          >
            <House />
            Home
          </Button>
          <GhostToggle />
        </div>
      }
    >
      <div className="flex flex-col gap-1">
        {specs.map((spec) => {
          const radians = positionsRad[spec.id] ?? 0;
          return (
            <div key={spec.id} className="flex h-5 items-center gap-1.5">
              <JointIncrementalControl
                jointName={spec.id}
                label={spec.label}
                value={radians}
                lowerRad={spec.lowerRad}
                upperRad={spec.upperRad}
              />
              <JointSlider
                jointName={spec.id}
                label={spec.label}
                value={radians}
                lowerRad={spec.lowerRad}
                upperRad={spec.upperRad}
              />
            </div>
          );
        })}
      </div>
    </PanelSection>
  );
}

export default JointControls;
