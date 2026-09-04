import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Check, Pencil, Plus, RotateCcw, Trash2, Undo2, VectorSquare, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection } from "@/app/components/PanelSection";
import { createProjection, fleetRuntime, polygonAreaM2, type Zone, type ZoneType } from "@/fleet";
import { cn } from "@/lib/utils";
import { FleetSelect, ZONE_TYPE_META, ZONE_TYPE_ORDER, type FleetSelectOption } from "../../components";
import { useZoneEditor } from "../../context/useZoneEditor";
import { ZONES_HELP } from "../../help/fleetHelp";
import { useFleetArea } from "../../hooks";

const TYPE_OPTIONS: FleetSelectOption<ZoneType>[] = ZONE_TYPE_ORDER.map((type) => ({
  value: type,
  label: ZONE_TYPE_META[type].label,
  description: ZONE_TYPE_META[type].detail,
  icon: <span className={cn("size-1.5 rounded-full", ZONE_TYPE_META[type].dotClass)} />,
}));

function formatArea(m2: number): string {
  return m2 >= 1_000_000 ? `${(m2 / 1_000_000).toFixed(2)} km²` : `${(m2 / 10_000).toFixed(1)} ha`;
}

/** Zone list with drawing, renaming, retyping, vertex editing, and deletion. */
export function ZoneManager() {
  const area = useFleetArea();
  const editor = useZoneEditor();
  const projection = useMemo(() => createProjection(area.center), [area.center]);
  const modified = fleetRuntime.zonesModified();
  const ordered = useMemo(
    () => [...area.zones].sort((a, b) => ZONE_TYPE_ORDER.indexOf(a.type) - ZONE_TYPE_ORDER.indexOf(b.type) || a.name.localeCompare(b.name)),
    [area.zones]
  );

  return (
    <PanelSection
      title="Zones"
      info={ZONES_HELP}
      trailing={
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {area.zones.length}
          {modified ? " · edited" : ""}
        </span>
      }
    >
      <div className="flex flex-col gap-2">
        {editor.mode === "draw" ? (
          <DrawStatus />
        ) : (
          <div className="flex items-center gap-1">
            <FleetSelect<ZoneType>
              aria-label="Type for the next zone"
              className="flex-1"
              value={editor.draftType}
              onValueChange={(next) => editor.setDraftType(next)}
              options={TYPE_OPTIONS}
              contentClassName="w-64"
            />
            <Button variant="outline" size="xs" onClick={() => editor.startDraw()}>
              <Plus />
              Draw
            </Button>
          </div>
        )}

        {ordered.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">No zones. Draw one on the map.</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {ordered.map((zone) => (
              <ZoneRow
                key={zone.id}
                zone={zone}
                areaM2={polygonAreaM2(zone.polygon.map((point) => projection.toXY(point)))}
              />
            ))}
          </ul>
        )}

        {modified ? (
          <Button
            variant="ghost"
            size="xs"
            className="self-start text-muted-foreground"
            onClick={editor.requestReset}
          >
            <RotateCcw />
            Reset to defaults
          </Button>
        ) : null}
      </div>
    </PanelSection>
  );
}

function DrawStatus() {
  const editor = useZoneEditor();
  const meta = ZONE_TYPE_META[editor.draftType];
  const count = editor.draftPoints.length;
  return (
    <div className="hud-skin hud-skin-sm hud-skin-plain flex flex-col gap-1.5 rounded-sm border border-border p-1.5">
      <div className="relative z-[1] flex items-center gap-1.5">
        <span className={cn("hud-live size-1.5 rounded-full", meta.dotClass)} />
        <span className="font-mono text-[10px] tracking-wide text-foreground uppercase">Drawing {meta.label}</span>
        <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
          {count} pt{count === 1 ? "" : "s"}
        </span>
      </div>
      <p className="relative z-[1] text-[10px] leading-3 text-muted-foreground">
        Click the map to add vertices. Double-click, press Enter, or click the first point to close.
      </p>
      <div className="relative z-[1] flex items-center gap-1">
        <Button size="xs" disabled={count < 3} onClick={() => editor.finishDraw()}>
          <Check />
          Finish
        </Button>
        <Button variant="outline" size="xs" disabled={count === 0} onClick={editor.undoDraftPoint}>
          <Undo2 />
          Undo
        </Button>
        <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={editor.cancel}>
          <X />
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ZoneRow({ zone, areaM2 }: { zone: Zone; areaM2: number }) {
  const editor = useZoneEditor();
  const meta = ZONE_TYPE_META[zone.type];
  const selected = editor.selectedZoneId === zone.id;
  const editing = editor.editingZoneId === zone.id;
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(zone.name);

  useEffect(() => {
    if (editor.renameRequestId === zone.id) {
      setName(zone.name);
      setRenaming(true);
      editor.clearRenameRequest();
    }
  }, [editor, zone.id, zone.name]);

  const commitRename = () => {
    setRenaming(false);
    if (name.trim() && name.trim() !== zone.name) fleetRuntime.updateZone(zone.id, { name });
  };

  const onRenameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commitRename();
    if (event.key === "Escape") {
      setName(zone.name);
      setRenaming(false);
    }
  };

  return (
    <li
      className={cn(
        "group/zone flex flex-col gap-1 rounded-sm border px-1.5 py-1",
        selected ? "border-border bg-muted" : "border-transparent hover:bg-muted/60",
        editing && "border-ring/60"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("size-1.5 shrink-0 rounded-full", meta.dotClass, editing && "hud-live")} />
        {renaming ? (
          <input
            autoFocus
            value={name}
            aria-label="Zone name"
            className="h-4 min-w-0 flex-1 rounded-sm border border-border bg-background px-1 font-mono text-xs text-foreground outline-none focus-visible:border-ring"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={onRenameKey}
            onBlur={commitRename}
          />
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left font-mono text-xs text-foreground"
            title={zone.name}
            onClick={() => editor.focusZone(zone.id)}
            onDoubleClick={() => {
              setName(zone.name);
              setRenaming(true);
            }}
          >
            {zone.name}
          </button>
        )}
        <Badge variant="outline" className={cn("shrink-0 font-mono text-[9px] font-normal tracking-wide", meta.textClass)}>
          {meta.short}
        </Badge>
      </div>
      <div className="flex items-center gap-1">
        <FleetSelect<ZoneType>
          aria-label={`Type of ${zone.name}`}
          className="h-4 w-28 text-[10px]"
          value={zone.type}
          onValueChange={(next) => fleetRuntime.updateZone(zone.id, { type: next })}
          options={TYPE_OPTIONS}
          contentClassName="w-64"
        />
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {zone.polygon.length} pts · {formatArea(areaM2)}
        </span>
        <span className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Rename ${zone.name}`}
            className="text-muted-foreground"
            onClick={() => {
              setName(zone.name);
              setRenaming(true);
            }}
          >
            <Pencil />
          </Button>
          <Button
            variant={editing ? "secondary" : "ghost"}
            size="icon-xs"
            aria-label={editing ? `Stop editing ${zone.name}` : `Edit shape of ${zone.name}`}
            aria-pressed={editing}
            className={cn(!editing && "text-muted-foreground")}
            onClick={() => (editing ? editor.stopEdit() : editor.startEdit(zone.id))}
          >
            <VectorSquare />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Delete ${zone.name}`}
            className="text-muted-foreground hover:text-destructive"
            onClick={() => editor.requestDelete(zone.id)}
          >
            <Trash2 />
          </Button>
        </span>
      </div>
    </li>
  );
}

export default ZoneManager;
