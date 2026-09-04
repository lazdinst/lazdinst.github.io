import { createContext, useContext } from "react";

export interface DevicePrefs {
  /** Most recently selected device ids, newest first. */
  recent: string[];
  favorites: string[];
  pushRecent: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const DevicePrefsContext = createContext<DevicePrefs | null>(null);

export function useDevicePrefs(): DevicePrefs {
  const value = useContext(DevicePrefsContext);
  if (!value) throw new Error("useDevicePrefs must be used inside DevicePrefsProvider");
  return value;
}
