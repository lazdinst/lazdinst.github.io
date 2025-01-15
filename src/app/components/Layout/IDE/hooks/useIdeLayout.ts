import { useEffect, useState } from "react";
import { useResizable, SeparatorProps } from "react-resizable-layout";
import { useWindowSize } from "./useWindowSize";
import { useDynamicCanvasSize } from "./useDynamicCanvasSize";
import {
  SEPARATOR_WIDTH,
  MIN_CENTER_WIDTH,
  MIN_LEFT_SIDEBAR_WIDTH,
  MIN_RIGHT_SIDEBAR_WIDTH,
} from "../../../../../constants";

interface IdeLayout {
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  terminalH: number;
  dynamicCanvasWidth: number;
  dynamicCanvasHeight: number;
  isLeftSidebarDragging: boolean;
  isRightSidebarDragging: boolean;
  isTerminalDragging: boolean;
  leftSidebarSeparatorProps: SeparatorProps;
  rightSidebarSeparatorProps: SeparatorProps;
  terminalSeparatorProps: SeparatorProps;
}

/**
 * A custom hook to manage IDE-like layout state.
 */
export function useIdeLayout(): IdeLayout {
  // 1) Window size
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [leftMax, setLeftMax] = useState(MIN_LEFT_SIDEBAR_WIDTH);
  const [rightMax, setRightMax] = useState(MIN_RIGHT_SIDEBAR_WIDTH);

  // 2) Left sidebar
  const {
    isDragging: isLeftSidebarDragging,
    position: leftSidebarWidth,
    separatorProps: leftSidebarSeparatorProps,
  } = useResizable({
    axis: "x",
    initial: 332,
    min: 332,
    max: leftMax,
  });
  // 3) Right sidebar
  const {
    isDragging: isRightSidebarDragging,
    position: rightSidebarWidth,
    separatorProps: rightSidebarSeparatorProps,
  } = useResizable({
    axis: "x",
    initial: 200,
    min: 50,
    max: rightMax,
    reverse: true,
  });

  // 4) Terminal
  const {
    isDragging: isTerminalDragging,
    position: terminalH,
    separatorProps: terminalSeparatorProps,
  } = useResizable({
    axis: "y",
    initial: 150,
    min: 50,
    max: 500,
    reverse: true,
  });

  useEffect(() => {
    const diff = windowWidth - MIN_CENTER_WIDTH - 2 * SEPARATOR_WIDTH;
    const newLeftMax = diff - rightSidebarWidth;
    const newRightMax = diff - leftSidebarWidth;

    setLeftMax(newLeftMax);
    setRightMax(newRightMax);
  }, [leftSidebarWidth, rightSidebarWidth, windowWidth]);

  // 5) Compute dynamic canvas sizes
  const { dynamicCanvasWidth, dynamicCanvasHeight } = useDynamicCanvasSize({
    windowWidth,
    windowHeight,
    leftSidebarWidth,
    rightSidebarWidth,
    terminalH,
  });

  // 6) Return everything your component needs
  return {
    leftSidebarWidth,
    rightSidebarWidth,
    terminalH,
    dynamicCanvasWidth,
    dynamicCanvasHeight,
    isLeftSidebarDragging,
    isRightSidebarDragging,
    isTerminalDragging,
    leftSidebarSeparatorProps,
    rightSidebarSeparatorProps,
    terminalSeparatorProps,
  };
}
