import React, { useState } from "react";
import styled from "styled-components";
import { SEPARATOR_WIDTH } from "../../../../constants";
export type direction = "horizontal" | "vertical";

interface SeperatorStyleProps {
  $isDragging: boolean;
  isFocused: boolean;
  direction: direction;
}

interface SeperatorComponentProps {
  id?: string;
  direction: direction;
  isDragging: boolean;
}

const Seperator = styled.div<SeperatorStyleProps>`
  flex-shrink: 0;
  background-color: rgb(255, 255, 255, 0);
  width: ${({ direction }) => (direction === "horizontal" ? "100%" : `1px`)};
  height: ${({ direction }) =>
    direction === "horizontal" ? `${SEPARATOR_WIDTH}px` : "auto"};
  cursor: ${({ direction }) =>
    direction === "horizontal" ? "row-resize" : "col-resize"};

  &:hover {
    background-color: ${({ theme }) => theme.colors.accent};
    width: ${({ direction }) =>
      direction === "horizontal" ? "100%" : `${SEPARATOR_WIDTH}px`};
  }
  &:focus {
    background-color: ${({ theme }) => theme.colors.accent};
    width: ${({ direction }) =>
      direction === "horizontal" ? "100%" : `${SEPARATOR_WIDTH}px`};
  }
`;

const SeparatorComponent: React.FC<SeperatorComponentProps> = ({
  id = "drag-bar",
  direction = "vertical",
  isDragging,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Seperator
      id={id}
      data-testid={id}
      tabIndex={0}
      direction={direction}
      $isDragging={isDragging}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      isFocused={isFocused}
      {...props}
    ></Seperator>
  );
};

export default SeparatorComponent;
