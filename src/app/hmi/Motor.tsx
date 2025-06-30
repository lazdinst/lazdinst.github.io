import React from "react";
import { DeviceSide } from "./types";
import { DIMENSIONS } from "./dimensions";
import { motorColor, motorFlangeColor, motorSymbolColor } from "./hmi.style";

interface Props {
  x: number;
  y: number;
  side?: DeviceSide;
}

const Motor: React.FC<Props> = ({ x, y, side = "right" }) => {
  // Conveyor reference dimensions
  const beltHalfHeight = DIMENSIONS.conveyorHeight * 0.5;
  const motorMountOffset = DIMENSIONS.motorMountOffset;

  // Compute Y offset so it's mounted beside the conveyor
  const sideOffset = beltHalfHeight + motorMountOffset;
  const motorY = side === "left" ? y - sideOffset : y + sideOffset;

  // Physical body rectangles
  const bodyWidth = DIMENSIONS.motorBodyWidth;
  const bodyHeight = DIMENSIONS.motorBodyHeight;
  const flangeWidth = DIMENSIONS.motorFlangeWidth;

  // IEC symbol details
  const symbolX = x - bodyWidth / 2;
  const r = bodyWidth * 0.25;
  const lineLen = bodyWidth * 0.5 - r;
  const strokeWidth = DIMENSIONS.motorSymbolStrokeWidth;
  const fontSize = DIMENSIONS.motorFontSize;

  return (
    <>
      {/* Motor physical body */}
      <rect
        x={x - bodyWidth}
        y={motorY - bodyHeight / 2}
        width={bodyWidth}
        height={bodyHeight}
        fill={motorColor}
        stroke="#000"
        strokeWidth={1}
        rx={3}
      />

      {/* Motor flange at conveyor edge */}
      <rect
        x={x}
        y={motorY - bodyHeight / 2}
        width={flangeWidth}
        height={bodyHeight}
        fill={motorFlangeColor}
        stroke="#000"
        strokeWidth={1}
      />

      {/* IEC Motor Symbol */}
      {/* Left horizontal line */}
      <line
        x1={symbolX - r - lineLen}
        y1={motorY}
        x2={symbolX - r}
        y2={motorY}
        stroke={motorSymbolColor}
        strokeWidth={strokeWidth}
      />

      {/* Right horizontal line */}
      <line
        x1={symbolX + r}
        y1={motorY}
        x2={symbolX + r + lineLen}
        y2={motorY}
        stroke={motorSymbolColor}
        strokeWidth={strokeWidth}
      />

      {/* Circle */}
      <circle
        cx={symbolX}
        cy={motorY}
        r={r}
        fill="none"
        stroke={motorSymbolColor}
        strokeWidth={strokeWidth}
      />

      {/* M inside the circle */}
      <text
        x={symbolX}
        y={motorY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fill={motorSymbolColor}
        fontFamily="sans-serif"
      >
        M
      </text>
    </>
  );
};

export default Motor;
