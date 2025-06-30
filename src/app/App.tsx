import { FC, useState, useEffect } from "react";
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

import HMI from "./hmi/HMI";

const IDESideBar = () => (
  <SideBar>
    <JointAnimationSection />
    <JointControls />
    <CartesianControl />
  </SideBar>
);

const IDEMain = () => <World />;

const App: FC = () => {
  return (
    <AppProviders>
      {/* <IDE
        sidebar={<IDESideBar />}
        main={<IDEMain />}
        plugin={<PluginPanel />}
        terminal={<Terminal />}
      /> */}
      <HMI />
    </AppProviders>
  );
};

export default App;
