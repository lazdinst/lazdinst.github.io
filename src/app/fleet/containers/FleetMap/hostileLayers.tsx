import { memo, useMemo } from "react";
import { divIcon, type DivIcon } from "leaflet";
import { Circle, Marker, Polygon, Tooltip } from "react-leaflet";
import type { Asset, EngagementArea, Hostile } from "@/fleet";
import { cn } from "@/lib/utils";

const toTuple = (point: { lat: number; lng: number }): [number, number] => [point.lat, point.lng];

const DIAMOND = '<path d="M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z"/>';
const CROSS = '<path d="M5 5 L19 19 M19 5 L5 19"/>';
const cache = new Map<string, DivIcon>();

function hostileIcon(hostile: Hostile, selected: boolean): DivIcon {
  const key = `${hostile.threat}:${hostile.status}:${selected ? 1 : 0}`;
  let icon = cache.get(key);
  if (!icon) {
    icon = divIcon({
      className: "fl-hostile-wrap",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      tooltipAnchor: [0, -11],
      html: `<div class="fl-hostile fl-threat-${hostile.threat} fl-hstatus-${hostile.status}${selected ? " fl-selected" : ""}"><svg viewBox="0 0 24 24" aria-hidden="true">${hostile.status === "eliminated" ? CROSS : DIAMOND}</svg></div>`,
    });
    cache.set(key, icon);
  }
  return icon;
}

export const EngagementAreaLayer = memo(function EngagementAreaLayer({ areas }: { areas: EngagementArea[] }) {
  return (
    <>
      {areas.map((area) => (
        <Polygon
          key={area.id}
          positions={area.polygon.map(toTuple)}
          className={"fl-engagement-area"} interactive={false}
        >
          <Tooltip permanent direction="center" className="fl-tooltip fl-label" opacity={1}>
            {area.label}
          </Tooltip>
        </Polygon>
      ))}
    </>
  );
});

/** Dashed range rings around armed devices that are currently engaging. */
export function WeaponRangeLayer({ assets }: { assets: Asset[] }) {
  return (
    <>
      {assets
        .filter((asset) => asset.weapon && asset.status === "engaging")
        .map((asset) => (
          <Circle
            key={asset.id}
            center={toTuple(asset.position)}
            radius={asset.weapon!.system.rangeM}
            className={"fl-weapon-range"} interactive={false}
          />
        ))}
    </>
  );
}

export function HostileMarkers({
  hostiles,
  selectedId,
  labels,
  onSelect,
  onContextMenu,
}: {
  hostiles: Hostile[];
  selectedId: string | null;
  labels: boolean;
  onSelect: (hostile: Hostile) => void;
  onContextMenu: (hostile: Hostile, clientX: number, clientY: number) => void;
}) {
  return (
    <>
      {hostiles.map((hostile) => (
        <HostileMarker
          key={hostile.id}
          hostile={hostile}
          selected={hostile.id === selectedId}
          labels={labels}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
        />
      ))}
    </>
  );
}

function HostileMarker({
  hostile,
  selected,
  labels,
  onSelect,
  onContextMenu,
}: {
  hostile: Hostile;
  selected: boolean;
  labels: boolean;
  onSelect: (hostile: Hostile) => void;
  onContextMenu: (hostile: Hostile, clientX: number, clientY: number) => void;
}) {
  const icon = useMemo(() => hostileIcon(hostile, selected), [hostile, selected]);
  const showLabel = labels || selected;
  return (
    <>
      {hostile.status !== "eliminated" ? (
        <Circle
          center={toTuple(hostile.position)}
          radius={hostile.weaponRangeM}
          className={"fl-hostile-range"} interactive={false}
        />
      ) : null}
      <Marker
        position={toTuple(hostile.position)}
        icon={icon}
        zIndexOffset={selected ? 900 : 50}
        keyboard
        alt={hostile.callsign}
        bubblingMouseEvents={false}
        eventHandlers={{
          click: () => onSelect(hostile),
          contextmenu: (event) => {
            event.originalEvent.preventDefault();
            onContextMenu(hostile, event.originalEvent.clientX, event.originalEvent.clientY);
          },
        }}
      >
        <Tooltip
          key={showLabel ? "p" : "h"}
          permanent={showLabel}
          direction="top"
          offset={[0, -11]}
          className={cn("fl-tooltip fl-hostile-tip", selected && "fl-selected-tip")}
          opacity={1}
        >
          {hostile.callsign} · {hostile.status === "eliminated" ? "ELIMINATED" : `${hostile.threat.toUpperCase()} · ${(hostile.hp * 100).toFixed(0)}%`}
        </Tooltip>
      </Marker>
    </>
  );
}
