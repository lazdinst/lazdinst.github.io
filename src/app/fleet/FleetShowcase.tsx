import { FC, useEffect } from "react";
import { AppChrome } from "../components/AppChrome";
import { FleetInspector } from "./containers/AssetInspector";
import { FLEET_TITLE, FleetCommandBar } from "./containers/FleetCommandBar/FleetCommandBar";
import { FleetLog } from "./containers/FleetLog";
import { FleetMap } from "./containers/FleetMap";
import { OperationsPanel } from "./containers/OperationsPanel";
import { FleetProvider } from "./providers/FleetProvider";

/** Autonomous fleet mapping, sensor integration, and mission dispatch. */
const FleetShowcase: FC = () => {
  useEffect(() => {
    document.title = FLEET_TITLE;
  }, []);

  return (
    <FleetProvider>
      <AppChrome
        commandBar={<FleetCommandBar />}
        inspectorTitle="Assets"
        auxiliaryTitle="Operations"
        inspector={<FleetInspector />}
        stage={<FleetMap />}
        auxiliary={<OperationsPanel />}
        output={<FleetLog />}
      />
    </FleetProvider>
  );
};

export default FleetShowcase;
