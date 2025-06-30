// src/app/hmi/ConveyorSegment.tsx
import React, { useState, useEffect } from "react";
import { ConveyorSegmentConfig, Device } from "./types";
import Motor from "./Motor";
import PhotoEye from "./PhotoEye";
import PackageComp from "./Package";
import Scanner from "./Scanner";
import LPAStation from "./LPAStation";
import { DIMENSIONS } from "./dimensions";
import { conveyorColor, conveyorStroke, conveyorGuardColor } from "./hmi.style";

const getDeviceX = (device: Device, length: number) => {
  switch (device.position) {
    case "charge":
      return 0;
    case "discharge":
      return length;
    case "custom":
    default:
      return device.x ?? 0;
  }
};

const ConveyorSegment: React.FC<ConveyorSegmentConfig> = ({
  x,
  y,
  length,
  angle,
  devices,
  packages,
}) => {
  const [stripeOffset, setStripeOffset] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const step = () => {
      setStripeOffset((prev) => (prev + 1) % 20); // Loop
      animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const scaledX = x * DIMENSIONS.scale;
  const scaledY = y * DIMENSIONS.scale;
  const scaledLength = length * DIMENSIONS.scale;

  // Use shared scaled dimensions
  // const rollerSpacing = DIMENSIONS.rollerSpacing;
  // const numRollerLines = Math.floor(length / rollerSpacing);
  // const rollerLines = Array.from(
  //   { length: numRollerLines },
  //   (_, i) => i * rollerSpacing + rollerSpacing / 2
  // );

  const beltHalfHeight = DIMENSIONS.conveyorHeight * 0.5;
  const guardThickness = DIMENSIONS.conveyorGuardThickness;

  return (
    <g transform={`translate(${scaledX}, ${scaledY}) rotate(${angle})`}>
      {/* Conveyor belt */}
      <defs>
        <pattern
          id="movingStripes"
          patternUnits="userSpaceOnUse"
          width="20"
          height="20"
          patternTransform={`translate(${stripeOffset},0)`}
        >
          <rect width="20" height="20" fill={conveyorColor} />
          <path d="M 0 20 L 20 0" stroke={conveyorStroke} strokeWidth="1" />
        </pattern>
      </defs>

      <rect
        x={0}
        y={-beltHalfHeight}
        width={scaledLength}
        height={DIMENSIONS.conveyorHeight}
        fill="url(#movingStripes)"
        stroke={conveyorStroke}
        strokeWidth={2}
      />

      {/* Side guards */}
      <rect
        x={0}
        y={-beltHalfHeight - guardThickness}
        width={scaledLength}
        height={guardThickness}
        fill={conveyorGuardColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />
      <rect
        x={0}
        y={beltHalfHeight}
        width={scaledLength}
        height={guardThickness}
        fill={conveyorGuardColor}
        stroke={conveyorStroke}
        strokeWidth={1}
      />

      {/* Roller lines */}
      {/* {rollerLines.map((rollerX, index) => (
        <circle
          key={`roller-${index}`}
          cx={rollerX * DIMENSIONS.scale}
          cy={0}
          r={DIMENSIONS.rollerRadius}
          fill={conveyorRollerLineColor}
          stroke={conveyorStroke}
          strokeWidth={1}
        />
      ))} */}

      {/* Devices */}
      {devices.map((device) => {
        const deviceX = getDeviceX(device, length) * DIMENSIONS.scale;
        const photoeyeX = getDeviceX(device, length) * DIMENSIONS.scale;
        const photoeyeY = (device.y ?? 0) * DIMENSIONS.scale;
        const deviceY = (device.y ?? 0) * DIMENSIONS.scale;

        switch (device.type) {
          case "motor":
            return (
              <Motor
                key={device.id}
                x={deviceX}
                y={device.y ?? 0}
                side={device.side}
              />
            );
          case "photoeye":
            return <PhotoEye key={device.id} x={photoeyeX} y={photoeyeY} />;
          case "scanner":
            return <Scanner key={device.id} x={deviceX} y={deviceY} />;
          case "lpa":
            return <LPAStation key={device.id} x={deviceX} y={deviceY} />;
          default:
            return null;
        }
      })}

      {/* Packages */}
      {packages?.map((pkg) => (
        <PackageComp key={pkg.id} x={pkg.x} y={pkg.y} />
      ))}
    </g>
  );
};

export default ConveyorSegment;
