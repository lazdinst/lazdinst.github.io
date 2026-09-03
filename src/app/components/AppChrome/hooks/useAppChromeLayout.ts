import { useCallback, useEffect, useState } from "react";
import {
  COMPACT_BREAKPOINT,
  NARROW_BREAKPOINT,
  SHORT_HEIGHT_BREAKPOINT,
} from "../constants/chromeLayout";

export type ChromePane = "inspector" | "auxiliary";

export function useAppChromeLayout() {
  const [viewport, setViewport] = useState({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 800 : window.innerHeight,
  });
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [auxiliaryOpen, setAuxiliaryOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isNarrow = viewport.width < NARROW_BREAKPOINT;
  const isCompact = viewport.width < COMPACT_BREAKPOINT;
  const isShort = viewport.height < SHORT_HEIGHT_BREAKPOINT;

  // Overlay state only applies to narrow layouts; clear it when the split
  // layout returns so panes don't reappear unexpectedly on the next resize.
  useEffect(() => {
    if (!isNarrow) {
      setInspectorOpen(false);
      setAuxiliaryOpen(false);
    }
  }, [isNarrow]);

  // On phone widths both overlays would cover the whole stage, so keep at
  // most one open.
  useEffect(() => {
    if (isCompact && inspectorOpen && auxiliaryOpen) {
      setInspectorOpen(false);
    }
  }, [isCompact, inspectorOpen, auxiliaryOpen]);

  const closePanes = useCallback(() => {
    setInspectorOpen(false);
    setAuxiliaryOpen(false);
  }, []);

  const togglePane = useCallback(
    (pane: ChromePane) => {
      if (pane === "inspector") {
        setInspectorOpen((open) => {
          if (!open && isCompact) setAuxiliaryOpen(false);
          return !open;
        });
      } else {
        setAuxiliaryOpen((open) => {
          if (!open && isCompact) setInspectorOpen(false);
          return !open;
        });
      }
    },
    [isCompact]
  );

  const anyPaneOpen = isNarrow && (inspectorOpen || auxiliaryOpen);

  useEffect(() => {
    if (!anyPaneOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanes();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [anyPaneOpen, closePanes]);

  return {
    isNarrow,
    isCompact,
    isShort,
    inspectorOpen: isNarrow && inspectorOpen,
    auxiliaryOpen: isNarrow && auxiliaryOpen,
    togglePane,
    closePanes,
  };
}
