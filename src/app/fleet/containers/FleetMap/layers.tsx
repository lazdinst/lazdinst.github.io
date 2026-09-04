import { memo, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { Marker as LeafletMarker } from "leaflet";
import {
  Circle,
  CircleMarker,
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  fleetRuntime,
  type Asset,
  type CourseOfAction,
  type FleetScenario,
  type FleetSnapshot,
  type LatLng,
  type OperatingArea,
} from "@/fleet";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE } from "../../components";
import type { PlannerDraft } from "../../context/usePlannerDraft";
import { assetIcon } from "./assetIcons";

const toTuple = (point: LatLng): [number, number] => [point.lat, point.lng];
const toTuples = (points: LatLng[]) => points.map(toTuple);

export const TerrainLayer = memo(function TerrainLayer({ area }: { area: OperatingArea }) {
  return (
    <>
      {area.terrainPatches.map((patch) => (
        <Polygon
          key={patch.id}
          positions={toTuples(patch.polygon)}
          pathOptions={{ className: `fl-terrain fl-terrain-${patch.class}`, interactive: false }}
        />
      ))}
      {area.roads.map((road) => (
        <Polyline
          key={road.id}
          positions={toTuples(road.points)}
          pathOptions={{ className: "fl-road", interactive: false }}
        />
      ))}
    </>
  );
});

export const CoverageLayer = memo(function CoverageLayer({ area, scenario }: { area: OperatingArea; scenario: FleetScenario }) {
  return (
    <>
      {area.relays.map((relay) => {
        const off = scenario.disabledRelayIds.includes(relay.id);
        return (
          <Circle
            key={relay.id}
            center={toTuple(relay.position)}
            radius={off ? relay.rangeM * 0.15 : relay.rangeM * scenario.linkRangeScale}
            pathOptions={{ className: cn("fl-coverage", off && "fl-coverage-off"), interactive: false }}
          />
        );
      })}
      {area.relays.map((relay) => {
        const off = scenario.disabledRelayIds.includes(relay.id);
        return (
          <CircleMarker
            key={`${relay.id}-pin`}
            center={toTuple(relay.position)}
            radius={3}
            pathOptions={{ className: cn("fl-relay", off && "fl-relay-off") }}
          >
            <Tooltip direction="right" offset={[6, 0]} className="fl-tooltip" opacity={1}>
              {relay.name} · {off ? "OFFLINE" : `${((relay.rangeM * scenario.linkRangeScale) / 1000).toFixed(1)} km`}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
});

export const SitesLayer = memo(function SitesLayer({ area, labels }: { area: OperatingArea; labels: boolean }) {
  return (
    <>
      {area.depots.map((depot) => (
        <CircleMarker
          key={depot.id}
          center={toTuple(depot.position)}
          radius={5}
          pathOptions={{ className: "fl-depot" }}
        >
          <Tooltip key={labels ? "p" : "h"} permanent direction="right" offset={[6, 0]} className="fl-tooltip fl-label" opacity={1}>
            {depot.name.toUpperCase()}
          </Tooltip>
        </CircleMarker>
      ))}
      {area.waypoints.map((waypoint) => (
        <CircleMarker
          key={waypoint.id}
          center={toTuple(waypoint.position)}
          radius={3}
          pathOptions={{ className: "fl-waypoint" }}
        >
          <Tooltip key={labels ? "p" : "h"} permanent={labels} direction="right" offset={[5, 0]} className="fl-tooltip fl-label" opacity={1}>
            {waypoint.label}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
});

/** Polyline whose Leaflet coordinates only update when the source array changes. */
function StablePolyline({
  points,
  className,
  interactive = false,
  children,
  onClick,
}: {
  points: LatLng[];
  className: string;
  interactive?: boolean;
  children?: ReactNode;
  onClick?: () => void;
}) {
  const positions = useMemo(() => toTuples(points), [points]);
  const pathOptions = useMemo(() => ({ className, interactive }), [className, interactive]);
  const handlers = useMemo(() => (onClick ? { click: onClick } : undefined), [onClick]);
  return (
    <Polyline positions={positions} pathOptions={pathOptions} eventHandlers={handlers}>
      {children}
    </Polyline>
  );
}

export function PathLayer({ snapshot }: { snapshot: FleetSnapshot }) {
  const assets = useMemo(
    () => new Map(snapshot.assets.map((asset) => [asset.id, asset])),
    [snapshot.assets]
  );
  const active = snapshot.missions.filter((mission) => mission.status === "active");
  const candidates = snapshot.planner.candidates.filter((coa) => coa.feasible);
  const selectedId = snapshot.planner.selectedCoaId;

  return (
    <>
      {active.map((mission) => {
        const asset = assets.get(mission.assetId);
        const path = mission.coa.path;
        const travelled = asset
          ? [...path.slice(0, Math.min(mission.waypointIndex, path.length)), asset.position]
          : [];
        const focus = asset?.id === snapshot.selectedAssetId;
        return (
          <span key={mission.id}>
            <StablePolyline
              points={path}
              className={cn(
                "fl-path fl-path-mission",
                mission.objective.type === "rtb" && "fl-path-rtb",
                mission.objective.type === "patrol" && "fl-path-patrol",
                focus && "fl-path-focus"
              )}
            />
            {travelled.length > 1 ? (
              <Polyline
                positions={toTuples(travelled)}
                pathOptions={{ className: "fl-path fl-path-travelled", interactive: false }}
              />
            ) : null}
            {mission.objective.type !== "patrol" ? (
              <CircleMarker
                center={toTuple(path[path.length - 1])}
                radius={4}
                pathOptions={{ className: "fl-target", interactive: false }}
              />
            ) : null}
          </span>
        );
      })}
      {candidates
        .slice()
        .sort((a) => (a.id === selectedId ? 1 : -1))
        .map((coa) => (
          <CandidatePath key={coa.id} coa={coa} selected={coa.id === selectedId} />
        ))}
    </>
  );
}

function CandidatePath({ coa, selected }: { coa: CourseOfAction; selected: boolean }) {
  const onClick = useMemo(() => () => fleetRuntime.selectCoa(coa.id), [coa.id]);
  return (
    <StablePolyline
      points={coa.path}
      className={cn("fl-path fl-path-candidate", `fl-path-${coa.variant}`, selected && "fl-path-selected")}
      interactive
      onClick={onClick}
    >
      <Tooltip sticky className="fl-tooltip" opacity={1}>
        {coa.variant.toUpperCase()} · {(coa.distanceM / 1000).toFixed(1)} km
      </Tooltip>
    </StablePolyline>
  );
}

export function PlannerDraftLayer({ draft, area }: { draft: PlannerDraft; area: OperatingArea }) {
  if (draft.objectiveType === "transit" && draft.pickedTarget) {
    return (
      <CircleMarker center={toTuple(draft.pickedTarget)} radius={6} pathOptions={{ className: "fl-target" }}>
        <Tooltip permanent direction="top" offset={[0, -8]} className="fl-tooltip fl-label" opacity={1}>
          TARGET
        </Tooltip>
      </CircleMarker>
    );
  }
  if (draft.objectiveType === "survey") {
    const surveyArea = area.surveyAreas.find((candidate) => candidate.id === draft.surveyAreaId);
    if (!surveyArea) return null;
    return (
      <Polygon positions={toTuples(surveyArea.polygon)} pathOptions={{ className: "fl-survey", interactive: false }}>
        <Tooltip permanent direction="center" className="fl-tooltip fl-label" opacity={1}>
          {surveyArea.label.toUpperCase()}
        </Tooltip>
      </Polygon>
    );
  }
  if (draft.objectiveType === "patrol") {
    const points = draft.patrolWaypointIds
      .map((id) => area.waypoints.find((waypoint) => waypoint.id === id)?.position)
      .filter((point): point is LatLng => point !== undefined);
    if (points.length < 2) return null;
    return (
      <Polyline positions={toTuples([...points, points[0]])} pathOptions={{ className: "fl-patrol-draft", interactive: false }} />
    );
  }
  return null;
}

export function AssetMarkers({
  assets,
  selectedId,
  labels,
  favorites,
  onContextMenu,
}: {
  assets: Asset[];
  selectedId: string | null;
  labels: boolean;
  favorites: string[];
  onContextMenu: (asset: Asset, clientX: number, clientY: number) => void;
}) {
  return (
    <>
      {assets.map((asset) => (
        <AssetMarker
          key={asset.id}
          asset={asset}
          selected={asset.id === selectedId}
          labels={labels}
          favorite={favorites.includes(asset.id)}
          onContextMenu={onContextMenu}
        />
      ))}
    </>
  );
}

function AssetMarker({
  asset,
  selected,
  labels,
  favorite,
  onContextMenu,
}: {
  asset: Asset;
  selected: boolean;
  labels: boolean;
  favorite: boolean;
  onContextMenu: (asset: Asset, clientX: number, clientY: number) => void;
}) {
  const ref = useRef<LeafletMarker | null>(null);
  const lostLink = asset.status === "lost_link";
  // A lost-link asset is still friendly: keep its body neutral (red reads as
  // hostile on a map) and flag the condition with a pulsing ring instead.
  const tone = lostLink ? "neutral" : STATUS_TONE[asset.status];
  const live =
    asset.status === "en_route" || asset.status === "patrolling" || asset.status === "returning";
  const icon = useMemo(
    () => assetIcon(asset.kind, asset.domain, tone, selected, live, favorite, lostLink),
    [asset.kind, asset.domain, tone, selected, live, favorite, lostLink]
  );

  useEffect(() => {
    const element = ref.current?.getElement();
    if (element) {
      element.style.setProperty("--heading", `${asset.headingDeg}deg`);
    }
  }, [asset.headingDeg, icon]);

  const showLabel = labels || selected;
  return (
    <Marker
      ref={ref}
      position={toTuple(asset.position)}
      icon={icon}
      zIndexOffset={selected ? 1000 : live || lostLink ? 100 : 0}
      keyboard
      alt={asset.callsign}
      bubblingMouseEvents={false}
      eventHandlers={{
        click: () => fleetRuntime.selectAsset(asset.id),
        contextmenu: (event) => {
          event.originalEvent.preventDefault();
          onContextMenu(asset, event.originalEvent.clientX, event.originalEvent.clientY);
        },
      }}
    >
      <Tooltip
        key={showLabel ? "p" : "h"}
        permanent={showLabel}
        direction="top"
        offset={[0, -12]}
        className={cn("fl-tooltip", selected && "fl-selected-tip")}
        opacity={1}
      >
        {asset.callsign} · {STATUS_LABEL[asset.status]}
      </Tooltip>
    </Marker>
  );
}

interface MapInteractionsProps {
  pickMode: boolean;
  onPick: (point: LatLng) => void;
  /** Zone drawing: clicks place vertices and a double-click closes the ring. */
  drawing: boolean;
  onDrawPoint: (point: LatLng) => void;
  onDrawFinish: () => void;
  follow: boolean;
  followTarget: LatLng | null;
  onUserPan: () => void;
  /** Fly to this point whenever `focusNonce` changes. */
  focusTarget: LatLng | null;
  focusNonce: number;
  onContextMenu: (latlng: LatLng, clientX: number, clientY: number) => void;
}

/** Map click for target picking, follow-selected panning, focus requests, and right-click. */
export function MapInteractions({
  pickMode,
  onPick,
  drawing,
  onDrawPoint,
  onDrawFinish,
  follow,
  followTarget,
  onUserPan,
  focusTarget,
  focusNonce,
  onContextMenu,
}: MapInteractionsProps) {
  const map = useMap();
  useMapEvents({
    click: (event) => {
      const point = { lat: event.latlng.lat, lng: event.latlng.lng };
      if (drawing) {
        onDrawPoint(point);
      } else if (pickMode) {
        onPick(point);
      }
    },
    dblclick: (event) => {
      if (!drawing) return;
      event.originalEvent.preventDefault();
      onDrawFinish();
    },
    dragstart: () => onUserPan(),
    contextmenu: (event) => {
      event.originalEvent.preventDefault();
      onContextMenu({ lat: event.latlng.lat, lng: event.latlng.lng }, event.originalEvent.clientX, event.originalEvent.clientY);
    },
  });
  // Double-click closes the ring while drawing, so it must not zoom.
  useEffect(() => {
    if (drawing) {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }
  }, [map, drawing]);
  const focusRef = useRef(0);
  useEffect(() => {
    if (focusNonce === focusRef.current || !focusTarget) return;
    focusRef.current = focusNonce;
    map.flyTo([focusTarget.lat, focusTarget.lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce]);
  useEffect(() => {
    if (!follow || !followTarget) return;
    const center = map.getCenter();
    if (center.distanceTo([followTarget.lat, followTarget.lng]) > 2) {
      map.panTo([followTarget.lat, followTarget.lng], { animate: false });
    }
  }, [map, follow, followTarget]);
  return null;
}
