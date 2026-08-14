import { AppCommandBar } from "./components/AppCommandBar";
import { AppWorkspace } from "./components/AppWorkspace";
import { useAppChromeLayout } from "./hooks/useAppChromeLayout";
import type { AppChromeSlots } from "./types/AppChromeSlots";

export function AppChrome({
  inspector,
  stage,
  auxiliary,
  output,
}: AppChromeSlots) {
  const { isNarrow, isShort, auxiliaryOpen, setAuxiliaryOpen } =
    useAppChromeLayout();

  return (
    <div className="flex h-svh w-svw flex-col overflow-hidden bg-background text-foreground">
      <AppCommandBar
        isNarrow={isNarrow}
        isShort={isShort}
        auxiliaryOpen={auxiliaryOpen}
        onToggleAuxiliary={() => setAuxiliaryOpen((open) => !open)}
      />
      <AppWorkspace
        inspector={inspector}
        stage={stage}
        auxiliary={auxiliary}
        output={output}
        isNarrow={isNarrow}
        isShort={isShort}
        auxiliaryOpen={auxiliaryOpen}
      />
    </div>
  );
}
