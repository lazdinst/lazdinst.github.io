import { Check, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { ModeBanner, ZONE_TYPE_META } from "../components";
import { usePlannerDraft } from "../context/usePlannerDraft";
import { useZoneEditor } from "../context/useZoneEditor";
import { useFleetArea } from "../hooks";

/**
 * Drawing, editing, and target-pick status, stacked under the simulation bar
 * and sized to it. Each pill slides in when its mode starts and out when it ends.
 */
export function ModeBanners() {
  const area = useFleetArea();
  const zoneEditor = useZoneEditor();
  const { draft, setPickMode } = usePlannerDraft();
  const drawing = zoneEditor.mode === "draw";
  const editingZone = zoneEditor.mode === "edit" ? area.zones.find((zone) => zone.id === zoneEditor.editingZoneId) ?? null : null;
  const draftMeta = ZONE_TYPE_META[zoneEditor.draftType];
  const points = zoneEditor.draftPoints.length;

  return (
    <>
      <ModeBanner open={drawing}>
        <span className={cn("size-1.5 shrink-0 rounded-full", draftMeta.dotClass)} />
        <span className="min-w-0 truncate text-foreground">
          Drawing {draftMeta.label.toLowerCase()} zone
          <span className="text-muted-foreground">
            {" "}· {points} point{points === 1 ? "" : "s"}
          </span>
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <span className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex">
            <Kbd size="small">Enter</Kbd> closes
          </span>
          <Button variant="ghost" size="icon-xs" aria-label="Undo last vertex" disabled={points === 0} onClick={zoneEditor.undoDraftPoint}>
            <Undo2 />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Finish zone" disabled={points < 3} onClick={() => zoneEditor.finishDraw()}>
            <Check />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Cancel drawing" onClick={zoneEditor.cancel}>
            <X />
          </Button>
        </span>
      </ModeBanner>

      <ModeBanner open={editingZone !== null}>
        <span className={cn("size-1.5 shrink-0 rounded-full", editingZone ? ZONE_TYPE_META[editingZone.type].dotClass : "bg-muted-foreground")} />
        <span className="min-w-0 truncate text-foreground">
          Editing <span className="font-medium">{editingZone?.name}</span>
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <span className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex">
            <Kbd size="small">Esc</Kbd> done
          </span>
          <Button variant="ghost" size="icon-xs" aria-label="Finish editing" onClick={zoneEditor.stopEdit}>
            <Check />
          </Button>
        </span>
      </ModeBanner>

      <ModeBanner open={draft.pickMode && !drawing}>
        <span className="hud-live size-1.5 shrink-0 rounded-full bg-chart-1" />
        <span className="min-w-0 truncate text-foreground">Click the map to set the planner target</span>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <span className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex">
            <Kbd size="small">Esc</Kbd> cancels
          </span>
          <Button variant="ghost" size="icon-xs" aria-label="Cancel pick" onClick={() => setPickMode(false)}>
            <X />
          </Button>
        </span>
      </ModeBanner>
    </>
  );
}
