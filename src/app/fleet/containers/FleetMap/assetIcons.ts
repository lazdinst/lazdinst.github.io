import { divIcon, type DivIcon } from "leaflet";
import type { AssetDomain, AssetKind } from "@/fleet";
import type { StatusTone } from "../../components";

const SHAPES: Record<AssetDomain | "legged", string> = {
  air: '<path d="M12 2 L20 21 L12 16.5 L4 21 Z"/>',
  sea: '<path d="M12 2 L18.5 10 L18.5 21 L5.5 21 L5.5 10 Z"/>',
  ground:
    '<path d="M6 7.5 h12 v11.5 a2 2 0 0 1 -2 2 h-8 a2 2 0 0 1 -2 -2 z"/><path d="M12 2 L16 7.5 H8 Z"/>',
  legged: '<circle cx="12" cy="13.5" r="7"/><path d="M12 2 L16.5 7.5 H7.5 Z"/>',
};

const STAR =
  '<svg class="fl-fav" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5L2.5 9.4l6.6-.8z"/></svg>';

const cache = new Map<string, DivIcon>();

export function assetIcon(
  kind: AssetKind,
  domain: AssetDomain,
  tone: StatusTone,
  selected: boolean,
  live: boolean,
  favorite: boolean,
  lostLink = false
): DivIcon {
  const key = `${kind}:${tone}:${selected ? 1 : 0}:${live ? 1 : 0}:${favorite ? 1 : 0}:${lostLink ? 1 : 0}`;
  let icon = cache.get(key);
  if (!icon) {
    const shape = SHAPES[kind === "legged" ? "legged" : domain];
    icon = divIcon({
      className: "fl-marker-wrap",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      tooltipAnchor: [0, -12],
      html: `<div class="fl-marker fl-tone-${tone}${selected ? " fl-selected" : ""}${live ? " fl-live" : ""}${lostLink ? " fl-lost" : ""}"><div class="fl-marker-rot"><svg viewBox="0 0 24 24" aria-hidden="true">${shape}</svg></div>${favorite ? STAR : ""}</div>`,
    });
    cache.set(key, icon);
  }
  return icon;
}
