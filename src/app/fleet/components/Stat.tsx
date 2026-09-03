import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: ReactNode;
  unit?: string;
  className?: string;
  valueClassName?: string;
}

/** Label-over-value pair in the portfolio metrics style. */
export function Stat({ label, value, unit, className, valueClassName }: StatProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <span className="truncate text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={cn(
          "truncate font-mono text-xs leading-none tabular-nums text-foreground",
          valueClassName
        )}
      >
        {value}
        {unit ? <span className="ml-0.5 text-[10px] text-muted-foreground">{unit}</span> : null}
      </span>
    </div>
  );
}
