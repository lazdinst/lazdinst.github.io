export interface SettingsState {
  cacheUIState: boolean;
  messages: string[];
  gridEnabled: boolean;
  worldAxis: boolean;
  ghostEnabled: boolean;
  angleUnit: "deg" | "rad";
}
