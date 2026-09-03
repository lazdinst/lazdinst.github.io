import type { ReactNode } from "react";
import { ArrowLeft, PanelLeft, PanelRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "../../ThemeToggle";
import type { ChromePane } from "../hooks/useAppChromeLayout";
import { cn } from "@/lib/utils";

interface AppCommandBarProps {
  isNarrow: boolean;
  isShort: boolean;
  inspectorOpen: boolean;
  auxiliaryOpen: boolean;
  inspectorTitle: string;
  auxiliaryTitle: string;
  onTogglePane: (pane: ChromePane) => void;
  children: ReactNode;
  trailing?: ReactNode;
}

/**
 * Generic command bar shell: back link, pane toggles on narrow viewports, and
 * the theme toggle. Everything app-specific arrives through `children` and
 * `trailing`.
 */
export function AppCommandBar({
  isNarrow,
  isShort,
  inspectorOpen,
  auxiliaryOpen,
  inspectorTitle,
  auxiliaryTitle,
  onTogglePane,
  children,
  trailing,
}: AppCommandBarProps) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-2",
        isShort ? "h-6" : "h-7"
      )}
    >
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0"
                aria-label="Back to portfolio"
                nativeButton={false}
                render={<Link to="/" />}
              />
            }
          >
            <ArrowLeft />
          </TooltipTrigger>
          <TooltipContent>Back to portfolio</TooltipContent>
        </Tooltip>
        {isNarrow ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={inspectorOpen ? "secondary" : "ghost"}
                  size="icon-xs"
                  className="shrink-0"
                  aria-label={`Toggle ${inspectorTitle.toLowerCase()}`}
                  aria-pressed={inspectorOpen}
                  onClick={() => onTogglePane("inspector")}
                />
              }
            >
              <PanelLeft />
            </TooltipTrigger>
            <TooltipContent>{inspectorTitle}</TooltipContent>
          </Tooltip>
        ) : null}
        {children}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {isNarrow ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={auxiliaryOpen ? "secondary" : "ghost"}
                  size="icon-xs"
                  aria-label={`Toggle ${auxiliaryTitle.toLowerCase()}`}
                  aria-pressed={auxiliaryOpen}
                  onClick={() => onTogglePane("auxiliary")}
                />
              }
            >
              <PanelRight />
            </TooltipTrigger>
            <TooltipContent>{auxiliaryTitle}</TooltipContent>
          </Tooltip>
        ) : null}
        {trailing}
        <ThemeToggle />
      </div>
    </header>
  );
}
