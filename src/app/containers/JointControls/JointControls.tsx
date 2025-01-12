import React from "react";
import { useSelector } from "react-redux";
import { useJoints } from "../../context";
import { RootState, useAppDispatch } from "../../../redux/store";
import { toggleJointAnimation } from "../../../redux/slices/settings";
import JointStreamer from "../JointStreamer";

const JointControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jointAnimationEnabled } = useSelector(
    (state: RootState) => state.settings
  );
  const { joints, updateJoint } = useJoints();

  const handleToggleJointAnimation = () => {
    dispatch(toggleJointAnimation());
  };
  console.log(jointAnimationEnabled);
  return (
    <>
      <h3>Animation</h3>
      <label>
        <input
          type="checkbox"
          checked={jointAnimationEnabled}
          onChange={() => handleToggleJointAnimation()}
        />
        Enable joint animation
      </label>
      <JointStreamer />
      <h3>Joint Controls</h3>
      {Object.keys(joints).map((jointName) => (
        <div key={jointName} style={{ marginBottom: "10px" }}>
          <label
            style={{ display: "block", color: "#000", fontWeight: "bold" }}
          >
            {jointName}
          </label>
          <input
            type="range"
            min="-3.14" // Assuming a typical revolute joint range [-π, π]
            max="3.14"
            step="0.01"
            onChange={(e) => updateJoint(jointName, parseFloat(e.target.value))}
          />
        </div>
      ))}
    </>
  );
};

export default JointControls;
