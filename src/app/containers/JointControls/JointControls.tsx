import React from "react";
import { useJoints } from "../../context";
import {
  Container,
  SectionTitle,
  JointSettingContainer,
  Label,
} from "./JointControls.style";

import { ALLOWED_JOINTS, JOINT_NAME_MAP } from "../../../constants";
import JointIncrementalControls from "./JointIncrementalControls";
import JointSlider from "./JointSlider";
import JointAnimationToggle from "../JointAnimationToggle";

const JointControls: React.FC = () => {
  const { joints, jointValues } = useJoints();

  return (
    <Container>
      <JointAnimationToggle />
      <SectionTitle>Joint Controls</SectionTitle>
      {Object.keys(joints)
        .filter((jointName) => ALLOWED_JOINTS[jointName])
        .map((jointName) => {
          return (
            <JointSettingContainer key={jointName}>
              <Label>{JOINT_NAME_MAP[jointName]}:</Label>
              <JointIncrementalControls
                jointName={jointName}
                value={jointValues[jointName]}
              />
              <JointSlider
                jointName={jointName}
                value={jointValues[jointName]}
              />
            </JointSettingContainer>
          );
        })}
    </Container>
  );
};

export default JointControls;
