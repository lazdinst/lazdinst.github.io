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
import type { ChromePane } from "../hooks/useAppChromeLayout";
import { AppOutputBar } from "./AppOutputBar";
import { AuxiliaryPane } from "./AuxiliaryPane";
import { InspectorPane } from "./InspectorPane";
import { OverlayPane } from "./OverlayPane";
import { PaneCloseButton } from "./PaneCloseButton";
import { StagePane } from "./StagePane";

interface AppWorkspaceProps {
  inspector: ReactNode;
  stage: ReactNode;
  auxiliary: ReactNode;
  output: ReactNode;
  inspectorTitle: string;
  auxiliaryTitle: string;
  isNarrow: boolean;
  isCompact: boolean;
  isShort: boolean;
  inspectorOpen: boolean;
  auxiliaryOpen: boolean;
  onTogglePane: (pane: ChromePane) => void;
}

export function AppWorkspace({
  inspector,
  stage,
  auxiliary,
  output,
  inspectorTitle,
  auxiliaryTitle,
  isNarrow,
  isCompact,
  isShort,
  inspectorOpen,
  auxiliaryOpen,
  onTogglePane,
}: AppWorkspaceProps) {
  return (
    <div className="relative min-h-0 flex-1">
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        {!isNarrow ? (
          <>
            <ResizablePanel
              defaultSize={INSPECTOR_DEFAULT_SIZE}
              minSize={INSPECTOR_MIN_SIZE}
              maxSize={INSPECTOR_MAX_SIZE}
              className={PANEL_FILL_CLASS}
              style={PANEL_OVERFLOW_STYLE}
            >
              <InspectorPane title={inspectorTitle}>{inspector}</InspectorPane>
            </ResizablePanel>
            <ResizableHandle />
          </>
        ) : null}
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
              <AuxiliaryPane title={auxiliaryTitle}>{auxiliary}</AuxiliaryPane>
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
      {isNarrow ? (
        <>
          <OverlayPane
            side="left"
            open={inspectorOpen}
            withScrim={isCompact}
            onClose={() => onTogglePane("inspector")}
          >
            <InspectorPane
              title={inspectorTitle}
              trailing={
                <PaneCloseButton
                  label={`Close ${inspectorTitle.toLowerCase()}`}
                  onClick={() => onTogglePane("inspector")}
                />
              }
            >
              {inspector}
            </InspectorPane>
          </OverlayPane>
          <OverlayPane
            side="right"
            open={auxiliaryOpen}
            withScrim={isCompact}
            onClose={() => onTogglePane("auxiliary")}
          >
            <AuxiliaryPane
              title={auxiliaryTitle}
              trailing={
                <PaneCloseButton
                  label={`Close ${auxiliaryTitle.toLowerCase()}`}
                  onClick={() => onTogglePane("auxiliary")}
                />
              }
            >
              {auxiliary}
            </AuxiliaryPane>
          </OverlayPane>
        </>
      ) : null}
    </div>
  );
}
