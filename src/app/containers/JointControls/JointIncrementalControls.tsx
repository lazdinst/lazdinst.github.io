import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { useJoints } from "../../context";
import { toDegrees, toRadians } from "../../../utils";
import { NumericInput } from "../../components";
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

  const handleValueChange = (value: number) => {
    const newValue = toRadians(value);
    console.log(newValue);
    if (!isNaN(newValue)) {
      updateJoint(jointName, newValue);
    }
  };

  return (
    <NumericInput
      value={value && toDegrees(value)}
      onChange={handleValueChange}
      disabled={jointAnimationEnabled}
      min={-180}
      max={180}
      step={1}
    />
  );
};

export default JointIncrementalControls;
