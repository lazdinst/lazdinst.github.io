import { FC, useEffect } from "react";
import { AppChrome } from "../components/AppChrome";
import { APP_TITLE } from "../components/AppChrome/constants/chromeLayout";
import AppProviders from "../providers";
import { EventTimeline } from "../containers/EventTimeline/EventTimeline";
import { JointInspector } from "../containers/JointInspector";
import { PluginPanel, Terminal, World } from "../containers";

/** The robot workcell console, mounted as a full-screen showcase. */
const WorkcellShowcase: FC = () => {
  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

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

export default WorkcellShowcase;
