import { Moon, Sun } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toggleThemeMode } from "@/redux/slices/theme";
import { RootState, useAppDispatch } from "@/redux/store";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Toggle theme"
            onClick={() => dispatch(toggleThemeMode())}
          />
        }
      >
        {mode === "dark" ? <Sun /> : <Moon />}
      </TooltipTrigger>
      <TooltipContent>
        {mode === "dark" ? "Light theme" : "Dark theme"}
      </TooltipContent>
    </Tooltip>
  );
}
