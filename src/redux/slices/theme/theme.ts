import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThemeModeState, ThemeMode } from "./types";

const initialState: ThemeModeState = {
  mode: "dark",
};

function persistTheme(state: ThemeModeState) {
  localStorage.setItem("theme", JSON.stringify(state));
}

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      persistTheme(state);
    },
    toggleThemeMode: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      persistTheme(state);
    },
  },
});

export type { ThemeModeState };
export const { setThemeMode, toggleThemeMode } = themeSlice.actions;
export const selectThemeMode = (state: { theme: ThemeModeState }) =>
  state.theme.mode;
export default themeSlice.reducer;
