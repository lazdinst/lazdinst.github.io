import React from "react";
import { HotkeysProvider } from "@tanstack/react-hotkeys";
import { AppProvidersProps } from "./providers.types";
import { JointProvider, SimulationProvider } from "../context";
import { RobotJogHotkeys } from "../hotkeys";
import "@/workcell/runtime";
import "@/perception/runtime";
import "@/simulation/diagnostics/cellDiagnostics";

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SimulationProvider>
      <JointProvider>
        <HotkeysProvider
          defaultOptions={{
            hotkey: { preventDefault: true, ignoreInputs: true },
          }}
        >
          {children}
          <RobotJogHotkeys />
        </HotkeysProvider>
      </JointProvider>
    </SimulationProvider>
  );
};

export default AppProviders;
