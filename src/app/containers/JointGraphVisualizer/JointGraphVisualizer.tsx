import { useState } from "react";
import { useSelector } from "react-redux";
import { Switch } from "@/components/ui/switch";
import { JOINT_GRAPHS_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useDisplayedSnapshot, useJoints, useRobot } from "../../context";
import StreamingGraphContainer from "../StreamingGraphContainer";
import type { RootState } from "../../../redux";

export function JointGraphVisualizer() {
  const { jointBuffer } = useJoints();
  const { specs } = useRobot();
  const snapshot = useDisplayedSnapshot();
  const { angleUnit } = useSelector((state: RootState) => state.settings);
  const [isRenderingEnabled, setRenderingEnabled] = useState(true);
  const jointsById = new Map(
    (snapshot.robot?.joints ?? []).map((joint) => [joint.id, joint])
  );

  return (
    <PanelSection
      title="Joints"
      info={JOINT_GRAPHS_HELP}
      trailing={
        <Switch
          id="graph-renderer"
          size="sm"
          checked={isRenderingEnabled}
          onCheckedChange={setRenderingEnabled}
          aria-label="Toggle joint graphs"
        />
      }
    >
      {isRenderingEnabled ? (
        <div className="flex flex-col gap-1.5">
          {specs.map((spec) => (
            <StreamingGraphContainer
              key={spec.id}
              label={spec.label}
              data={jointBuffer[spec.id] || []}
              angleUnit={angleUnit}
              lowerRad={spec.lowerRad}
              upperRad={spec.upperRad}
              signal={jointsById.get(spec.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs tracking-wide text-muted-foreground">
          Enable graphs to stream joint angles.
        </p>
      )}
    </PanelSection>
  );
}

export default JointGraphVisualizer;
