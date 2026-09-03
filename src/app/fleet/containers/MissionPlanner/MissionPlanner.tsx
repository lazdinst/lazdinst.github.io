import { useMemo, useState } from "react";
import { Crosshair, Route, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection } from "@/app/components/PanelSection";
import { SignalMeter } from "@/app/components/SignalMeter";
import {
  ENERGY_RESERVE_PCT,
  fleetRuntime,
  formatDuration,
  formatLatLng,
  type Asset,
  type CourseOfAction,
  type Objective,
  type ObjectiveType,
  type OperatingArea,
} from "@/fleet";
import { cn } from "@/lib/utils";
import { FleetSelect, Stat } from "../../components";
import { usePlannerDraft, type PlannerDraft } from "../../context/usePlannerDraft";
import { PLANNER_HELP } from "../../help/fleetHelp";
import { useFleetArea, useFleetSnapshot, useSelectedAsset } from "../../hooks";

const OBJECTIVES: { id: ObjectiveType; label: string }[] = [
  { id: "transit", label: "Transit" },
  { id: "patrol", label: "Patrol" },
  { id: "survey", label: "Survey" },
  { id: "rtb", label: "RTB" },
];

const SWATHS = [100, 150, 250];

function buildObjective(draft: PlannerDraft, area: OperatingArea, asset: Asset | null): Objective | null {
  switch (draft.objectiveType) {
    case "transit": {
      if (draft.pickedTarget) {
        return { type: "transit", target: draft.pickedTarget, targetLabel: formatLatLng(draft.pickedTarget) };
      }
      const waypoint = area.waypoints.find((candidate) => candidate.id === draft.waypointId);
      return waypoint ? { type: "transit", target: waypoint.position, targetLabel: waypoint.label } : null;
    }
    case "rtb": {
      const depot = area.depots.find((candidate) => candidate.id === asset?.homeDepotId);
      return depot ? { type: "rtb", target: depot.position, targetLabel: depot.name } : null;
    }
    case "patrol": {
      const points = draft.patrolWaypointIds
        .map((id) => area.waypoints.find((candidate) => candidate.id === id))
        .filter((waypoint): waypoint is NonNullable<typeof waypoint> => waypoint !== undefined);
      if (points.length < 2) return null;
      return {
        type: "patrol",
        waypoints: points.map((waypoint) => waypoint.position),
        targetLabel: points.map((waypoint) => waypoint.label).join(" → "),
      };
    }
    case "survey": {
      const surveyArea = area.surveyAreas.find((candidate) => candidate.id === draft.surveyAreaId);
      if (!surveyArea) return null;
      return { type: "survey", polygon: surveyArea.polygon, swathM: draft.swathM, targetLabel: surveyArea.label };
    }
    default:
      return null;
  }
}

export function MissionPlanner() {
  const snapshot = useFleetSnapshot();
  const area = useFleetArea();
  const asset = useSelectedAsset();
  const { draft, update, setPickMode } = usePlannerDraft();
  const [refusal, setRefusal] = useState<string | null>(null);
  const [override, setOverride] = useState(false);

  const objective = useMemo(() => buildObjective(draft, area, asset), [draft, area, asset]);
  const domainWaypoints = area.waypoints.filter((waypoint) => !asset || waypoint.domains.includes(asset.domain));
  const planner = snapshot.planner;
  const plannedAsset = snapshot.assets.find((candidate) => candidate.id === planner.assetId) ?? null;
  const selectedCoa = planner.candidates.find((coa) => coa.id === planner.selectedCoaId) ?? null;

  const generate = () => {
    if (!asset || !objective) return;
    setRefusal(null);
    fleetRuntime.planMission(asset.id, objective);
  };

  const dispatch = () => {
    const result = fleetRuntime.dispatch(undefined, { override });
    setRefusal(result.ok ? null : (result.reason ?? "Dispatch refused"));
    if (result.ok) setOverride(false);
  };

  return (
    <PanelSection title="Mission planner" info={PLANNER_HELP}>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[3.5rem_1fr] items-center gap-x-2 gap-y-1">
          <label htmlFor="planner-asset" className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Asset
          </label>
          <FleetSelect
            id="planner-asset"
            value={asset?.id ?? ""}
            onChange={(event) => fleetRuntime.selectAsset(event.target.value || null)}
          >
            <option value="">Select…</option>
            {snapshot.assets.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.callsign} · {candidate.status.replace(/_/g, " ")}
              </option>
            ))}
          </FleetSelect>

          <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Objective</span>
          <div className="flex flex-wrap gap-0.5">
            {OBJECTIVES.map((option) => (
              <Button
                key={option.id}
                variant={draft.objectiveType === option.id ? "secondary" : "outline"}
                size="xs"
                aria-pressed={draft.objectiveType === option.id}
                className="h-4 px-1 font-mono text-[10px]"
                onClick={() => update({ objectiveType: option.id, pickMode: false })}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {draft.objectiveType === "transit" ? (
            <>
              <label htmlFor="planner-target" className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Target
              </label>
              <div className="flex items-center gap-1">
                <FleetSelect
                  id="planner-target"
                  className="flex-1"
                  value={draft.pickedTarget ? "__map" : (draft.waypointId ?? "")}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "__map") {
                      setPickMode(true);
                    } else {
                      update({ waypointId: value, pickedTarget: null, pickMode: false });
                    }
                  }}
                >
                  {draft.pickedTarget ? (
                    <option value="__map">{formatLatLng(draft.pickedTarget)}</option>
                  ) : null}
                  {domainWaypoints.map((waypoint) => (
                    <option key={waypoint.id} value={waypoint.id}>
                      {waypoint.label}
                    </option>
                  ))}
                  {!draft.pickedTarget ? <option value="__map">Pick on map…</option> : null}
                </FleetSelect>
                <Button
                  variant={draft.pickMode ? "secondary" : "outline"}
                  size="icon-sm"
                  aria-label="Pick target on map"
                  aria-pressed={draft.pickMode}
                  onClick={() => setPickMode(!draft.pickMode)}
                >
                  <Crosshair />
                </Button>
              </div>
            </>
          ) : null}

          {draft.objectiveType === "patrol" ? (
            <>
              <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Loop</span>
              <div className="flex flex-wrap gap-0.5">
                {domainWaypoints.map((waypoint) => {
                  const index = draft.patrolWaypointIds.indexOf(waypoint.id);
                  const active = index >= 0;
                  return (
                    <Button
                      key={waypoint.id}
                      variant={active ? "secondary" : "outline"}
                      size="xs"
                      aria-pressed={active}
                      className="h-4 px-1 font-mono text-[10px]"
                      onClick={() =>
                        update({
                          patrolWaypointIds: active
                            ? draft.patrolWaypointIds.filter((id) => id !== waypoint.id)
                            : [...draft.patrolWaypointIds, waypoint.id],
                        })
                      }
                    >
                      {active ? `${index + 1} ` : ""}
                      {waypoint.label}
                    </Button>
                  );
                })}
              </div>
            </>
          ) : null}

          {draft.objectiveType === "survey" ? (
            <>
              <label htmlFor="planner-survey" className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Area
              </label>
              <div className="flex items-center gap-1">
                <FleetSelect
                  id="planner-survey"
                  className="flex-1"
                  value={draft.surveyAreaId ?? ""}
                  onChange={(event) => update({ surveyAreaId: event.target.value })}
                >
                  {area.surveyAreas.map((surveyArea) => (
                    <option key={surveyArea.id} value={surveyArea.id}>
                      {surveyArea.label}
                    </option>
                  ))}
                </FleetSelect>
                <label className="sr-only" htmlFor="planner-swath">
                  Swath width
                </label>
                <FleetSelect
                  id="planner-swath"
                  value={draft.swathM}
                  onChange={(event) => update({ swathM: Number(event.target.value) })}
                >
                  {SWATHS.map((swath) => (
                    <option key={swath} value={swath}>
                      {swath} m
                    </option>
                  ))}
                </FleetSelect>
              </div>
            </>
          ) : null}
        </div>

        <Button variant="outline" size="xs" className="self-start" disabled={!asset || !objective} onClick={generate}>
          <Route />
          Generate COAs
        </Button>

        {planner.candidates.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] text-muted-foreground">
              {plannedAsset?.callsign ?? "?"} · {planner.objective ? planner.objective.targetLabel ?? planner.objective.type : ""}
            </p>
            <ul className="flex flex-col gap-1">
              {planner.candidates.map((coa) => (
                <CoaCard
                  key={coa.id}
                  coa={coa}
                  asset={plannedAsset}
                  selected={coa.id === planner.selectedCoaId}
                  onSelect={() => fleetRuntime.selectCoa(coa.id)}
                />
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button size="xs" disabled={!selectedCoa || !selectedCoa.feasible} onClick={dispatch}>
                <Send />
                Dispatch {selectedCoa ? selectedCoa.variant : ""}
              </Button>
              {plannedAsset?.maintenance.due ? (
                <label className="flex items-center gap-1 text-[10px] text-warning">
                  <input
                    type="checkbox"
                    className="size-3 accent-[var(--warning)]"
                    checked={override}
                    onChange={(event) => setOverride(event.target.checked)}
                  />
                  Override maintenance hold
                </label>
              ) : null}
              <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => fleetRuntime.clearPlanner()}>
                Clear
              </Button>
            </div>
            {refusal ? (
              <p className="rounded-sm border border-destructive/40 px-1.5 py-1 font-mono text-[10px] text-destructive">
                REFUSED · {refusal}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </PanelSection>
  );
}

function CoaCard({
  coa,
  asset,
  selected,
  onSelect,
}: {
  coa: CourseOfAction;
  asset: Asset | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const remaining = asset ? asset.energyPct - coa.energyPct : null;
  const riskTone = coa.riskScore < 25 ? "ok" : coa.riskScore < 55 ? "warn" : "alert";
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        disabled={!coa.feasible}
        className={cn(
          "flex w-full flex-col gap-1 rounded-sm border px-1.5 py-1 text-left transition-colors disabled:opacity-60",
          selected ? "border-chart-1/60 bg-muted" : "border-border hover:bg-muted/60",
          coa.recommended && selected && "hud-skin hud-skin-sm hud-skin-plain"
        )}
        onClick={onSelect}
      >
        <div className="relative z-[1] flex w-full items-center justify-between gap-1">
          <span className={cn("font-mono text-xs uppercase", selected ? "text-foreground" : "text-muted-foreground")}>
            {coa.variant}
          </span>
          {coa.recommended ? (
            <Badge variant="outline" className="border-chart-1/40 font-mono text-[10px] font-normal text-chart-1">
              RECOMMENDED
            </Badge>
          ) : null}
        </div>
        {coa.feasible ? (
          <>
            <div className="relative z-[1] grid w-full grid-cols-4 gap-1">
              <Stat label="ETA" value={formatDuration(coa.etaMs)} />
              <Stat label="Dist" value={`${(coa.distanceM / 1000).toFixed(1)}`} unit="km" />
              <Stat
                label="Energy"
                value={`${coa.energyPct.toFixed(0)}%`}
                valueClassName={remaining !== null && remaining < ENERGY_RESERVE_PCT ? "text-warning" : undefined}
              />
              <Stat label="Gap" value={coa.coverageGapMs > 0 ? formatDuration(coa.coverageGapMs) : "none"} />
            </div>
            <div className="relative z-[1] flex w-full items-center gap-1.5">
              <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Risk</span>
              <SignalMeter value={coa.riskScore / 100} tone={riskTone} className="flex-1" />
              <span className="w-6 text-right font-mono text-[10px] tabular-nums">{coa.riskScore.toFixed(0)}</span>
            </div>
            <p className="relative z-[1] text-[10px] leading-3 text-muted-foreground">{coa.rationale}</p>
          </>
        ) : (
          <p className="relative z-[1] text-[10px] text-destructive">{coa.reason}</p>
        )}
      </button>
    </li>
  );
}
