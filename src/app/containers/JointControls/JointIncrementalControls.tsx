import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { useJoints } from "../../context";
import { Button } from "./JointControls.style";
import {
  JOINT_CONTROL_CLAMP,
  JOINT_CONTROL_INCREMENT,
} from "../../../constants";

interface JointIncrementalControlsProps {
  jointName: string;
  value: number;
}

const JointIncrementalControls: React.FC<JointIncrementalControlsProps> = ({
  jointName,
  value,
}) => {
  const { jointAnimationEnabled } = useSelector(
    (state: RootState) => state.settings
  );
  const { updateJoint } = useJoints();

  const incrementValue = () => {
    updateJoint(
      jointName,
      Math.min(value + JOINT_CONTROL_INCREMENT, JOINT_CONTROL_CLAMP)
    );
  };

  const decrementValue = () => {
    updateJoint(
      jointName,
      Math.max(value - JOINT_CONTROL_INCREMENT, -JOINT_CONTROL_CLAMP)
    );
  };

  return (
    <>
      <Button onClick={incrementValue} disabled={jointAnimationEnabled}>
        +
      </Button>
      <Button onClick={decrementValue} disabled={jointAnimationEnabled}>
        -
      </Button>
    </>
  );
};

export default JointIncrementalControls;
