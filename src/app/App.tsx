import { FC } from "react";
import World from "./containers/World";
import { SideBar } from "./components";
import AppProviders from "./providers";
import { JointControls, CartesianForm } from "./containers";
import { IDE } from "./components/Layout";

const IDESideBar = () => (
  <SideBar>
    <JointControls />
    <CartesianForm />
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
