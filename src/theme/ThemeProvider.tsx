import { useEffect, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ThemeModeState } from "@/redux/slices/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSelector(
    (state: { theme: ThemeModeState }) => state.theme.mode
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return <TooltipProvider delay={200}>{children}</TooltipProvider>;
}
