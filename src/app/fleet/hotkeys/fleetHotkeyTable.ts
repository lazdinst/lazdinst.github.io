export interface KeyChord {
  key: string;
  meta?: boolean;
  shift?: boolean;
}

export interface FleetHotkeyInfo {
  chords: KeyChord[];
  label: string;
  group: "Navigate" | "Selected device" | "Panels" | "Simulation";
}

/** Displayed in the key help. Keep in sync with the registrations in FleetHotkeys. */
export const FLEET_HOTKEYS: FleetHotkeyInfo[] = [
  { chords: [{ key: "K", meta: true }], label: "Search devices", group: "Navigate" },
  { chords: [{ key: "J" }, { key: "K" }], label: "Next / previous device", group: "Navigate" },
  { chords: [{ key: "F" }], label: "Follow selected on map", group: "Navigate" },
  { chords: [{ key: "Esc" }], label: "Cancel drawing, close menu, drawer, or selection", group: "Navigate" },
  { chords: [{ key: "Z" }], label: "Draw an exclusion zone", group: "Navigate" },
  { chords: [{ key: "Enter" }], label: "Close the zone being drawn", group: "Navigate" },
  { chords: [{ key: "P" }], label: "Plan mission", group: "Selected device" },
  { chords: [{ key: "B" }], label: "Return to base", group: "Selected device" },
  { chords: [{ key: "X" }], label: "Abort mission", group: "Selected device" },
  { chords: [{ key: "S" }], label: "Star / unstar", group: "Selected device" },
  { chords: [{ key: "M" }], label: "Operations drawer", group: "Panels" },
  { chords: [{ key: "L" }], label: "Event log", group: "Panels" },
  { chords: [{ key: "H" }], label: "Key help", group: "Panels" },
  { chords: [{ key: "Space" }], label: "Start / pause simulation", group: "Simulation" },
];
