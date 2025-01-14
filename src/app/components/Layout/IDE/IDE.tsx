import React, { ReactNode } from "react";
import SampleSplitter from "./SampleSplitter";
import { useResizable } from "react-resizable-layout";
import {
  Wrapper,
  MainArea,
  FileTree,
  RobotArea,
  EditorArea,
  PluginArea,
  Terminal,
} from "./IDE.style";

interface IDEProps {
  sidebar: ReactNode;
  main: ReactNode;
  plugin: ReactNode;
}

const IdeClone: React.FC<IDEProps> = ({
  sidebar,
  main,
  plugin,
}): JSX.Element => {
  const {
    isDragging: isTerminalDragging,
    position: terminalH,
    separatorProps: terminalSeparatorProps,
  } = useResizable({
    axis: "y",
    initial: 150,
    min: 50,
    reverse: true,
  });

  const {
    isDragging: isFileDragging,
    position: fileW,
    separatorProps: fileSeparatorProps,
  } = useResizable({
    axis: "x",
    initial: 250,
    min: 50,
  });

  const {
    isDragging: isPluginDragging,
    position: pluginW,
    separatorProps: pluginSeparatorProps,
  } = useResizable({
    axis: "x",
    initial: 200,
    min: 50,
    reverse: true,
  });

  return (
    <Wrapper>
      <MainArea>
        <FileTree isDragging={isFileDragging} width={fileW}>
          {sidebar}
        </FileTree>
        <SampleSplitter
          direction="vertical"
          isDragging={isFileDragging}
          {...fileSeparatorProps}
        />

        <EditorArea>
          <RobotArea>{main}</RobotArea>
          <SampleSplitter
            direction="vertical"
            isDragging={isPluginDragging}
            {...pluginSeparatorProps}
          />
          <PluginArea isDragging={isPluginDragging} width={pluginW}>
            {plugin}
          </PluginArea>
        </EditorArea>
      </MainArea>

      <SampleSplitter
        direction="horizontal"
        isDragging={isTerminalDragging}
        {...terminalSeparatorProps}
      />

      <Terminal isDragging={isTerminalDragging} height={terminalH}>
        Terminal
      </Terminal>
    </Wrapper>
  );
};

export default IdeClone;
