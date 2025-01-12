import React from "react";
import { useSelector } from "react-redux";
import { useJoints } from "../../context";
import { RootState, useAppDispatch } from "../../../redux/store";
import { toggleJointAnimation } from "../../../redux/slices/settings";
import {
  Container,
  SectionTitle,
  CheckboxLabel,
  SliderContainer,
} from "./JointControls.style";

import { ALLOWED_JOINTS } from "../../../constants";
import JointIncrementalControls from "./JointIncrementalControls";
import JointSliderControls from "./JointSliderControls";

const JointControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jointAnimationEnabled } = useSelector(
    (state: RootState) => state.settings
  );
  const { joints, jointValues } = useJoints();

  const handleToggleJointAnimation = () => {
    dispatch(toggleJointAnimation());
  };

  return (
    <Container>
      <CheckboxLabel>
        <input
          type="checkbox"
          checked={jointAnimationEnabled}
          onChange={handleToggleJointAnimation}
        />
        Enable joint animation
      </CheckboxLabel>
      <SectionTitle>Joint Controls</SectionTitle>
      {Object.keys(joints)
        .filter((jointName) => ALLOWED_JOINTS[jointName])
        .map((jointName) => {
          return (
            <SliderContainer key={jointName}>
              <JointSliderControls
                jointName={jointName}
                value={jointValues[jointName]}
              />
              <JointIncrementalControls
                jointName={jointName}
                value={jointValues[jointName]}
              />
            </SliderContainer>
          );
        })}
    </Container>
  );
};

export default JointControls;
