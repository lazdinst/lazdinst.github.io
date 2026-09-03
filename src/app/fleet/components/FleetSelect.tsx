import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Native select styled like the command-bar pickers in the workcell. */
export function FleetSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-5 min-w-0 truncate rounded-sm border border-border bg-background px-1 font-mono text-xs text-foreground disabled:opacity-50",
        className
      )}
    />
  );
}
