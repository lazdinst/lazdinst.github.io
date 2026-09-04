import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FloatingPanelProps {
  title?: ReactNode;
  trailing?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Wrap the body in a scroll area (default) or let it size to content. */
  scroll?: boolean;
}

/** Card that floats over the map: translucent ground, hairline border, soft shadow. */
export function FloatingPanel({
  title,
  trailing,
  onClose,
  closeLabel = "Close",
  children,
  className,
  bodyClassName,
  scroll = true,
}: FloatingPanelProps) {
  return (
    <section
      className={cn(
        "pointer-events-auto flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background/95 shadow-md backdrop-blur",
        className
      )}
    >
      {title !== undefined || onClose ? (
        <header className="flex h-7 shrink-0 items-center justify-between gap-2 border-b border-border px-2">
          <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {title}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {trailing}
            {onClose ? (
              <Button variant="ghost" size="icon-xs" aria-label={closeLabel} onClick={onClose}>
                <X />
              </Button>
            ) : null}
          </div>
        </header>
      ) : null}
      {scroll ? (
        <ScrollArea className="min-h-0 flex-1 pane-scrollbar-gutter">
          <div className={cn("flex flex-col gap-3 p-2.5", bodyClassName)}>{children}</div>
        </ScrollArea>
      ) : (
        <div className={cn("flex min-h-0 flex-col gap-3 p-2.5", bodyClassName)}>{children}</div>
      )}
    </section>
  );
}
