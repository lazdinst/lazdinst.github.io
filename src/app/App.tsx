import { FC } from "react";
import World from "./containers/World";
import { SideBar } from "./components";
import AppProviders from "./providers";
import {
  JointControls,
  CartesianControl,
  JointAnimationSection,
  Terminal,
  PluginPanel,
} from "./containers";
import { IDE } from "./components/Layout";

import ProcessFlowDiagram from "./hmi/ProcessFlowDiagram";

const IDESideBar = () => (
  <SideBar>
    <JointAnimationSection />
    <JointControls />
    <CartesianControl />
  </SideBar>
);

const IDEMain = () => <World />;

const mockSegments: ConveyorSegmentConfig[] = [
  {
    id: "seg1",
    x: 100,
    y: 100,
    length: 300,
    angle: 0,
    devices: [
      { id: "m1", type: "motor", x: 150, y: 0, position: "charge" },
      { id: "p1", type: "photoeye", x: 250, y: 0 },
      { id: "p1", type: "photoeye", x: 298, y: 0 },
    ],
    packages: [
      { id: "pkg1", x: 50, y: 0 },
      { id: "pkg2", x: 200, y: 0 },
    ],
  },
];

const App: FC = () => {
  return (
    <AppProviders>
      {/* <IDE
        sidebar={<IDESideBar />}
        main={<IDEMain />}
        plugin={<PluginPanel />}
        terminal={<Terminal />}
      /> */}
      <ProcessFlowDiagram segments={mockSegments} />
    </AppProviders>
  );
};

export default App;
