import { FC } from "react";
import { AppChrome } from "./components/AppChrome";
import AppProviders from "./providers";
import { EventTimeline } from "./containers/EventTimeline/EventTimeline";
import { JointInspector } from "./containers/JointInspector";
import { PluginPanel, Terminal, World } from "./containers";

const App: FC = () => {
  return (
    <AppProviders>
      <AppChrome
        inspector={<JointInspector />}
        stage={<World />}
        auxiliary={<PluginPanel />}
        output={
          <div className="flex h-full min-h-0 flex-col">
            <EventTimeline />
            <div className="min-h-0 flex-1">
              <Terminal />
            </div>
          </div>
        }
      />
    </AppProviders>
  );
};

export default App;
