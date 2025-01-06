import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoaderComponent from "../URDF";
import Lighting from "../Lighting";
import JointControls from "../JointControls";
import JointAnimator from "../JointAnimator";
import { URDFJoint } from "../../../definitions";

const World: React.FC = () => {
  const [joints, setJoints] = useState<{ [key: string]: URDFJoint }>({});

  const updateJoint = (name: string, value: number) => {
    const joint = joints[name];
    if (joint) {
      joint.setJointValue(value);
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        {/* Lighting */}
        <Lighting />

        {/* URDF Loader */}
        <URDFLoaderComponent setJoints={setJoints} />

        {/* Controls */}
        <OrbitControls enableDamping={false} />

        {/* Animations */}
        {/* <JointAnimator joints={joints} /> */}
      </Canvas>

      {/* Joint Controls */}
      <JointControls joints={joints} updateJoint={updateJoint} />
    </div>
  );
};

export default World;
