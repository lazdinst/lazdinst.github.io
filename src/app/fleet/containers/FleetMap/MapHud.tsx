import type { MutableRefObject } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Crosshair, Layers, LocateFixed, Minus, Plus, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SectionInfo } from "@/app/components/SectionInfo";
import { cn } from "@/lib/utils";
import { MAP_HELP } from "../../help/fleetHelp";

export interface MapLayers {
  zones: boolean;
  terrain: boolean;
  coverage: boolean;
  labels: boolean;
  paths: boolean;
  hostiles: boolean;
}

const LAYER_LABELS: { id: keyof MapLayers; label: string; detail: string }[] = [
  { id: "zones", label: "Zones", detail: "Exclusion, no-fly, restricted, hazard, shallows, comms shadow" },
  { id: "terrain", label: "Terrain", detail: "Wetland, urban, steep patches and road corridors" },
  { id: "coverage", label: "Coverage", detail: "Relay range rings" },
  { id: "paths", label: "Paths", detail: "Candidate and active mission routes" },
  { id: "labels", label: "Labels", detail: "Permanent callsign and waypoint labels" },
  { id: "hostiles", label: "Hostiles", detail: "Hostile tracks, objectives, and weapon ranges" },
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

function HudButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={active ? "secondary" : "ghost"}
            size="icon"
            className="rounded-none"
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Vertical control stack in the map's bottom-right corner, Google Maps style. */
export function MapHud({ mapRef, layers, onToggleLayer, follow, canFollow, onToggleFollow, onFitFleet, onResetView }: MapHudProps) {
  const group = "pointer-events-auto flex flex-col overflow-hidden rounded-lg border border-border bg-background/95 shadow-md backdrop-blur divide-y divide-border";
  return (
    <div className="pointer-events-none flex flex-col items-end gap-2">
      <div className={group}>
        <Popover>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={<Button variant="ghost" size="icon" className="rounded-none" aria-label="Map layers" />}
                />
              }
            >
              <Layers />
            </TooltipTrigger>
            <TooltipContent side="left">Layers</TooltipContent>
          </Tooltip>
          <PopoverContent side="left" align="end" className="w-56 p-2">
            <ul className="flex flex-col gap-1">
              {LAYER_LABELS.map((layer) => (
                <li key={layer.id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-sm px-1 py-0.5 hover:bg-muted">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-3 accent-[var(--ring)]"
                      checked={layers[layer.id]}
                      onChange={() => onToggleLayer(layer.id)}
                    />
                    <span className="flex flex-col">
                      <span className="text-xs text-foreground">{layer.label}</span>
                      <span className="text-[10px] leading-3 text-muted-foreground">{layer.detail}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        <div className={cn("flex items-center justify-center", "h-6")}>
          <SectionInfo content={MAP_HELP} />
        </div>
      </div>
      <div className={group}>
        <HudButton label="Fit fleet" onClick={onFitFleet}>
          <Scan />
        </HudButton>
        <HudButton label={follow ? "Stop following" : "Follow selected"} active={follow} disabled={!canFollow} onClick={onToggleFollow}>
          <Crosshair />
        </HudButton>
        <HudButton label="Reset view" onClick={onResetView}>
          <LocateFixed />
        </HudButton>
      </div>
      <div className={group}>
        <HudButton label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
          <Plus />
        </HudButton>
        <HudButton label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
          <Minus />
        </HudButton>
      </div>
    </div>
  );
}
