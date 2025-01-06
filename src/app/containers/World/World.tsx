import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoaderComponent from "../URDF";
import JointControls from "../JointControls";
import JointAnimator from "../JointAnimator";
import LogCameraPosition from "../LogCameraPositions";
import { URDFJoint } from "../../../definitions";
import { Lighting, Axis, Grid } from "../../components";

const ANIMATE = true;
const LOG_CAMERA_POSITION = false;

// TODO: Refactor these to state
const ENABLE_XY_GRID = true;
const ENABLE_XZ_GRID = false;
const ENABLE_YZ_GRID = false;

const World: React.FC = () => {
  const [joints, setJoints] = useState<{ [key: string]: URDFJoint }>({});

  const updateJoint = (name: string, value: number) => {
    const joint = joints[name];
    if (joint) {
      joint.setJointValue(value);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas camera={{ position: [3, 0, 3], up: [0, 0, 1], fov: 75 }}>
        <Lighting />
        <Axis />
        {ENABLE_XY_GRID && <Grid size={4} plane="XY" />}
        {ENABLE_XZ_GRID && <Grid size={10} plane="XZ" />}
        {ENABLE_YZ_GRID && <Grid size={10} plane="YZ" />}

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
