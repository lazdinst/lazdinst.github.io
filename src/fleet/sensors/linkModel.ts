import type { LatLng, LinkState, Relay, TerrainClass } from "../types";
import { haversineM } from "../geo/haversine";

export const LINK_LOSS_TIMEOUT_MS = 8_000;
export const RSSI_FLOOR_DBM = -100;

export interface LinkContext {
  position: LatLng;
  relays: Relay[];
  disabledRelayIds: string[];
  rangeScale: number;
  terrain: TerrainClass;
  radioFailed: boolean;
  previous: LinkState | null;
  timestampMs: number;
}

export function nearestRelay(
  position: LatLng,
  relays: Relay[],
  disabledRelayIds: string[]
): { relay: Relay; distanceM: number } | null {
  let best: { relay: Relay; distanceM: number } | null = null;
  relays.forEach((relay) => {
    if (disabledRelayIds.includes(relay.id)) return;
    const distanceM = haversineM(position, relay.position);
    if (!best || distanceM < best.distanceM) {
      best = { relay, distanceM };
    }
  });
  return best;
}

/** True when a point sits inside at least one enabled relay's range. */
export function isCovered(
  position: LatLng,
  relays: Relay[],
  disabledRelayIds: string[],
  rangeScale: number
): boolean {
  const nearest = nearestRelay(position, relays, disabledRelayIds);
  return nearest !== null && nearest.distanceM <= nearest.relay.rangeM * rangeScale;
}

export function deriveLink(ctx: LinkContext): LinkState {
  const nearest = ctx.radioFailed
    ? null
    : nearestRelay(ctx.position, ctx.relays, ctx.disabledRelayIds);
  if (!nearest) {
    return {
      relayId: null,
      rssiDbm: -120,
      quality: 0,
      latencyMs: 0,
      lostSinceMs: ctx.previous?.lostSinceMs ?? ctx.timestampMs,
    };
  }
  const range = nearest.relay.rangeM * ctx.rangeScale;
  const ratio = nearest.distanceM / range;
  const canyon = ctx.terrain === "urban" ? 0.7 : 1;
  const quality = Math.max(0, Math.min(1, (1 - ratio * ratio) * canyon));
  const rssiDbm = -55 - 45 * Math.min(1.4, ratio) - (canyon < 1 ? 8 : 0);
  const connected = rssiDbm > RSSI_FLOOR_DBM;
  return {
    relayId: connected ? nearest.relay.id : null,
    rssiDbm: Number(rssiDbm.toFixed(1)),
    quality: connected ? Number(quality.toFixed(3)) : 0,
    latencyMs: connected ? Math.round(18 + ratio * 120) : 0,
    lostSinceMs: connected ? null : (ctx.previous?.lostSinceMs ?? ctx.timestampMs),
  };
}

export function isLinkLost(link: LinkState, timestampMs: number): boolean {
  return link.lostSinceMs !== null && timestampMs - link.lostSinceMs >= LINK_LOSS_TIMEOUT_MS;
}
