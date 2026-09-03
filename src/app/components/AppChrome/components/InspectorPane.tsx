import type { ReactNode } from "react";
import { PaneBody } from "./PaneBody";
import { PaneHeader } from "./PaneHeader";

interface InspectorPaneProps {
  children: ReactNode;
  trailing?: ReactNode;
}

export function InspectorPane({ children, trailing }: InspectorPaneProps) {
  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground">
      <PaneHeader title="Inspector" trailing={trailing} />
      <PaneBody className="pane-scrollbar-gutter">{children}</PaneBody>
    </section>
  );
}
