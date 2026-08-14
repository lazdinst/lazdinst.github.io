import { useEffect, useState } from "react";
import { NARROW_BREAKPOINT, SHORT_HEIGHT_BREAKPOINT } from "../constants/chromeLayout";

export function useAppChromeLayout() {
  const [viewport, setViewport] = useState({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 800 : window.innerHeight,
  });
  const [auxiliaryOpen, setAuxiliaryOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isNarrow = viewport.width < NARROW_BREAKPOINT;
  const isShort = viewport.height < SHORT_HEIGHT_BREAKPOINT;

  useEffect(() => {
    if (!isNarrow) {
      setAuxiliaryOpen(false);
    }
  }, [isNarrow]);

  return {
    isNarrow,
    isShort,
    auxiliaryOpen,
    setAuxiliaryOpen,
  };
}
