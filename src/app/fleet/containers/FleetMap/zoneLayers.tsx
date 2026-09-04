import { useEffect, useMemo, useRef, useState } from "react";
import { divIcon, latLngBounds, type LeafletMouseEvent } from "leaflet";
import { CircleMarker, Marker, Polygon, Polyline, Tooltip, useMap } from "react-leaflet";
import { fleetRuntime, polygonCentroid, type LatLng, type Zone, type ZoneType } from "@/fleet";
import { cn } from "@/lib/utils";
import { ZONE_TYPE_META } from "../../components";
import type { ZoneFocusRequest } from "../../context/useZoneEditor";

const toTuple = (point: LatLng): [number, number] => [point.lat, point.lng];
const toTuples = (points: LatLng[]) => points.map(toTuple);

const VERTEX_ICON = divIcon({ className: "fl-vertex", iconSize: [10, 10], iconAnchor: [5, 5] });
const MIDPOINT_ICON = divIcon({ className: "fl-vertex fl-vertex-mid", iconSize: [8, 8], iconAnchor: [4, 4] });
const CENTER_ICON = divIcon({ className: "fl-vertex fl-vertex-center", iconSize: [14, 14], iconAnchor: [7, 7] });

interface ZoneLayerProps {
  zones: Zone[];
  selectedZoneId: string | null;
  editingZoneId: string | null;
  /** While drawing, zones stop catching clicks so vertices can land on them. */
  drawing: boolean;
  onSelect: (zoneId: string) => void;
  onContextMenu: (zone: Zone, latlng: LatLng, clientX: number, clientY: number) => void;
}

export function ZoneLayer({ zones, selectedZoneId, editingZoneId, drawing, onSelect, onContextMenu }: ZoneLayerProps) {
  return (
    <>
      {zones.map((zone) => (
        <ZonePolygon
          key={zone.id}
          zone={zone}
          selected={zone.id === selectedZoneId}
          editing={zone.id === editingZoneId}
          interactive={!drawing}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
        />
      ))}
    </>
  );
}

function ZonePolygon({
  zone,
  selected,
  editing,
  interactive,
  onSelect,
  onContextMenu,
}: {
  zone: Zone;
  selected: boolean;
  editing: boolean;
  interactive: boolean;
  onSelect: (zoneId: string) => void;
  onContextMenu: (zone: Zone, latlng: LatLng, clientX: number, clientY: number) => void;
}) {
  // Vertex drags preview locally and commit on drop, so the grid is not
  // re-rasterized on every mouse move.
  const [preview, setPreview] = useState<LatLng[] | null>(null);
  useEffect(() => {
    setPreview(null);
  }, [zone.polygon, editing]);
  const polygon = preview ?? zone.polygon;

  const pathOptions = useMemo(
    () => ({
      className: cn(
        "fl-zone",
        `fl-zone-${zone.type}`,
        selected && "fl-zone-selected",
        editing && "fl-zone-editing"
      ),
      interactive,
    }),
    [zone.type, selected, editing, interactive]
  );
  const handlers = useMemo(
    () => ({
      click: () => {
        if (interactive) onSelect(zone.id);
      },
      contextmenu: (event: LeafletMouseEvent) => {
        event.originalEvent.preventDefault();
        onContextMenu(zone, { lat: event.latlng.lat, lng: event.latlng.lng }, event.originalEvent.clientX, event.originalEvent.clientY);
      },
    }),
    [zone, interactive, onSelect, onContextMenu]
  );

  const commit = (next: LatLng[]) => {
    setPreview(null);
    fleetRuntime.updateZone(zone.id, { polygon: next });
  };

  return (
    <>
      <Polygon
        // Leaflet keeps its own copy of the ring; remount when the source changes.
        key={`${zone.id}:${polygon.length}:${editing ? "e" : "s"}`}
        positions={toTuples(polygon)}
        pathOptions={pathOptions}
        eventHandlers={handlers}
        bubblingMouseEvents={false}
      >
        {!editing ? (
          <Tooltip sticky className="fl-tooltip" opacity={1}>
            {zone.name} · {ZONE_TYPE_META[zone.type].label}
          </Tooltip>
        ) : null}
      </Polygon>
      {editing ? (
        <VertexHandles
          polygon={polygon}
          canDelete={polygon.length > 3}
          onPreview={(next) => setPreview(next)}
          onCommit={commit}
        />
      ) : null}
    </>
  );
}

function VertexHandles({
  polygon,
  canDelete,
  onPreview,
  onCommit,
}: {
  polygon: LatLng[];
  canDelete: boolean;
  onPreview: (next: LatLng[]) => void;
  onCommit: (next: LatLng[]) => void;
}) {
  const replaceAt = (index: number, point: LatLng) => polygon.map((vertex, i) => (i === index ? point : vertex));
  const centroid = useMemo(() => polygonCentroid(polygon), [polygon]);
  // Whole-shape drag: offsets are measured from the ring as it was when the drag began.
  const moveOrigin = useRef<{ ring: LatLng[]; from: LatLng } | null>(null);
  const translated = (to: LatLng) => {
    const origin = moveOrigin.current;
    if (!origin) return polygon;
    const dLat = to.lat - origin.from.lat;
    const dLng = to.lng - origin.from.lng;
    return origin.ring.map((vertex) => ({ lat: vertex.lat + dLat, lng: vertex.lng + dLng }));
  };
  return (
    <>
      <Marker
        key={`c-${polygon.length}`}
        position={toTuple(centroid)}
        icon={CENTER_ICON}
        draggable
        zIndexOffset={2500}
        bubblingMouseEvents={false}
        eventHandlers={{
          dragstart: (event) => {
            const { lat, lng } = event.target.getLatLng();
            moveOrigin.current = { ring: polygon, from: { lat, lng } };
          },
          drag: (event) => {
            const { lat, lng } = event.target.getLatLng();
            onPreview(translated({ lat, lng }));
          },
          dragend: (event) => {
            const { lat, lng } = event.target.getLatLng();
            onCommit(translated({ lat, lng }));
            moveOrigin.current = null;
          },
        }}
      >
        <Tooltip direction="top" offset={[0, -8]} className="fl-tooltip" opacity={1}>
          drag to move the zone
        </Tooltip>
      </Marker>
      {polygon.map((vertex, index) => (
        <Marker
          key={`v-${index}-${polygon.length}`}
          position={toTuple(vertex)}
          icon={VERTEX_ICON}
          draggable
          zIndexOffset={2000}
          bubblingMouseEvents={false}
          eventHandlers={{
            drag: (event) => {
              const { lat, lng } = event.target.getLatLng();
              onPreview(replaceAt(index, { lat, lng }));
            },
            dragend: (event) => {
              const { lat, lng } = event.target.getLatLng();
              onCommit(replaceAt(index, { lat, lng }));
            },
            contextmenu: (event) => {
              event.originalEvent.preventDefault();
              if (canDelete) onCommit(polygon.filter((_, i) => i !== index));
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -6]} className="fl-tooltip" opacity={1}>
            {index + 1} · drag · right-click removes
          </Tooltip>
        </Marker>
      ))}
      {polygon.map((vertex, index) => {
        const next = polygon[(index + 1) % polygon.length];
        const mid = { lat: (vertex.lat + next.lat) / 2, lng: (vertex.lng + next.lng) / 2 };
        return (
          <Marker
            key={`m-${index}-${polygon.length}`}
            position={toTuple(mid)}
            icon={MIDPOINT_ICON}
            zIndexOffset={1500}
            bubblingMouseEvents={false}
            eventHandlers={{
              click: () => {
                const inserted = [...polygon.slice(0, index + 1), mid, ...polygon.slice(index + 1)];
                onCommit(inserted);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -5]} className="fl-tooltip" opacity={1}>
              click to add a vertex
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}

interface ZoneDraftLayerProps {
  points: LatLng[];
  type: ZoneType;
  onCloseRing: () => void;
}

/** The polygon being drawn: placed vertices, edges so far, and a dashed closing edge. */
export function ZoneDraftLayer({ points, type, onCloseRing }: ZoneDraftLayerProps) {
  if (points.length === 0) return null;
  return (
    <>
      {points.length >= 3 ? (
        <Polygon
          key={`draft-${points.length}`}
          positions={toTuples(points)}
          pathOptions={{ className: cn("fl-zone fl-zone-draft", `fl-zone-${type}`), interactive: false }}
        />
      ) : points.length === 2 ? (
        <Polyline
          positions={toTuples(points)}
          pathOptions={{ className: "fl-zone-draft-edge", interactive: false }}
        />
      ) : null}
      {points.map((point, index) => (
        <CircleMarker
          key={`d-${index}`}
          center={toTuple(point)}
          radius={index === 0 ? 5 : 3}
          pathOptions={{ className: cn("fl-draft-vertex", index === 0 && "fl-draft-vertex-first") }}
          eventHandlers={
            index === 0 && points.length >= 3
              ? {
                  click: () => onCloseRing(),
                }
              : undefined
          }
          bubblingMouseEvents={index !== 0 || points.length < 3}
        >
          {index === 0 && points.length >= 3 ? (
            <Tooltip direction="top" offset={[0, -6]} className="fl-tooltip" opacity={1}>
              click to close
            </Tooltip>
          ) : null}
        </CircleMarker>
      ))}
    </>
  );
}

/** Flies to a zone whenever the focus request changes. */
export function ZoneFocus({ request, zones }: { request: ZoneFocusRequest | null; zones: Zone[] }) {
  const map = useMap();
  useEffect(() => {
    if (!request) return;
    const zone = zones.find((candidate) => candidate.id === request.zoneId);
    if (!zone || zone.polygon.length === 0) return;
    map.flyToBounds(latLngBounds(toTuples(zone.polygon)), { padding: [80, 80], duration: 0.6, maxZoom: 15 });
    // Only the nonce should retrigger; zone edits must not yank the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.nonce]);
  return null;
}
