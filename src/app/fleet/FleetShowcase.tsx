import { FC, useEffect } from "react";
import { FleetProvider } from "./providers/FleetProvider";
import { FleetShell } from "./shell/FleetShell";

export const FLEET_TITLE = "Fleet Ops";

/** Autonomous fleet mapping, sensor integration, and mission dispatch. */
const FleetShowcase: FC = () => {
  useEffect(() => {
    document.title = FLEET_TITLE;
  }, []);

  return (
    <FleetProvider>
      <FleetShell />
    </FleetProvider>
  );
};

export default FleetShowcase;
