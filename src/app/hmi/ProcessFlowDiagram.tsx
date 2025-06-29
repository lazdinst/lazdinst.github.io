// src/app/hmi/ProcessFlowDiagram.tsx
import React from "react";
import { ConveyorSegmentConfig } from "./types";
import ConveyorSegment from "./ConveyorSegment";

interface Props {
  segments: ConveyorSegmentConfig[];
}

const ProcessFlowDiagram: React.FC<Props> = ({ segments }) => {
  return (
    <svg
      viewBox="0 0 1000 600"
      width="100%"
      height="100%"
      style={{ border: "1px solid #ccc", background: "#f9f9f9" }}
    >
      {segments.map((segment) => (
        <ConveyorSegment key={segment.id} {...segment} />
      ))}
    </svg>
  );
};

export default ProcessFlowDiagram;
