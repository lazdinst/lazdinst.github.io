import React, { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";

interface AxesHelperProps {
  axisLength?: number;
}
const OFFSET = 0.1;
const TEXT_SIZE = 0.1;

const AXIS_COLORS = {
  x: "red",
  y: "green",
  z: "blue",
};

const AxesHelper: React.FC<AxesHelperProps> = ({ axisLength = 2 }) => {
  const { scene } = useThree();

  useEffect(() => {
    const axesHelper = new THREE.AxesHelper(axisLength);
    scene.add(axesHelper);

    return () => {
      scene.remove(axesHelper);
    };
  }, [scene, axisLength]);

  return (
    <>
      <Text
        position={[axisLength + OFFSET, 0, 0]}
        fontSize={TEXT_SIZE}
        color={AXIS_COLORS.x}
      >
        X
      </Text>
      <Text
        position={[0, axisLength + OFFSET, 0]}
        fontSize={TEXT_SIZE}
        color={AXIS_COLORS.y}
      >
        Y
      </Text>
      <Text
        position={[0, 0, axisLength + OFFSET]}
        rotation={[Math.PI / 2, Math.PI, Math.PI]}
        fontSize={TEXT_SIZE}
        color={AXIS_COLORS.z}
      >
        Z
      </Text>
    </>
  );
};

export default AxesHelper;
