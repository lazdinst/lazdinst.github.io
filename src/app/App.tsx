import { FC } from "react";
import World from "./containers/World";
import { SideBar } from "./components";
import AppProviders from "./providers";
import { JointControls } from "./containers";
import { IDE } from "./components/Layout";

const IDESideBar = () => (
  <SideBar>
    <JointControls />
  </SideBar>
);

const IDEMain = () => <World />;

const App: FC = () => {
  return (
    <AppProviders>
      <IDE
        sidebar={<IDESideBar />}
        main={<IDEMain />}
        plugin={<div>Plugin</div>}
      />
    </AppProviders>
  );
};

export default App;
