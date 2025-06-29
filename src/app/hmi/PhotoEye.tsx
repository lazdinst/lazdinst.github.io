import React from "react";
import { DIMENSIONS } from "./dimensions";
import { photoEyeColor } from "./hmi.style";

interface Props {
  x: number;
  y: number;
}

const PhotoEye: React.FC<Props> = ({ x, y }) => {
  // These dimensions are *already scaled* in DIMENSIONS
  const beltHalfHeight = DIMENSIONS.conveyorHeight * 0.5;
  const guardOffset = DIMENSIONS.photoEyeGuardOffset;

  const emitterWidth = DIMENSIONS.photoEyeEmitterWidth;
  const emitterHeight = DIMENSIONS.photoEyeEmitterHeight;
  const receiverSize = DIMENSIONS.photoEyeReceiverSize;
  const beamStrokeWidth = DIMENSIONS.photoEyeBeamStrokeWidth;

  // Offset from centerline to emitter/receiver positions
  const verticalOffset = beltHalfHeight + guardOffset;

  const emitterY = y - verticalOffset;
  const receiverY = y + verticalOffset;

  return (
    <>
      {/* Beam line */}
      <line
        x1={x}
        y1={emitterY}
        x2={x}
        y2={receiverY}
        stroke={photoEyeColor}
        strokeWidth={beamStrokeWidth}
        strokeDasharray="4 2"
      />

      {/* Emitter triangle (points down along beam) */}
      <polygon
        points={`
          ${x - emitterWidth / 2},${emitterY}
          ${x + emitterWidth / 2},${emitterY}
          ${x},${emitterY + emitterHeight}
        `}
        fill={photoEyeColor}
        stroke="#000"
        strokeWidth={1}
      />

      {/* Receiver box */}
      <rect
        x={x - receiverSize / 2}
        y={receiverY - receiverSize / 2}
        width={receiverSize}
        height={receiverSize}
        fill={photoEyeColor}
        stroke="#000"
        strokeWidth={1}
      />
    </>
  );
};

export default PhotoEye;
