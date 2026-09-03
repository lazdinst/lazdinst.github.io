import type { ReactNode } from "react";

export interface AppChromeSlots {
  /** App-specific title and controls rendered in the command bar. */
  commandBar: ReactNode;
  /** Extra controls rendered at the right edge of the command bar, before the theme toggle. */
  commandBarTrailing?: ReactNode;
  inspector: ReactNode;
  stage: ReactNode;
  auxiliary: ReactNode;
  output: ReactNode;
  /** Pane header labels. Default to the workcell's "Inspector" and "Telemetry". */
  inspectorTitle?: string;
  auxiliaryTitle?: string;
}
