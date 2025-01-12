import React, { useEffect, useState } from "react";
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

const INTERVAL = 100;

// Define the allowed joint names as a string name key map
const ALLOWED_JOINTS: { [key: string]: boolean } = {
  joint_1: true,
  joint_2: true,
  joint_3: true,
  joint_4: true,
  joint_5: true,
  joint_6: true,
};

const JOINT_NAME_MAP: { [key: string]: string } = {
  joint_1: "J1",
  joint_2: "J2",
  joint_3: "J3",
  joint_4: "J4",
  joint_5: "J5",
  joint_6: "J6",
};

const JointStreamer: React.FC = () => {
  const { getJointValues } = useJoints();
  const [jointValues, setJointValues] = useState<{
    [key: string]: number | undefined;
  }>({});
  const [isDegrees, setIsDegrees] = useState(false); // Toggle between degrees and radians

  useEffect(() => {
    const interval = setInterval(() => {
      const values = getJointValues();
      setJointValues(values); // Update state with the latest joint values
    }, INTERVAL);

    return () => clearInterval(interval);
  }, [getJointValues]);

  const toggleUnit = () => {
    setIsDegrees((prev) => !prev); // Toggle between degrees and radians
  };

  const formatValue = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) {
      return "—"; // Fallback for undefined or invalid values
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
