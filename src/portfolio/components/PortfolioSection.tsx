import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface PortfolioSectionProps {
  id: string;
  label: string;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Same header treatment as the inspector groups, without the collapse. */
export function PortfolioSection({
  id,
  label,
  trailing,
  children,
  className,
}: PortfolioSectionProps) {
  return (
    <section
      id={id}
      className={cn("flex scroll-mt-10 flex-col gap-3", className)}
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex items-center gap-1.5">
        <h2
          id={`${id}-heading`}
          className="shrink-0 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
        >
          {label}
        </h2>
        <Separator className="flex-1" />
        {trailing ? (
          <div className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-muted-foreground">
            {trailing}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
