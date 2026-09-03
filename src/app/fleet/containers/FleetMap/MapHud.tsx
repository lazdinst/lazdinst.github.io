import type { MutableRefObject } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Crosshair, Minus, Plus, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionInfo } from "@/app/components/SectionInfo";
import { cn } from "@/lib/utils";
import { MAP_HELP } from "../../help/fleetHelp";

export interface MapLayers {
  zones: boolean;
  terrain: boolean;
  coverage: boolean;
  labels: boolean;
  paths: boolean;
}

const LAYER_LABELS: { id: keyof MapLayers; label: string }[] = [
  { id: "zones", label: "Zones" },
  { id: "terrain", label: "Terrain" },
  { id: "coverage", label: "Coverage" },
  { id: "paths", label: "Paths" },
  { id: "labels", label: "Labels" },
];

interface MapHudProps {
  mapRef: MutableRefObject<LeafletMap | null>;
  layers: MapLayers;
  onToggleLayer: (layer: keyof MapLayers) => void;
  follow: boolean;
  canFollow: boolean;
  onToggleFollow: () => void;
  onFitFleet: () => void;
  onResetView: () => void;
}

export function MapHud({
  mapRef,
  layers,
  onToggleLayer,
  follow,
  canFollow,
  onToggleFollow,
  onFitFleet,
  onResetView,
}: MapHudProps) {
  const buttonClass = "h-5 px-1.5 font-mono text-xs";
  return (
    <div className="pointer-events-none flex max-w-[min(100%,24rem)] flex-col gap-1">
      <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-md border border-border bg-background/90 px-1.5 py-1 shadow-sm">
        <Button variant="ghost" size="xs" className={buttonClass} onClick={onFitFleet}>
          <Scan />
          Fit fleet
        </Button>
        <Button
          variant={follow ? "secondary" : "ghost"}
          size="xs"
          className={buttonClass}
          aria-pressed={follow}
          disabled={!canFollow}
          onClick={onToggleFollow}
        >
          <Crosshair />
          Follow
        </Button>
        <Button variant="ghost" size="xs" className={buttonClass} onClick={onResetView}>
          Reset view
        </Button>
        <span className="mx-0.5 h-3 w-px bg-border" />
        <Button variant="ghost" size="icon-xs" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
          <Plus />
        </Button>
        <Button variant="ghost" size="icon-xs" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
          <Minus />
        </Button>
        <SectionInfo content={MAP_HELP} />
      </div>
      <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-md border border-border bg-background/90 px-1.5 py-1 shadow-sm">
        {LAYER_LABELS.map((layer) => (
          <Button
            key={layer.id}
            variant={layers[layer.id] ? "secondary" : "ghost"}
            size="xs"
            aria-pressed={layers[layer.id]}
            className={cn("h-4 px-1 font-mono text-[10px]", !layers[layer.id] && "text-muted-foreground")}
            onClick={() => onToggleLayer(layer.id)}
          >
            {layer.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
