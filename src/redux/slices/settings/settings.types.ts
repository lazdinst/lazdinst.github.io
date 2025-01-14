export interface SettingsState {
  cacheUIState: boolean;
  messages: string[];
  gridEnabled: boolean;
  worldAxis: boolean;
  jointAnimationEnabled: boolean;
  jointAnimationType: AnimationType;
}

export const animationTypes = ["sine", "cosine", "linear", "custom"] as const;

export type AnimationType = (typeof animationTypes)[number];
