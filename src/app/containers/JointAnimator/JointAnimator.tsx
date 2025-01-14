import React from "react";
import { useJoints } from "../../context";
import { useJointAnimation } from "./useJointAnimation";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const JointAnimator: React.FC = () => {
  const { joints } = useJoints();
  const { jointAnimationEnabled, jointAnimationType } = useSelector(
    (state: RootState) => state.settings
  );

  useJointAnimation(joints, jointAnimationEnabled, jointAnimationType);

  return null;
};

export default JointAnimator;
