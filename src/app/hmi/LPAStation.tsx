// src/app/hmi/LPAStation.tsx
import React from "react";
import { DIMENSIONS } from "./dimensions";
import {
  lpaZoneColor,
  lpaFillOpacity,
  lpaFrameColor,
  labelerColor,
  conveyorStroke,
} from "./hmi.style";

interface Props {
  x: number;
  y: number;
}

const LPAStation: React.FC<Props> = ({ x, y }) => {
  const halfWidth = DIMENSIONS.lpaWidth / 2;
  const halfHeight = DIMENSIONS.lpaHeight / 2;
  const thickness = DIMENSIONS.lpaMemberThickness;
  const guardOffset = DIMENSIONS.conveyorGuardThickness;

  // Applicator head dimensions
  const applicatorWidth = DIMENSIONS.labelerWidth;
  const applicatorHeight = DIMENSIONS.labelerHeight;

  return (
    <>
      {/* LABEL APPLY ZONE FILL */}
      <rect
        x={x - halfWidth}
        y={y - halfHeight}
        width={DIMENSIONS.lpaWidth}
        height={DIMENSIONS.lpaHeight}
        fill={lpaZoneColor}
        fillOpacity={lpaFillOpacity}
        stroke="none"
      />

      {/* Top horizontal frame member */}
      <rect
        x={x - halfWidth}
        y={y - halfHeight - guardOffset}
        width={DIMENSIONS.lpaWidth}
        height={thickness}
        fill={lpaFrameColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />

      {/* Bottom horizontal frame member */}
      <rect
        x={x - halfWidth}
        y={y + halfHeight - thickness + guardOffset}
        width={DIMENSIONS.lpaWidth}
        height={thickness}
        fill={lpaFrameColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />

      {/* Left vertical frame member */}
      <rect
        x={x - halfWidth}
        y={y - halfHeight - guardOffset}
        width={thickness}
        height={DIMENSIONS.lpaHeight + 2 * guardOffset}
        fill={lpaFrameColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />

      {/* Right vertical frame member */}
      <rect
        x={x + halfWidth - thickness}
        y={y - halfHeight - guardOffset}
        width={thickness}
        height={DIMENSIONS.lpaHeight + 2 * guardOffset}
        fill={lpaFrameColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />

      {/* Label Applicator Head (on right side) */}
      <rect
        x={x - applicatorWidth / 2}
        y={y - halfHeight - guardOffset - applicatorHeight}
        width={applicatorWidth}
        height={applicatorHeight}
        fill={labelerColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />

      {/* Optional label path line */}
      <line
        x1={x}
        y1={y - halfHeight - guardOffset}
        x2={x}
        y2={y}
        stroke={labelerColor}
        strokeWidth={2}
        strokeDasharray="4 2"
      />
    </>
  );
};

export default LPAStation;
