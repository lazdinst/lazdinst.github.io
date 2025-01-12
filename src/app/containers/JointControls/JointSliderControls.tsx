import React from "react";
import { useJoints } from "../../context";
import { Label, Slider } from "./JointControls.style";
import { JOINT_NAME_MAP } from "../../../constants";
interface JointSliderControlsProps {
  jointName: string;
  value: number;
}
const JointSliderControls: React.FC<JointSliderControlsProps> = ({
  jointName,
  value,
}) => {
  const { updateJoint } = useJoints();

  const handleSliderChange = (name: string, value: string) => {
    updateJoint(name, parseFloat(value));
  };

  return (
    <>
      <Label>{JOINT_NAME_MAP[jointName]}</Label>
      <Slider
        type="range"
        min="-3.14"
        max="3.14"
        step="0.01"
        value={value ?? 0}
        onChange={(e) => handleSliderChange(jointName, e.target.value)}
      />
    </>
  );
};

export default JointSliderControls;
