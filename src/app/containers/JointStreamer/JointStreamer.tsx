import React, { useState } from "react";
import { useJoints } from "../../context";
import {
  Container,
  ToggleButton,
  JointList,
  JointItem,
  Label,
  ReadOnlyInput,
} from "./JointStreamer.style";
import { ALLOWED_JOINTS, JOINT_NAME_MAP } from "../../../constants";

const JointStreamer: React.FC = () => {
  const { jointValues } = useJoints();
  const [isDegrees, setIsDegrees] = useState(false);

  const toggleUnit = () => {
    setIsDegrees((prev) => !prev);
  };

  const formatValue = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) {
      return "—";
    }
    if (isDegrees) {
      return `${((value * 180) / Math.PI).toFixed(2)}°`;
    }
    return value.toFixed(2);
  };

  return (
    <Container>
      <ToggleButton onClick={toggleUnit}>{isDegrees ? "○" : "π"}</ToggleButton>
      <JointList>
        {Object.entries(jointValues)
          .filter(([jointName]) => ALLOWED_JOINTS[jointName])
          .map(([jointName, value]) => (
            <JointItem key={jointName}>
              <Label htmlFor={jointName}>{JOINT_NAME_MAP[jointName]}:</Label>
              <ReadOnlyInput
                id={jointName}
                type="text"
                readOnly
                value={formatValue(value)}
              />
            </JointItem>
          ))}
      </JointList>
    </Container>
  );
};

export default JointStreamer;
