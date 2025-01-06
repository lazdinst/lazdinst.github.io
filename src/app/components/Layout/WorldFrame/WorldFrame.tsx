import React from "react";
import { WorldFrameContainer } from "./WorldFrame.style";
import { WorldFrameProps } from "./WorldFrame.types";

const WorldFrame: React.FC<WorldFrameProps> = ({ children }) => {
  return <WorldFrameContainer>{children}</WorldFrameContainer>;
};

export default WorldFrame;
