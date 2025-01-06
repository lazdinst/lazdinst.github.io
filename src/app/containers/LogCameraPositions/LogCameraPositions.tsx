import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";

const LogCameraPosition = () => {
  const { camera } = useThree();
  const lastPosition = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!lastPosition.current.equals(camera.position)) {
      console.log("Camera Position:", camera.position);
      console.log(
        "Camera Direction:",
        camera.getWorldDirection(new THREE.Vector3())
      );
      lastPosition.current.copy(camera.position);
    }
  });

  return <OrbitControls />;
};

export default LogCameraPosition;
