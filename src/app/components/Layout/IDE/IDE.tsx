import React, { ReactNode } from "react";
import Separator from "./Separator";
import {
  Wrapper,
  MainArea,
  DraggableSidebar,
  RobotArea,
  EditorArea,
  Terminal,
} from "./IDE.style";
import { useIdeLayout } from "./hooks";

interface IDEProps {
  sidebar: ReactNode;
  main: ReactNode;
  plugin: ReactNode;
  terminal: ReactNode;
}

const IdeClone: React.FC<IDEProps> = ({
  sidebar,
  main,
  plugin,
  terminal,
}): JSX.Element => {
  const {
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
  } = useIdeLayout();
  return (
    <Wrapper>
      <MainArea>
        <DraggableSidebar
          $isDragging={isLeftSidebarDragging}
          width={leftSidebarWidth}
        >
          {sidebar}
        </DraggableSidebar>
        <Separator
          direction="vertical"
          isDragging={isLeftSidebarDragging}
          {...leftSidebarSeparatorProps}
        />

        <EditorArea>
          <RobotArea width={dynamicCanvasWidth} height={dynamicCanvasHeight}>
            {main}
          </RobotArea>
          <Separator
            direction="vertical"
            isDragging={isRightSidebarDragging}
            {...rightSidebarSeparatorProps}
          />
          <DraggableSidebar
            $isDragging={isRightSidebarDragging}
            width={rightSidebarWidth}
          >
            {plugin}
          </DraggableSidebar>
        </EditorArea>
      </MainArea>
      <Separator
        direction="horizontal"
        isDragging={isTerminalDragging}
        {...terminalSeparatorProps}
      />
      <Terminal $isDragging={isTerminalDragging} height={terminalH}>
        {terminal}
      </Terminal>
    </Wrapper>
  );
};

export default IdeClone;
