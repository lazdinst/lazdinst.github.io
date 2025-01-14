import { FC } from "react";
import World from "./containers/World";
import { SideBar, WorldFrame } from "./components";
import AppProviders from "./providers";
import { JointControls } from "./containers";
import { IDE } from "./components/Layout";

const IDESideBar = () => (
  <SideBar>
    <JointControls />
  </SideBar>
);

const IDEMain = () => (
  <WorldFrame>
    <World />
  </WorldFrame>
);
const App: FC = () => {
  return (
    <AppProviders>
      <IDE
        sidebar={<IDESideBar />}
        main={<IDEMain />}
        plugin={<div>Plugin</div>}
      />
      {/* <SideBar>
        <JointControls />
      </SideBar>
      <WorldFrame>
        <World />
      </WorldFrame> */}
    </AppProviders>
  );
};

export default App;
