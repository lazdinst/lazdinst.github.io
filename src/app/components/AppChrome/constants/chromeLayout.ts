export const COMMAND_BAR_HEIGHT = 28;
/** Below this width the side panes leave the split layout and overlay the stage. */
export const NARROW_BREAKPOINT = 960;
/** Below this width (phones) only one overlay pane can be open at a time. */
export const COMPACT_BREAKPOINT = 640;
export const SHORT_HEIGHT_BREAKPOINT = 700;

export const INSPECTOR_DEFAULT_SIZE = 280;
export const INSPECTOR_MIN_SIZE = 220;
export const INSPECTOR_MAX_SIZE = 360;
export const STAGE_MIN_SIZE = "32%";
export const AUXILIARY_DEFAULT_SIZE = 280;
export const AUXILIARY_MIN_SIZE = 220;
export const AUXILIARY_MAX_SIZE = 360;

export const STAGE_DEFAULT_SIZE = "85%";
export const STAGE_VERTICAL_MIN_SIZE = "60%";
export const OUTPUT_DEFAULT_SIZE = 128;
export const OUTPUT_MIN_SIZE = 36;
export const OUTPUT_MAX_SIZE = 240;

export const APP_TITLE = "Fanuc LR Mate 200iD";

export const PANEL_FILL_CLASS = "h-full min-h-0 min-w-0 overflow-hidden";
export const PANEL_OVERFLOW_STYLE = { overflow: "hidden" } as const;

/** Width of a side pane when it overlays the stage on narrow viewports. */
export const OVERLAY_PANE_WIDTH_CLASS = "w-[min(85vw,20rem)]";
