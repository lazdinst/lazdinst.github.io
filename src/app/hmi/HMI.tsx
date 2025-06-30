import { FC, useState, useEffect } from "react";
import { DIMENSIONS } from "./dimensions";
import ProcessFlowDiagram from "./ProcessFlowDiagram";

const mockSegments: ConveyorSegmentConfig[] = [
  {
    id: "seg1",
    x: 25,
    y: 50,
    length: 300,
    angle: 0,
    devices: [
      { id: "m1", type: "motor", x: 150, y: 0, position: "charge" },
      { id: "p1", type: "photoeye", x: 250, y: 0 },
      { id: "p1", type: "photoeye", x: 298, y: 0 },
      { id: "s1", type: "scanner", x: 125, y: 0 },
      { id: "lpa1", type: "lpa", x: 185, y: 0 },
    ],
    packages: [
      { id: "pkg1", x: 50, y: 0 },
      { id: "pkg2", x: 200, y: 0 },
    ],
  },
];

const HMI: FC = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const centerY = viewportHeight / 2;
  const scaledConveyorHeight = DIMENSIONS.conveyorHeight * DIMENSIONS.scale;
  const centeredY = viewportHeight / 2 - scaledConveyorHeight / 2;

  const centeredSegments = mockSegments.map((segment) => ({
    ...segment,
    y: centeredY,
  }));

  return <ProcessFlowDiagram segments={centeredSegments} />;
};

export default HMI;
