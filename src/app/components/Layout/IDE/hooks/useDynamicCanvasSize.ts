import { SEPARATOR_WIDTH } from "../../../../../constants";

interface UseDynamicCanvasSizeArgs {
  windowWidth: number;
  windowHeight: number;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  terminalH: number;
}

export function useDynamicCanvasSize({
  windowWidth,
  windowHeight,
  leftSidebarWidth,
  rightSidebarWidth,
  terminalH,
}: UseDynamicCanvasSizeArgs) {
  const dynamicCanvasWidth =
    windowWidth - leftSidebarWidth - rightSidebarWidth - SEPARATOR_WIDTH * 2;

  const dynamicCanvasHeight = windowHeight - terminalH - SEPARATOR_WIDTH;
  return { dynamicCanvasWidth, dynamicCanvasHeight };
}
