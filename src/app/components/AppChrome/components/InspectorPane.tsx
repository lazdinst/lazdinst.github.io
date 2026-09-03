import type { ReactNode } from "react";
import { PaneBody } from "./PaneBody";
import { PaneHeader } from "./PaneHeader";

interface InspectorPaneProps {
  title: string;
  children: ReactNode;
  trailing?: ReactNode;
}

export function InspectorPane({ title, children, trailing }: InspectorPaneProps) {
  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground">
      <PaneHeader title={title} trailing={trailing} />
      <PaneBody className="pane-scrollbar-gutter">{children}</PaneBody>
    </section>
  );
}
