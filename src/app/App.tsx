import { FC } from "react";
import World from "./containers/World";
import { SideBar, WorldFrame } from "./components";
import AppProviders from "./providers";
import { JointControls } from "./containers";

const App: FC = () => {
  return (
    <AppProviders>
      <SideBar>
        <JointControls />
      </SideBar>
      <WorldFrame>
        <World />
      </WorldFrame>
    </AppProviders>
  );
};

export default App;
