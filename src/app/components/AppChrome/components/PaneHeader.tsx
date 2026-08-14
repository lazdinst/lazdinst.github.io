import type { ReactNode } from "react";

interface PaneHeaderProps {
  title: string;
  trailing?: ReactNode;
}

export function PaneHeader({ title, trailing }: PaneHeaderProps) {
  return (
    <header className="flex h-6 shrink-0 items-center justify-between gap-2 border-b border-border px-2">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {trailing ? <div className="flex items-center gap-2">{trailing}</div> : null}
    </header>
  );
}
