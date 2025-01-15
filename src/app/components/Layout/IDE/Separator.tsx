import React, { useState } from "react";
import styled from "styled-components";
import { SEPARATOR_WIDTH } from "../../../../constants";

export type direction = "horizontal" | "vertical";

interface SeperatorComponentProps {
  id?: string;
  direction: direction;
  isDragging: boolean;
}

interface SeparatorLineProps {
  direction: direction;
  $isDragging: boolean;
}

const SeperatorLine = styled.div<SeparatorLineProps>`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.accent};
  display: ${({ $isDragging }) => ($isDragging ? "block" : "none")};
  width: ${({ direction }) =>
    direction === "horizontal" ? "100%" : `${SEPARATOR_WIDTH}px`};
  height: ${({ direction }) =>
    direction === "horizontal" ? `${SEPARATOR_WIDTH}px` : "100%"};
`;

interface SeperatorStyleProps {
  $isDragging: boolean;
  $isFocused: boolean;
  direction: direction;
}

const Seperator = styled.div<SeperatorStyleProps>`
  position: relative;
  flex-shrink: 0;
  background-color: rgb(255, 255, 255, 0);
  width: ${({ direction }) => (direction === "horizontal" ? "100%" : `1px`)};
  height: ${({ direction }) => (direction === "horizontal" ? "1px" : "auto")};
  cursor: ${({ direction }) =>
    direction === "horizontal" ? "row-resize" : "col-resize"};

  &:hover ${SeperatorLine} {
    display: block;
  }
`;

const SeparatorComponent: React.FC<SeperatorComponentProps> = ({
  id = "drag-bar",
  direction = "vertical",
  isDragging = false,
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
      $isFocused={isFocused}
      {...props}
    >
      <SeperatorLine direction={direction} $isDragging={isDragging} />
    </Seperator>
  );
};

export default SeparatorComponent;
