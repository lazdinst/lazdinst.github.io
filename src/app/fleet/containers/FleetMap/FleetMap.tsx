import { useCallback, useEffect, useRef, useState } from "react";
import { latLngBounds, type Map as LeafletMap } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./fleetMap.css";
import { Button } from "@/components/ui/button";
import { findFleetScenario, formatDuration } from "@/fleet";
import type { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE, TONE_TEXT_CLASS } from "../../components";
import { usePlannerDraft } from "../../context/usePlannerDraft";
import { useAssetMission, useFleetArea, useFleetSnapshot, useSelectedAsset } from "../../hooks";
import {
  AssetMarkers,
  CoverageLayer,
  MapInteractions,
  PathLayer,
  PlannerDraftLayer,
  SitesLayer,
  TerrainLayer,
  ZoneLayer,
} from "./layers";
import { MapHud, type MapLayers } from "./MapHud";

// Esri's gray canvas basemaps are free to use with attribution and come in a
// light and a dark style, which the theme toggle needs.
const TILES = {
  light: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};
const ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TILE_MAX_NATIVE_ZOOM = 16;
const DEFAULT_ZOOM = 12;

export function FleetMap() {
  const snapshot = useFleetSnapshot();
  const area = useFleetArea();
  const selected = useSelectedAsset();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const { draft, setPickMode, setPickedTarget } = usePlannerDraft();
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [layers, setLayers] = useState<MapLayers>({
    zones: true,
    terrain: true,
    coverage: true,
    labels: false,
    paths: true,
  });
  const [follow, setFollow] = useState(false);
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
    if (!draft.pickMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [draft.pickMode, setPickMode]);

  const fitFleet = useCallback(() => {
    const map = mapRef.current;
    if (!map || snapshot.assets.length === 0) return;
    setFollow(false);
    map.fitBounds(
      latLngBounds(snapshot.assets.map((asset) => [asset.position.lat, asset.position.lng])),
      { padding: [40, 40], animate: true }
    );
  }, [snapshot.assets]);

  const resetView = useCallback(() => {
    setFollow(false);
    mapRef.current?.setView([area.center.lat, area.center.lng], DEFAULT_ZOOM, { animate: true });
  }, [area.center]);

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
        attributionControl
        className={cn("fl-map h-full w-full", draft.pickMode && "fl-pick")}
      >
        <TileLayer
          url={mode === "dark" ? TILES.dark : TILES.light}
          attribution={ATTRIBUTION}
          maxNativeZoom={TILE_MAX_NATIVE_ZOOM}
          maxZoom={17}
        />
        {layers.terrain ? <TerrainLayer area={area} /> : null}
        {layers.zones ? <ZoneLayer area={area} /> : null}
        {layers.coverage ? <CoverageLayer area={area} scenario={scenario} /> : null}
        <SitesLayer area={area} labels={layers.labels} />
        {layers.paths ? <PathLayer snapshot={snapshot} /> : null}
        <PlannerDraftLayer draft={draft} area={area} />
        <AssetMarkers assets={snapshot.assets} selectedId={snapshot.selectedAssetId} labels={layers.labels} />
        <MapInteractions
          pickMode={draft.pickMode}
          onPick={setPickedTarget}
          follow={follow}
          followTarget={selected?.position ?? null}
          onUserPan={() => setFollow(false)}
        />
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-2 z-[1001] flex flex-col items-center gap-1 px-12">
        <SelectedOverlay />
        {draft.pickMode ? (
          <div className="pointer-events-auto flex items-center gap-1 rounded-md border border-chart-1/40 bg-background/90 px-2 py-0.5 font-mono text-xs text-chart-1 shadow-sm">
            <span className="hud-live">PICK TARGET</span>
            <span className="text-muted-foreground">· click the map · Esc cancels</span>
            <Button variant="ghost" size="icon-xs" aria-label="Cancel pick" onClick={() => setPickMode(false)}>
              <X />
            </Button>
          </div>
        ) : null}
      </div>
      <div className="pointer-events-none absolute bottom-5 left-2 z-[1001]">
        <MapHud
          mapRef={mapRef}
          layers={layers}
          onToggleLayer={(layer) => setLayers((current) => ({ ...current, [layer]: !current[layer] }))}
          follow={follow}
          canFollow={selected !== null}
          onToggleFollow={() => setFollow((current) => !current)}
          onFitFleet={fitFleet}
          onResetView={resetView}
        />
      </div>
    </div>
  );
}

function SelectedOverlay() {
  const asset = useSelectedAsset();
  const mission = useAssetMission(asset);
  if (!asset) return null;
  const tone = STATUS_TONE[asset.status];
  return (
    <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-md border border-border bg-background/90 px-2 py-0.5 font-mono text-xs shadow-sm">
      <span className="text-foreground">{asset.callsign}</span>
      <span className={TONE_TEXT_CLASS[tone]}>{STATUS_LABEL[asset.status]}</span>
      <span className="text-muted-foreground tabular-nums">{asset.speedMps.toFixed(1)} m/s</span>
      <span className="text-muted-foreground tabular-nums">{asset.energyPct.toFixed(0)}%</span>
      {mission ? (
        <span className="hidden text-muted-foreground tabular-nums sm:inline">
          {(mission.progress * 100).toFixed(0)}% · eta {formatDuration(mission.etaMs)}
        </span>
      ) : null}
    </div>
  );
}

export default FleetMap;
