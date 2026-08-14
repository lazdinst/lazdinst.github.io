import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionInfo } from "../SectionInfo";
import type { SectionInfoContent } from "../SectionInfo";

interface PanelSectionProps {
  title: string;
  info?: SectionInfoContent;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PanelSection({
  title,
  info,
  trailing,
  children,
  className,
}: PanelSectionProps) {
  return (
    <section className={cn("flex flex-col gap-1", className)}>
      <div className="flex h-5 items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-0.5">
          <h3 className="text-xs font-medium text-foreground">{title}</h3>
          {info ? <SectionInfo content={info} /> : null}
        </div>
        {trailing}
      </div>
      {children}
    </section>
  );
}
