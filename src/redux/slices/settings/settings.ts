import { createSlice } from "@reduxjs/toolkit";
import { SettingsState } from "./settings.types";

const initialState: SettingsState = {
  cacheUIState: true,
  messages: [],
  gridEnabled: true,
  worldAxis: true,
  jointAnimationEnabled: false,
};

const settings = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleCacheUIState: (state) => {
      state.cacheUIState = !state.cacheUIState;
    },
    clearUICache: () => {
      localStorage.removeItem("ui");
    },
    toggleWorldGrid: (state) => {
      state.gridEnabled = !state.gridEnabled;
    },
    toggleWorldAxis: (state) => {
      state.worldAxis = !state.worldAxis;
    },
    toggleJointAnimation: (state) => {
      state.jointAnimationEnabled = !state.jointAnimationEnabled;
    },
  },
});

export const {
  toggleCacheUIState,
  clearUICache,
  toggleWorldGrid,
  toggleWorldAxis,
  toggleJointAnimation,
} = settings.actions;

export default settings.reducer;
