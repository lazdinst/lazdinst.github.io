import React, { useState } from "react";
import styled from "styled-components";

export type direction = "horizontal" | "vertical";

interface SeperatorStyleProps {
  isDragging: boolean;
  isFocused: boolean;
  direction: direction;
}

interface SeperatorComponentProps {
  id?: string;
  direction: direction;
  isDragging: boolean;
}

// Styled component for the Seperator
const Seperator = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isDragging" && prop !== "isFocused",
})<SeperatorStyleProps>`
  flex-shrink: 0;
  background-color: rgb(255, 255, 255, 0.2);
  width: ${({ direction }) => (direction === "horizontal" ? "100%" : "4px")};
  height: ${({ direction }) => (direction === "horizontal" ? "4px" : "auto")};
  cursor: ${({ direction }) =>
    direction === "horizontal" ? "row-resize" : "col-resize"};

  &:hover {
    background-color: #63b3ed;
  }
  ${({ isDragging }) => isDragging && `opacity: 0.7;`}
`;

const SampleSplitter: React.FC<SeperatorComponentProps> = ({
  id = "drag-bar",
  direction = "vertical",
  isDragging,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  console.log(props);
  return (
    <Seperator
      id={id}
      data-testid={id}
      tabIndex={0}
      direction={direction}
      isDragging={isDragging}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      isFocused={isFocused}
      {...props}
    />
  );
};

export default SampleSplitter;
