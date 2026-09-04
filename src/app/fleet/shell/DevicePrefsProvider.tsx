import { useCallback, useMemo, useState, type ReactNode } from "react";
import { DevicePrefsContext } from "./useDevicePrefs";

const RECENT_KEY = "fleet.recentDevices";
const FAVORITES_KEY = "fleet.favoriteDevices";
const RECENT_LIMIT = 6;

function readIds(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Storage may be unavailable; these are conveniences only.
  }
}

/** Recently selected and favorited device ids, persisted per browser. */
export function DevicePrefsProvider({ children }: { children: ReactNode }) {
  const [recent, setRecent] = useState<string[]>(() => readIds(RECENT_KEY));
  const [favorites, setFavorites] = useState<string[]>(() => readIds(FAVORITES_KEY));

  const pushRecent = useCallback((id: string) => {
    setRecent((current) => {
      if (current[0] === id) return current;
      const next = [id, ...current.filter((other) => other !== id)].slice(0, RECENT_LIMIT);
      writeIds(RECENT_KEY, next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((other) => other !== id) : [...current, id];
      writeIds(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      recent,
      favorites,
      pushRecent,
      toggleFavorite,
      isFavorite: (id: string) => favorites.includes(id),
    }),
    [recent, favorites, pushRecent, toggleFavorite]
  );

  return <DevicePrefsContext.Provider value={value}>{children}</DevicePrefsContext.Provider>;
}
