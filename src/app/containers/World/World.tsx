import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoaderComponent from "../URDF";
import Lighting from "../Lighting";
import JointControls from "../JointControls";
import JointAnimator from "../JointAnimator";
import LogCameraPosition from "../LogCameraPositions";
import Axis from "../Axis";

import { URDFJoint } from "../../../definitions";

const ANIMATE = false;
const LOG_CAMERA_POSITION = false;

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
      <Canvas camera={{ position: [3, 0, 3], up: [0, 0, 1], fov: 75 }}>
        <Lighting />
        <Axis />
        <URDFLoaderComponent setJoints={setJoints} />
        <OrbitControls enableDamping={false} />
        {LOG_CAMERA_POSITION && <LogCameraPosition />}
        {ANIMATE && <JointAnimator joints={joints} />}
      </Canvas>
      <JointControls joints={joints} updateJoint={updateJoint} />
    </div>
  );
};

export default World;
