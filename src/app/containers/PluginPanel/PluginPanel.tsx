import React from "react";
import { PluginPanelContainer } from "./PluginPanel.style";
import { JointGraphVisualizer } from "..";

const PluginPanel: React.FC = () => {
  return (
    <PluginPanelContainer>
      <JointGraphVisualizer />
    </PluginPanelContainer>
  );
};
export default PluginPanel;
