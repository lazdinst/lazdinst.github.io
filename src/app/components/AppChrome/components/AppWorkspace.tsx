import type { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  AUXILIARY_DEFAULT_SIZE,
  AUXILIARY_MAX_SIZE,
  AUXILIARY_MIN_SIZE,
  INSPECTOR_DEFAULT_SIZE,
  INSPECTOR_MAX_SIZE,
  INSPECTOR_MIN_SIZE,
  OUTPUT_DEFAULT_SIZE,
  OUTPUT_MAX_SIZE,
  OUTPUT_MIN_SIZE,
  PANEL_FILL_CLASS,
  PANEL_OVERFLOW_STYLE,
  STAGE_DEFAULT_SIZE,
  STAGE_MIN_SIZE,
  STAGE_VERTICAL_MIN_SIZE,
} from "../constants/chromeLayout";
import { AppOutputBar } from "./AppOutputBar";
import { AuxiliaryPane } from "./AuxiliaryPane";
import { InspectorPane } from "./InspectorPane";
import { StagePane } from "./StagePane";

interface AppWorkspaceProps {
  inspector: ReactNode;
  stage: ReactNode;
  auxiliary: ReactNode;
  output: ReactNode;
  isNarrow: boolean;
  isShort: boolean;
  auxiliaryOpen: boolean;
}

export function AppWorkspace({
  inspector,
  stage,
  auxiliary,
  output,
  isNarrow,
  isShort,
  auxiliaryOpen,
}: AppWorkspaceProps) {
  return (
    <div className="relative min-h-0 flex-1">
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={INSPECTOR_DEFAULT_SIZE}
          minSize={INSPECTOR_MIN_SIZE}
          maxSize={INSPECTOR_MAX_SIZE}
          className={PANEL_FILL_CLASS}
          style={PANEL_OVERFLOW_STYLE}
        >
          <InspectorPane>{inspector}</InspectorPane>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          minSize={STAGE_MIN_SIZE}
          className={PANEL_FILL_CLASS}
          style={PANEL_OVERFLOW_STYLE}
        >
          <ResizablePanelGroup orientation="vertical" className="h-full">
            <ResizablePanel
              defaultSize={STAGE_DEFAULT_SIZE}
              minSize={STAGE_VERTICAL_MIN_SIZE}
              className={PANEL_FILL_CLASS}
              style={PANEL_OVERFLOW_STYLE}
            >
              <StagePane>{stage}</StagePane>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              defaultSize={isShort ? OUTPUT_MIN_SIZE : OUTPUT_DEFAULT_SIZE}
              minSize={OUTPUT_MIN_SIZE}
              maxSize={OUTPUT_MAX_SIZE}
              className={PANEL_FILL_CLASS}
              style={PANEL_OVERFLOW_STYLE}
            >
              <AppOutputBar>{output}</AppOutputBar>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        {!isNarrow ? (
          <>
            <ResizableHandle />
            <ResizablePanel
              defaultSize={AUXILIARY_DEFAULT_SIZE}
              minSize={AUXILIARY_MIN_SIZE}
              maxSize={AUXILIARY_MAX_SIZE}
              className={PANEL_FILL_CLASS}
              style={PANEL_OVERFLOW_STYLE}
            >
              <AuxiliaryPane>{auxiliary}</AuxiliaryPane>
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
      {isNarrow && auxiliaryOpen ? (
        <div className="absolute inset-y-0 right-0 z-20 w-[min(100%,20rem)] border-l border-border">
          <AuxiliaryPane>{auxiliary}</AuxiliaryPane>
        </div>
      ) : null}
    </div>
  );
}
