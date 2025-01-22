import React from "react";
import { useJoints } from "../../context";
import {
  ControlsContainer,
  JointSettingContainer,
} from "./JointControls.style";
import { SectionTitle, SidebarSection } from "../../components";
import { ALLOWED_JOINTS, JOINT_NAME_MAP } from "../../../constants";
import JointIncrementalControl from "./JointIncrementalControl";
import JointSlider from "./JointSlider";
import { JointKeys } from "../../../definitions";

const JointControls: React.FC = () => {
  const { joints, jointValues } = useJoints();

  return (
    <SidebarSection>
      <SectionTitle title="Joint Controls" />
      <ControlsContainer>
        {Object.keys(joints)
          .filter((jointName): jointName is JointKeys => {
            return ALLOWED_JOINTS[jointName] && jointName in JOINT_NAME_MAP;
          })
          .map((jointName) => {
            return (
              <JointSettingContainer key={jointName}>
                <JointIncrementalControl
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
      </ControlsContainer>
    </SidebarSection>
  );
};

export default JointControls;
