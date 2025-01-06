import React from "react";
import { JointControlsProps } from "../../definitions";

const JointControls: React.FC<JointControlsProps> = ({
  joints,
  updateJoint,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "300px",
        padding: "10px",
        borderRadius: "8px",
        overflowY: "auto",
        maxHeight: "100vh",
      }}
    >
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
    </div>
  );
};

export default JointControls;
