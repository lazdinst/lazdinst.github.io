import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModeBannerProps {
  open: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A pill that slides down when it opens and back up when it closes. Stays
 * mounted through the exit animation so the close is visible.
 */
export function ModeBanner({ open, className, children }: ModeBannerProps) {
  const [mounted, setMounted] = useState(open);
  const [content, setContent] = useState<ReactNode>(children);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setContent(children);
    }
  }, [open, children]);

  if (!mounted) return null;

  return (
    <div
      data-state={open ? "open" : "closed"}
      className={cn(
        "pointer-events-auto flex h-7 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-background/95 px-2 text-xs whitespace-nowrap shadow-md backdrop-blur",
        "fill-mode-forwards duration-200 ease-out",
        open ? "animate-in fade-in-0 slide-in-from-top-2" : "animate-out fade-out-0 slide-out-to-top-2",
        className
      )}
      onAnimationEnd={() => {
        if (!open) setMounted(false);
      }}
    >
      {open ? children : content}
    </div>
  );
}
