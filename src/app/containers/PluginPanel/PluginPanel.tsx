import React from "react";
import { PluginPanelContainer, PluginTitle } from "./PluginPanel.style";
import { JointGraphVisualizer } from "..";

const PluginPanel: React.FC = () => {
  return (
    <PluginPanelContainer>
      <PluginTitle>Plugin Panel</PluginTitle>
      <JointGraphVisualizer />
    </PluginPanelContainer>
  );
};
export default PluginPanel;
