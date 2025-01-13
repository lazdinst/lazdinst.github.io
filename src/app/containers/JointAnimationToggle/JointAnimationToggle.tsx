import React from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../redux/store";
import { toggleJointAnimation } from "../../../redux/slices/settings";
import {
  CheckboxLabel,
  ToggleInput,
  ToggleSlider,
} from "./JointAnimationToggle.style";

const JointAnimationToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jointAnimationEnabled } = useSelector(
    (state: RootState) => state.settings
  );

  const handleToggleJointAnimation = () => {
    dispatch(toggleJointAnimation());
  };

  return (
    <CheckboxLabel>
      <ToggleInput
        type="checkbox"
        checked={jointAnimationEnabled}
        onChange={handleToggleJointAnimation}
      />
      <ToggleSlider />
      Joint Animation
    </CheckboxLabel>
  );
};

export default JointAnimationToggle;
