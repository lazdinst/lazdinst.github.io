import { useCallback, useEffect, useRef, useState } from "react";
import { latLngBounds, type Map as LeafletMap } from "leaflet";
import { AttributionControl, MapContainer, TileLayer } from "react-leaflet";
import { useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import "./fleetMap.css";
import { findFleetScenario, fleetRuntime } from "@/fleet";
import type { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";
import { usePlannerDraft } from "../../context/usePlannerDraft";
import { useZoneEditor } from "../../context/useZoneEditor";
import { useFleetArea, useFleetSnapshot, useSelectedAsset } from "../../hooks";
import { useDevicePrefs } from "../../shell/useDevicePrefs";
import { useShellUi } from "../../shell/useShellUi";
import {
  AssetMarkers,
  CoverageLayer,
  MapInteractions,
  PathLayer,
  PlannerDraftLayer,
  SitesLayer,
  TerrainLayer,
} from "./layers";
import { ZoneDraftLayer, ZoneFocus, ZoneLayer } from "./zoneLayers";
import { MapHud, type MapLayers } from "./MapHud";
import { EngagementAreaLayer, HostileMarkers, WeaponRangeLayer } from "./hostileLayers";

interface Basemap {
  light: string;
  dark: string;
  attribution: string;
  subdomains: string;
  maxNativeZoom: number;
}

const CARTO_KEY = (import.meta.env.VITE_CARTO_API_KEY as string | undefined)?.trim();

/**
 * CARTO Dark Matter and Positron when a key is configured (VITE_CARTO_API_KEY);
 * otherwise Esri's gray canvas tiles, which are free with attribution.
 */
const BASEMAP: Basemap = CARTO_KEY
  ? {
      light: `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
      dark: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxNativeZoom: 20,
    }
  : {
      light: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      attribution:
        'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "",
      maxNativeZoom: 16,
    };
const DEFAULT_ZOOM = 12;

export function FleetMap() {
  const snapshot = useFleetSnapshot();
  const area = useFleetArea();
  const selected = useSelectedAsset();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const { draft, setPickMode, setPickedTarget } = usePlannerDraft();
  const zoneEditor = useZoneEditor();
  const drawing = zoneEditor.mode === "draw";
  const editing = zoneEditor.mode === "edit";
  const { favorites } = useDevicePrefs();
  const { follow, setFollow, focusRequest, openContextMenu, selectHostile, selectedHostileId, drawerPanel, closeDrawer } = useShellUi();
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [layers, setLayers] = useState<MapLayers>({
    zones: true,
    terrain: true,
    coverage: true,
    labels: false,
    paths: true,
    hostiles: true,
  });
  const scenario = findFleetScenario(snapshot.scenarioId);

  // Leaflet caches its container size; the resizable panes change it.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.invalidateSize({ animate: false });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!draft.pickMode || drawing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [draft.pickMode, drawing, setPickMode]);

  const fitFleet = useCallback(() => {
    const map = mapRef.current;
    if (!map || snapshot.assets.length === 0) return;
    setFollow(false);
    map.fitBounds(
      latLngBounds(snapshot.assets.map((asset) => [asset.position.lat, asset.position.lng])),
      { padding: [40, 40], animate: true }
    );
  }, [snapshot.assets, setFollow]);

  const resetView = useCallback(() => {
    setFollow(false);
    mapRef.current?.setView([area.center.lat, area.center.lng], DEFAULT_ZOOM, { animate: true });
  }, [area.center, setFollow]);

  return (
    // `isolate` keeps Leaflet's pane z-indexes (400–1000) inside the map so
    // portaled popovers and tooltips at z-50 still render above it.
    <div ref={containerRef} className="relative isolate h-full min-h-0 w-full min-w-0">
      <MapContainer
        ref={mapRef}
        center={[area.center.lat, area.center.lng]}
        zoom={DEFAULT_ZOOM}
        minZoom={10}
        maxZoom={17}
        zoomControl={false}
        attributionControl={false}
        className={cn("fl-map h-full w-full", draft.pickMode && "fl-pick", drawing && "fl-draw")}
      >
        <AttributionControl position="bottomleft" prefix={false} />
        <TileLayer
          url={mode === "dark" ? BASEMAP.dark : BASEMAP.light}
          attribution={BASEMAP.attribution}
          subdomains={BASEMAP.subdomains}
          maxNativeZoom={BASEMAP.maxNativeZoom}
          maxZoom={17}
        />
        {layers.terrain ? <TerrainLayer area={area} /> : null}
        {layers.zones || editing ? (
          <ZoneLayer
            zones={area.zones}
            selectedZoneId={zoneEditor.selectedZoneId}
            editingZoneId={zoneEditor.editingZoneId}
            drawing={drawing}
            onSelect={zoneEditor.selectZone}
            onContextMenu={(zone, latlng, clientX, clientY) =>
              openContextMenu({ clientX, clientY, latlng, assetId: null, zoneId: zone.id })
            }
          />
        ) : null}
        {drawing ? (
          <ZoneDraftLayer points={zoneEditor.draftPoints} type={zoneEditor.draftType} onCloseRing={() => zoneEditor.finishDraw()} />
        ) : null}
        <ZoneFocus request={zoneEditor.focusRequest} zones={area.zones} />
        {layers.coverage ? <CoverageLayer area={area} scenario={scenario} /> : null}
        <SitesLayer area={area} labels={layers.labels} />
        {layers.paths ? <PathLayer snapshot={snapshot} /> : null}
        <PlannerDraftLayer draft={draft} area={area} />
        {layers.hostiles ? (
          <>
            <EngagementAreaLayer areas={fleetRuntime.getEngagementAreas()} />
            <WeaponRangeLayer assets={snapshot.assets} />
            <HostileMarkers
              hostiles={snapshot.hostiles}
              selectedId={selectedHostileId}
              labels={layers.labels}
              onSelect={(hostile) => selectHostile(hostile.id)}
              onContextMenu={(hostile, clientX, clientY) =>
                openContextMenu({ clientX, clientY, latlng: hostile.position, assetId: null, hostileId: hostile.id })
              }
            />
          </>
        ) : null}
        <AssetMarkers
          // A device tapped on the map should show its card; the operations
          // drawer would otherwise hide it. The planner stays, it uses the selection.
          onSelect={() => {
            if (drawerPanel === "operations") closeDrawer();
          }}
          assets={snapshot.assets}
          selectedId={snapshot.selectedAssetId}
          labels={layers.labels}
          favorites={favorites}
          onContextMenu={(asset, clientX, clientY) =>
            openContextMenu({ clientX, clientY, latlng: asset.position, assetId: asset.id })
          }
        />
        <MapInteractions
          pickMode={draft.pickMode && !drawing}
          onPick={setPickedTarget}
          drawing={drawing}
          onDrawPoint={zoneEditor.addDraftPoint}
          onDrawFinish={() => zoneEditor.finishDraw()}
          follow={follow}
          followTarget={selected?.position ?? null}
          onUserPan={() => setFollow(false)}
          focusTarget={
            focusRequest
              ? (focusRequest.point ?? snapshot.assets.find((a) => a.id === focusRequest.assetId)?.position ?? null)
              : null
          }
          focusNonce={focusRequest?.nonce ?? 0}
          onContextMenu={(latlng, clientX, clientY) => openContextMenu({ clientX, clientY, latlng, assetId: null })}
        />
      </MapContainer>

      <div className="pointer-events-none absolute right-3 bottom-8 z-[1001]">
        <MapHud
          mapRef={mapRef}
          layers={layers}
          onToggleLayer={(layer) => setLayers((current) => ({ ...current, [layer]: !current[layer] }))}
          follow={follow}
          canFollow={selected !== null}
          onToggleFollow={() => setFollow(!follow)}
          onFitFleet={fitFleet}
          onResetView={resetView}
        />
      </div>
    </div>
  );
}

export default FleetMap;
