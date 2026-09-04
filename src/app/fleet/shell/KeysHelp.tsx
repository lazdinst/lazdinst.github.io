import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { FLEET_HOTKEYS, type FleetHotkeyInfo } from "../hotkeys/fleetHotkeyTable";
import { useShellUi } from "./useShellUi";

const GROUPS: FleetHotkeyInfo["group"][] = ["Navigate", "Selected device", "Panels", "Simulation"];

export function KeysHelp() {
  const ui = useShellUi();
  return (
    <Popover open={ui.keysOpen} onOpenChange={ui.setKeysOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant={ui.keysOpen ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-label="Keyboard shortcuts"
                  aria-pressed={ui.keysOpen}
                />
              }
            />
          }
        >
          <Keyboard />
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-1.5">
          Keyboard shortcuts <Kbd size="small">H</Kbd>
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="end" side="bottom" className="w-72 p-0">
        <div className="flex h-7 items-center justify-between border-b border-border px-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Keys</span>
          <span className="text-[10px] text-muted-foreground">Right-click the map for quick actions</span>
        </div>
        <div className="flex flex-col gap-2 p-2">
          {GROUPS.map((group) => (
            <div key={group} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{group}</span>
              {FLEET_HOTKEYS.filter((item) => item.group === group).map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-foreground">{item.label}</span>
                  <span className="flex items-center gap-1">
                    {item.chords.map((chord, index) => (
                      <span key={`${chord.key}-${index}`} className="flex items-center gap-1">
                        {index > 0 ? <span className="text-[10px] text-muted-foreground">/</span> : null}
                        <Kbd size="small" meta={chord.meta} shift={chord.shift}>
                          {chord.key}
                        </Kbd>
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
