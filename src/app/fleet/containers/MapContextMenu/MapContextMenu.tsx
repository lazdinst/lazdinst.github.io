import { useMemo, type ReactNode } from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { Ban, Check, Crosshair, Home, LocateFixed, Pencil, Route, Send, Shapes, Star, Trash2, VectorSquare, X } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  HOSTILE_KIND_LABEL,
  buildEngageObjective,
  fleetRuntime,
  formatLatLng,
  haversineM,
  type Asset,
  type Hostile,
  type LatLng,
  type Zone,
} from "@/fleet";
import { cn } from "@/lib/utils";
import { AssetGlyph, STATUS_LABEL, STATUS_TONE, TONE_TEXT_CLASS, ZONE_TYPE_META, ZONE_TYPE_ORDER } from "../../components";
import { usePlannerDraft } from "../../context/usePlannerDraft";
import { useZoneEditor } from "../../context/useZoneEditor";
import { useFleetArea, useFleetSnapshot } from "../../hooks";
import { useDevicePrefs } from "../../shell/useDevicePrefs";
import { useShellUi } from "../../shell/useShellUi";

const ITEM = "text-xs [&_svg:not([class*='size-'])]:size-3";

/**
 * Right-click menu for the map. Wraps the map in a ContextMenu trigger so
 * Base UI positions the popup at the pointer and nests the submenu properly.
 * Leaflet's own contextmenu handlers run first (they are deeper in the DOM)
 * and record the clicked point or device in the shell state.
 *
 * On a device: select, plan, recall, abort, star. On open ground: send the
 * selected device there, pick another device to send, or hand the point to
 * the planner.
 */
export function MapContextMenu({ children }: { children: ReactNode }) {
  const ui = useShellUi();
  const snapshot = useFleetSnapshot();
  const area = useFleetArea();
  const zoneEditor = useZoneEditor();
  const { isFavorite, toggleFavorite } = useDevicePrefs();
  const { setPickedTarget, update } = usePlannerDraft();
  const target = ui.contextMenu;

  const device = target?.assetId ? snapshot.assets.find((asset) => asset.id === target.assetId) ?? null : null;
  const zone = target?.zoneId ? area.zones.find((candidate) => candidate.id === target.zoneId) ?? null : null;
  const hostile = target?.hostileId ? snapshot.hostiles.find((candidate) => candidate.id === target.hostileId) ?? null : null;
  const selected = snapshot.assets.find((asset) => asset.id === snapshot.selectedAssetId) ?? null;
  const selectedMission = selected?.missionId
    ? snapshot.missions.find((mission) => mission.id === selected.missionId && mission.status === "active") ?? null
    : null;

  const quickDispatch = (asset: Asset, point: LatLng) => {
    fleetRuntime.selectAsset(asset.id);
    fleetRuntime.planMission(asset.id, { type: "transit", target: point, targetLabel: formatLatLng(point) });
    const result = fleetRuntime.dispatch();
    if (!result.ok) ui.openDrawer("planner");
  };

  const candidates = useMemo(() => {
    if (!target) return [];
    return [...snapshot.assets]
      .sort((a, b) => haversineM(a.position, target.latlng) - haversineM(b.position, target.latlng))
      .slice(0, 8)
      .map((asset) => ({ asset, blocker: fleetRuntime.dispatchBlocker(asset.id) }));
  }, [snapshot.assets, target]);

  return (
    <ContextMenuPrimitive.Root
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) ui.closeContextMenu();
      }}
    >
      <ContextMenuPrimitive.Trigger className="absolute inset-0 z-0">{children}</ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Positioner className="isolate z-50 outline-none">
          <ContextMenuPrimitive.Popup
            data-slot="dropdown-menu-content"
            className="z-50 min-w-52 origin-(--transform-origin) rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            {hostile ? (
              <HostileItems hostile={hostile} />
            ) : device ? (
              <DeviceItems
                device={device}
                favorite={isFavorite(device.id)}
                onToggleFavorite={() => toggleFavorite(device.id)}
              />
            ) : zone && target ? (
              <ZoneItems zone={zone} />
            ) : target ? (
              <>
                <div className="px-1.5 py-1 font-mono text-[10px] text-muted-foreground">
                  {formatLatLng(target.latlng)}
                </div>
                {selected ? (
                  <DropdownMenuItem
                    className={ITEM}
                    disabled={fleetRuntime.dispatchBlocker(selected.id) !== null}
                    onClick={() => quickDispatch(selected, target.latlng)}
                  >
                    <Send />
                    Send {selected.callsign} here
                    {fleetRuntime.dispatchBlocker(selected.id) ? (
                      <DropdownMenuShortcut className="text-[10px]">{fleetRuntime.dispatchBlocker(selected.id)}</DropdownMenuShortcut>
                    ) : null}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className={ITEM}>
                    <Route />
                    Dispatch a device here
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="min-w-56">
                    {candidates.map(({ asset, blocker }) => (
                      <DropdownMenuItem
                        key={asset.id}
                        className={ITEM}
                        disabled={blocker !== null}
                        onClick={() => quickDispatch(asset, target.latlng)}
                      >
                        <AssetGlyph kind={asset.kind} />
                        <span className="font-mono">{asset.callsign}</span>
                        <span className={cn("ml-auto pl-2 font-mono text-[10px]", TONE_TEXT_CLASS[STATUS_TONE[asset.status]])}>
                          {blocker ?? STATUS_LABEL[asset.status]}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={ITEM}
                  onClick={() => {
                    setPickedTarget(target.latlng);
                    update({ objectiveType: "transit" });
                    ui.openDrawer("planner");
                  }}
                >
                  <Crosshair />
                  Set as planner target
                  <DropdownMenuShortcut><Kbd size="small">P</Kbd></DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className={ITEM} onClick={() => zoneEditor.startDraw("exclusion", target.latlng)}>
                  <Ban />
                  Draw exclusion zone from here
                  <DropdownMenuShortcut><Kbd size="small">Z</Kbd></DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className={ITEM}>
                    <Shapes />
                    Draw another zone type
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="min-w-56">
                    {ZONE_TYPE_ORDER.filter((type) => type !== "exclusion").map((type) => (
                      <DropdownMenuItem key={type} className={ITEM} onClick={() => zoneEditor.startDraw(type, target.latlng)}>
                        <span className={cn("size-1.5 rounded-full", ZONE_TYPE_META[type].dotClass)} />
                        {ZONE_TYPE_META[type].label}
                        <span className="ml-auto pl-2 text-[10px] text-muted-foreground">{ZONE_TYPE_META[type].short}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {selectedMission ? (
                  <DropdownMenuItem className={ITEM} variant="destructive" onClick={() => fleetRuntime.abortMission(selectedMission.id)}>
                    <X />
                    Abort {selected?.callsign} mission
                    <DropdownMenuShortcut><Kbd size="small">X</Kbd></DropdownMenuShortcut>
                  </DropdownMenuItem>
                ) : null}
              </>
            ) : null}
          </ContextMenuPrimitive.Popup>
        </ContextMenuPrimitive.Positioner>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
}

function DeviceItems({
  device,
  favorite,
  onToggleFavorite,
}: {
  device: Asset;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  const ui = useShellUi();
  const snapshot = useFleetSnapshot();
  const mission = device.missionId
    ? snapshot.missions.find((candidate) => candidate.id === device.missionId && candidate.status === "active") ?? null
    : null;
  const tone = STATUS_TONE[device.status];
  return (
    <>
      <div className="flex items-center gap-1.5 px-1.5 py-1">
        <AssetGlyph kind={device.kind} className="text-foreground" />
        <span className="font-mono text-xs text-foreground">{device.callsign}</span>
        <span className={cn("font-mono text-[10px]", TONE_TEXT_CLASS[tone])}>{STATUS_LABEL[device.status]}</span>
      </div>
      <DropdownMenuItem className={ITEM} onClick={() => ui.focusAsset(device.id)}>
        <LocateFixed />
        Select and center
      </DropdownMenuItem>
      <DropdownMenuItem
        className={ITEM}
        onClick={() => {
          fleetRuntime.selectAsset(device.id);
          ui.openDrawer("planner");
        }}
      >
        <Route />
        Plan mission
        <DropdownMenuShortcut><Kbd size="small">P</Kbd></DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem
        className={ITEM}
        disabled={device.status === "returning" || device.status === "lost_link"}
        onClick={() => fleetRuntime.returnToBase(device.id)}
      >
        <Home />
        Return to base
        <DropdownMenuShortcut><Kbd size="small">B</Kbd></DropdownMenuShortcut>
      </DropdownMenuItem>
      {mission ? (
        <DropdownMenuItem className={ITEM} variant="destructive" onClick={() => fleetRuntime.abortMission(mission.id)}>
          <X />
          Abort mission
          <DropdownMenuShortcut><Kbd size="small">X</Kbd></DropdownMenuShortcut>
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuSeparator />
      <DropdownMenuItem className={ITEM} onClick={onToggleFavorite}>
        <Star className={cn(favorite && "fill-current text-warning")} />
        {favorite ? "Unstar" : "Star"}
        <DropdownMenuShortcut><Kbd size="small">S</Kbd></DropdownMenuShortcut>
      </DropdownMenuItem>
    </>
  );
}

function ZoneItems({ zone }: { zone: Zone }) {
  const ui = useShellUi();
  const zoneEditor = useZoneEditor();
  const meta = ZONE_TYPE_META[zone.type];
  const editing = zoneEditor.editingZoneId === zone.id;
  return (
    <>
      <div className="flex items-center gap-1.5 px-1.5 py-1">
        <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
        <span className="truncate font-mono text-xs text-foreground">{zone.name}</span>
        <span className={cn("ml-auto pl-2 font-mono text-[10px]", meta.textClass)}>{meta.short}</span>
      </div>
      <DropdownMenuItem className={ITEM} onClick={() => (editing ? zoneEditor.stopEdit() : zoneEditor.startEdit(zone.id))}>
        <VectorSquare />
        {editing ? "Finish editing shape" : "Edit shape"}
      </DropdownMenuItem>
      <DropdownMenuItem
        className={ITEM}
        onClick={() => {
          zoneEditor.requestRename(zone.id);
          ui.openDrawer("operations");
        }}
      >
        <Pencil />
        Rename…
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={ITEM}>
          <Shapes />
          Change type
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-56">
          {ZONE_TYPE_ORDER.map((type) => (
            <DropdownMenuItem
              key={type}
              className={ITEM}
              disabled={type === zone.type}
              onClick={() => fleetRuntime.updateZone(zone.id, { type })}
            >
              <span className={cn("size-1.5 rounded-full", ZONE_TYPE_META[type].dotClass)} />
              {ZONE_TYPE_META[type].label}
              {type === zone.type ? <Check className="ml-auto" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem className={ITEM} variant="destructive" onClick={() => zoneEditor.requestDelete(zone.id)}>
        <Trash2 />
        Delete zone…
      </DropdownMenuItem>
    </>
  );
}

function HostileItems({ hostile }: { hostile: Hostile }) {
  const ui = useShellUi();
  const snapshot = useFleetSnapshot();
  const armed = [...snapshot.assets]
    .filter((asset) => asset.weapon)
    .map((asset) => ({
      asset,
      distanceM: haversineM(asset.position, hostile.position),
      blocker: fleetRuntime.dispatchBlocker(asset.id) ?? (asset.weapon!.ammo === 0 ? "No ammunition" : null),
    }))
    .sort((a, b) => a.distanceM - b.distanceM);
  const selected = armed.find(({ asset }) => asset.id === snapshot.selectedAssetId) ?? null;
  const activeHostiles = snapshot.hostiles.filter((candidate) => candidate.status !== "eliminated");

  const engage = (asset: Asset, targets: Hostile[]) => {
    const objective = buildEngageObjective(asset.position, targets);
    if (!objective) return;
    fleetRuntime.selectAsset(asset.id);
    ui.selectHostile(null);
    fleetRuntime.planMission(asset.id, objective);
    const result = fleetRuntime.dispatch();
    if (!result.ok) ui.openDrawer("planner");
  };

  return (
    <>
      <div className="flex items-center gap-1.5 px-1.5 py-1">
        <span className="size-2 rotate-45 bg-destructive" />
        <span className="font-mono text-xs text-foreground">{hostile.callsign}</span>
        <span className="truncate text-[10px] text-muted-foreground">
          {HOSTILE_KIND_LABEL[hostile.kind]} · {hostile.threat} · {hostile.status}
        </span>
      </div>
      <DropdownMenuItem
        className={ITEM}
        onClick={() => {
          ui.selectHostile(hostile.id);
          ui.focusPoint(hostile.position);
        }}
      >
        <LocateFixed />
        Select threat
      </DropdownMenuItem>
      {hostile.status !== "eliminated" ? (
        <>
          {selected ? (
            <DropdownMenuItem className={ITEM} disabled={selected.blocker !== null} onClick={() => engage(selected.asset, [hostile])}>
              <Crosshair />
              Engage with {selected.asset.callsign}
              {selected.blocker ? <DropdownMenuShortcut className="text-[10px]">{selected.blocker}</DropdownMenuShortcut> : null}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={ITEM}>
              <Crosshair />
              Engage with…
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-56">
              {armed.length === 0 ? (
                <DropdownMenuItem className={ITEM} disabled>
                  No armed devices
                </DropdownMenuItem>
              ) : null}
              {armed.map(({ asset, distanceM, blocker }) => (
                <DropdownMenuItem key={asset.id} className={ITEM} disabled={blocker !== null} onClick={() => engage(asset, [hostile])}>
                  <AssetGlyph kind={asset.kind} />
                  <span className="font-mono">{asset.callsign}</span>
                  <span className="ml-auto pl-2 font-mono text-[10px] text-muted-foreground">
                    {blocker ?? `${(distanceM / 1000).toFixed(1)} km · ${asset.weapon!.ammo} rds`}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={ITEM}>
              <Crosshair />
              Engage all {activeHostiles.length} hostiles with…
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-56">
              {armed.map(({ asset, blocker }) => (
                <DropdownMenuItem key={asset.id} className={ITEM} disabled={blocker !== null} onClick={() => engage(asset, activeHostiles)}>
                  <AssetGlyph kind={asset.kind} />
                  <span className="font-mono">{asset.callsign}</span>
                  <span className="ml-auto pl-2 font-mono text-[10px] text-muted-foreground">
                    {blocker ?? `${asset.weapon!.ammo} rds · armor ${asset.armorPct.toFixed(0)}%`}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </>
      ) : null}
    </>
  );
}
