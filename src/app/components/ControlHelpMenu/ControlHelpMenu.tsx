import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ControlHelpNote } from "../ControlHelpNote";

interface ControlHelpMenuProps {
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
}

export function ControlHelpMenu({
  align = "end",
  side = "bottom",
}: ControlHelpMenuProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="bg-background/90"
            aria-label="Control help"
          />
        }
      >
        <CircleHelp className="size-3" />
      </PopoverTrigger>
      <PopoverContent align={align} side={side} className="w-72 p-3">
        <ControlHelpNote />
      </PopoverContent>
    </Popover>
  );
}
