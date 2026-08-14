import { ChevronDown, CircleHelp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ControlHelpNote } from "./ControlHelpNote";

export function ControlHelpCallout() {
  return (
    <Collapsible>
      <div className="rounded-md border border-border bg-muted/20">
        <CollapsibleTrigger className="flex h-6 w-full items-center gap-1.5 px-2 text-left">
          <CircleHelp className="size-3 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">How to drive</span>
          <ChevronDown className="ml-auto size-3 text-muted-foreground transition-transform data-[panel-open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden">
          <div className="border-t border-border px-2 py-2">
            <ControlHelpNote heading={false} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
