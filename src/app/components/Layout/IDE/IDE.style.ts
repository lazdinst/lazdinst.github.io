import styled from "styled-components";

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

export const RobotArea = styled.div`
  flex-grow: 1;
  background-color: #1e293b;
`;

// File Tree section
export const FileTree = styled.div<{ isDragging: boolean; width: number }>`
  width: ${({ width }) => width || 250}px;
  transition: filter 0.2s ease-out, background-color 0.2s ease-out;
  font-size: 16px;
  opacity: ${({ isDragging }) => (isDragging ? "0.7" : "1")};
  flex-shrink: 0;
  display: grid;
  place-items: center;
`;

// Plugin area
export const PluginArea = styled.div<{ isDragging: boolean; width: number }>`
  width: ${({ width }) => width || 250}px;
  transition: filter 0.2s ease-out, background-color 0.2s ease-out;
  font-size: 16px;
  opacity: ${({ isDragging }) => (isDragging ? "0.7" : "1")};
  flex-shrink: 0;
  display: grid;
  place-items: center;
`;

// Splitter wrapper for the draggable bars
export const SplitterWrapper = styled.div<{ isDragging: boolean }>`
  display: flex;
  position: relative;
  cursor: ${({ isDragging }) => (isDragging ? "grabbing" : "grab")};
`;

// Terminal area
export const Terminal = styled.div<{ isDragging: boolean; height: number }>`
  height: ${({ height }) => height || 150}px;
  background-color: #1e293b; // bg-darker
  transition: height 0.2s;
  opacity: ${({ isDragging }) => (isDragging ? "0.7" : "1")};
  display: grid;
  place-items: center;
  transition: filter 0.2s ease-out, background-color 0.2s ease-out;
  font-size: 16px;

  &.dragging {
    filter: blur(5px);
    background-color: #555555;
  }
`;
