import React, { useEffect } from "react";
import * as THREE from "three";

interface LightingProps {
  scene: THREE.Scene;
}

const Lighting: React.FC<LightingProps> = ({ scene }) => {
  useEffect(() => {
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10);

    scene.add(ambientLight, directionalLight);

    return () => {
      scene.remove(ambientLight, directionalLight);
    };
  }, [scene]);

  return null;
};

export default Lighting;
