// World.tsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import URDFLoaderComponent from "./URDFLoaderComponent";
import Lighting from "./Lighting";
import JointControls from "./JointControls";
import JointAnimator from "./JointAnimator";

interface URDFJoint extends THREE.Object3D {
  isURDFJoint: boolean;
  setJointValue: (value: number) => void;
}

const World: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const [joints, setJoints] = useState<{ [key: string]: URDFJoint }>({});

  useEffect(() => {
    const width = mountRef.current!.clientWidth;
    const height = mountRef.current!.clientHeight;

    const scene = sceneRef.current;
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current!.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current!.removeChild(renderer.domElement);
    };
  }, []);

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
      <URDFLoaderComponent scene={sceneRef.current} setJoints={setJoints} />
      <Lighting scene={sceneRef.current} />
      <JointAnimator joints={joints} />
      <JointControls joints={joints} updateJoint={updateJoint} />
    </div>
  );
};

export default World;
