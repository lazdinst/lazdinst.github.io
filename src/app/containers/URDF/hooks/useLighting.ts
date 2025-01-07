import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export const useLighting = () => {
  const { scene } = useThree();

  useEffect(() => {
    // Add ambient and directional lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;

    scene.add(ambientLight);
    scene.add(directionalLight);

    // Cleanup lights on unmount
    return () => {
      scene.remove(ambientLight);
      scene.remove(directionalLight);
    };
  }, [scene]);
};
