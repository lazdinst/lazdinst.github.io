import React from "react";
import { useJoints } from "../../context";
import { Slider } from "./JointControls.style";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
interface JointSliderProps {
  jointName: string;
  value: number;
}
const JointSlider: React.FC<JointSliderProps> = ({ jointName, value }) => {
  const { jointAnimationEnabled } = useSelector(
    (state: RootState) => state.settings
  );
  const { updateJoint } = useJoints();

  const handleSliderChange = (name: string, value: string) => {
    updateJoint(name, parseFloat(value));
  };

  return (
    <Slider
      type="range"
      min="-3.14"
      max="3.14"
      step="0.01"
      value={value ?? 0}
      onChange={(e) => handleSliderChange(jointName, e.target.value)}
      disabled={jointAnimationEnabled}
    />
  );
};

export default JointSlider;
