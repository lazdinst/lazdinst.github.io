import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PaneBodyProps {
  children: ReactNode;
  className?: string;
}

export function PaneBody({ children, className }: PaneBodyProps) {
  return (
    <ScrollArea className={cn("min-h-0 flex-1", className)}>
      <div className="flex flex-col gap-3 p-2">{children}</div>
    </ScrollArea>
  );
}
