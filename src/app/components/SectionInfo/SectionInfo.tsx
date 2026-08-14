import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SectionInfoContent } from "./types/SectionInfoContent";

interface SectionInfoProps {
  content: SectionInfoContent;
}

export function SectionInfo({ content }: SectionInfoProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            aria-label={`About ${content.title}`}
          />
        }
      >
        <Info className="size-3" />
      </PopoverTrigger>
      <PopoverContent align="start" side="right" className="w-72 p-3">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-foreground">{content.title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {content.summary}
          </p>
          {content.controls && content.controls.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {content.controls.map((control) => (
                <li key={control.name} className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] tracking-wide text-foreground uppercase">
                    {control.name}
                  </span>
                  <span className="text-xs leading-4 text-muted-foreground">
                    {control.detail}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
