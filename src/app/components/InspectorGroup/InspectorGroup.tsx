import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { SectionInfo } from "../SectionInfo";
import type { SectionInfoContent } from "../SectionInfo";

interface InspectorGroupProps {
  label: string;
  info?: SectionInfoContent;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function InspectorGroup({
  label,
  info,
  defaultOpen = true,
  children,
}: InspectorGroupProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="flex flex-col">
      <div className="flex items-center gap-1.5 pt-1">
        <CollapsibleTrigger
          className="group flex items-center gap-1.5 text-left hover:[&_h2]:text-foreground"
          aria-label={`Toggle ${label}`}
        >
          <h2 className="shrink-0 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {label}
          </h2>
        </CollapsibleTrigger>
        {info ? <SectionInfo content={info} /> : null}
        <CollapsibleTrigger
          className="group flex min-w-0 flex-1 items-center gap-1.5"
          aria-label={`Toggle ${label}`}
        >
          <Separator className="flex-1" />
          <ChevronDown className="size-3 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180 group-data-[open]:rotate-180" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="overflow-hidden">
        <div className="flex flex-col gap-2 pt-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
