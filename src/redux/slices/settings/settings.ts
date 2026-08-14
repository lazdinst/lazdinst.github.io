import { createSlice } from "@reduxjs/toolkit";
import { SettingsState } from "./settings.types";

const initialState: SettingsState = {
  cacheUIState: true,
  messages: [],
  gridEnabled: true,
  worldAxis: true,
  ghostEnabled: true,
  angleUnit: "deg",
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
    toggleGhostRobot: (state) => {
      state.ghostEnabled = !state.ghostEnabled;
    },
    toggleAngleUnit: (state) => {
      state.angleUnit = state.angleUnit === "deg" ? "rad" : "deg";
    },
  },
});

export const {
  toggleCacheUIState,
  clearUICache,
  toggleWorldGrid,
  toggleWorldAxis,
  toggleGhostRobot,
  toggleAngleUnit,
} = settings.actions;

export default settings.reducer;
