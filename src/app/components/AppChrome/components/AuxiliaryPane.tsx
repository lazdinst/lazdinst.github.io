import type { ReactNode } from "react";
import { PaneBody } from "./PaneBody";
import { PaneHeader } from "./PaneHeader";

interface AuxiliaryPaneProps {
  title: string;
  children: ReactNode;
  trailing?: ReactNode;
}

export function AuxiliaryPane({ title, children, trailing }: AuxiliaryPaneProps) {
  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground">
      <PaneHeader title={title} trailing={trailing} />
      <PaneBody className="@container">{children}</PaneBody>
    </section>
  );
}
