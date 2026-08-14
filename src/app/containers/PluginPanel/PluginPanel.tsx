import { AnalyticsPanel } from "../AnalyticsPanel/AnalyticsPanel";
import { JointGraphVisualizer } from "../JointGraphVisualizer/JointGraphVisualizer";
import { TcpTelemetry } from "../TcpTelemetry";

export function PluginPanel() {
  return (
    <div className="flex flex-col gap-3">
      <AnalyticsPanel />
      <TcpTelemetry />
      <JointGraphVisualizer />
    </div>
  );
}

export default PluginPanel;
