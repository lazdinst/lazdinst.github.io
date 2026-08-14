import type { ThemeModeState } from "../redux/slices/theme";

export function loadPlannerState() {
  try {
    const serializedState = localStorage.getItem("planner");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load planner state from localStorage", err);
    return undefined;
  }
}

export function loadUIState() {
  try {
    const serializedState = localStorage.getItem("ui");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load ui state from localStorage", err);
    return undefined;
  }
}

export function loadThemeState(): ThemeModeState | undefined {
  try {
    const serializedTheme = localStorage.getItem("theme");
    if (serializedTheme === null) {
      return undefined;
    }
    const parsed = JSON.parse(serializedTheme) as { mode?: string } | string;
    if (parsed === "light" || parsed === "dark") {
      return { mode: parsed };
    }
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed.mode === "light" || parsed.mode === "dark")
    ) {
      return { mode: parsed.mode };
    }
    return undefined;
  } catch (err) {
    console.error("Failed to load theme state from localStorage", err);
    return undefined;
  }
}
