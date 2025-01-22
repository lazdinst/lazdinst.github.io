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
      <IDE
        sidebar={<IDESideBar />}
        main={<IDEMain />}
        plugin={<PluginPanel />}
        terminal={<Terminal />}
      />
    </AppProviders>
  );
};

export default App;
