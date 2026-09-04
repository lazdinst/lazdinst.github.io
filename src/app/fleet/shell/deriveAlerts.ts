import { LOW_ENERGY_PCT, findFleetFault, haversineM, type FleetSnapshot } from "@/fleet";

export type AlertSeverity = "alert" | "warn";

export interface FleetAlert {
  id: string;
  severity: AlertSeverity;
  assetId: string;
  callsign: string;
  title: string;
  detail: string;
}

const FAILED_MISSION_WINDOW_MS = 120_000;

/** Everything that currently needs an operator's attention, worst first. */
export function deriveAlerts(snapshot: FleetSnapshot): FleetAlert[] {
  const alerts: FleetAlert[] = [];
  snapshot.assets.forEach((asset) => {
    if (asset.status === "lost_link") {
      const forMs = asset.link.lostSinceMs !== null ? snapshot.timestampMs - asset.link.lostSinceMs : 0;
      alerts.push({
        id: `${asset.id}-link`,
        severity: "alert",
        assetId: asset.id,
        callsign: asset.callsign,
        title: "Link lost",
        detail: `No relay for ${Math.round(forMs / 1000)} s · holding last fix`,
      });
    }
    asset.faults.forEach((fault) => {
      const definition = findFleetFault(fault);
      alerts.push({
        id: `${asset.id}-${fault}`,
        severity: "alert",
        assetId: asset.id,
        callsign: asset.callsign,
        title: definition.name,
        detail: definition.description,
      });
    });
    if (asset.maintenance.due) {
      const orders = asset.maintenance.workOrders.length;
      alerts.push({
        id: `${asset.id}-maint`,
        severity: "warn",
        assetId: asset.id,
        callsign: asset.callsign,
        title: "Maintenance due",
        detail:
          orders > 0
            ? `${orders} open work order${orders === 1 ? "" : "s"} · dispatch needs override`
            : `${asset.maintenance.hoursSinceService.toFixed(0)} h of ${asset.maintenance.serviceIntervalHours.toFixed(0)} h interval`,
      });
    }
    const onMission =
      asset.status === "en_route" || asset.status === "patrolling" || asset.status === "returning";
    if (onMission && asset.energyPct < LOW_ENERGY_PCT) {
      alerts.push({
        id: `${asset.id}-energy`,
        severity: "warn",
        assetId: asset.id,
        callsign: asset.callsign,
        title: "Low energy",
        detail: `${asset.energyPct.toFixed(0)}% while ${asset.status === "returning" ? "returning to base" : "on mission"}`,
      });
    }
  });
  snapshot.assets.forEach((asset) => {
    if (asset.armorPct < 40) {
      alerts.push({
        id: `${asset.id}-armor`,
        severity: "alert",
        assetId: asset.id,
        callsign: asset.callsign,
        title: "Armor critical",
        detail: `${asset.armorPct.toFixed(0)}% armor remaining`,
      });
    }
    if (asset.weapon && asset.weapon.ammo === 0) {
      alerts.push({
        id: `${asset.id}-ammo`,
        severity: "warn",
        assetId: asset.id,
        callsign: asset.callsign,
        title: "Out of ammunition",
        detail: "Rearm at the home depot",
      });
    }
    const contact = snapshot.hostiles
      .filter((hostile) => hostile.status !== "eliminated")
      .map((hostile) => ({ hostile, distance: haversineM(asset.position, hostile.position) }))
      .filter(({ hostile, distance }) => distance <= Math.max(1500, hostile.weaponRangeM))
      .sort((a, b) => a.distance - b.distance)[0];
    if (contact && asset.status !== "engaging") {
      const underFire = contact.distance <= contact.hostile.weaponRangeM;
      alerts.push({
        id: `${asset.id}-contact-${contact.hostile.id}`,
        severity: underFire ? "alert" : "warn",
        assetId: asset.id,
        callsign: asset.callsign,
        title: underFire ? "Under hostile fire" : "Hostile contact",
        detail: `${contact.hostile.callsign} · ${contact.hostile.label} · ${contact.distance.toFixed(0)} m · threat ${contact.hostile.threat}`,
      });
    }
  });
  snapshot.missions.forEach((mission) => {
    if (mission.status !== "failed" || mission.completedAtMs === null) return;
    if (snapshot.timestampMs - mission.completedAtMs > FAILED_MISSION_WINDOW_MS) return;
    alerts.push({
      id: `${mission.id}-failed`,
      severity: "warn",
      assetId: mission.assetId,
      callsign: mission.callsign,
      title: "Mission failed",
      detail: mission.failureReason ?? "See event log",
    });
  });
  return alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "alert" ? -1 : 1));
}
