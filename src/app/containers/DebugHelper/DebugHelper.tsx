import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const DebugHelpers: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    return () => {
      scene.remove(axesHelper);
    };
  }, [scene]);

  return null;
};

export default DebugHelpers;
