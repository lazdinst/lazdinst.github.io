import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoaderComponent from "../URDF";
import JointAnimator from "../JointAnimator";
import LogCameraPosition from "../LogCameraPositions";
import SceneEnvironment from "../SceneEnvironment";
import DebugHelpers from "../DebugHelper";
import JointStreamer from "../JointStreamer";

const LOG_CAMERA_POSITION = false;
const DEBUG_HELPER = false;

const World: React.FC = () => {
  return (
    <>
      <Canvas camera={{ position: [1.5, 1.5, 1.5], up: [0, 0, 1], fov: 75 }}>
        {DEBUG_HELPER && <DebugHelpers />}
        <SceneEnvironment />
        <URDFLoaderComponent />
        <OrbitControls enableDamping={false} />
        {LOG_CAMERA_POSITION && <LogCameraPosition />}
        <JointAnimator />
      </Canvas>
      <JointStreamer />
    </>
  );
};

export default World;
