import { fleetRuntime, type Zone } from "@/fleet";
import { cn } from "@/lib/utils";
import { ConfirmDialog, ZONE_TYPE_META } from "../../components";
import { useZoneEditor } from "../../context/useZoneEditor";
import { useFleetArea, useFleetSnapshot } from "../../hooks";

/** Confirms zone deletion and the reset of every custom zone. Mounted once in the shell. */
export function ZoneDeleteDialog() {
  const area = useFleetArea();
  const snapshot = useFleetSnapshot();
  const editor = useZoneEditor();
  const zone = editor.pendingDeleteId ? area.zones.find((candidate) => candidate.id === editor.pendingDeleteId) ?? null : null;
  const activeMissions = snapshot.missions.filter((mission) => mission.status === "active").length;

  return (
    <>
      <ConfirmDialog
        open={zone !== null}
        onOpenChange={(open) => {
          if (!open) editor.cancelDelete();
        }}
        title="Delete zone?"
        description="This cannot be undone. Routing recomputes without it immediately."
        confirmLabel="Delete zone"
        destructive
        onConfirm={() => {
          if (zone) fleetRuntime.removeZone(zone.id);
        }}
      >
        {zone ? <ZoneSummary zone={zone} /> : null}
        {zone?.type === "exclusion" && activeMissions > 0 ? (
          <p className="text-warning">
            {activeMissions} active mission{activeMissions === 1 ? "" : "s"} may re-route through this area once it is open.
          </p>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={editor.pendingReset}
        onOpenChange={(open) => {
          if (!open) editor.cancelReset();
        }}
        title="Reset zones to defaults?"
        description="Every zone you drew or edited in this browser is discarded and the shipped set comes back."
        confirmLabel="Reset zones"
        destructive
        onConfirm={() => {
          editor.cancel();
          fleetRuntime.resetZones();
        }}
      />
    </>
  );
}

function ZoneSummary({ zone }: { zone: Zone }) {
  const meta = ZONE_TYPE_META[zone.type];
  return (
    <div className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5">
      <span className={cn("size-1.5 shrink-0 rounded-full", meta.dotClass)} />
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{zone.name}</span>
      <span className={cn("font-mono text-[10px]", meta.textClass)}>{meta.short}</span>
      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{zone.polygon.length} pts</span>
    </div>
  );
}
