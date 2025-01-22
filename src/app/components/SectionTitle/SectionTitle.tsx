import React from "react";
import { SectionTitle } from "./SectionTitle.style";

const SectionTitleComponent: React.FC<{ title: string }> = ({ title }) => {
  return <SectionTitle>{title}</SectionTitle>;
};

export default SectionTitleComponent;
