import React from "react";
import { SideBarContainer } from "./SideBar.style";
import { SideBarProps } from "./SideBar.types";

const SideBar: React.FC<SideBarProps> = ({ children }) => {
  return <SideBarContainer>{children}</SideBarContainer>;
};

export default SideBar;
