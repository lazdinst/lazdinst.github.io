import React, { useState } from "react";
import { useJoints } from "../../context";
import StreamingGraphContainer from "../StreamingGraphContainer";
import { JOINT_NAME_MAP } from "../../../constants";
import { JointGraphTitle, GraphContainer } from "./JointGraphVisualizer.style";
import { Toggle } from "../../components";

const JointGraphVisualizer: React.FC = () => {
  const { jointBuffer } = useJoints();
  const [isRenderingEnabled, setRenderingEnabled] = useState(true); // Toggle state

  const toggleRendering = () => {
    setRenderingEnabled((prev) => !prev);
  };

  return (
    <div>
      <Toggle
        label="Graph Renderer"
        checked={isRenderingEnabled}
        onChange={() => toggleRendering()}
      />
      {isRenderingEnabled && (
        <GraphContainer>
          {Object.keys(JOINT_NAME_MAP).map((jointName) => {
            const jointData = jointBuffer[jointName] || [];
            return (
              <div key={jointName} style={{ margin: "10px" }}>
                <JointGraphTitle>{JOINT_NAME_MAP[jointName]}</JointGraphTitle>
                <StreamingGraphContainer data={jointData} />
              </div>
            );
          })}
        </GraphContainer>
      )}
    </div>
  );
};

export default JointGraphVisualizer;
