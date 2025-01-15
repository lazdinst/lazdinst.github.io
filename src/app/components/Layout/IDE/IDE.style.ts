import styled from "styled-components";
interface Draggable {
  $isDragging: boolean;
}

interface HorizontalDraggable extends Draggable {
  width: number;
}

interface VerticalDraggable extends Draggable {
  height: number;
}

// Wrapper for the entire layout
export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  color: white; // color-white
  overflow: hidden; // overflow-hidden
`;

// Main area that contains the file tree, editor, and plugin
export const MainArea = styled.div`
  display: flex;
  flex-grow: 1;
`;

// Editor area (the main editor section)
export const EditorArea = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const RobotArea = styled.div<{ width: number; height: number }>`
  width: ${({ width }) => width || 250}px;
  height: ${({ height }) => (height ? `${height}px` : "100%")};
  flex-grow: 1;
  background-color: #000000;
  position: relative;
  min-width: 0;
`;

export const DraggableSidebar = styled.div<HorizontalDraggable>`
  width: ${({ width }) => width || 300}px;
  flex-shrink: 0;
  transition: filter 0.2s ease-out, background-color 0.2s ease-out;
`;

export const Terminal = styled.div<VerticalDraggable>`
  height: ${({ height }) => height || 150}px;
  transition: filter 0.2s ease-out, background-color 0.2s ease-out;
`;
