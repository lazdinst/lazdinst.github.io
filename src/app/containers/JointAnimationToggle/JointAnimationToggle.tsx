import React from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../redux/store";
import { toggleJointAnimation } from "../../../redux/slices/settings";
import { Toggle } from "../../components";

const JointAnimationToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jointAnimationEnabled } = useSelector(
    (state: RootState) => state.settings
  );

  const handleToggleJointAnimation = () => {
    dispatch(toggleJointAnimation());
  };

  return (
    <Toggle
      label="Joint Animatior"
      checked={jointAnimationEnabled}
      onChange={handleToggleJointAnimation}
    />
  );
};

export default JointAnimationToggle;
