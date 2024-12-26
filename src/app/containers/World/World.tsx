import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import URDFLoaderComponent from "../URDF";
import Lighting from "../Lighting";
import JointControls from "../JointControls";
import JointAnimator from "../JointAnimator";
import { URDFJoint } from "../../../definitions";
import { useSetupScene } from "./hooks";

const World: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const robotGroupRef = useRef(new THREE.Group());
  const [joints, setJoints] = useState<{ [key: string]: URDFJoint }>({});
  const hasRobotLoaded = useRef(false); // Track if the robot has been loaded

  const setupScene = useSetupScene(mountRef, sceneRef);

  useEffect(() => {
    console.log("useEffect: World - Start");
    console.log(robotGroupRef.current);
    const scene = sceneRef.current;
    console.log();
    scene.add(robotGroupRef.current); // Add robot group to the scene

    const cleanup = setupScene();
    return () => {
      console.log("useEffect: World - Cleaning up scene...");
      scene.remove(robotGroupRef.current); // Remove robot group
      robotGroupRef.current.clear(); // Clear objects from robot group
      cleanup();
      hasRobotLoaded.current = false; // Reset robot loaded state
    };
  }, []); // Ensure no dependencies cause re-runs

  const updateJoint = (name: string, value: number) => {
    const joint = joints[name];
    if (joint) {
      joint.setJointValue(value);
    }
  };

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      <URDFLoaderComponent
        scene={sceneRef.current}
        robotGroup={robotGroupRef.current}
        setJoints={setJoints}
      />
      <Lighting scene={sceneRef.current} />
      <JointAnimator joints={joints} />
      <JointControls joints={joints} updateJoint={updateJoint} />
    </div>
  );
};

export default World;
