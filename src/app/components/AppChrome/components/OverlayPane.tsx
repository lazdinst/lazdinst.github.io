import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { OVERLAY_PANE_WIDTH_CLASS } from "../constants/chromeLayout";

interface OverlayPaneProps {
  side: "left" | "right";
  open: boolean;
  /** When true a tappable scrim covers the stage and closes the pane. */
  withScrim: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Hosts a side pane on top of the stage for narrow viewports. The stage stays
 * mounted and interactive underneath; the pane slides in from its edge.
 */
export function OverlayPane({
  side,
  open,
  withScrim,
  onClose,
  children,
}: OverlayPaneProps) {
  if (!open) return null;

  return (
    <>
      {withScrim ? (
        <button
          type="button"
          aria-label="Close panel"
          className="absolute inset-0 z-20 bg-background/50 animate-in fade-in duration-200"
          onClick={onClose}
        />
      ) : null}
      <div
        role="dialog"
        aria-modal={withScrim ? "true" : undefined}
        className={cn(
          "absolute inset-y-0 z-30 flex border-border shadow-xl animate-in duration-200",
          OVERLAY_PANE_WIDTH_CLASS,
          side === "left"
            ? "left-0 border-r slide-in-from-left"
            : "right-0 border-l slide-in-from-right"
        )}
      >
        {children}
      </div>
    </>
  );
}
