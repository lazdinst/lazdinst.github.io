import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  CircleDashed,
  Grid2x2,
  House,
  Menu,
  Navigation,
  Repeat,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { SectionInfo } from "@/app/components/SectionInfo";
import {
  ASSET_KINDS,
  ENERGY_BANDS,
  countActiveFilters,
  filterAssets,
  fleetRuntime,
  kindProfile,
  matchesFilters,
  matchesQuery,
  type Asset,
  type AssetDomain,
  type AssetFilters,
  type AssetStatus,
  type MissionFilter,
  type MissionTypeOf,
} from "@/fleet";
import { cn } from "@/lib/utils";
import {
  AssetGlyph,
  DomainGlyph,
  FavoriteButton,
  FleetSelect,
  type FleetSelectOption,
  STATUS_LABEL,
  STATUS_TONE,
  TONE_DOT_CLASS,
  TONE_TEXT_CLASS,
} from "../../components";
import { SEARCH_HELP } from "../../help/fleetHelp";
import { useFleetSnapshot } from "../../hooks";
import { useDevicePrefs } from "../../shell/useDevicePrefs";
import { SEARCH_INPUT_ID } from "../../shell/useShellUi";

const DOMAINS: { id: AssetDomain; label: string }[] = [
  { id: "air", label: "AIR" },
  { id: "ground", label: "GND" },
  { id: "sea", label: "SEA" },
];

const STATUS_OPTIONS: FleetSelectOption<AssetStatus>[] = (
  ["idle", "en_route", "patrolling", "returning", "engaging", "charging", "maintenance", "lost_link", "fault"] as AssetStatus[]
).map((status) => ({
  value: status,
  label: STATUS_LABEL[status],
  icon: <span className={cn("size-1.5 rounded-full", TONE_DOT_CLASS[STATUS_TONE[status]])} />,
}));

const ENERGY_ICON: Record<string, ReactNode> = {
  critical: <BatteryWarning className="text-destructive" />,
  low: <BatteryLow className="text-warning" />,
  ok: <BatteryMedium className="text-success" />,
  full: <BatteryFull className="text-success" />,
};

const ENERGY_OPTIONS: FleetSelectOption[] = ENERGY_BANDS.map((band) => ({
  value: band.id,
  label: band.label,
  icon: ENERGY_ICON[band.id],
}));

const MISSION_OPTIONS: FleetSelectOption<MissionFilter>[] = [
  { value: "none", label: "No mission", description: "Idle, charging, or held", icon: <CircleDashed /> },
  { value: "transit", label: "Transit", description: "Moving to a point", icon: <Navigation /> },
  { value: "patrol", label: "Patrol", description: "Looping waypoints", icon: <Repeat /> },
  { value: "survey", label: "Survey", description: "Flying a lawnmower pattern", icon: <Grid2x2 /> },
  { value: "rtb", label: "Return to base", description: "Heading to the home depot", icon: <House /> },
  { value: "engage", label: "Engage", description: "Prosecuting hostile targets" },
];

const KIND_OPTIONS: FleetSelectOption<Asset["kind"]>[] = ASSET_KINDS.map((kind) => ({
  value: kind,
  label: kindProfile(kind).label,
  icon: <AssetGlyph kind={kind} />,
}));

const EMPTY: AssetFilters = { domains: [], statuses: [], kinds: [], energy: null, missions: [] };

interface DeviceSearchProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onSelect?: (asset: Asset) => void;
}

interface Section {
  id: "favorites" | "recent" | "all";
  label: string;
  assets: Asset[];
}

/**
 * Google-Maps-style search box: hamburger on the left, a query field, and a
 * dropdown that lists favorites, then recently selected devices, then
 * everything else.
 */
export function DeviceSearch({ menuOpen, onToggleMenu, onSelect }: DeviceSearchProps) {
  const snapshot = useFleetSnapshot();
  const { recent, favorites, toggleFavorite } = useDevicePrefs();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<AssetFilters>(EMPTY);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const missionTypeOf = useCallback<MissionTypeOf>(
    (asset) => {
      if (!asset.missionId) return null;
      const mission = snapshot.missions.find((candidate) => candidate.id === asset.missionId);
      return mission && mission.status === "active" ? mission.objective.type : null;
    },
    [snapshot.missions]
  );

  const sections = useMemo<Section[]>(() => {
    const trimmed = query.trim();
    const byId = new Map(snapshot.assets.map((asset) => [asset.id, asset]));
    const pick = (ids: string[]) =>
      ids
        .map((id) => byId.get(id))
        .filter((asset): asset is Asset => asset !== undefined)
        .filter((asset) => matchesFilters(asset, filters, missionTypeOf))
        .filter((asset) => trimmed === "" || matchesQuery(asset, trimmed, missionTypeOf));
    const favoriteAssets = pick(favorites);
    const taken = new Set(favoriteAssets.map((asset) => asset.id));
    const recentAssets = pick(recent).filter((asset) => !taken.has(asset.id));
    recentAssets.forEach((asset) => taken.add(asset.id));
    const rest = filterAssets(snapshot.assets, trimmed, filters, trimmed ? "callsign" : "severity", missionTypeOf)
      .filter((asset) => !taken.has(asset.id));
    const out: Section[] = [];
    if (favoriteAssets.length > 0) out.push({ id: "favorites", label: "Favorites", assets: favoriteAssets });
    if (recentAssets.length > 0) out.push({ id: "recent", label: "Recent", assets: recentAssets });
    out.push({ id: "all", label: trimmed ? "Matches" : "All devices", assets: rest });
    return out;
  }, [snapshot.assets, recent, favorites, query, filters, missionTypeOf]);

  const flat = useMemo(() => sections.flatMap((section) => section.assets), [sections]);
  const activeFilters = countActiveFilters(filters);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, filters, open]);

  // The results list would otherwise sit on top of whichever drawer opens.
  useEffect(() => {
    if (menuOpen) setOpen(false);
  }, [menuOpen]);

  // Close on clicks outside the search, but not on the portaled select popups.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (target.closest('[data-slot="select-popup"], [data-slot="popover-content"]')) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  /**
   * Keyboard selection keeps the list open and focused so the operator can
   * step to another device and select again; a mouse click closes it.
   */
  const choose = (asset: Asset, keepOpen = false) => {
    fleetRuntime.selectAsset(asset.id);
    onSelect?.(asset);
    if (keepOpen) {
      inputRef.current?.focus();
      return;
    }
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(flat.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const asset = flat[activeIndex];
      if (asset) choose(asset, true);
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  let runningIndex = -1;
  const energyId = ENERGY_BANDS.find((band) => {
    const current = filters.energy;
    return current !== null && current !== undefined && band.band.min === current.min && band.band.max === current.max;
  })?.id ?? null;

  return (
    <div ref={rootRef} className="relative">
      <div className="pointer-events-auto flex h-9 items-center gap-1 rounded-lg border border-border bg-background/95 pr-1 pl-1 shadow-md backdrop-blur">
        <Button
          variant={menuOpen ? "secondary" : "ghost"}
          size="icon-sm"
          aria-label={menuOpen ? "Close operations" : "Open operations"}
          aria-pressed={menuOpen}
          onClick={() => {
            setOpen(false);
            onToggleMenu();
          }}
        >
          <Menu />
        </Button>
        <Search className="size-3 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          id={SEARCH_INPUT_ID}
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-controls="device-search-list"
          aria-autocomplete="list"
          aria-label="Search devices"
          placeholder="Search devices"
          className="h-full min-w-0 flex-1 bg-transparent font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground"
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {query ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X />
          </Button>
        ) : (
          <Kbd size="small" meta className="pr-1 text-muted-foreground" aria-hidden>
            K
          </Kbd>
        )}
      </div>

      {open ? (
        <div className="pointer-events-auto absolute inset-x-0 top-full z-10 mt-2 flex max-h-[min(64vh,30rem)] flex-col overflow-hidden rounded-lg border border-border bg-background/95 shadow-md backdrop-blur">
          <div className="flex shrink-0 flex-col gap-1 border-b border-border px-2 py-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-0.5">
                {DOMAINS.map((domain) => {
                  const active = filters.domains.includes(domain.id);
                  return (
                    <Button
                      key={domain.id}
                      variant={active ? "secondary" : "outline"}
                      size="xs"
                      aria-pressed={active}
                      className="h-4 gap-1 px-1 font-mono text-[10px]"
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          domains: active
                            ? current.domains.filter((d) => d !== domain.id)
                            : [...current.domains, domain.id],
                        }))
                      }
                    >
                      <DomainGlyph domain={domain.id} className="size-2.5" />
                      {domain.label}
                    </Button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {flat.length} of {snapshot.assets.length}
                </span>
                {activeFilters > 0 ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-4 px-1 font-mono text-[10px] text-muted-foreground"
                    onClick={() => setFilters(EMPTY)}
                  >
                    Clear {activeFilters}
                  </Button>
                ) : null}
                <SectionInfo content={SEARCH_HELP} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <FleetSelect<AssetStatus>
                label="Status"
                aria-label="Filter by status"
                value={filters.statuses[0] ?? null}
                clearable
                muted={filters.statuses.length === 0}
                onValueChange={(next) =>
                  setFilters((current) => ({ ...current, statuses: next ? [next] : [] }))
                }
                options={STATUS_OPTIONS}
              />
              <FleetSelect
                label="Charge"
                aria-label="Filter by charge"
                value={energyId}
                clearable
                muted={energyId === null}
                onValueChange={(next) =>
                  setFilters((current) => ({
                    ...current,
                    energy: next ? (ENERGY_BANDS.find((band) => band.id === next)?.band ?? null) : null,
                  }))
                }
                options={ENERGY_OPTIONS}
              />
              <FleetSelect<MissionFilter>
                label="Mission"
                aria-label="Filter by mission"
                value={filters.missions?.[0] ?? null}
                clearable
                muted={!filters.missions || filters.missions.length === 0}
                onValueChange={(next) =>
                  setFilters((current) => ({ ...current, missions: next ? [next] : [] }))
                }
                options={MISSION_OPTIONS}
                contentClassName="w-56"
              />
              <FleetSelect
                label="Kind"
                aria-label="Filter by kind"
                value={filters.kinds?.[0] ?? null}
                clearable
                muted={!filters.kinds || filters.kinds.length === 0}
                onValueChange={(next) =>
                  setFilters((current) => ({ ...current, kinds: next ? [next as Asset["kind"]] : [] }))
                }
                options={KIND_OPTIONS}
                align="end"
              />
            </div>
          </div>
          <div
            ref={listRef}
            id="device-search-list"
            role="listbox"
            className="min-h-0 flex-1 overflow-y-auto p-1 [scrollbar-gutter:stable]"
          >
            {flat.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">No devices match.</p>
            ) : (
              sections.map((section) =>
                section.assets.length === 0 ? null : (
                  <div key={section.id} className="flex flex-col">
                    <div className="px-1.5 pt-1.5 pb-0.5 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                      {section.label}
                    </div>
                    {section.assets.map((asset) => {
                      runningIndex += 1;
                      const index = runningIndex;
                      return (
                        <DeviceRow
                          key={asset.id}
                          asset={asset}
                          index={index}
                          active={index === activeIndex}
                          selected={asset.id === snapshot.selectedAssetId}
                          favorite={favorites.includes(asset.id)}
                          onHover={() => setActiveIndex(index)}
                          onChoose={() => choose(asset)}
                          onToggleFavorite={() => toggleFavorite(asset.id)}
                        />
                      );
                    })}
                  </div>
                )
              )
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeviceRow({
  asset,
  index,
  active,
  selected,
  favorite,
  onHover,
  onChoose,
  onToggleFavorite,
}: {
  asset: Asset;
  index: number;
  active: boolean;
  selected: boolean;
  favorite: boolean;
  onHover: () => void;
  onChoose: () => void;
  onToggleFavorite: () => void;
}) {
  const tone = STATUS_TONE[asset.status];
  const live = asset.status === "en_route" || asset.status === "patrolling" || asset.status === "returning";
  return (
    <div
      role="option"
      aria-selected={selected}
      data-index={index}
      className={cn(
        "group/row flex w-full cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-left text-xs",
        active ? "bg-muted text-foreground" : "text-muted-foreground"
      )}
      onMouseEnter={onHover}
      onClick={onChoose}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", TONE_DOT_CLASS[tone], live && "hud-live")} />
      <AssetGlyph kind={asset.kind} className="text-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-mono text-foreground">
          {asset.callsign}
          {selected ? <span className="ml-1 text-[10px] text-muted-foreground">· selected</span> : null}
        </span>
        <span className="truncate text-[10px]">{asset.name} · {asset.kind.replace(/_/g, " ")}</span>
      </span>
      <span className={cn("shrink-0 font-mono text-[10px] tracking-wide", TONE_TEXT_CLASS[tone])}>
        {STATUS_LABEL[asset.status]}
      </span>
      <span className="w-7 shrink-0 text-right font-mono text-[10px] tabular-nums">
        {asset.energyPct.toFixed(0)}%
      </span>
      <FavoriteButton
        active={favorite}
        callsign={asset.callsign}
        onToggle={onToggleFavorite}
        className={cn(!favorite && "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100")}
      />
    </div>
  );
}
