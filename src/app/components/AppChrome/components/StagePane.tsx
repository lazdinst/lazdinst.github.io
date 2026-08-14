import type { ReactNode } from "react";

interface StagePaneProps {
  children: ReactNode;
}

export function StagePane({ children }: StagePaneProps) {
  return (
    <section className="relative h-full min-h-0 min-w-0 w-full bg-background">
      {children}
    </section>
  );
}
