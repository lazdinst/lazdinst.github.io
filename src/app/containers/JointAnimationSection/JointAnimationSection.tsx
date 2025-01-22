import React from "react";
import { SectionTitle, SidebarSection } from "../../components";
import JointAnimationToggle from "../JointAnimationToggle";

const JointAnimationSection: React.FC = () => {
  return (
    <SidebarSection>
      <SectionTitle title="Joint Animation" />
      <JointAnimationToggle />
    </SidebarSection>
  );
};

export default JointAnimationSection;
