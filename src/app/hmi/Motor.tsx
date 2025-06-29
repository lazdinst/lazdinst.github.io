import React from "react";
import { DeviceSide } from "./types";
import { DIMENSIONS } from "./dimensions";
import { motorColor, motorFlangeColor } from "./hmi.style";

interface Props {
  x: number;
  y: number;
  side?: DeviceSide;
}

const Motor: React.FC<Props> = ({ x, y, side = "right" }) => {
  // Motor dimensions from shared config
  const bodyWidth = DIMENSIONS.motorBodyWidth;
  const bodyHeight = DIMENSIONS.motorBodyHeight;
  const flangeWidth = DIMENSIONS.motorFlangeWidth;

  // Conveyor reference dimensions
  const beltHalfHeight = DIMENSIONS.conveyorHeight * 0.5;
  const motorMountOffset = DIMENSIONS.motorMountOffset;

  // Compute side offset from conveyor centerline
  const sideOffset = beltHalfHeight + motorMountOffset;
  const motorY = side === "left" ? y - sideOffset : y + sideOffset;

  return (
    <g transform={`translate(${x}, ${motorY}) rotate(-90)`}>
      {/* Motor body - extends back from charge end */}
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
      {/* Gearbox / flange at conveyor edge */}
      <rect
        x={x}
        y={motorY - bodyHeight / 2}
        width={flangeWidth}
        height={bodyHeight}
        fill={motorFlangeColor}
        stroke="#000"
        strokeWidth={1}
      />
    </g>
  );
};

export default Motor;
