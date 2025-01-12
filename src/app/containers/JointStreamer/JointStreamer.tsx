import React, { useState } from "react";
import { useJoints } from "../../context";
import {
  Container,
  Title,
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
    return isDegrees ? ((value * 180) / Math.PI).toFixed(2) : value.toFixed(2);
  };

  return (
    <Container>
      <Title>Joint Values</Title>
      <ToggleButton onClick={toggleUnit}>
        Display in {isDegrees ? "Radians" : "Degrees"}
      </ToggleButton>
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
