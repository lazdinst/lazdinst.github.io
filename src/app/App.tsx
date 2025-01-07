import { FC } from "react";
import World from "./containers/World";
import { SideBar, WorldFrame } from "./components";
import AppProviders from "./providers";

const App: FC = () => {
  return (
    <AppProviders>
      <SideBar>test</SideBar>
      <WorldFrame>
        <World />
      </WorldFrame>
    </AppProviders>
  );
};

export default App;
