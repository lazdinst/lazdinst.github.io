import React from "react";
import { DIMENSIONS } from "./dimensions";
import { packageColor, packageTapeColor } from "./hmi.style";

interface Props {
  x: number;
  y: number;
}

const PackageComp: React.FC<Props> = ({ x, y }) => {
  const boxSize = DIMENSIONS.packageSize;
  const halfSize = boxSize / 2;
  const tapeWidth = DIMENSIONS.packageTapeWidth;

  return (
    <>
      {/* Main box */}
      <rect
        x={x - halfSize}
        y={y - halfSize}
        width={boxSize}
        height={boxSize}
        fill={packageColor}
        stroke="#000"
        strokeWidth={1}
      />

      {/* Tape stripe */}
      <rect
        x={x - tapeWidth / 2}
        y={y - halfSize}
        width={tapeWidth}
        height={boxSize}
        fill={packageTapeColor}
      />
    </>
  );
};

export default PackageComp;
