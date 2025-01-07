import React, { useState } from "react";
import { WorldContainer } from "./World.style";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoaderComponent from "../URDF";
import JointControls from "../JointControls";
import JointAnimator from "../JointAnimator";
import LogCameraPosition from "../LogCameraPositions";
import { URDFJoint } from "../../../definitions";
import SceneEnvironment from "../SceneEnvironment";

const ANIMATE = true;
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
    <WorldContainer>
      <Canvas camera={{ position: [3, 0, 3], up: [0, 0, 1], fov: 75 }}>
        <SceneEnvironment />
        <URDFLoaderComponent setJoints={setJoints} />
        <OrbitControls enableDamping={false} />
        {LOG_CAMERA_POSITION && <LogCameraPosition />}
        {ANIMATE && <JointAnimator joints={joints} />}
      </Canvas>
      <JointControls joints={joints} updateJoint={updateJoint} />
    </WorldContainer>
  );
};

export default World;
