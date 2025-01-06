import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";

interface AxesHelperProps {
  size?: number;
}
const OFFSET = 0.1;

const AxesHelper: React.FC<AxesHelperProps> = ({ size = 2 }) => {
  const { scene } = useThree();

  React.useEffect(() => {
    const axesHelper = new THREE.AxesHelper(size);
    scene.add(axesHelper);

    return () => {
      scene.remove(axesHelper);
    };
  }, [scene, size]);

  return (
    <>
      <Text position={[size + OFFSET, 0, 0]} fontSize={0.1} color="red">
        X
      </Text>
      <Text position={[0, size + OFFSET, 0]} fontSize={0.1} color="green">
        Y
      </Text>
      <Text position={[0, 0, size + OFFSET]} fontSize={0.1} color="blue">
        Z
      </Text>
    </>
  );
};

export default AxesHelper;
