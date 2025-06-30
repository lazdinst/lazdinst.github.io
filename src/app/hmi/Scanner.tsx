// src/app/hmi/Scanner.tsx
import React from "react";
import { DIMENSIONS } from "./dimensions";
import {
  scannerColor,
  scannerFillOpacity,
  scannerSupportColor,
  conveyorStroke,
} from "./hmi.style";

interface Props {
  x: number;
  y: number;
}

const Scanner: React.FC<Props> = ({ x, y }) => {
  const halfWidth = DIMENSIONS.scannerWidth / 2;
  const halfHeight = DIMENSIONS.scannerHeight / 2;
  const thickness = DIMENSIONS.scannerMemberThickness;
  const guardOffset = DIMENSIONS.conveyorGuardThickness;

  return (
    <>
      {/* SCAN AREA FILL */}
      <rect
        x={x - halfWidth}
        y={y - halfHeight - guardOffset}
        width={DIMENSIONS.scannerWidth}
        height={DIMENSIONS.scannerHeight + 2 * guardOffset}
        fill={scannerColor}
        fillOpacity={scannerFillOpacity}
        stroke="none"
      />

      {/* Top horizontal frame member */}
      <rect
        x={x - halfWidth}
        y={y - halfHeight - guardOffset}
        width={DIMENSIONS.scannerWidth}
        height={thickness}
        fill={scannerSupportColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />

      {/* Bottom horizontal frame member */}
      <rect
        x={x - halfWidth}
        y={y + halfHeight - thickness + guardOffset}
        width={DIMENSIONS.scannerWidth}
        height={thickness}
        fill={scannerSupportColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />

      {/* Left vertical frame member */}
      <rect
        x={x - halfWidth}
        y={y - halfHeight - guardOffset}
        width={thickness}
        height={DIMENSIONS.scannerHeight + 2 * guardOffset}
        fill={scannerSupportColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />

      {/* Right vertical frame member */}
      <rect
        x={x + halfWidth - thickness}
        y={y - halfHeight - guardOffset}
        width={thickness}
        height={DIMENSIONS.scannerHeight + 2 * guardOffset}
        fill={scannerSupportColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />
    </>
  );
};

export default Scanner;
