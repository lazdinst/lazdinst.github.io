import { AppCommandBar } from "./components/AppCommandBar";
import { AppWorkspace } from "./components/AppWorkspace";
import { useAppChromeLayout } from "./hooks/useAppChromeLayout";
import type { AppChromeSlots } from "./types/AppChromeSlots";

export function AppChrome({
  commandBar,
  commandBarTrailing,
  inspector,
  stage,
  auxiliary,
  output,
  inspectorTitle = "Inspector",
  auxiliaryTitle = "Telemetry",
}: AppChromeSlots) {
  const {
    isNarrow,
    isCompact,
    isShort,
    inspectorOpen,
    auxiliaryOpen,
    togglePane,
  } = useAppChromeLayout();

  return (
    <div className="flex h-svh w-svw flex-col overflow-hidden bg-background text-foreground">
      <AppCommandBar
        isNarrow={isNarrow}
        isShort={isShort}
        inspectorOpen={inspectorOpen}
        auxiliaryOpen={auxiliaryOpen}
        inspectorTitle={inspectorTitle}
        auxiliaryTitle={auxiliaryTitle}
        onTogglePane={togglePane}
        trailing={commandBarTrailing}
      >
        {commandBar}
      </AppCommandBar>
      <AppWorkspace
        inspector={inspector}
        stage={stage}
        auxiliary={auxiliary}
        output={output}
        inspectorTitle={inspectorTitle}
        auxiliaryTitle={auxiliaryTitle}
        isNarrow={isNarrow}
        isCompact={isCompact}
        isShort={isShort}
        inspectorOpen={inspectorOpen}
        auxiliaryOpen={auxiliaryOpen}
        onTogglePane={togglePane}
      />
    </div>
  );
}
