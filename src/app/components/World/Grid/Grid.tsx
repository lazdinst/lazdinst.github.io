import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface GridProps {
  size: number; // Size of the grid
  plane: "XY" | "XZ" | "YZ"; // The plane to render
  shift?: boolean; // Whether to shift the grid
  color?: string; // Color of the grid lines
  divisions?: number; // Number of divisions in the grid
}

const GridComponent: React.FC<GridProps> = ({
  size,
  plane,
  shift = false,
  color = "gray",
  divisions = 50,
}) => {
  // Determine plane-specific configurations
  let rotation: [number, number, number] = [0, 0, 0];
  let position: [number, number, number] = [0, 0, 0];

  if (plane === "XZ") {
    position = [0, 0, shift ? size / 2 : 0];
    rotation = [Math.PI / 2, 0, 0]; // Align with XZ plane
  } else if (plane === "YZ") {
    position = [shift ? size / 2 : 0, 0, 0];
    rotation = [0, Math.PI / 2, 0]; // Align with YZ plane
  } else if (plane === "XY") {
    // Default to XY plane
    position = [0, 0, 0];
    rotation = [0, 0, 0];
  }

  // Generate grid lines
  const step = size / divisions;
  const halfSize = size / 2;

  const lines: [THREE.Vector3, THREE.Vector3][] = [];
  for (let i = 0; i <= divisions; i++) {
    const offset = -halfSize + i * step;
    // Add lines parallel to X or Y axis
    lines.push(
      [
        new THREE.Vector3(-halfSize, offset, 0),
        new THREE.Vector3(halfSize, offset, 0),
      ], // Horizontal
      [
        new THREE.Vector3(offset, -halfSize, 0),
        new THREE.Vector3(offset, halfSize, 0),
      ] // Vertical
    );
  }

  return (
    <group rotation={rotation} position={position}>
      {lines.map((line, index) => (
        <Line
          key={index}
          points={line} // Start and end points as Vector3
          color={color} // Grid line color
          lineWidth={1} // Thickness of the grid line
        />
      ))}
    </group>
  );
};

export default GridComponent;
