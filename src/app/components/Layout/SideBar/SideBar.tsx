import React from "react";
import { SideBarContainer, Title } from "./SideBar.style";
import { SideBarProps } from "./SideBar.types";

const SideBar: React.FC<SideBarProps> = ({ children }) => {
  return (
    <SideBarContainer>
      <Title>Controls</Title>
      {children}
    </SideBarContainer>
  );
};

export default SideBar;
